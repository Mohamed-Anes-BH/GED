from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourrierEntrantViewSet, CourrierSortantViewSet,
    DiffusionViewSet, PieceJointeViewSet,
    PhysicalLocationViewSet, courriers_kpis
)

app_name = 'courriers'

router = DefaultRouter()
router.register(r'entrants',           CourrierEntrantViewSet,    basename='entrant')
router.register(r'sortants',           CourrierSortantViewSet,    basename='sortant')
router.register(r'diffusions',         DiffusionViewSet,          basename='diffusion')
router.register(r'attachments',        PieceJointeViewSet,        basename='pj')
router.register(r'physical-locations', PhysicalLocationViewSet,   basename='physical-location')

urlpatterns = [
    path('courriers/', include(router.urls)),
    path('courriers/kpis/', courriers_kpis, name='courriers-kpis'),
]
