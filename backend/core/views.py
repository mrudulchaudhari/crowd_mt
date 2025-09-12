# backend/core/views.py
from rest_framework import viewsets, mixins, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from django.utils import timezone
from django.conf import settings

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import Event, HeadcountSnapshot, Alert
from .serializers import (
    EventSerializer,
    EventDetailSerializer,
    HeadcountSnapshotSerializer,
    AlertSerializer,
)
from .utils import generate_qr_datauri


# -----------------------
# Broadcast helper
# -----------------------
def broadcast_snapshot(snap):
    """
    Broadcast a headcount update to the event group.
    Group name: event_{id}
    Message type: headcount_update
    Payload: { headcount, timestamp, source, event_id }
    """
    layer = get_channel_layer()
    group = f"event_{snap.event.id}"
    data = {
        "headcount": snap.headcount,
        "timestamp": snap.timestamp.isoformat() if hasattr(snap, "timestamp") else None,
        "source": snap.source,
        "event_id": snap.event.id,
    }
    async_to_sync(layer.group_send)(group, {"type": "headcount_update", "data": data})


# -----------------------
# Alert checks & broadcast
# -----------------------
def check_alerts_for_snapshot(snap):
    """
    Creates an Alert if conditions match, returns Alert instance or None.
    Logic:
      - capacity: headcount >= safety_threshold (if present)
      - spike: >30% increase vs previous snapshot
      - stale: if event.last_validated_at exists and is older than 30m and headcount > safety_threshold
    """
    event = snap.event
    # standardize on safety_threshold field (ensure your Event model matches)
    safety_thr = getattr(event, "safety_threshold", None) or 0
    crowded_thr = getattr(event, "crowded_threshold", None)

    # 1) Capacity breach (prefer crowded_threshold if set)
    cap_thr = crowded_thr if (crowded_thr is not None) else safety_thr
    if cap_thr and snap.headcount >= cap_thr:
        alert = Alert.objects.create(
            event=event,
            alert_type="capacity",
            message=f"Headcount {snap.headcount} >= threshold {cap_thr}",
        )
        return alert

    # 2) Rising rate (compare to previous snapshot)
    prev = (
        HeadcountSnapshot.objects.filter(event=event, timestamp__lt=snap.timestamp)
        .order_by("-timestamp")
        .first()
    )
    if prev:
        denom = prev.headcount if prev.headcount > 0 else 1
        growth_rate = (snap.headcount - prev.headcount) / denom
        if growth_rate > 0.3:
            alert = Alert.objects.create(
                event=event,
                alert_type="spike",
                message=f"Sharp spike: {growth_rate:.0%} increase in headcount",
            )
            return alert

    # 3) Staleness
    if hasattr(event, "last_validated_at") and event.last_validated_at:
        if (snap.timestamp - event.last_validated_at).total_seconds() > 1800 and snap.headcount > safety_thr:
            alert = Alert.objects.create(
                event=event,
                alert_type="stale",
                message="No admin validation recently, but crowd is above safe threshold!",
            )
            return alert

    return None


# -----------------------
# Public Event listing
# -----------------------
class EventViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Event.objects.all().order_by("-date")
    serializer_class = EventSerializer
    permission_classes = [AllowAny]


# -----------------------
# Scan by event_id (compat)
# -----------------------
@api_view(["POST"])
def scan(request):
    """
    POST /api/scan/
    Body: {"event_id": <int>, "increment": <int>}
    Public endpoint for QR scanners mapped to event_id.
    """
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

    # broadcast headcount update
    broadcast_snapshot(snap)

    # check alerts and broadcast if any (uses alert_message type)
    alert = check_alerts_for_snapshot(snap)
    if alert:
        async_to_sync(get_channel_layer().group_send)(
            f"event_{event_id}", {"type": "alert_message", "data": AlertSerializer(alert).data}
        )

    return Response({"headcount": new_count, "event_id": event.id})


