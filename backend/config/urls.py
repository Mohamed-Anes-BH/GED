from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/', include('apps.users.urls')),
    path('api/', include('apps.organization.urls')),
    path('api/organization/', include('apps.organization.urls')),
    path('api/', include('apps.documents.urls')),
    path('api/', include('apps.dossiers.urls')),
    path('api/', include('apps.courriers.urls')),
    path('api/', include('apps.workflow.urls')),
    path('api/', include('apps.ocr.urls')),
    path('api/', include('apps.notifications.urls')),
    path('api/', include('apps.audit.urls')),
    path('api/', include('apps.dashboard.urls')),
    path('api/', include('apps.settings_app.urls')),
    path('api/', include('apps.messagerie.urls')),
    path('api/', include('apps.common.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
