from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
import uuid


def default_qr_token():
    return uuid.uuid4().hex[:10]


class Event(models.Model):
    name = models.CharField(max_length=200)
    date = models.DateField(null=True, blank=True)
    safe_threshold = models.IntegerField(default=500)
    crowded_threshold = models.IntegerField(default=1000)
    created_at = models.DateTimeField(auto_now_add=True)

    manager = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_events',
        help_text="The user responsible for managing this event."
    )

    qr_token = models.CharField(max_length=64, unique=True, default=default_qr_token)

    def __str__(self):
        return f"{self.name} ({self.date})"


class HeadcountSnapshot(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    headcount = models.IntegerField()
    source = models.CharField(
        max_length=10,
        choices=(('admin', 'Admin'), ('qr', 'QR'), ('ml', 'ML'))
    )
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.event.name} - {self.headcount} ({self.source})"


class Alert(models.Model):
    event = models.ForeignKey("Event", on_delete=models.CASCADE)
    alert_type = models.CharField(max_length=50)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"[{self.alert_type}] {self.message[:50]}"
