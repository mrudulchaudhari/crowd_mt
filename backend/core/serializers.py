from rest_framework import serializers
from .models import Event, HeadcountSnapshot
from .models import Alert


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
        if headcount < obj.safe_threshold:
            return "Green"
        elif headcount > obj.crowded_threshold:
            return "Red"
        return "Yellow"


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
    class Meta:
        model = Alert
        fields = "__all__"
