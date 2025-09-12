from rest_framework import serializers
from .models import Event, HeadcountSnapshot, Alert

class HeadcountSnapshotSerializer(serializers.ModelSerializer):
    """
    Serializer for individual headcount snapshots.
    """
    event = serializers.StringRelatedField()

    class Meta:
        model = HeadcountSnapshot
        fields = ["id", "event", "headcount", "source", "timestamp"]

class EventSerializer(serializers.ModelSerializer):
    """
    Serializer for the public list view of events.
    Adds dynamic fields for the current headcount and status.
    """
    current_headcount = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id", "name", "date", "safe_threshold", "crowded_threshold",
            "created_at", "qr_token", "current_headcount", "status",
        ]

    def get_current_headcount(self, obj):
        """
        Returns the latest headcount for the event.
        """
        latest_snapshot = obj.snapshots.order_by("-timestamp").first()
        return latest_snapshot.headcount if latest_snapshot else 0

    def get_status(self, obj):
        """
        Determines the crowd status based on the current headcount and thresholds.
        """
        headcount = self.get_current_headcount(obj)
        if headcount > obj.crowded_threshold:
            return "Red"
        elif headcount > obj.safe_threshold:
            return "Yellow"
        return "Green"

class EventDetailSerializer(EventSerializer):
    """
    Detailed serializer for a single event.
    Includes all snapshots for historical data.
    """
    snapshots = HeadcountSnapshotSerializer(many=True, read_only=True)

    class Meta(EventSerializer.Meta):
        fields = EventSerializer.Meta.fields + ["snapshots"]

# --- New Serializers for Advanced API Endpoints ---

class AlertSerializer(serializers.ModelSerializer):
    """
    Serializer for the Alert model.
    """
    class Meta:
        model = Alert
        fields = ['id', 'event', 'alert_type', 'message', 'created_at', 'resolved']

class StatusSerializer(serializers.Serializer):
    """
    Serializer for the custom status endpoint.
    This doesn't use a model because it combines data from multiple sources.
    """
    headcount = serializers.IntegerField()
    status = serializers.CharField()
    source = serializers.CharField()
    predicted_next_hour = serializers.IntegerField()
    timestamp = serializers.DateTimeField()

class HeatmapBucketSerializer(serializers.Serializer):
    """
    Serializer for the aggregated heatmap data.
    """
    timestamp_bucket = serializers.DateTimeField()
    avg_headcount = serializers.FloatField()

