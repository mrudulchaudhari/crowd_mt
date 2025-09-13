from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.urls import reverse
import uuid


def default_qr_token():
    """
    Generate a short unique token for QR usage.
    We deliberately use the first 10 hex chars of a uuid4 to keep tokens short.
    """
    return uuid.uuid4().hex[:10]


class Event(models.Model):
    """
    Event model representing an event for crowd monitoring.

    Notes:
    - safe_threshold is the DB field (legacy name). Use the `safety_threshold`
      property in code/templates for the canonical name.
    - location is optional (string) and will be used for filtering in event lists.
    """
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    date = models.DateField(null=True, blank=True)

    # Legacy DB column name kept for minimal migration friction.
    safe_threshold = models.IntegerField(default=500, help_text="Legacy field name; prefer safety_threshold in code.")
    crowded_threshold = models.IntegerField(default=1000)

    # NEW
    location = models.CharField(max_length=255, null=True, blank=True, help_text="Human-readable location (city/venue).")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    manager = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_events',
        help_text="User who manages this event (can acknowledge alerts / edit event)."
    )

    qr_token = models.CharField(max_length=64, unique=True, default=default_qr_token)

    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['qr_token']),
            models.Index(fields=['location']),
        ]
        verbose_name = "Event"
        verbose_name_plural = "Events"

    def __str__(self):
        date_str = self.date.isoformat() if self.date else "unspecified date"
        return f"{self.name} ({date_str})"

    def get_absolute_url(self):
        # Assumes you have a URL pattern like /events/<id>/
        try:
            return reverse('core_templates:event_detail', args=[self.id])
        except Exception:
            return f"/events/{self.id}/"

    @property
    def safety_threshold(self):
        """
        Backwards-compatible alias used across views/serializers/templates.
        """
        return self.safe_threshold

    def latest_headcount(self):
        """
        Convenient helper to get the most recent headcount snapshot (or None).
        """
        last = getattr(self, 'snapshots', None)
        if last is None:
            return None
        last_snap = self.snapshots.order_by('-timestamp').first()
        return last_snap.headcount if last_snap else None


class HeadcountSnapshot(models.Model):
    """
    Stores a headcount snapshot for an event.
    source: 'admin' | 'qr' | 'ml' are supported.
    """
    SOURCE_ADMIN = 'admin'
    SOURCE_QR = 'qr'
    SOURCE_ML = 'ml'
    SOURCE_CHOICES = (
        (SOURCE_ADMIN, 'Admin'),
        (SOURCE_QR, 'QR'),
        (SOURCE_ML, 'ML'),
    )

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='snapshots'
    )
    headcount = models.IntegerField()
    source = models.CharField(max_length=10, choices=SOURCE_CHOICES, default=SOURCE_QR)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['event', 'timestamp']),
        ]
        verbose_name = "Headcount Snapshot"
        verbose_name_plural = "Headcount Snapshots"

    def __str__(self):
        return f"{self.event.name} - {self.headcount} (@{self.timestamp.isoformat()})"


class Alert(models.Model):
    """
    Alerts triggered from snapshot checks or manual creation.
    - alert_type: short keyword (e.g. 'capacity', 'spike', 'stale')
    - resolved / acknowledged fields for workflow
    """
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=50)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    # optional workflow fields
    resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    acknowledged = models.BooleanField(default=False)
    acknowledged_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='acknowledged_alerts')

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['event', 'created_at']),
            models.Index(fields=['alert_type']),
        ]
        verbose_name = "Alert"
        verbose_name_plural = "Alerts"

    def __str__(self):
        short = (self.message[:60] + '...') if len(self.message) > 60 else self.message
        return f"[{self.alert_type}] {short}"

    def mark_resolved(self, by_user=None):
        self.resolved = True
        self.resolved_at = timezone.now()
        if by_user:
            self.acknowledged_by = by_user
        self.save(update_fields=['resolved', 'resolved_at', 'acknowledged_by'])
