from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Workflow, WorkflowStep, WorkflowInstance, StepExecution
from .serializers import WorkflowSerializer, WorkflowStepSerializer, WorkflowInstanceSerializer, StepExecutionSerializer
from .services import create_instance, validate_execution, reject_execution

class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'visibility', 'departement']
    search_fields = ['name', 'description']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def kpis(self, request):
        return Response({
            'actifs': Workflow.objects.filter(status='actif').count(),
            'docs_validation': WorkflowInstance.objects.filter(status='en_cours').count(),
            'etapes_attente': StepExecution.objects.filter(status='en_attente').count(),
            'valides_today': StepExecution.objects.filter(status='valide').count(),
            'rejetes_today': StepExecution.objects.filter(status='rejete').count(),
        })

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        workflow = self.get_object()
        instances = WorkflowInstance.objects.filter(workflow=workflow)
        return Response({
            'instances': instances.count(),
            'en_cours': instances.filter(status='en_cours').count(),
            'valides': instances.filter(status='valide').count(),
            'rejetes': instances.filter(status='rejete').count(),
            'steps': workflow.steps.count(),
        })

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
        # P1 security: only the assigned user or an admin/staff may validate
        if execution.user != request.user and not request.user.is_staff:
            return Response({'detail': "Vous n'êtes pas autorisé à valider cette étape."}, status=status.HTTP_403_FORBIDDEN)

        validate_execution(execution, user=request.user, comment=request.data.get('comment', ''))
        return Response({'status': 'étape validée'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        execution = self.get_object()
        if execution.status != 'en_attente':
            return Response({'detail': "L'étape est déjà traitée."}, status=status.HTTP_400_BAD_REQUEST)
        # P1 security: only the assigned user or an admin/staff may reject
        if execution.user != request.user and not request.user.is_staff:
            return Response({'detail': "Vous n'êtes pas autorisé à rejeter cette étape."}, status=status.HTTP_403_FORBIDDEN)
        if not request.data.get('comment'):
            return Response({'detail': "Un commentaire est obligatoire pour un rejet."}, status=status.HTTP_400_BAD_REQUEST)

        reject_execution(execution, user=request.user, comment=request.data.get('comment'))
        return Response({'status': 'étape rejetée'})


    @action(detail=False, methods=['post'])
    def start_instance(self, request):
        workflow = Workflow.objects.get(pk=request.data.get('workflow'))
        document_id = request.data.get('document')
        from apps.documents.models import Document

        document = Document.objects.get(pk=document_id)
        instance = create_instance(workflow, document, user=request.user)
        return Response(WorkflowInstanceSerializer(instance).data, status=status.HTTP_201_CREATED)
