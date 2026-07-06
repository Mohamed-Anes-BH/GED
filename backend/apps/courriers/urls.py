from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourrierEntrantViewSet, CourrierSortantViewSet, DiffusionViewSet

app_name = 'courriers'

router = DefaultRouter()
router.register(r'entrants', CourrierEntrantViewSet, basename='entrant')
router.register(r'sortants', CourrierSortantViewSet, basename='sortant')
router.register(r'diffusions', DiffusionViewSet, basename='diffusion')

urlpatterns = [
    path('courriers/', include(router.urls)),
]
