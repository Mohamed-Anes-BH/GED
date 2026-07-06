from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import CourrierEntrant, CourrierSortant, PieceJointe, Diffusion, CourrierHistorique
from .serializers import (
    CourrierEntrantSerializer, CourrierSortantSerializer, 
    PieceJointeSerializer, DiffusionSerializer, CourrierHistoriqueSerializer
)

class CourrierEntrantViewSet(viewsets.ModelViewSet):
    queryset = CourrierEntrant.objects.all()
    serializer_class = CourrierEntrantSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['statut', 'priorite', 'direction', 'assigned_to']
    search_fields = ['numero', 'objet', 'expediteur']
    ordering_fields = ['date_reception', 'created_at']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        courrier = self.get_object()
        if courrier.statut == 'nouveau':
            courrier.statut = 'lu'
            courrier.save()
            return Response({'status': 'marqué comme lu'})
        return Response({'detail': 'Le courrier a déjà été lu.'}, status=status.HTTP_400_BAD_REQUEST)


class CourrierSortantViewSet(viewsets.ModelViewSet):
    queryset = CourrierSortant.objects.all()
    serializer_class = CourrierSortantSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['statut', 'priorite', 'auteur']
    search_fields = ['numero', 'objet', 'destinataire']
    ordering_fields = ['date_envoi', 'created_at']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class DiffusionViewSet(viewsets.ModelViewSet):
    queryset = Diffusion.objects.all()
    serializer_class = DiffusionSerializer
    permission_classes = [IsAuthenticated]
