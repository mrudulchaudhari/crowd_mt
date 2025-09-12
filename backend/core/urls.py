from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, ManagerEventViewSet, CustomAuthToken ,heatmap,PublicEventViewSet


# The router handles the ViewSet-based endpoints for public and manager access
router = DefaultRouter()
router.register(r'events', PublicEventViewSet, basename='public-event')
router.register(r'manager/events', ManagerEventViewSet, basename='manager-event')

# The main URL configuration for the core app
urlpatterns = [
    # Includes the ViewSet routes (/api/events/, /api/manager/events/)
    path('', include(router.urls)),
    
    # Includes all the new, specific API routes from api_urls.py
    path('', include('core.api_urls')),
    
    # Includes the login route
    path('api-token-auth/', CustomAuthToken.as_view(), name='api_token_auth'),
    path("api/heatmap/", heatmap, name="heatmap"),
]
