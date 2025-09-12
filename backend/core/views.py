from django.utils import timezone
from django.conf import settings
from django.db.models import Avg
from django.db.models.functions import TruncSecond
from rest_framework import viewsets, mixins, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

# Local imports
from .models import Event, HeadcountSnapshot
from .serializers import (
    EventSerializer, EventDetailSerializer, HeadcountSnapshotSerializer,
    StatusSerializer, AlertSerializer, HeatmapBucketSerializer
)
from .permissions import IsEventManager
from .utils import generate_qr_datauri
from .ml import run_ml_predict

# --- Helper Function ---

def broadcast_update(event):
    """
    Broadcasts the latest event status and headcount to the WebSocket group.
    """
    channel_layer = get_channel_layer()
    event_group_name = f'event_{event.id}'

    # Use the serializer to ensure data is consistent with the main API
    serializer = EventSerializer(event)

    async_to_sync(channel_layer.group_send)(
        event_group_name,
        {
            'type': 'event_update', # This must match the method name in the consumer
            'headcount': serializer.data.get('current_headcount'),
            'status': serializer.data.get('status')
        }
    )

# --- ViewSets for General and Manager Access ---

class PublicEventViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A public, read-only view for visitors to list and retrieve event details.
    This covers the main GET /api/events/ and GET /api/events/<id>/ endpoints.
    """
    queryset = Event.objects.all().order_by('-date')
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EventDetailSerializer
        return EventSerializer

class ManagerEventViewSet(viewsets.ModelViewSet):
    """
    A protected ViewSet for Event Managers to Create, Read, Update, and Delete their events.
    This covers the protected GET, POST, PUT, DELETE /api/manager/events/ endpoints.
    """
    serializer_class = EventDetailSerializer
    permission_classes = [IsAuthenticated, IsEventManager]

    def get_queryset(self):
        """This view only returns events managed by the current user."""
        return Event.objects.filter(manager=self.request.user)

    def perform_create(self, serializer):
        """Automatically assign the current user as the manager when creating a new event."""
        serializer.save(manager=self.request.user)


# --- Login View for Managers ---

class CustomAuthToken(ObtainAuthToken):
    """
    This view allows a user to get their auth token by POSTing their
    username and password to /api/api-token-auth/.
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

# --- New Function-Based Views for Specific API Endpoints ---

