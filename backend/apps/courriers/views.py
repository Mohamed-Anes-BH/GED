from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import CourrierEntrant, CourrierSortant, PieceJointe, Diffusion, CourrierHistorique, PhysicalLocation
from .serializers import (
    CourrierEntrantSerializer, CourrierSortantSerializer,
    PieceJointeSerializer, DiffusionSerializer, CourrierHistoriqueSerializer,
    PhysicalLocationSerializer
)
from .services import (
    mark_courrier_traite, transfer_courrier, assign_courrier,
    send_courrier_sortant, sign_courrier_sortant, archive_courrier_sortant,
    generate_numero_entrant, generate_numero_sortant,
    add_attachment, delete_attachment, get_courriers_kpis,
)


class CourrierEntrantViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return CourrierEntrant.objects.filter(is_deleted=False)
    serializer_class = CourrierEntrantSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['statut', 'priorite', 'direction', 'departement', 'assigned_to']
    search_fields = ['numero', 'objet', 'expediteur']
    ordering_fields = ['date_reception', 'created_at', 'priorite']

    def perform_create(self, serializer):
        numero = generate_numero_entrant()
        serializer.save(created_by=self.request.user, numero=numero)

    def perform_destroy(self, instance):
        from django.utils import timezone
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.save(update_fields=['is_deleted', 'deleted_at'])

    @action(detail=False, methods=['get'])
    def trash(self, request):
        """Liste des courriers entrants dans la corbeille."""
        queryset = CourrierEntrant.objects.filter(is_deleted=True)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restaurer un courrier entrant depuis la corbeille."""
        from django.shortcuts import get_object_or_404
        courrier = get_object_or_404(CourrierEntrant.objects.filter(is_deleted=True, pk=pk))
        self.check_object_permissions(self.request, courrier)
        courrier.is_deleted = False
        courrier.deleted_at = None
        courrier.save(update_fields=['is_deleted', 'deleted_at'])
        return Response({'status': 'Courrier restauré'})

    @action(detail=True, methods=['delete'])
    def permanent(self, request, pk=None):
        """Suppression définitive d'un courrier entrant."""
        from django.shortcuts import get_object_or_404
        courrier = get_object_or_404(CourrierEntrant.objects.filter(is_deleted=True, pk=pk))
        self.check_object_permissions(self.request, courrier)
        courrier.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Marquer un courrier comme lu."""
        courrier = self.get_object()
        if courrier.statut == 'nouveau':
            courrier.statut = 'lu'
            courrier.save(update_fields=['statut'])
            return Response({'status': 'marqué comme lu'})
        return Response({'detail': 'Déjà lu.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def mark_treated(self, request, pk=None):
        """Marquer un courrier comme traité."""
        courrier = self.get_object()
        mark_courrier_traite(courrier, user=request.user)
        return Response({'status': 'marqué comme traité'})

    @action(detail=True, methods=['post'])
    def transfer(self, request, pk=None):
        """Transférer un courrier à un autre utilisateur ou service."""
        courrier = self.get_object()
        to_user_id = request.data.get('user_id')
        notes = request.data.get('notes', '')
        transfer_courrier(courrier, to_user_id=to_user_id, notes=notes, actor=request.user)
        return Response({'status': 'transféré'})

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assigner un courrier à un utilisateur."""
        courrier = self.get_object()
        user_id = request.data.get('user_id')
        assign_courrier(courrier, user_id=user_id, actor=request.user)
        return Response({'status': 'assigné'})

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Historique des actions sur un courrier entrant."""
        courrier = self.get_object()
        from django.contrib.contenttypes.models import ContentType
        ct = ContentType.objects.get_for_model(courrier)
        history = CourrierHistorique.objects.filter(content_type=ct, object_id=courrier.pk).order_by('-created_at')
        return Response(CourrierHistoriqueSerializer(history, many=True).data)

    @action(detail=True, methods=['get'])
    def diffusions(self, request, pk=None):
        """Diffusions de ce courrier entrant."""
        courrier = self.get_object()
        diffusions = Diffusion.objects.filter(courrier_type='entrant', courrier_id=courrier.id)
        from .serializers import DiffusionSerializer
        return Response(DiffusionSerializer(diffusions, many=True).data)

    @action(detail=True, methods=['post'])
    def upload_attachment(self, request, pk=None):
        """Ajouter une pièce jointe."""
        courrier = self.get_object()
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'detail': 'Aucun fichier fourni.'}, status=status.HTTP_400_BAD_REQUEST)
        pj = add_attachment(courrier, uploaded_file)
        return Response(PieceJointeSerializer(pj).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def toggle_favorite(self, request, pk=None):
        courrier = self.get_object()
        from apps.documents.models import Favorite
        favorite = Favorite.objects.filter(user=request.user, courrier_entrant=courrier).first()
        if favorite:
            favorite.delete()
            return Response({'is_favorite': False})
        else:
            Favorite.objects.create(user=request.user, courrier_entrant=courrier)
            return Response({'is_favorite': True})


class CourrierSortantViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return CourrierSortant.objects.filter(is_deleted=False)
    serializer_class = CourrierSortantSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['statut', 'priorite', 'auteur', 'departement']
    search_fields = ['numero', 'objet', 'destinataire']
    ordering_fields = ['date_envoi', 'created_at', 'priorite']

    def perform_create(self, serializer):
        numero = generate_numero_sortant()
        serializer.save(created_by=self.request.user, auteur=self.request.user if not serializer.validated_data.get('auteur') else serializer.validated_data['auteur'], numero=numero)

    def perform_destroy(self, instance):
        from django.utils import timezone
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.save(update_fields=['is_deleted', 'deleted_at'])

    @action(detail=False, methods=['get'])
    def trash(self, request):
        """Liste des courriers sortants dans la corbeille."""
        queryset = CourrierSortant.objects.filter(is_deleted=True)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restaurer un courrier sortant depuis la corbeille."""
        from django.shortcuts import get_object_or_404
        courrier = get_object_or_404(CourrierSortant.objects.filter(is_deleted=True, pk=pk))
        self.check_object_permissions(self.request, courrier)
        courrier.is_deleted = False
        courrier.deleted_at = None
        courrier.save(update_fields=['is_deleted', 'deleted_at'])
        return Response({'status': 'Courrier restauré'})

    @action(detail=True, methods=['delete'])
    def permanent(self, request, pk=None):
        """Suppression définitive d'un courrier sortant."""
        from django.shortcuts import get_object_or_404
        courrier = get_object_or_404(CourrierSortant.objects.filter(is_deleted=True, pk=pk))
        self.check_object_permissions(self.request, courrier)
        courrier.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        """Marquer le courrier comme envoyé."""
        courrier = self.get_object()
        send_courrier_sortant(courrier, user=request.user)
        return Response({'status': 'envoyé'})

    @action(detail=True, methods=['post'])
    def sign(self, request, pk=None):
        """Marquer le courrier comme signé."""
        courrier = self.get_object()
        sign_courrier_sortant(courrier, user=request.user)
        return Response({'status': 'signé'})

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Archiver le courrier sortant."""
        courrier = self.get_object()
        archive_courrier_sortant(courrier, user=request.user)
        return Response({'status': 'archivé'})

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Historique des actions sur un courrier sortant."""
        courrier = self.get_object()
        from django.contrib.contenttypes.models import ContentType
        ct = ContentType.objects.get_for_model(courrier)
        history = CourrierHistorique.objects.filter(content_type=ct, object_id=courrier.pk).order_by('-created_at')
        return Response(CourrierHistoriqueSerializer(history, many=True).data)

    @action(detail=True, methods=['get'])
    def diffusions(self, request, pk=None):
        """Diffusions de ce courrier sortant."""
        courrier = self.get_object()
        diffusions = Diffusion.objects.filter(courrier_type='sortant', courrier_id=courrier.id)
        from .serializers import DiffusionSerializer
        return Response(DiffusionSerializer(diffusions, many=True).data)

    @action(detail=True, methods=['post'])
    def upload_attachment(self, request, pk=None):
        """Ajouter une pièce jointe."""
        courrier = self.get_object()
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'detail': 'Aucun fichier fourni.'}, status=status.HTTP_400_BAD_REQUEST)
        pj = add_attachment(courrier, uploaded_file)
        return Response(PieceJointeSerializer(pj).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def toggle_favorite(self, request, pk=None):
        courrier = self.get_object()
        from apps.documents.models import Favorite
        favorite = Favorite.objects.filter(user=request.user, courrier_sortant=courrier).first()
        if favorite:
            favorite.delete()
            return Response({'is_favorite': False})
        else:
            Favorite.objects.create(user=request.user, courrier_sortant=courrier)
            return Response({'is_favorite': True})


class DiffusionViewSet(viewsets.ModelViewSet):
    queryset = Diffusion.objects.all()
    serializer_class = DiffusionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['courrier_type']

    def perform_create(self, serializer):
        diffusion = serializer.save(created_by=self.request.user)
        # Create DiffusionDestinataire for each user when a diffusion is created
        # The user IDs should ideally be provided in the request data e.g., 'destinataires'
        destinataires_ids = self.request.data.get('destinataires', [])
        from django.contrib.auth import get_user_model
        User = get_user_model()
        from .models import DiffusionDestinataire
        users = User.objects.filter(id__in=destinataires_ids)
        for user in users:
            DiffusionDestinataire.objects.get_or_create(diffusion=diffusion, user=user)

    @action(detail=True, methods=['get'])
    def tracking(self, request, pk=None):
        """Suivi de lecture par destinataire."""
        from .models import DiffusionDestinataire
        diffusion = self.get_object()
        destinataires = DiffusionDestinataire.objects.filter(diffusion=diffusion)
        # On pourrait avoir un serializer dédié, mais on renvoie juste les dicts
        data = []
        for dest in destinataires:
            data.append({
                'id': dest.user.id,
                'email': dest.user.email,
                'lu': dest.lu,
                'date_lecture': dest.date_lecture
            })
        return Response(data)

    @action(detail=True, methods=['post'])
    def read(self, request, pk=None):
        """Marquer comme lu pour l'utilisateur courant."""
        from .models import DiffusionDestinataire
        from django.utils import timezone
        diffusion = self.get_object()
        try:
            dest = DiffusionDestinataire.objects.get(diffusion=diffusion, user=request.user)
            if not dest.lu:
                dest.lu = True
                dest.date_lecture = timezone.now()
                dest.save(update_fields=['lu', 'date_lecture'])
                return Response({'status': 'marqué comme lu'})
            return Response({'status': 'déjà lu'})
        except DiffusionDestinataire.DoesNotExist:
            return Response({'detail': 'Vous n\'êtes pas destinataire de cette diffusion.'}, status=status.HTTP_403_FORBIDDEN)


class PieceJointeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PieceJointe.objects.all()
    serializer_class = PieceJointeSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Télécharger une pièce jointe."""
        from django.http import FileResponse
        pj = self.get_object()
        try:
            response = FileResponse(pj.file.open('rb'), as_attachment=True, filename=pj.name)
            return response
        except Exception:
            return Response({'detail': 'Fichier introuvable.'}, status=status.HTTP_404_NOT_FOUND)


class PhysicalLocationViewSet(viewsets.ModelViewSet):
    """CRUD pour les emplacements physiques."""
    queryset = PhysicalLocation.objects.all()
    serializer_class = PhysicalLocationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['building', 'office', 'treasury', 'shelf']
    search_fields = ['box_number', 'document_number']


# ── KPIs courriers (non-viewset) ────────────────────────────────────────
from rest_framework.decorators import api_view, permission_classes as perms

@api_view(['GET'])
@perms([IsAuthenticated])
def courriers_kpis(request):
    """Retourne les KPIs des courriers."""
    return Response(get_courriers_kpis())
