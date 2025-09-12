from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, ManagerEventViewSet, CustomAuthToken # Import the new view

router = DefaultRouter()
# Public endpoint for visitors
router.register(r'events', EventViewSet, basename='event')
# Protected endpoint for event managers
router.register(r'manager/events', ManagerEventViewSet, basename='manager-event')

urlpatterns = [
    path('', include(router.urls)),
    # ADD THIS NEW LINE FOR THE LOGIN ENDPOINT
    path('api-token-auth/', CustomAuthToken.as_view(), name='api_token_auth'),
]

