# backend/core/crowd_mgmt/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

# import app routing
import core.routing as core_routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "crowd_mgmt.settings")

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(core_routing.websocket_urlpatterns)
    ),
})
