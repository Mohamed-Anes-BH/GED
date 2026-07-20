from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from .models import AppSettings, BackupRecord
from .serializers import AppSettingsSerializer, BackupRecordSerializer
from .services import get_settings, update_settings, trigger_backup, list_backups, get_about_info, get_storage_details, restore_backup

class AppSettingsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        serializer = AppSettingsSerializer(get_settings())
        return Response(serializer.data)

    def update(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'detail': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)
        settings = update_settings(request.data)
        serializer = AppSettingsSerializer(settings)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def about(self, request):
        return Response(get_about_info())

    @action(detail=False, methods=['get'])
    def storage(self, request):
        return Response(get_storage_details())


class BackupRecordViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BackupRecord.objects.all().order_by('-created_at')
    serializer_class = BackupRecordSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['post'])
    def trigger_backup(self, request):
        backup = trigger_backup()
        return Response(BackupRecordSerializer(backup).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def list_backups(self, request):
        serializer = BackupRecordSerializer(list_backups(), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        backup = self.get_object()
        restore_backup(backup)
        return Response(BackupRecordSerializer(backup).data)