@api_view(['POST'])
@permission_classes([AllowAny])
def scan_by_token(request):
    """
    POST /api/scan_by_token/
    Handles a QR code scan. Finds an event by its unique QR token
    and increments its headcount by 1.
    """
    token = request.data.get("token")
    if not token:
        return Response({"error": "token is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        event = Event.objects.get(qr_token=token)
        latest = event.snapshots.order_by('-timestamp').first()
        new_count = (latest.headcount + 1) if latest else 1

        HeadcountSnapshot.objects.create(event=event, headcount=new_count, source='qr')
        broadcast_update(event) # Send real-time update

        return Response({"status": "success", "new_headcount": new_count}, status=status.HTTP_201_CREATED)
    except Event.DoesNotExist:
        return Response({"error": "Invalid token"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_update(request):
    """
    POST /api/admin_update/
    Allows a logged-in manager to set a specific headcount for an event.
    """
    event_id = request.data.get("event_id")
    headcount = request.data.get("headcount")

    if not all([event_id, headcount]):
        return Response({"error": "event_id and headcount are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        event = Event.objects.get(pk=event_id)
        # Security check: Ensure the user manages this event
        if event.manager != request.user:
            return Response({"error": "You do not have permission to update this event."}, status=status.HTTP_403_FORBIDDEN)

        snapshot = HeadcountSnapshot.objects.create(event=event, headcount=int(headcount), source='admin')
        broadcast_update(event) # Send real-time update

        return Response(HeadcountSnapshotSerializer(snapshot).data, status=status.HTTP_201_CREATED)
    except (Event.DoesNotExist, ValueError, TypeError):
        return Response({"error": "Invalid data provided"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def status_view(request):
    """
    GET /api/status/?event_id=1
    Returns the detailed current status for a single event, including an ML prediction.
    """
    event_id = request.query_params.get("event_id")
    if not event_id:
        return Response({"error": "event_id query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        event = Event.objects.get(pk=event_id)
        latest = event.snapshots.order_by('-timestamp').first()
        if not latest:
            return Response({"error": "No data available for this event."}, status=status.HTTP_404_NOT_FOUND)

        event_serializer = EventSerializer(event)
        predicted_headcount = run_ml_predict(event, timezone.now() + timezone.timedelta(hours=1))

        status_data = {
            'headcount': latest.headcount,
            'status': event_serializer.get_status(event),
            'source': latest.get_source_display(),
            'predicted_next_hour': predicted_headcount,
            'timestamp': latest.timestamp
        }
        return Response(StatusSerializer(status_data).data)
    except Event.DoesNotExist:
        return Response({"error": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([AllowAny])
def history_view(request):
    """
    GET /api/history/?event_id=1&limit=50
    Returns the recent headcount history for an event, with a limit.
    """
    event_id = request.query_params.get("event_id")
    limit = int(request.query_params.get("limit", 50))
    if not event_id:
        return Response({"error": "event_id query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    snapshots = HeadcountSnapshot.objects.filter(event_id=event_id).order_by('-timestamp')[:limit]
    return Response(HeadcountSnapshotSerializer(snapshots, many=True).data)

@api_view(['GET'])
@permission_classes([AllowAny])
def heatmap_view(request):
    """
    GET /api/heatmap/?event_id=1&interval=300
    Returns aggregated headcount data in time buckets for a heatmap.
    """
    event_id = request.query_params.get("event_id")
    interval = int(request.query_params.get("interval", 300)) # Default: 5-minute intervals
    if not event_id:
        return Response({"error": "event_id query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    # This query groups snapshots by time intervals and calculates the average headcount
    heatmap_data = HeadcountSnapshot.objects.filter(event_id=event_id) \
        .annotate(timestamp_bucket=TruncSecond('timestamp', 'second', extra={'step': interval})) \
        .values('timestamp_bucket') \
        .annotate(avg_headcount=Avg('headcount')) \
        .order_by('timestamp_bucket')

    return Response(HeatmapBucketSerializer(heatmap_data, many=True).data)

@api_view(['GET'])
@permission_classes([AllowAny])
def alerts_view(request):
    """
    GET /api/alerts/?event_id=1
    Returns current alerts for an event based on crowd thresholds.
    """
    event_id = request.query_params.get("event_id")
    if not event_id:
        return Response({"error": "event_id query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        event = Event.objects.get(pk=event_id)
        latest = event.snapshots.order_by('-timestamp').first()
        alerts = []
        if latest:
            if latest.headcount > event.crowded_threshold:
                alerts.append({
                    "level": "critical",
                    "message": f"Crowd has exceeded the critical threshold of {event.crowded_threshold}.",
                    "timestamp": latest.timestamp
                })
            elif latest.headcount > event.safe_threshold:
                 alerts.append({
                    "level": "warning",
                    "message": f"Crowd is approaching the critical threshold ({latest.headcount}/{event.crowded_threshold}).",
                    "timestamp": latest.timestamp
                })
        return Response(AlertSerializer(alerts, many=True).data)
    except Event.DoesNotExist:
        return Response({"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def qr_for_event(request, event_id):
    """
    GET /api/qr/<event_id>/
    Generates and returns a QR code data URI for an event's unique scan token.
    """
    try:
        event = Event.objects.get(pk=event_id)
        # Security check: Ensure the user manages this event
        if event.manager != request.user:
            return Response({"error": "You do not have permission to generate a QR for this event."}, status=status.HTTP_403_FORBIDDEN)

        # This URL should point to your frontend's scan page, passing the unique event token
        frontend_url = getattr(settings, "FRONTEND_BASE_URL", "http://localhost:3000")
        scan_url = f"{frontend_url}/scan/{event.qr_token}"
        data_uri = generate_qr_datauri(scan_url)

        return Response({"qr_data_uri": data_uri, "scan_url": scan_url})
    except Event.DoesNotExist:
        return Response({"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND)