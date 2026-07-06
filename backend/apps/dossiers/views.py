from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Dossier, DossierPermission
from .serializers import DossierSerializer, DossierPermissionSerializer
from apps.documents.models import Document
from apps.documents.serializers import DocumentSerializer

class DossierViewSet(viewsets.ModelViewSet):
    queryset = Dossier.objects.all()
    serializer_class = DossierSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['parent', 'direction', 'departement', 'service', 'responsable', 'is_archived']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def content(self, request, pk=None):
        """Retourne les sous-dossiers et les documents contenus dans ce dossier"""
        dossier = self.get_object()
        
        # Sous-dossiers
        subfolders = Dossier.objects.filter(parent=dossier)
        subfolders_data = DossierSerializer(subfolders, many=True).data
        
        # Documents
        documents = Document.objects.filter(dossier=dossier, is_deleted=False)
        documents_data = DocumentSerializer(documents, many=True).data
        
        return Response({
            'dossiers': subfolders_data,
            'documents': documents_data
        })

    @action(detail=True, methods=['get'])
    def tree(self, request, pk=None):
        """Récupérer l'arborescence à partir de ce dossier"""
        # Complex tree logic can be put in services.py, simplified here
        pass

class DossierPermissionViewSet(viewsets.ModelViewSet):
    queryset = DossierPermission.objects.all()
    serializer_class = DossierPermissionSerializer
    permission_classes = [IsAuthenticated]
