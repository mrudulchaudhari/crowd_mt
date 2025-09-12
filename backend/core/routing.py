from django.urls import re_path
from . import consumers

# Use consistent URL pattern: "ws/event/<id>/"
websocket_urlpatterns = [
    re_path(r"ws/event/(?P<event_id>\d+)/$", consumers.EventConsumer.as_asgi()),
    re_path(r"ws/events/(?P<event_id>\d+)/$", consumers.EventConsumer.as_asgi()),
]
