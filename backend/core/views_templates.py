from django.shortcuts import render, get_object_or_404
from .models import Event

def events_list_template(request):
    return render(request, "core/events_list.html")

def event_detail_template(request, event_id):
    # optional: ensure event exists so template doesn't 404
    event = get_object_or_404(Event, id=event_id)
    return render(request, "core/event_detail.html", {"event": event})
