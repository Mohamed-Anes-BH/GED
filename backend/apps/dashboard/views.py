from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta

# Imports for dashboard aggregations
from apps.documents.models import Document
from apps.courriers.models import CourrierEntrant, CourrierSortant
from apps.workflow.models import WorkflowInstance, StepExecution
from apps.dossiers.models import Dossier

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kpi_global(request):
    """
    Retourne les KPIs globaux pour le tableau de bord
    """
    total_docs = Document.objects.filter(is_deleted=False).count()
    total_courriers = CourrierEntrant.objects.count() + CourrierSortant.objects.count()
    workflows_en_attente = StepExecution.objects.filter(status='en_attente', user=request.user).count()
    
    # Simple trend calculation example (last 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    new_docs_30d = Document.objects.filter(created_at__gte=thirty_days_ago).count()

    data = {
        'total_documents': total_docs,
        'total_courriers': total_courriers,
        'taches_en_attente': workflows_en_attente,
        'nouveaux_documents_30_jours': new_docs_30d
    }
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_activity(request):
    """
    Retourne l'activité récente
    """
    # Simply get user's recent documents for example
    recent_docs = Document.objects.filter(created_by=request.user).order_by('-created_at')[:5]
    docs_data = [
        {"id": d.id, "title": d.title, "type": "document", "date": d.created_at} 
        for d in recent_docs
    ]
    return Response(docs_data)
