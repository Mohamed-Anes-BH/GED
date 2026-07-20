import csv
from django.http import HttpResponse
from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import AuditLog
from .serializers import AuditLogSerializer
from .services import get_audit_queryset, get_audit_stats

class AuditLogViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """
    ViewSet en lecture seule pour les logs d'audit.
    Les logs sont créés automatiquement par le backend (via signaux ou services),
    l'API ne permet que de les consulter.
    """
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['user', 'action', 'resource_type']
    search_fields = ['resource_name', 'ip_address']
    ordering_fields = ['created_at']

    def get_queryset(self):
        qs = get_audit_queryset(self.request.user)
        # Date range filtering via query params
        after = self.request.query_params.get('created_at_after')
        before = self.request.query_params.get('created_at_before')
        if after:
            qs = qs.filter(created_at__gte=after)
        if before:
            qs = qs.filter(created_at__lte=before)
        return qs

    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response(get_audit_stats(request.user))

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """Export all audit logs as a CSV file."""
        qs = self.get_queryset()
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="audit_log.csv"'
        writer = csv.writer(response)
        writer.writerow(['ID', 'Utilisateur', 'Action', 'Type ressource', 'ID ressource', 'Nom ressource', 'Date', 'IP'])
        for log in qs.order_by('-created_at'):
            writer.writerow([
                log.pk,
                str(log.user) if log.user else '',
                log.action,
                log.resource_type,
                log.resource_id or '',
                log.resource_name or '',
                log.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                log.ip_address or '',
            ])
        return response

    @action(detail=False, methods=['get'])
    def export_pdf(self, request):
        """Export audit logs as a PDF file using reportlab."""
        try:
            from reportlab.lib.pagesizes import A4, landscape
            from reportlab.lib import colors
            from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
            from reportlab.lib.styles import getSampleStyleSheet
            import io

            qs = self.get_queryset().order_by('-created_at')[:500]  # Limit to avoid huge PDFs
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=landscape(A4), rightMargin=20, leftMargin=20, topMargin=20, bottomMargin=20)
            styles = getSampleStyleSheet()
            elements = []

            elements.append(Paragraph('Journal d\'audit — AgrOdiv GED', styles['Title']))
            elements.append(Spacer(1, 12))

            headers = ['ID', 'Utilisateur', 'Action', 'Type', 'Ressource', 'Date']
            data = [headers]
            for log in qs:
                data.append([
                    str(log.pk),
                    str(log.user) if log.user else 'Système',
                    log.action,
                    log.resource_type,
                    (log.resource_name or '')[:40],
                    log.created_at.strftime('%d/%m/%Y %H:%M'),
                ])

            table = Table(data, repeatRows=1)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F97316')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#FFF7ED')]),
                ('GRID', (0, 0), (-1, -1), 0.3, colors.HexColor('#E5E7EB')),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            elements.append(table)
            doc.build(elements)

            buffer.seek(0)
            response = HttpResponse(buffer, content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename="audit_log.pdf"'
            return response
        except ImportError:
            return Response({'detail': 'reportlab non installé sur ce serveur.'}, status=500)
