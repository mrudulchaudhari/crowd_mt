from django.urls import path
from . import views_templates
from .views import acknowledge_alert

app_name = "core_templates"

urlpatterns = [
    path("test/events/", views_templates.events_list_template, name="events_list"),
    path("test/events/<int:event_id>/", views_templates.event_detail_template, name="event_detail"),
    path('alerts/<int:event_id>/', views_templates.alerts_event_page, name='alerts_event'),

]
