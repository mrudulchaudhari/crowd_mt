from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Event, HeadcountSnapshot, Alert, Event
from .serializers import EventSerializer, EventDetailSerializer, HeadcountSnapshotSerializer,AlertSerializer
from rest_framework.views import APIView
from django.utils import timezone

class EventViewSet(mixins.ListModelMixin,
                   mixins.RetrieveModelMixin,
                   viewsets.GenericViewSet):
    """
    Event API:
    - List events (summary)
    - Retrieve event details (with history, status, current headcount)
    - Visitor check-in via scan QR
    - Admin manual headcount updates
    """
    queryset = Event.objects.all().order_by('-date')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EventDetailSerializer
        return EventSerializer

    # Helper function to broadcast headcount update
    def broadcast_update(self, event, snapshot):
        channel_layer = get_channel_layer()
        # Calculate status using the serializer logic
        status = "Green"
        if snapshot.headcount > event.crowded_threshold:
            status = "Red"
        elif snapshot.headcount >= event.safe_threshold:
            status = "Yellow"

        async_to_sync(channel_layer.group_send)(
            f"event_{event.id}",
            {
                "type": "event_update",  # matches EventConsumer method
                "headcount": snapshot.headcount,
                "status": status
            }
        )

    # Scan QR endpoint (visitor check-in)
    @action(detail=True, methods=['post'])
    def scan_qr(self, request, pk=None):
        event = self.get_object()

        # Get the latest headcount
        latest_snapshot = event.headcountsnapshot_set.order_by('-timestamp').first()
        current_count = latest_snapshot.headcount if latest_snapshot else 0

        # Increment headcount by 1 (for this scan)
        new_count = current_count + 1

        # Create snapshot using valid source
        snapshot = HeadcountSnapshot.objects.create(
            event=event,
            headcount=new_count,
            source='qr'  # matches model choices
        )

        # Broadcast update to WebSocket
        self.broadcast_update(event, snapshot)

        serializer = HeadcountSnapshotSerializer(snapshot)
        return Response(serializer.data)

    # Admin manual update
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def admin_update(self, request, pk=None):
        event = self.get_object()

        # Validate input
        headcount = request.data.get('headcount')
        if headcount is None or not isinstance(headcount, int) or headcount < 0:
            return Response({'error': 'Invalid headcount'}, status=400)

        # Create snapshot using valid source
        snapshot = HeadcountSnapshot.objects.create(
            event=event,
            headcount=headcount,
            source='admin'  # matches model choices
        )

        # Broadcast update to WebSocket
        self.broadcast_update(event, snapshot)

        serializer = HeadcountSnapshotSerializer(snapshot)
        return Response(serializer.data)



def check_alerts_for_snapshot(snap):
    event = snap.event
    thr = event.safety_threshold

    # 1. Capacity breach
    if snap.headcount >= thr:
        return Alert.objects.create(
            event=event,
            alert_type="capacity",
            message=f"Headcount {snap.headcount} >= threshold {thr}"
        )

    # 2. Rising rate
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

    # 3. Staleness
    if hasattr(event, "last_validated_at"):
        if (snap.timestamp - event.last_validated_at).total_seconds() > 1800 and snap.headcount > thr:
            return Alert.objects.create(
                event=event,
                alert_type="stale",
                message="No admin validation recently, but crowd is above threshold!"
            )

    return None


class SnapshotCreateView(APIView):
    def post(self, request, event_id):
        headcount = request.data.get("headcount")
        snap = HeadcountSnapshot.objects.create(
            event_id=event_id,
            headcount=headcount,
            timestamp=timezone.now()
        )

        alert = check_alerts_for_snapshot(snap)

        if alert:
            from .serializers import AlertSerializer
            from asgiref.sync import async_to_sync
            from channels.layers import get_channel_layer

            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"event_{event_id}",
                {
                    "type": "alert.message",
                    "alert": AlertSerializer(alert).data,
                }
            )

        return Response({"status": "ok"})


class AlertViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Alert.objects.all().order_by('-created_at')
    serializer_class = AlertSerializer
