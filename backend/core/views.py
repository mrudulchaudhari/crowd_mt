from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny # Import AllowAny
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Event, HeadcountSnapshot
from .serializers import EventSerializer, EventDetailSerializer, HeadcountSnapshotSerializer
from .permissions import IsEventManager

# ADD THESE IMPORTS FOR THE LOGIN VIEW
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token


# This is the public, read-only view for visitors.
class EventViewSet(mixins.ListModelMixin,
                   mixins.RetrieveModelMixin,
                   viewsets.GenericViewSet):
    queryset = Event.objects.all().order_by('-date')
    permission_classes = [AllowAny] # Explicitly make this view public

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

    @action(detail=True, methods=['post'], permission_classes=[AllowAny]) # Make scan_qr public
    def scan_qr(self, request, pk=None):
        event = self.get_object()
        latest_snapshot = event.snapshots.order_by('-timestamp').first()
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


# ADD THIS NEW CLASS AT THE END OF THE FILE
class CustomAuthToken(ObtainAuthToken):
    """
    This view allows a user to get their auth token by POSTing their
    username and password.
    """
    permission_classes = [AllowAny] # Allow any user to attempt to log in

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
