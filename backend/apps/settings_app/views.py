from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from .models import AppSettings, BackupRecord
from .serializers import AppSettingsSerializer, BackupRecordSerializer

class AppSettingsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        settings = AppSettings.get_settings()
        serializer = AppSettingsSerializer(settings)
        return Response(serializer.data)

    def update(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'detail': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)
            
        settings = AppSettings.get_settings()
        serializer = AppSettingsSerializer(settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class BackupRecordViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BackupRecord.objects.all().order_by('-created_at')
    serializer_class = BackupRecordSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['post'])
    def trigger_backup(self, request):
        # Simulation d'un déclenchement de backup
        # Ici on utiliserait une tâche Celery
        BackupRecord.objects.create(
            filename="manual_backup_simulated.zip",
            size=1024,
            type="manual",
            status="completed"
        )
        return Response({"status": "Sauvegarde déclenchée avec succès."})
