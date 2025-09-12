from django.urls import path
from . import views

# These are the specific, function-based API endpoints
urlpatterns = [
    path('scan_by_token/', views.scan_by_token, name='scan_by_token'),
    path('admin_update/', views.admin_update, name='admin_update'),
    path('status/', views.status_view, name='status'),
    path('history/', views.history_view, name='history'),
    path('heatmap/', views.heatmap_view, name='heatmap'),
    path('alerts/', views.alerts_view, name='alerts'),
    path('qr/<int:event_id>/', views.qr_for_event, name='qr_for_event'),
]

