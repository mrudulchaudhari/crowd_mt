from django.urls import path
from . import views_templates

app_name = "core_templates"

urlpatterns = [
    path("test/events/", views_templates.events_list_template, name="events_list"),
    path("test/events/<int:event_id>/", views_templates.event_detail_template, name="event_detail"),
]
