from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DossierViewSet, DossierPermissionViewSet

app_name = 'dossiers'

router = DefaultRouter()
router.register(r'dossiers', DossierViewSet, basename='dossier')
router.register(r'dossier-permissions', DossierPermissionViewSet, basename='dossierpermission')

urlpatterns = [
    path('', include(router.urls)),
]
