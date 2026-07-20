from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


class ConversationViewSet(viewsets.ModelViewSet):
    """CRUD + list conversations for the authenticated user."""
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants', 'messages')

    def perform_create(self, serializer):
        conv = serializer.save()
        conv.participants.add(self.request.user)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """List all messages in a conversation."""
        conv = self.get_object()
        msgs = conv.messages.all()
        serializer = MessageSerializer(msgs, many=True)
        return Response(serializer.data)


class MessageViewSet(viewsets.ModelViewSet):
    """Send/view messages."""
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(
            conversation__participants=self.request.user
        ).select_related('sender', 'conversation')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
        # Update conversation timestamp
        conv = serializer.instance.conversation
        conv.save()  # triggers auto_now on updated_at

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        msg = self.get_object()
        msg.is_read = True
        msg.save()
        return Response({'status': 'read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        conversation_id = request.data.get('conversation')
        if conversation_id:
            Message.objects.filter(
                conversation_id=conversation_id,
                is_read=False,
            ).exclude(sender=request.user).update(is_read=True)
        return Response({'status': 'ok'})
