# backend/predictor/management/commands/predict_headcount.py
from django.core.management.base import BaseCommand
from django.utils import timezone

from predictor.utils import predict_next_hours, save_predictions
from core.models import Event  # adjust

class Command(BaseCommand):
    help = "Run headcount predictions for active events and save results."

    def add_arguments(self, parser):
        parser.add_argument("--hours", type=int, default=1, help="How many hours to predict ahead")
        parser.add_argument("--event", type=int, help="Optional event id to run for only one event")

    def handle(self, *args, **options):
        hours = options["hours"]
        event_id = options.get("event")
        now = timezone.now()

        events = Event.objects.all()
        if event_id:
            events = events.filter(pk=event_id)

        for ev in events:
            # define how to get current headcount for this event:
            # try last snapshot or a real-time source
            last = ev.headcountsnapshot_set.order_by("-recorded_at").first()
            if last:
                current = last.headcount
            else:
                # fallback: 0
                current = 0

            preds = predict_next_hours(current, when=now, n_hours=hours)
            saved = save_predictions(ev.id, preds)
            self.stdout.write(self.style.SUCCESS(f"Event {ev.id}: saved {len(saved or [])} predictions"))
