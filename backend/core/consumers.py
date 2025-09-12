# backend/core/core/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer


class EventConsumer(AsyncWebsocketConsumer):
    """
    WS consumer for an Event.
    Connect URL: /ws/event/<event_id>/
    Joins group: event_<event_id>
    Handles: headcount_update, alert_message, event_update
    """

    async def connect(self):
        self.event_id = self.scope["url_route"]["kwargs"].get("event_id")
        if not self.event_id:
            await self.close(code=4001)
            return

        self.group_name = f"event_{self.event_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # small confirmation
        await self.send_json({"type": "connection_established", "event_id": self.event_id})

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        if not text_data:
            return
        try:
            payload = json.loads(text_data)
        except Exception:
            await self.send_json({"type": "echo", "raw": text_data})
            return

        # simple ping support
        if payload.get("action") == "ping":
            await self.send_json({"type": "pong"})
        else:
            await self.send_json({"type": "echo", "payload": payload})

    # Group handlers (method names must match the 'type' from group_send)
    async def headcount_update(self, event):
        data = event.get("data", {})
        await self.send_json(
            {
                "type": "headcount_update",
                "headcount": data.get("headcount"),
                "timestamp": data.get("timestamp"),
                "source": data.get("source"),
                "meta": {"event_id": data.get("event_id")},
            }
        )

    async def alert_message(self, event):
        # forward serialized alert under 'alert' key; clients will receive "type":"alert"
        data = event.get("data", {})
        await self.send_json({"type": "alert", "alert": data})

    async def event_update(self, event):
        await self.send_json(
            {
                "type": "event_update",
                "headcount": event.get("headcount"),
                "status": event.get("status"),
            }
        )

    async def send_json(self, content):
        await self.send(text_data=json.dumps(content))
