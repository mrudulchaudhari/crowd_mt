from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from django.utils import timezone

from .models import Event, HeadcountSnapshot, Alert
from .serializers import (
    EventSerializer,
    EventDetailSerializer,
    HeadcountSnapshotSerializer,
    AlertSerializer,
)
from .permissions import IsEventManager


# This is the public, read-only view for visitors.
class EventViewSet(mixins.ListModelMixin,
                   mixins.RetrieveModelMixin,
                   viewsets.GenericViewSet):
    queryset = Event.objects.all().order_by('-date')
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EventDetailSerializer
        return EventSerializer

    def broadcast_update(self, event, snapshot):
        channel_layer = get_channel_layer()
        status_str = "Green"
        if snapshot.headcount > event.crowded_threshold:
            status_str = "Red"
        elif snapshot.headcount >= event.safe_threshold:
            status_str = "Yellow"

        async_to_sync(channel_layer.group_send)(
            f"event_{event.id}",
            {
                "type": "event_update",
                "headcount": snapshot.headcount,
                "status": status_str
            }
        )

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def scan_qr(self, request, pk=None):
        event = self.get_object()
        # Use queryset to avoid relying on a related_name
        latest_snapshot = HeadcountSnapshot.objects.filter(event=event).order_by('-timestamp').first()
        current_count = latest_snapshot.headcount if latest_snapshot else 0
        new_count = current_count + 1
        snapshot = HeadcountSnapshot.objects.create(
            event=event,
            headcount=new_count,
            source='qr'
        )

        self.broadcast_update(event, snapshot)
        serializer = HeadcountSnapshotSerializer(snapshot)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# This is the protected view for event managers.
class ManagerEventViewSet(viewsets.ModelViewSet):
    serializer_class = EventDetailSerializer
    permission_classes = [IsAuthenticated, IsEventManager]

    def get_queryset(self):
        """This view should only return events managed by the current user."""
        return Event.objects.filter(manager=self.request.user)

    def perform_create(self, serializer):
        """Automatically assign the current user as the manager when creating a new event."""
        serializer.save(manager=self.request.user)


# Login view to obtain auth token
class CustomAuthToken(ObtainAuthToken):
    """
    This view allows a user to obtain their auth token by POSTing username & password.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email
        })


def check_alerts_for_snapshot(snap):
    """
    Returns an Alert instance if one should be created for this snapshot, otherwise None.
    Note: models.Event uses `safe_threshold` (not `safety_threshold`).
    """
    event = snap.event
    thr = getattr(event, "safe_threshold", None)
    if thr is None:
        return None

    # 1. Capacity breach
    if snap.headcount >= thr:
        return Alert.objects.create(
            event=event,
            alert_type="capacity",
            message=f"Headcount {snap.headcount} >= threshold {thr}"
        )

    # 2. Rising rate (relative to previous snapshot)
    prev = HeadcountSnapshot.objects.filter(
        event=event, timestamp__lt=snap.timestamp
    ).order_by('-timestamp').first()

    if prev:
        growth_rate = (snap.headcount - prev.headcount) / max(prev.headcount, 1)
        if growth_rate > 0.3:
            return Alert.objects.create(
                event=event,
                alert_type="spike",
                message=f"Sharp spike: {growth_rate:.0%} increase in headcount"
            )

    # 3. Staleness (if the Event model tracks last_validated_at)
    if hasattr(event, "last_validated_at") and event.last_validated_at:
        if (snap.timestamp - event.last_validated_at).total_seconds() > 1800 and snap.headcount > thr:
            return Alert.objects.create(
                event=event,
                alert_type="stale",
                message="No admin validation recently, but crowd is above threshold!"
            )

    return None


class SnapshotCreateView(APIView):
    """
    Create a headcount snapshot for an event (POST) and trigger alerts/broadcasts.
    Expects JSON body with {"headcount": <int>}
    """
    permission_classes = [IsAuthenticated]  # change to AllowAny if public endpoint desired

    def post(self, request, event_id):
        try:
            headcount = int(request.data.get("headcount"))
        except (TypeError, ValueError):
            return Response({"detail": "Invalid headcount"}, status=status.HTTP_400_BAD_REQUEST)

        snap = HeadcountSnapshot.objects.create(
            event_id=event_id,
            headcount=headcount,
            timestamp=timezone.now(),
            source=request.data.get("source", "admin")
        )

        # check for alerts
        alert = check_alerts_for_snapshot(snap)

        if alert:
            async_to_sync(get_channel_layer().group_send)(
                f"event_{event_id}",
                {
                    "type": "alert.message",
                    "alert": AlertSerializer(alert).data,
                }
            )

        # broadcast update to channels as well (reuse logic similar to EventViewSet)
        async_to_sync(get_channel_layer().group_send)(
            f"event_{event_id}",
            {
                "type": "event_update",
                "headcount": snap.headcount,
            }
        )

        return Response({"status": "ok"}, status=status.HTTP_201_CREATED)


class AlertViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Alert.objects.all().order_by('-created_at')
    serializer_class = AlertSerializer
