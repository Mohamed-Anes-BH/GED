from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .services import (
    get_global_kpis, get_recent_activity, get_recent_documents,
    get_storage_info, get_calendar_events,
    get_documents_stats, get_courriers_stats, get_users_stats,
    get_storage_stats, get_evolution_stats, get_category_stats,
    get_department_stats, export_stats_payload,
)
from apps.documents.serializers import DocumentSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kpi_global(request):
    """Retourne les KPIs globaux pour le tableau de bord."""
    return Response(get_global_kpis(request.user))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_activity(request):
    """Retourne l'activité récente (documents + audit)."""
    return Response(get_recent_activity(request.user, limit=10))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_documents(request):
    """Retourne les documents les plus récents."""
    docs = get_recent_documents(request.user, limit=10)
    return Response(DocumentSerializer(docs, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def storage_info(request):
    """Retourne les informations de stockage."""
    return Response(get_storage_info())


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def calendar_events(request):
    """Retourne les événements calendrier des 30 derniers jours."""
    days = int(request.query_params.get('days', 30))
    return Response(get_calendar_events(days=days))


# ── Statistiques ────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_documents(request):
    return Response(get_documents_stats())


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_courriers(request):
    return Response(get_courriers_stats())


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_users(request):
    return Response(get_users_stats())


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_storage(request):
    return Response(get_storage_stats())


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_evolution(request):
    days = int(request.query_params.get('days', 30))
    return Response(get_evolution_stats(days=days))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_by_category(request):
    return Response(get_category_stats())


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_by_department(request):
    return Response(get_department_stats())


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_stats(request):
    """Exporte toutes les statistiques : PDF si ?format=pdf, sinon JSON."""
    fmt = request.query_params.get('format', 'json')

    if fmt == 'pdf':
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.lib import colors
            from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
            from reportlab.lib.styles import getSampleStyleSheet
            from django.http import HttpResponse
            import io
            from django.utils import timezone

            payload = export_stats_payload()
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
            styles = getSampleStyleSheet()
            elements = []

            # Title
            elements.append(Paragraph('Rapport de Statistiques — AgrOdiv GED', styles['Title']))
            elements.append(Paragraph(f'Généré le {timezone.now().strftime("%d/%m/%Y %H:%M")}', styles['Normal']))
            elements.append(Spacer(1, 16))

            # KPIs section
            elements.append(Paragraph('Indicateurs Clés (KPIs)', styles['Heading2']))
            elements.append(Spacer(1, 6))
            kpis = payload.get('kpis', {})
            kpi_rows = [['Indicateur', 'Valeur']]
            kpi_labels = {
                'total_documents': 'Total documents',
                'documents_archives': 'Documents archivés',
                'courriers_entrants': 'Courriers entrants',
                'courriers_sortants': 'Courriers sortants',
                'dossiers_actifs': 'Dossiers actifs',
                'taches_en_attente': 'Tâches en attente',
                'workflows_en_cours': 'Workflows en cours',
            }
            for key, label in kpi_labels.items():
                kpi_rows.append([label, str(kpis.get(key, 0))])

            kpi_table = Table(kpi_rows, colWidths=[300, 120])
            kpi_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F97316')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#FFF7ED')]),
                ('GRID', (0, 0), (-1, -1), 0.3, colors.HexColor('#E5E7EB')),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ]))
            elements.append(kpi_table)
            elements.append(Spacer(1, 16))

            # Documents by status
            elements.append(Paragraph('Documents par Statut', styles['Heading2']))
            elements.append(Spacer(1, 6))
            doc_stats = payload.get('documents', [])
            if doc_stats:
                doc_rows = [['Statut', 'Nombre']] + [[d.get('status', '-'), str(d.get('count', 0))] for d in doc_stats]
                doc_table = Table(doc_rows, colWidths=[300, 120])
                doc_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#22C55E')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, -1), 9),
                    ('GRID', (0, 0), (-1, -1), 0.3, colors.HexColor('#E5E7EB')),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F0FDF4')]),
                    ('TOPPADDING', (0, 0), (-1, -1), 5),
                ]))
                elements.append(doc_table)

            doc.build(elements)
            buffer.seek(0)
            response = HttpResponse(buffer, content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename="statistiques_agrodiv.pdf"'
            return response
        except ImportError:
            return Response({'detail': 'reportlab non installé.'}, status=500)

    return Response(export_stats_payload())
