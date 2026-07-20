from django.http import FileResponse
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Document, DocumentFile, DocumentVersion, DocumentRelation, Favorite, ScanJob, OCRResult
from .serializers import (
    DocumentSerializer, DocumentFileSerializer,
    DocumentVersionSerializer, DocumentRelationSerializer, FavoriteSerializer
)
from .services import (
    soft_delete_document,
    restore_document,
    permanently_delete_document,
    add_favorite,
    remove_favorite,
    add_document_file,
    create_document_version,
    empty_trash,
    archive_document,
    share_document,
    restore_document_version,
)


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.filter(is_deleted=False)
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'direction', 'departement', 'service', 'dossier', 'status', 'priority', 'is_archived', 'created_by']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'title']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        doc = self.get_object()
        soft_delete_document(doc, user=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    # ── Corbeille ──────────────────────────────────────────────────────
    @action(detail=False, methods=['get'])
    def trash(self, request):
        trash_docs = Document.objects.filter(is_deleted=True)
        serializer = self.get_serializer(trash_docs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='trash/empty')
    def empty_trash_action(self, request):
        count = empty_trash(user=request.user)
        return Response({'deleted': count})

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        doc = Document.objects.filter(pk=pk, is_deleted=True).first()
        if not doc:
            return Response({"detail": "Non trouvé."}, status=status.HTTP_404_NOT_FOUND)
        restore_document(doc, user=request.user)
        return Response({'status': 'restauré'})

    @action(detail=True, methods=['delete'])
    def permanent_delete(self, request, pk=None):
        doc = Document.objects.filter(pk=pk, is_deleted=True).first()
        if not doc:
            return Response({"detail": "Non trouvé."}, status=status.HTTP_404_NOT_FOUND)
        permanently_delete_document(doc, user=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def toggle_favorite(self, request, pk=None):
        doc = self.get_object()
        favorite = Favorite.objects.filter(user=request.user, document=doc).first()
        if favorite:
            favorite.delete()
            return Response({'is_favorite': False})
        else:
            Favorite.objects.create(user=request.user, document=doc)
            return Response({'is_favorite': True})

    # ── Fichiers & Upload ──────────────────────────────────────────────
    @action(detail=True, methods=['post'], url_path='upload')
    def upload_file(self, request, pk=None):
        doc = self.get_object()
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'detail': 'Aucun fichier fourni.'}, status=status.HTTP_400_BAD_REQUEST)
        document_file = add_document_file(doc, uploaded_file, user=request.user)
        return Response(DocumentFileSerializer(document_file).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        doc = self.get_object()
        latest_file = doc.files.order_by('-uploaded_at').first()
        if not latest_file:
            return Response({'detail': 'Aucun fichier associé.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            response = FileResponse(latest_file.file.open('rb'), as_attachment=True, filename=latest_file.filename)
            return response
        except Exception:
            return Response({'detail': 'Fichier introuvable sur le serveur.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        doc = self.get_object()
        latest_file = doc.files.order_by('-uploaded_at').first()
        if not latest_file:
            return Response({'detail': 'Aucun fichier associé.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            response = FileResponse(latest_file.file.open('rb'), content_type=latest_file.mime_type)
            return response
        except Exception:
            return Response({'detail': 'Fichier introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    # ── Versions ───────────────────────────────────────────────────────
    @action(detail=True, methods=['get', 'post'])
    def versions(self, request, pk=None):
        doc = self.get_object()
        if request.method == 'GET':
            serializer = DocumentVersionSerializer(doc.versions.order_by('-version_number'), many=True)
            return Response(serializer.data)
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'detail': 'Aucun fichier fourni.'}, status=status.HTTP_400_BAD_REQUEST)
        version = create_document_version(
            doc, uploaded_file,
            user=request.user,
            changelog=request.data.get('changelog', ''),
        )
        return Response(DocumentVersionSerializer(version).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path=r'versions/(?P<vid>[^/.]+)/restore')
    def restore_version(self, request, pk=None, vid=None):
        doc = self.get_object()
        version = DocumentVersion.objects.filter(pk=vid, document=doc).first()
        if not version:
            return Response({'detail': 'Version non trouvée.'}, status=status.HTTP_404_NOT_FOUND)
        new_version = restore_document_version(doc, version, request.user)
        return Response({'status': f'version {version.version_number} restaurée', 'new_version_number': new_version.version_number})

    # ── Relations ──────────────────────────────────────────────────────
    @action(detail=True, methods=['get', 'post'])
    def relations(self, request, pk=None):
        doc = self.get_object()
        if request.method == 'GET':
            rels = doc.relations_sortantes.all()
            return Response(DocumentRelationSerializer(rels, many=True).data)
        data = request.data.copy()
        data['source'] = doc.pk
        serializer = DocumentRelationSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # ── Archive & Share ────────────────────────────────────────────────
    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        doc = self.get_object()
        archive_document(doc, user=request.user)
        return Response({'status': 'archivé'})

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        doc = self.get_object()
        users = request.data.get('users', [])
        message = request.data.get('message', '')
        share_document(doc, users=users, message=message, actor=request.user)
        return Response({'status': 'partagé'})

    # ── Documents récents ──────────────────────────────────────────────
    @action(detail=False, methods=['get'])
    def recent(self, request):
        qs = Document.objects.filter(is_deleted=False).order_by('-created_at')[:20]
        return Response(self.get_serializer(qs, many=True).data)

    # ── Scanner: create document + scan job + OCR result ────────────────
    @action(detail=False, methods=['post'], url_path='scan-save')
    def scan_save(self, request):
        """
        Receives multipart: file(s) + scan metadata + doc metadata.
        Creates: Document → DocumentFile → ScanJob → OCRResult (if ocr_enabled).
        """
        import threading
        from apps.ocr.services import start_ocr_job, execute_ocr_job

        # 1. Create document
        doc_data = {
            'title': request.data.get('title', 'Document Scanné'),
            'status': request.data.get('status', 'actif'),
        }
        for field in ['category', 'direction', 'departement', 'service', 'dossier']:
            val = request.data.get(field)
            if val:
                doc_data[field] = int(val)

        doc_serializer = self.get_serializer(data=doc_data)
        doc_serializer.is_valid(raise_exception=True)
        document = doc_serializer.save(created_by=request.user)

        # 2. Upload files
        uploaded_files = request.FILES.getlist('files')
        first_file = None
        for idx, f in enumerate(uploaded_files):
            from .services import add_document_file
            df = add_document_file(document, f, user=request.user)
            if idx == 0:
                first_file = df

        # 3. Create ScanJob
        scan_job = ScanJob.objects.create(
            document=document,
            scanner_name=request.data.get('scanner_name', 'Import'),
            dpi=int(request.data.get('dpi', 300)),
            color_mode=request.data.get('color_mode', 'Couleur'),
            paper_size=request.data.get('paper_size', 'A4'),
            duplex=request.data.get('duplex', 'false').lower() == 'true',
            format=request.data.get('format', 'PDF'),
            scan_status='completed',
            ocr_status='pending',
            created_by=request.user,
        )

        # 4. Trigger OCR if requested
        ocr_enabled = request.data.get('ocr_enabled', 'false').lower() == 'true'
        ocr_job = None
        if ocr_enabled and first_file:
            ocr_job = start_ocr_job(
                document=document,
                source_file=first_file.file.name,
                user=request.user,
            )
            scan_job.ocr_status = 'running'
            scan_job.save(update_fields=['ocr_status'])
            try:
                from apps.ocr.tasks import run_ocr_task
                run_ocr_task.delay(ocr_job.id)
            except Exception:
                threading.Thread(target=execute_ocr_job, args=(ocr_job.id,)).start()

        return Response({
            'document': self.get_serializer(document).data,
            'scan_job_id': scan_job.id,
            'ocr_job_id': ocr_job.id if ocr_job else None,
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='ocr-status')
    def ocr_status(self, request):
        """Poll OCR job status by id."""
        from apps.ocr.models import OcrJob
        job_id = request.query_params.get('job_id')
        if not job_id:
            return Response({'detail': 'job_id requis.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            job = OcrJob.objects.select_related('result').get(pk=job_id)
        except OcrJob.DoesNotExist:
            return Response({'detail': 'Job non trouvé.'}, status=status.HTTP_404_NOT_FOUND)
        result_text = ''
        if hasattr(job, 'result') and job.result:
            result_text = job.result.full_text or ''
        return Response({
            'status': job.status,
            'progress': job.progress,
            'extracted_text': result_text,
        })


class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        from django.db import models
        queryset = Favorite.objects.filter(user=user)

        # Filtering by type
        fav_type = self.request.query_params.get('type')
        if fav_type:
            if fav_type == 'document' or fav_type == 'documents':
                queryset = queryset.filter(document__isnull=False)
            elif fav_type == 'courrier' or fav_type == 'courriers':
                queryset = queryset.filter(models.Q(incoming_mail__isnull=False) | models.Q(outgoing_mail__isnull=False))
            elif fav_type == 'folder' or fav_type == 'folders' or fav_type == 'dossier' or fav_type == 'dossiers':
                queryset = queryset.filter(folder__isnull=False)

        # Search by Title, Reference/Numero, Type, Date
        search_query = self.request.query_params.get('search')
        if search_query:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(document__title__icontains=search_query) |
                Q(document__description__icontains=search_query) |
                Q(folder__name__icontains=search_query) |
                Q(folder__description__icontains=search_query) |
                Q(incoming_mail__objet__icontains=search_query) |
                Q(incoming_mail__numero__icontains=search_query) |
                Q(incoming_mail__expediteur__icontains=search_query) |
                Q(outgoing_mail__objet__icontains=search_query) |
                Q(outgoing_mail__numero__icontains=search_query) |
                Q(outgoing_mail__reference__icontains=search_query) |
                Q(outgoing_mail__destinataire__icontains=search_query)
            )

        # Apply ordering if specified
        ordering = self.request.query_params.get('ordering')
        if ordering:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-created_at')

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        instance.delete()

    @action(detail=False, methods=['get'])
    def stats(self, request):
        user = self.request.user
        from django.db import models
        base_qs = Favorite.objects.filter(user=user)
        total = base_qs.count()
        docs = base_qs.filter(document__isnull=False).count()
        courriers = base_qs.filter(models.Q(incoming_mail__isnull=False) | models.Q(outgoing_mail__isnull=False)).count()
        
        # Added this week (last 7 days)
        one_week_ago = timezone.now() - timezone.timedelta(days=7)
        added_this_week = base_qs.filter(created_at__gte=one_week_ago).count()

        return Response({
            'total': total,
            'documents': docs,
            'courriers': courriers,
            'added_this_week': added_this_week
        })
