from django.shortcuts import render, get_object_or_404
from .models import Event

def events_list_template(request):
    return render(request, "core/events_list.html")

def event_detail_template(request, event_id):
    # optional: ensure event exists so template doesn't 404
    event = get_object_or_404(Event, id=event_id)
    return render(request, "core/event_detail.html", {"event": event})


def alerts_event_page(request, event_id):
    """
    Renders the alerts page for a specific event id.
    Public page; acknowledgement requires auth on the API endpoint.
    """
    event = None
    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        event = None
    return render(request, "core/alerts_event.html", {"event": event, "event_id": event_id})


def code_entry_page(request):
    return render(request, 'code_entry.html')