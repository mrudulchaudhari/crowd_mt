from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EventViewSet, ManagerEventViewSet, CustomAuthToken,
    heatmap, PublicEventViewSet, AlertViewSet, HeadcountSnapshotViewSet, acknowledge_alert, code_entry_page, scan, scan_by_token
)


# Routers for DRF API
router = DefaultRouter()
router.register(r'events', PublicEventViewSet, basename='public-event')
router.register(r'manager/events', ManagerEventViewSet, basename='manager-event')

urlpatterns = [
    # API routes
    path('', include(router.urls)),
    path('', include('core.api_urls')),
    path('api-token-auth/', CustomAuthToken.as_view(), name='api_token_auth'),
    path("api/heatmap/<int:event_id>/", heatmap, name="heatmap"),
    

    # Template test UI
    path('', include('core.urls_templates')), 
    path('scanner/', code_entry_page, name='code_entry_form'),  # add this view (simple render)

    # API endpoints (already provided in your views.py)
    path('api/scan/', scan, name='scan'),
    path('api/scan-by-token/', scan_by_token, name='scan_by_token'), # 👈 this line adds test frontend
]
