from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Notification
from .serializers import NotificationSerializer
from .services import mark_all_read, mark_notification_read, clear_notifications, get_unread_count, list_notifications

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['is_read', 'type']

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        mark_all_read(request.user)
        return Response({'status': 'Toutes les notifications marquées comme lues'})

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        mark_notification_read(notif)
        return Response({'status': 'Notification marquée comme lue'})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        return Response({'count': get_unread_count(request.user)})

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        clear_notifications(request.user)
        return Response(status=204)
