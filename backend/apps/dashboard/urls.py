from django.urls import path
from .views import (
    kpi_global, recent_activity, recent_documents,
    storage_info, calendar_events, stats_documents,
    stats_courriers, stats_users, stats_storage,
    stats_evolution, stats_by_category, stats_by_department,
    export_stats,
)

app_name = 'dashboard'

urlpatterns = [
    # Dashboard principal
    path('dashboard/kpis/', kpi_global, name='kpi_global'),
    path('dashboard/recent-activity/', recent_activity, name='recent_activity'),
    path('dashboard/recent-documents/', recent_documents, name='recent_documents'),
    path('dashboard/storage/', storage_info, name='storage_info'),
    path('dashboard/calendar/', calendar_events, name='calendar_events'),
    
    # Statistiques détaillées
    path('stats/documents/', stats_documents, name='stats_documents'),
    path('stats/courriers/', stats_courriers, name='stats_courriers'),
    path('stats/users/', stats_users, name='stats_users'),
    path('stats/storage/', stats_storage, name='stats_storage'),
    path('stats/evolution/', stats_evolution, name='stats_evolution'),
    path('stats/by-category/', stats_by_category, name='stats_by_category'),
    path('stats/by-department/', stats_by_department, name='stats_by_department'),
    path('stats/export/', export_stats, name='export_stats'),
]
