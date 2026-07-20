from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import PageNumberPagination

from .models import (
    Direction, Departement, Service, Categorie, Tag, Correspondant, 
    Site, Batiment, Bureau, Armoire, Etagere, BoiteArchive, PhysicalLocation
)
from .serializers import (
    DirectionSerializer, DepartementSerializer, ServiceSerializer,
    CategorieSerializer, TagSerializer, CorrespondantSerializer,
    SiteSerializer, BatimentSerializer, BureauSerializer,
    ArmoireSerializer, EtagereSerializer, BoiteArchiveSerializer,
    PhysicalLocationSerializer
)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 1000

class BaseOrganizationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    pagination_class = StandardResultsSetPagination

class DirectionViewSet(BaseOrganizationViewSet):
    queryset = Direction.objects.all()
    serializer_class = DirectionSerializer
    filterset_fields = ['status', 'is_active']
    search_fields = ['name', 'code']

    @action(detail=True, methods=['get'])
    def departements(self, request, pk=None):
        direction = self.get_object()
        depts = Departement.objects.filter(direction=direction)
        return Response(DepartementSerializer(depts, many=True).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.departements.exists():
            raise ValidationError({"detail": "Impossible de supprimer cette direction car elle contient des départements."})
        return super().destroy(request, *args, **kwargs)

class DepartementViewSet(BaseOrganizationViewSet):
    queryset = Departement.objects.all()
    serializer_class = DepartementSerializer
    filterset_fields = ['direction', 'status', 'is_active']
    search_fields = ['name', 'code']

    @action(detail=True, methods=['get'])
    def services(self, request, pk=None):
        dept = self.get_object()
        srvs = Service.objects.filter(departement=dept)
        return Response(ServiceSerializer(srvs, many=True).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.services.exists():
            raise ValidationError({"detail": "Impossible de supprimer ce département car il contient des services."})
        return super().destroy(request, *args, **kwargs)

class ServiceViewSet(BaseOrganizationViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    filterset_fields = ['departement', 'status', 'is_active']
    search_fields = ['name', 'code']

class CategorieViewSet(BaseOrganizationViewSet):
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    filterset_fields = ['parent', 'status', 'is_active']
    search_fields = ['name', 'code']

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.document_set.exists():
            raise ValidationError({"detail": "Impossible de supprimer cette catégorie car elle est utilisée par des documents."})
        return super().destroy(request, *args, **kwargs)

class TagViewSet(BaseOrganizationViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    filterset_fields = ['status']
    search_fields = ['name', 'color', 'status']
    ordering_fields = ['name', 'color', 'status', 'created_at']
    ordering = ['name']

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        tag = self.get_object()
        tag.status = 'archived'
        tag.save()
        return Response(self.get_serializer(tag).data)

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

class PhysicalLocationViewSet(BaseOrganizationViewSet):
    queryset = PhysicalLocation.objects.all()
    serializer_class = PhysicalLocationSerializer
    filterset_fields = ['site', 'building', 'office', 'treasury', 'shelf', 'box_number', 'document_number']
    search_fields = ['box_number', 'document_number']
