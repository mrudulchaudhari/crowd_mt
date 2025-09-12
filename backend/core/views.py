from django.utils import timezone
from django.conf import settings
from django.db.models import Avg
from django.db.models.functions import TruncSecond

from rest_framework import viewsets, mixins, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

# Local imports
from .models import Event, HeadcountSnapshot, Alert
from .serializers import (
    EventSerializer,
    EventDetailSerializer,
    HeadcountSnapshotSerializer,
    StatusSerializer,
    AlertSerializer,
    HeatmapBucketSerializer,
)
from .permissions import IsEventManager
from .utils import generate_qr_datauri
from .ml import run_ml_predict


# -----------------------
# Broadcast helpers
# -----------------------
def broadcast_update(event):
    """Broadcast event summary update to its group."""
    channel_layer = get_channel_layer()
    serializer = EventSerializer(event)
    async_to_sync(channel_layer.group_send)(
        f"event_{event.id}",
        {
            "type": "event_update",
            "headcount": serializer.data.get("current_headcount"),
            "status": serializer.data.get("status"),
        },
    )


def broadcast_snapshot(snap):
    """Broadcast a headcount snapshot to the group."""
    data = {
        "headcount": snap.headcount,
        "timestamp": snap.timestamp.isoformat() if hasattr(snap, "timestamp") else None,
        "source": snap.source,
        "event_id": snap.event.id,
    }
    async_to_sync(get_channel_layer().group_send)(
        f"event_{snap.event.id}", {"type": "headcount_update", "data": data}
    )


def check_alerts_for_snapshot(snap):
    """Check thresholds and create Alert if needed."""
    event = snap.event
    safety_thr = getattr(event, "safety_threshold", None) or 0
    crowded_thr = getattr(event, "crowded_threshold", None)

    # Capacity breach
    cap_thr = crowded_thr if crowded_thr else safety_thr
    if cap_thr and snap.headcount >= cap_thr:
        return Alert.objects.create(
            event=event,
            alert_type="capacity",
            message=f"Headcount {snap.headcount} >= threshold {cap_thr}",
        )

    # Spike
    prev = (
        HeadcountSnapshot.objects.filter(event=event, timestamp__lt=snap.timestamp)
        .order_by("-timestamp")
        .first()
    )
    if prev:
        denom = prev.headcount if prev.headcount > 0 else 1
        growth_rate = (snap.headcount - prev.headcount) / denom
        if growth_rate > 0.3:
            return Alert.objects.create(
                event=event,
                alert_type="spike",
                message=f"Sharp spike: {growth_rate:.0%} increase",
            )

    # Staleness
    if getattr(event, "last_validated_at", None):
        if (
            (snap.timestamp - event.last_validated_at).total_seconds() > 1800
            and snap.headcount > safety_thr
        ):
            return Alert.objects.create(
                event=event,
                alert_type="stale",
                message="No admin validation recently, but crowd is above safe threshold!",
            )

    return None


# -----------------------
# Event ViewSets
# -----------------------
class PublicEventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Event.objects.all().order_by("-date")
    serializer_class = EventSerializer


class EventViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Event.objects.all().order_by("-date")
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        return EventDetailSerializer if self.action == "retrieve" else EventSerializer


class ManagerEventViewSet(viewsets.ModelViewSet):
    serializer_class = EventDetailSerializer
    permission_classes = [IsAuthenticated, IsEventManager]

    def get_queryset(self):
        return Event.objects.filter(manager=self.request.user)

    def perform_create(self, serializer):
        serializer.save(manager=self.request.user)


# -----------------------
# Authentication
# -----------------------
class CustomAuthToken(ObtainAuthToken):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user_id": user.pk, "email": user.email})


# -----------------------
# Scanning endpoints
# -----------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def scan(request):
    event_id = request.data.get("event_id")
    if not event_id:
        return Response({"error": "event_id required"}, status=400)
    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response({"error": "event not found"}, status=404)

    try:
        increment = int(request.data.get("increment", 1))
    except (TypeError, ValueError):
        increment = 1

    last = HeadcountSnapshot.objects.filter(event=event).order_by("-timestamp").first()
    new_count = (last.headcount if last else 0) + increment
    snap = HeadcountSnapshot.objects.create(
        event=event, headcount=new_count, source="qr", timestamp=timezone.now()
    )
    broadcast_snapshot(snap)
    alert = check_alerts_for_snapshot(snap)
    if alert:
        async_to_sync(get_channel_layer().group_send)(
            f"event_{event_id}", {"type": "alert_message", "data": AlertSerializer(alert).data}
        )
    return Response({"headcount": new_count, "event_id": event.id})


@api_view(["POST"])
@permission_classes([AllowAny])
def scan_by_token(request):
    token = request.data.get("token")
    if not token:
        return Response({"error": "token required"}, status=400)

    try:
        event = Event.objects.get(qr_token=token)
    except Event.DoesNotExist:
        return Response({"error": "invalid token"}, status=404)

    try:
        increment = int(request.data.get("increment", 1))
    except (TypeError, ValueError):
        increment = 1

    last = HeadcountSnapshot.objects.filter(event=event).order_by("-timestamp").first()
    new_count = (last.headcount if last else 0) + increment
    snap = HeadcountSnapshot.objects.create(
        event=event, headcount=new_count, source="qr", timestamp=timezone.now()
    )
    broadcast_snapshot(snap)
    alert = check_alerts_for_snapshot(snap)
    if alert:
        async_to_sync(get_channel_layer().group_send)(
            f"event_{event.id}", {"type": "alert_message", "data": AlertSerializer(alert).data}
        )
    return Response({"headcount": new_count, "event_id": event.id, "token": token})


