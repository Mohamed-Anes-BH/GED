from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppSettingsViewSet, BackupRecordViewSet

app_name = 'settings_app'

router = DefaultRouter()
router.register(r'global', AppSettingsViewSet, basename='appsettings')
router.register(r'backups', BackupRecordViewSet, basename='backuprecord')

urlpatterns = [
    path('settings/', include(router.urls)),
]
