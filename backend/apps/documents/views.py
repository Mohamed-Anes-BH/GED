from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone

from .models import Document, DocumentFile, DocumentVersion, DocumentRelation, Favorite
from .serializers import (
    DocumentSerializer, DocumentFileSerializer, 
    DocumentVersionSerializer, DocumentRelationSerializer, FavoriteSerializer
)

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.filter(is_deleted=False)
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'direction', 'departement', 'service', 'dossier', 'status', 'priority', 'is_archived']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'title']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        # Soft delete
        doc = self.get_object()
        doc.is_deleted = True
        doc.deleted_at = timezone.now()
        doc.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def trash(self, request):
        trash_docs = Document.objects.filter(is_deleted=True)
        serializer = self.get_serializer(trash_docs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        doc = Document.objects.filter(pk=pk, is_deleted=True).first()
        if not doc:
            return Response({"detail": "Non trouvé."}, status=status.HTTP_404_NOT_FOUND)
        doc.is_deleted = False
        doc.deleted_at = None
        doc.save()
        return Response({'status': 'restauré'})

    @action(detail=True, methods=['delete'])
    def permanent_delete(self, request, pk=None):
        doc = Document.objects.filter(pk=pk, is_deleted=True).first()
        if not doc:
            return Response({"detail": "Non trouvé."}, status=status.HTTP_404_NOT_FOUND)
        doc.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
