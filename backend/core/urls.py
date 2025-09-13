from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views 
from .views import (
    EventViewSet, ManagerEventViewSet, CustomAuthToken,
    heatmap, PublicEventViewSet, AlertViewSet, HeadcountSnapshotViewSet,
    predict_api, batch_predict_api, model_info_api
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
    path("heatmap/<int:event_id>/", heatmap, name="heatmap"),
    path('predict/', predict_api, name='predict'),
    path('batch-predict/', batch_predict_api, name='batch_predict'),
    path('model-info/', model_info_api, name='model_info'),
    # Template test UI
    path('', include('core.urls_templates')),  # 👈 this line adds test frontend
]
