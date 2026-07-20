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
from .services import build_tree as build_dossier_tree, get_content as get_dossier_content, log_dossier_action

class DossierViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return Dossier.objects.filter(is_deleted=False)
    serializer_class = DossierSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['parent', 'direction', 'departement', 'service', 'responsable', 'is_archived']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_destroy(self, instance):
        from django.utils import timezone
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.save(update_fields=['is_deleted', 'deleted_at'])

    @action(detail=False, methods=['get'])
    def trash(self, request):
        """Liste des dossiers dans la corbeille."""
        queryset = Dossier.objects.filter(is_deleted=True)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restaurer un dossier depuis la corbeille."""
        dossier = self.get_object_or_404(Dossier.objects.filter(is_deleted=True, pk=pk))
        dossier.is_deleted = False
        dossier.deleted_at = None
        dossier.save(update_fields=['is_deleted', 'deleted_at'])
        return Response({'status': 'Dossier restauré'})

    @action(detail=True, methods=['delete'])
    def permanent(self, request, pk=None):
        """Suppression définitive d'un dossier."""
        dossier = self.get_object_or_404(Dossier.objects.filter(is_deleted=True, pk=pk))
        dossier.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'], url_path='trash/empty')
    def empty_trash(self, request):
        """Vider la corbeille des dossiers."""
        Dossier.objects.filter(is_deleted=True).delete()
        return Response({'status': 'Corbeille vidée'})

    def get_object_or_404(self, queryset):
        from django.shortcuts import get_object_or_404
        obj = get_object_or_404(queryset)
        self.check_object_permissions(self.request, obj)
        return obj

    @action(detail=True, methods=['get'])
    def content(self, request, pk=None):
        """Retourne les sous-dossiers et les documents contenus dans ce dossier"""
        dossier = self.get_object()
        payload = get_dossier_content(dossier)
        return Response({
            'dossiers': DossierSerializer(payload['dossiers'], many=True).data,
            'documents': DocumentSerializer(payload['documents'], many=True).data,
        })

    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Retourne uniquement les documents contenus dans ce dossier"""
        dossier = self.get_object()
        docs = Document.objects.filter(dossier=dossier, is_deleted=False)
        return Response(DocumentSerializer(docs, many=True).data)

    @action(detail=True, methods=['get'])
    def tree(self, request, pk=None):
        """Récupérer l'arborescence à partir de ce dossier"""
        dossier = self.get_object()
        return Response(build_dossier_tree(dossier))

    @action(detail=True, methods=['post'])
    def toggle_favorite(self, request, pk=None):
        dossier = self.get_object()
        from apps.documents.models import Favorite
        favorite = Favorite.objects.filter(user=request.user, folder=dossier).first()
        if favorite:
            favorite.delete()
            return Response({'is_favorite': False})
        else:
            Favorite.objects.create(user=request.user, folder=dossier)
            return Response({'is_favorite': True})

class DossierPermissionViewSet(viewsets.ModelViewSet):
    queryset = DossierPermission.objects.all()
    serializer_class = DossierPermissionSerializer
    permission_classes = [IsAuthenticated]
