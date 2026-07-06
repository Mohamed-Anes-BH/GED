from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone

from .models import Workflow, WorkflowStep, WorkflowInstance, StepExecution
from .serializers import WorkflowSerializer, WorkflowStepSerializer, WorkflowInstanceSerializer, StepExecutionSerializer

class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'visibility', 'departement']
    search_fields = ['name', 'description']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class WorkflowStepViewSet(viewsets.ModelViewSet):
    queryset = WorkflowStep.objects.all()
    serializer_class = WorkflowStepSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['workflow']

class WorkflowInstanceViewSet(viewsets.ModelViewSet):
    queryset = WorkflowInstance.objects.all()
    serializer_class = WorkflowInstanceSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['workflow', 'document', 'status']

class StepExecutionViewSet(viewsets.ModelViewSet):
    queryset = StepExecution.objects.all()
    serializer_class = StepExecutionSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['instance', 'step', 'user', 'status']

    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        execution = self.get_object()
        if execution.status != 'en_attente':
            return Response({'detail': "L'étape est déjà traitée."}, status=status.HTTP_400_BAD_REQUEST)
        
        execution.status = 'valide'
        execution.comment = request.data.get('comment', '')
        execution.completed_at = timezone.now()
        execution.save()
        
        # Trigger next step logic inside signals.py or service.py
        return Response({'status': 'étape validée'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        execution = self.get_object()
        if execution.status != 'en_attente':
            return Response({'detail': "L'étape est déjà traitée."}, status=status.HTTP_400_BAD_REQUEST)
        
        if not request.data.get('comment'):
            return Response({'detail': "Un commentaire est obligatoire pour un rejet."}, status=status.HTTP_400_BAD_REQUEST)
            
        execution.status = 'rejete'
        execution.comment = request.data.get('comment')
        execution.completed_at = timezone.now()
        execution.save()
        
        # Trigger rejection logic inside signals.py or service.py
        return Response({'status': 'étape rejetée'})