# -----------------------
# Admin manual update
# -----------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_update(request):
    event_id = request.data.get("event_id")
    headcount = request.data.get("headcount")
    if not all([event_id, headcount]):
        return Response({"error": "event_id and headcount required"}, status=400)

    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response({"error": "event not found"}, status=404)

    if event.manager != request.user:
        return Response({"error": "permission denied"}, status=403)

    try:
        new_count = int(headcount)
    except (TypeError, ValueError):
        return Response({"error": "invalid headcount"}, status=400)

    snap = HeadcountSnapshot.objects.create(
        event=event, headcount=new_count, source="admin", timestamp=timezone.now()
    )
    broadcast_snapshot(snap)
    alert = check_alerts_for_snapshot(snap)
    if alert:
        async_to_sync(get_channel_layer().group_send)(
            f"event_{event.id}", {"type": "alert_message", "data": AlertSerializer(alert).data}
        )
    return Response({"headcount": new_count, "event_id": event.id})


# -----------------------
# Status & history
# -----------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def status_view(request):
    event_id = request.query_params.get("event_id")
    if not event_id:
        return Response({"status": "ok"})  # health check fallback

    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response({"error": "event not found"}, status=404)

    last = HeadcountSnapshot.objects.filter(event=event).order_by("-timestamp").first()
    if not last:
        return Response({"error": "no snapshots"}, status=404)

    predicted = run_ml_predict(event, timezone.now() + timezone.timedelta(hours=1))
    status_data = {
        "headcount": last.headcount,
        "status": EventSerializer(event).get_status(event),
        "source": last.source,
        "predicted_next_hour": predicted,
        "timestamp": last.timestamp,
    }
    return Response(StatusSerializer(status_data).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def history_view(request):
    event_id = request.query_params.get("event_id")
    limit = int(request.query_params.get("limit", 50))
    if not event_id:
        return Response({"error": "event_id required"}, status=400)
    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response({"error": "event not found"}, status=404)

    snaps = (
        HeadcountSnapshot.objects.filter(event=event)
        .order_by("-timestamp")[:limit]
        .values("timestamp", "headcount", "source")
    )
    return Response({"event_id": event.id, "history": list(snaps)})


@api_view(["GET"])
@permission_classes([AllowAny])
def heatmap_view(request):
    event_id = request.query_params.get("event_id")
    interval = int(request.query_params.get("interval", 300))
    if not event_id:
        return Response({"error": "event_id required"}, status=400)

    heatmap_data = (
        HeadcountSnapshot.objects.filter(event_id=event_id)
        .annotate(ts=TruncSecond("timestamp"))
        .values("ts")
        .annotate(avg_headcount=Avg("headcount"))
        .order_by("ts")
    )
    return Response(HeatmapBucketSerializer(heatmap_data, many=True).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def alerts_view(request):
    event_id = request.query_params.get("event_id")
    if not event_id:
        return Response({"error": "event_id required"}, status=400)

    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response({"error": "event not found"}, status=404)

    latest = event.snapshots.order_by("-timestamp").first()
    alerts = []
    if latest:
        if latest.headcount > getattr(event, "crowded_threshold", 0):
            alerts.append(
                {
                    "level": "critical",
                    "message": f"Crowd exceeded {event.crowded_threshold}",
                    "timestamp": latest.timestamp,
                }
            )
        elif latest.headcount > getattr(event, "safety_threshold", 0):
            alerts.append(
                {
                    "level": "warning",
                    "message": f"Crowd nearing threshold ({latest.headcount}/{event.crowded_threshold})",
                    "timestamp": latest.timestamp,
                }
            )
    return Response(alerts)


# -----------------------
# QR code generation
# -----------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def qr_for_event(request, event_id):
    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response({"error": "event not found"}, status=404)

    if event.manager != request.user:
        return Response({"error": "permission denied"}, status=403)

    frontend_url = getattr(settings, "FRONTEND_BASE_URL", "http://localhost:3000")
    scan_url = f"{frontend_url}/scan/{event.qr_token}"
    data_uri = generate_qr_datauri(scan_url)
    return Response({"qr_data_uri": data_uri, "scan_url": scan_url})

  
 class SnapshotCreateView(APIView):
    """
    POST /api/snapshots/<event_id>/
    Body JSON: {"headcount": int, "source": "sensor" (optional)}
    """
    permission_classes = [AllowAny]  # set to appropriate auth later

    def post(self, request, event_id=None):
        try:
            headcount = int(request.data.get("headcount"))
        except (TypeError, ValueError):
            return Response({"error": "Invalid headcount"}, status=400)

        snap = HeadcountSnapshot.objects.create(
            event_id=event_id,
            headcount=headcount,
            timestamp=timezone.now(),
            source=request.data.get("source", "sensor"),
        )

        # Broadcast headcount update
        broadcast_snapshot(snap)

        # Check for alerts and broadcast if created
        alert = check_alerts_for_snapshot(snap)
        if alert:
            async_to_sync(get_channel_layer().group_send)(
                f"event_{event_id}", {"type": "alert_message", "data": AlertSerializer(alert).data}
            )

        return Response({"status": "ok", "headcount": headcount, "event_id": event_id})


@api_view(['GET'])
def heatmap(request):
    """
    GET /api/heatmap/?event_id=<id>&minutes=60&interval=10
    Returns aggregated headcount snapshots in time buckets.
    """
    event_id = request.query_params.get("event_id")
    if not event_id:
        return Response({"error": "event_id required"}, status=400)

    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response({"error": "event not found"}, status=404)

    minutes = int(request.query_params.get("minutes", 60))
    interval = int(request.query_params.get("interval", 10))

    from .services import heatmap_for_event
    data = heatmap_for_event(event, minutes=minutes, interval=interval)

    return Response(data)