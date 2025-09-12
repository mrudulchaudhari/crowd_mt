from datetime import timedelta
from django.utils import timezone
from .models import HeadcountSnapshot


def heatmap_for_event(event, minutes=60, interval=10):
    """
    Aggregate headcount snapshots for an event in the last `minutes`.
    Groups snapshots into buckets of `interval` minutes.
    Returns list of {"time": ..., "count": ...}.
    """
    since = timezone.now() - timedelta(minutes=minutes)
    snaps = HeadcountSnapshot.objects.filter(
        event=event,
        timestamp__gte=since
    ).order_by("timestamp")

    buckets = {}
    for snap in snaps:
        bucket_minute = (snap.timestamp.minute // interval) * interval
        bucket_time = snap.timestamp.replace(
            minute=bucket_minute, second=0, microsecond=0
        )
        # here we just use the last headcount in that bucket
        # (or sum them, depending on what you want to visualize)
        buckets[bucket_time] = snap.headcount

    return [{"time": t.isoformat(), "count": c} for t, c in sorted(buckets.items())]
