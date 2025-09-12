from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EventViewSet, ManagerEventViewSet, CustomAuthToken,
    heatmap, PublicEventViewSet, AlertViewSet, HeadcountSnapshotViewSet
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
    path("api/heatmap/", heatmap, name="heatmap"),

    # Template test UI
    path('', include('core.urls_templates')),  # 👈 this line adds test frontend
]
