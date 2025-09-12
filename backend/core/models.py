from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User # Import the User model

class Event(models.Model):
    name = models.CharField(max_length=200)
    date = models.DateField(null=True, blank=True)
    safe_threshold = models.IntegerField(default=500)
    crowded_threshold = models.IntegerField(default=1000)
    created_at = models.DateTimeField(auto_now_add=True)

    # Add this field to link an event to a specific user
    manager = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="The user responsible for managing this event."
    )

    def __str__(self):
        return self.name

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

