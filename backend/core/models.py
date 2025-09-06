from django.db import models
from django.utils import timezone


class Event(models.Model):
    name = models.CharField(max_length=200)
    date = models.DateField(null=True, blank=True)

    # Renamed for clarity
    safe_threshold = models.IntegerField(default=500)        # Below this → Green
    crowded_threshold = models.IntegerField(default=1000)    # Above this → Red

    created_at = models.DateTimeField(auto_now_add=True)

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
