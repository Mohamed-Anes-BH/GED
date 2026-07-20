from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DirectionViewSet, DepartementViewSet, ServiceViewSet,
    CategorieViewSet, TagViewSet, CorrespondantViewSet,
    SiteViewSet, BatimentViewSet, BureauViewSet,
    ArmoireViewSet, EtagereViewSet, BoiteArchiveViewSet,
    PhysicalLocationViewSet
)

app_name = 'organization'

router = DefaultRouter()
router.register(r'directions', DirectionViewSet, basename='direction')
router.register(r'departements', DepartementViewSet, basename='departement')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'categories', CategorieViewSet, basename='categorie')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'correspondants', CorrespondantViewSet, basename='correspondant')
router.register(r'sites', SiteViewSet, basename='site')
router.register(r'batiments', BatimentViewSet, basename='batiment')
router.register(r'bureaux', BureauViewSet, basename='bureau')
router.register(r'armoires', ArmoireViewSet, basename='armoire')
router.register(r'etageres', EtagereViewSet, basename='etagere')
router.register(r'boites-archives', BoiteArchiveViewSet, basename='boitearchive')
router.register(r'physical-locations', PhysicalLocationViewSet, basename='physicallocation')

urlpatterns = [
    path('', include(router.urls)),
]
