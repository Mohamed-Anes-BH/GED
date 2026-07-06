from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import (
    Direction, Departement, Service, Categorie, Tag, Correspondant, 
    Site, Batiment, Bureau, Armoire, Etagere, BoiteArchive
)
from .serializers import (
    DirectionSerializer, DepartementSerializer, ServiceSerializer,
    CategorieSerializer, TagSerializer, CorrespondantSerializer,
    SiteSerializer, BatimentSerializer, BureauSerializer,
    ArmoireSerializer, EtagereSerializer, BoiteArchiveSerializer
)

class BaseOrganizationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]

class DirectionViewSet(BaseOrganizationViewSet):
    queryset = Direction.objects.all()
    serializer_class = DirectionSerializer
    filterset_fields = ['is_active']
    search_fields = ['name', 'code']

class DepartementViewSet(BaseOrganizationViewSet):
    queryset = Departement.objects.all()
    serializer_class = DepartementSerializer
    filterset_fields = ['direction', 'is_active']
    search_fields = ['name', 'code']

class ServiceViewSet(BaseOrganizationViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    filterset_fields = ['departement', 'is_active']
    search_fields = ['name', 'code']

class CategorieViewSet(BaseOrganizationViewSet):
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    filterset_fields = ['parent', 'is_active']
    search_fields = ['name', 'code']

class TagViewSet(BaseOrganizationViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    search_fields = ['name']

class CorrespondantViewSet(BaseOrganizationViewSet):
    queryset = Correspondant.objects.all()
    serializer_class = CorrespondantSerializer
    filterset_fields = ['type', 'is_active']
    search_fields = ['name', 'organisme', 'email']

class SiteViewSet(BaseOrganizationViewSet):
    queryset = Site.objects.all()
    serializer_class = SiteSerializer
    search_fields = ['name', 'address']

class BatimentViewSet(BaseOrganizationViewSet):
    queryset = Batiment.objects.all()
    serializer_class = BatimentSerializer
    filterset_fields = ['site']
    search_fields = ['name']

class BureauViewSet(BaseOrganizationViewSet):
    queryset = Bureau.objects.all()
    serializer_class = BureauSerializer
    filterset_fields = ['batiment']
    search_fields = ['name']

class ArmoireViewSet(BaseOrganizationViewSet):
    queryset = Armoire.objects.all()
    serializer_class = ArmoireSerializer
    filterset_fields = ['bureau']
    search_fields = ['name']

class EtagereViewSet(BaseOrganizationViewSet):
    queryset = Etagere.objects.all()
    serializer_class = EtagereSerializer
    filterset_fields = ['armoire']
    search_fields = ['name']

class BoiteArchiveViewSet(BaseOrganizationViewSet):
    queryset = BoiteArchive.objects.all()
    serializer_class = BoiteArchiveSerializer
    filterset_fields = ['etagere', 'status']
    search_fields = ['code', 'label']
