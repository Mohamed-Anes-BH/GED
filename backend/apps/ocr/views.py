import threading
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import OcrJob, OcrResult, OcrPage
from .serializers import OcrJobSerializer, OcrResultSerializer, OcrPageSerializer
from .services import start_ocr_job, fail_ocr_job, execute_ocr_job
from .tasks import run_ocr_task

class OcrJobViewSet(viewsets.ModelViewSet):
    queryset = OcrJob.objects.all().order_by('-created_at')
    serializer_class = OcrJobSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'document']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['post'])
    def process(self, request):
        document_id = request.data.get('document')
        source_file = request.data.get('source_file')
        language = request.data.get('language', 'fra')
        engine = request.data.get('engine', 'tesseract')

        if not document_id:
            return Response({'detail': 'document est requis.'}, status=status.HTTP_400_BAD_REQUEST)

        from apps.documents.models import Document

        try:
            document = Document.objects.get(pk=document_id)
        except Document.DoesNotExist:
            return Response({'detail': 'Document non trouvé.'}, status=status.HTTP_404_NOT_FOUND)

        # Auto-detect source_file from latest document file
        if not source_file:
            latest_file = document.files.order_by('-uploaded_at').first()
            source_file = latest_file.file.name if latest_file else 'unknown'

        job = start_ocr_job(document, source_file, request.user, language=language, engine=engine)
        
        # Dispatch Celery task
        try:
            run_ocr_task.delay(job.id)
        except Exception as e:
            # Fallback to local background thread execution if Celery connection is unavailable
            threading.Thread(target=execute_ocr_job, args=(job.id,)).start()
            
        return Response(OcrJobSerializer(job).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        job = self.get_object()
        if job.status == 'en_cours':
            return Response({'detail': "Le job est déjà en cours."}, status=status.HTTP_400_BAD_REQUEST)
        
        job.status = 'en_attente'
        job.error_message = None
        job.progress = 0
        job.save()
        
        # Trigger async task/fallback thread
        try:
            run_ocr_task.delay(job.id)
        except Exception:
            threading.Thread(target=execute_ocr_job, args=(job.id,)).start()
            
        return Response({'status': 'job remis en attente'})

    @action(detail=True, methods=['post'], url_path='update-text')
    def update_text(self, request, pk=None):
        """Allow editing extracted text for a page or the full result."""
        job = self.get_object()
        page_number = request.data.get('page_number')
        new_text = request.data.get('text', '')

        if page_number is not None:
            # Update specific page text
            try:
                page = OcrPage.objects.get(job=job, page_number=int(page_number))
                page.text = new_text
                page.save(update_fields=['text'])
            except OcrPage.DoesNotExist:
                return Response({'detail': 'Page non trouvée.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Update the full OCR result text
            result = getattr(job, 'result', None)
            if result:
                result.full_text = new_text
                result.words_count = len(new_text.split())
                result.save(update_fields=['full_text', 'words_count'])
            else:
                return Response({'detail': 'Aucun résultat OCR.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'status': 'texte mis à jour'})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response({
            'total_jobs': OcrJob.objects.count(),
            'en_cours': OcrJob.objects.filter(status='en_cours').count(),
            'termine': OcrJob.objects.filter(status='termine').count(),
            'erreur': OcrJob.objects.filter(status='erreur').count(),
        })


class OcrResultViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = OcrResult.objects.all()
    serializer_class = OcrResultSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['job']


class OcrPageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = OcrPage.objects.all()
    serializer_class = OcrPageSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['job']
