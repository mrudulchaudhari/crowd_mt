# backend/core/views.py
from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView

from django.utils import timezone
from django.conf import settings

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import Event, HeadcountSnapshot
from .serializers import EventSerializer, EventDetailSerializer, HeadcountSnapshotSerializer

from .utils import generate_qr_datauri

# -----------------------
# Broadcast helper
# -----------------------
def broadcast_snapshot(snap):
    layer = get_channel_layer()
    group = f"event_{snap.event.id}"
    data = {
        "headcount": snap.headcount,
        "timestamp": snap.timestamp.isoformat(),
        "source": snap.source,
        "event_id": snap.event.id,
    }
    # consumer handler must be 'headcount_update'
    async_to_sync(layer.group_send)(group, {"type": "headcount_update", "data": data})


# -----------------------
# Public Event listing
# -----------------------
class EventViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Event.objects.all().order_by('-date')
    serializer_class = EventSerializer
    permission_classes = [AllowAny]


# -----------------------
# Scan by event_id (compat)
# -----------------------
@api_view(['POST'])
def scan(request):
    """
    POST /api/scan/
    Body: {"event_id": <int>, "increment": <int>}
    """
    event_id = request.data.get("event_id")
    if not event_id:
        return Response({"error":"event_id required"}, status=400)
    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response({"error":"event not found"}, status=404)

    increment = int(request.data.get("increment", 1))
    last = HeadcountSnapshot.objects.filter(event=event).order_by('-timestamp').first()
    new_count = (last.headcount if last else 0) + increment
    snap = HeadcountSnapshot.objects.create(event=event, headcount=new_count, source='qr', timestamp=timezone.now())
    broadcast_snapshot(snap)
    return Response({"headcount": new_count, "event_id": event.id})


# -----------------------
# Scan by token (QR)
# -----------------------
@api_view(['POST'])
def scan_by_token(request):
    """
    POST /api/scan_by_token/
    Body JSON: {"token":"<qr_token>", "increment":1}
    Public endpoint — people scanning QR should be allowed to hit this.
    """
    token = request.data.get("token") or request.query_params.get("token")
    if not token:
        return Response({"error":"token required"}, status=400)

    try:
        event = Event.objects.get(qr_token=token)
    except Event.DoesNotExist:
        return Response({"error":"invalid token"}, status=404)

    increment = int(request.data.get("increment", 1))
    last = HeadcountSnapshot.objects.filter(event=event).order_by('-timestamp').first()
    new_count = (last.headcount if last else 0) + increment
    snap = HeadcountSnapshot.objects.create(event=event, headcount=new_count, source='qr', timestamp=timezone.now())
    broadcast_snapshot(snap)
    return Response({"headcount": new_count, "event_id": event.id, "token": token})


# -----------------------
# Admin update (protected)
# -----------------------
@api_view(['POST'])
def admin_update(request):
    """
    POST /api/admin_update/
    Body JSON: {"event_id": <int>, "headcount": <int>}
    """
    # protect this endpoint; change to AllowAny if you want open admin updates for demo
    if not request.user or not request.user.is_authenticated:
        return Response({"error":"authentication required"}, status=401)

    event_id = request.data.get("event_id")
    if not event_id:
        return Response({"error":"event_id required"}, status=400)
    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response({"error":"event not found"}, status=404)

    new_count = int(request.data.get("headcount", 0))
    snap = HeadcountSnapshot.objects.create(event=event, headcount=new_count, source='admin', timestamp=timezone.now())
    broadcast_snapshot(snap)
    return Response({"headcount": new_count, "event_id": event.id})


# -----------------------
# Status & history
# -----------------------
@api_view(['GET'])
def status(request):
    """
    GET /api/status/?event_id=<id>
    """
    event_id = request.query_params.get("event_id")
    if not event_id:
        return Response({"error":"event_id required"}, status=400)
    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response({"error":"event not found"}, status=404)

    last = HeadcountSnapshot.objects.filter(event=event).order_by('-timestamp').first()
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

    thr = event.safety_threshold or 1
    ratio = headcount / thr
    if ratio < 0.6:
        color = "green"
    elif ratio < 0.9:
        color = "yellow"
    else:
        color = "red"

    return Response({"headcount": headcount, "color": color, "source": source, "event_id": event.id})


@api_view(['GET'])
def history(request):
    """
    GET /api/history/?event_id=<id>&limit=20
    """
    event_id = request.query_params.get("event_id")
    limit = int(request.query_params.get("limit", 20))
    if not event_id:
        return Response({"error":"event_id required"}, status=400)
    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response({"error":"event not found"}, status=404)

    snaps = HeadcountSnapshot.objects.filter(event=event).order_by('-timestamp')[:limit]
    data = HeadcountSnapshotSerializer(snaps, many=True).data
    return Response(data)


# -----------------------
# QR generation endpoint
# -----------------------
@api_view(['GET'])
def qr_for_event(request, event_id):
    """
    GET /api/qr/<event_id>/
    Returns data-uri PNG for a QR that points to frontend scan route.
    """
    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response({"error":"event not found"}, status=404)

    FRONTEND_BASE = getattr(settings, "FRONTEND_BASE_URL", "http://localhost:5173")
    scan_url = f"{FRONTEND_BASE}/scan/{event.qr_token}"
    datauri = generate_qr_datauri(scan_url)
    return Response({"qr_datauri": datauri, "token": event.qr_token, "scan_url": scan_url})