# -----------------------
# Scan by token (QR)
# -----------------------
@api_view(["POST"])
def scan_by_token(request):
    """
    POST /api/scan_by_token/
    Body JSON: {"token":"<qr_token>", "increment":1}
    Public endpoint — people scanning QR should be allowed to hit this.
    """
    token = request.data.get("token") or request.query_params.get("token")
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

    # broadcast headcount update
    broadcast_snapshot(snap)

    # check alerts and broadcast if any
    alert = check_alerts_for_snapshot(snap)
    if alert:
        async_to_sync(get_channel_layer().group_send)(
            f"event_{event.id}", {"type": "alert_message", "data": AlertSerializer(alert).data}
        )

    return Response({"headcount": new_count, "event_id": event.id, "token": token})


# -----------------------
# Admin update (protected)
# -----------------------
@api_view(["POST"])
def admin_update(request):
    """
    POST /api/admin_update/
    Body JSON: {"event_id": <int>, "headcount": <int>}
    """
    if not request.user or not request.user.is_authenticated:
        return Response({"error": "authentication required"}, status=401)

    event_id = request.data.get("event_id")
    if not event_id:
        return Response({"error": "event_id required"}, status=400)
    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response({"error": "event not found"}, status=404)

    try:
        new_count = int(request.data.get("headcount", 0))
    except (TypeError, ValueError):
        return Response({"error": "Invalid headcount"}, status=400)

    snap = HeadcountSnapshot.objects.create(
        event=event, headcount=new_count, source="admin", timestamp=timezone.now()
    )

    # broadcast headcount update
    broadcast_snapshot(snap)

    # check alerts and broadcast if any
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
def status(request):
    """
    GET /api/status/?event_id=<id>
    """
    event_id = request.query_params.get("event_id")
    if not event_id:
        return Response({"error": "event_id required"}, status=400)
    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response({"error": "event not found"}, status=404)

    last = HeadcountSnapshot.objects.filter(event=event).order_by("-timestamp").first()
    use_ml = False
    if not last:
        use_ml = True
    else:
        elapsed = (timezone.now() - last.timestamp).total_seconds()
        if elapsed > 5 * 60:
            use_ml = True

    if use_ml:
        # minimal heuristic fallback (replace with ML model later)
        hour = timezone.now().hour
        base = 50
        if 17 <= hour <= 21:
            headcount = base * 8
        elif 11 <= hour <= 14:
            headcount = base * 5
        else:
            headcount = base * 2
        source = "ml"
    else:
        headcount = last.headcount
        source = last.source

    thr = getattr(event, "safety_threshold", 1) or 1
    ratio = headcount / thr
    if ratio < 0.6:
        color = "green"
    elif ratio < 0.9:
        color = "yellow"
    else:
        color = "red"

    return Response({"headcount": headcount, "color": color, "source": source, "event_id": event.id})


@api_view(["GET"])
def history(request):
    """
    GET /api/history/?event_id=<id>&limit=20
    """
    event_id = request.query_params.get("event_id")
    try:
        limit = int(request.query_params.get("limit", 20))
    except (TypeError, ValueError):
        limit = 20

    if not event_id:
        return Response({"error": "event_id required"}, status=400)
    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response({"error": "event not found"}, status=404)

    snaps = HeadcountSnapshot.objects.filter(event=event).order_by("-timestamp")[:limit]
    data = HeadcountSnapshotSerializer(snaps, many=True).data
    return Response(data)


# -----------------------
# QR generation endpoint
# -----------------------
@api_view(["GET"])
def qr_for_event(request, event_id):
    """
    GET /api/qr/<event_id>/
    Returns data-uri PNG for a QR that points to frontend scan route.
    """
    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response({"error": "event not found"}, status=404)

    FRONTEND_BASE = getattr(settings, "FRONTEND_BASE_URL", "http://localhost:5173")
    scan_url = f"{FRONTEND_BASE}/scan/{event.qr_token}"
    datauri = generate_qr_datauri(scan_url)
    return Response({"qr_datauri": datauri, "token": event.qr_token, "scan_url": scan_url})



# -----------------------
# SnapshotCreateView (for sensor / external snapshots)
# -----------------------
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
