from rest_framework import serializers
from .models import Event, HeadcountSnapshot
from .models import Alert, Event, HeadcountSnapshot


class HeadcountSnapshotSerializer(serializers.ModelSerializer):
    """
    Serializer for individual headcount snapshots.
    Displays event name for readability.
    """

    event = serializers.StringRelatedField()  # Shows event name instead of ID

    class Meta:
        model = HeadcountSnapshot
        fields = ["id", "event", "headcount", "source", "timestamp"]


class EventSerializer(serializers.ModelSerializer):
    """
    Serializer for Event model.
    Adds dynamic fields:
        - current_headcount: latest snapshot count
        - status: Green / Yellow / Red based on thresholds
    """

    current_headcount = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "name",
            "date",
            "safe_threshold",
            "crowded_threshold",
            "created_at",
            "current_headcount",
            "status",
        ]

    def get_current_headcount(self, obj):
        """
        Returns the latest headcount for the event.
        """
        latest_snapshot = obj.headcountsnapshot_set.order_by("-timestamp").first()
        return latest_snapshot.headcount if latest_snapshot else 0

    def get_status(self, obj):
        """
        Determines crowd status based on thresholds.
        """
        headcount = self.get_current_headcount(obj)
        if headcount >= obj.crowded_threshold:
            return "Red"
        elif headcount >= obj.safe_threshold:
            return "Yellow"
        return "Green"



class EventDetailSerializer(EventSerializer):
    """
    Detailed serializer for Event.
    Includes all snapshots for admin verification.
    """

    snapshots = HeadcountSnapshotSerializer(
        source="headcountsnapshot_set", many=True, read_only=True
    )

    class Meta(EventSerializer.Meta):
        fields = EventSerializer.Meta.fields + ["snapshots"]

class AlertSerializer(serializers.ModelSerializer):
    event_name = serializers.CharField(source="event.name", read_only=True)
    event_id = serializers.IntegerField(source="event.id", read_only=True)

    class Meta:
        model = Alert
        fields = [
            "id",
            "event_id",
            "event_name",
            "alert_type",
            "message",
            "created_at",
            "resolved",
        ]
        read_only_fields = ["id", "created_at"]


class StatusSerializer(serializers.Serializer):
    """
    Serializer for the ad-hoc status dict returned by status_view.
    Fields: headcount, status, source, predicted_next_hour, timestamp
    """
    headcount = serializers.IntegerField()
    status = serializers.CharField()
    source = serializers.CharField(allow_null=True)
    predicted_next_hour = serializers.FloatField(allow_null=True)
    timestamp = serializers.DateTimeField()


class HeatmapBucketSerializer(serializers.Serializer):
    """
    Serializer for heatmap aggregation rows.
    Expects items with keys: 'ts' (timestamp) and 'avg_headcount' (float)
    """
    ts = serializers.DateTimeField()
    avg_headcount = serializers.FloatField()