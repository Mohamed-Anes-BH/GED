from django.urls import path
from .views import kpi_global, recent_activity

app_name = 'dashboard'

urlpatterns = [
    path('dashboard/kpis/', kpi_global, name='kpi_global'),
    path('dashboard/recent-activity/', recent_activity, name='recent_activity'),
]
