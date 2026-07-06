from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import OcrJob, OcrResult, OcrPage
from .serializers import OcrJobSerializer, OcrResultSerializer, OcrPageSerializer

class OcrJobViewSet(viewsets.ModelViewSet):
    queryset = OcrJob.objects.all().order_by('-created_at')
    serializer_class = OcrJobSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'document']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        # Here we would also dispatch the asynchronous Celery task or script for actual OCR.

    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        job = self.get_object()
        if job.status == 'en_cours':
            return Response({'detail': "Le job est déjà en cours."}, status=status.HTTP_400_BAD_REQUEST)
        
        job.status = 'en_attente'
        job.error_message = None
        job.progress = 0
        job.save()
        
        # Trigger async task
        return Response({'status': 'job remis en attente'})


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
