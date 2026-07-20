from rest_framework import serializers
from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_name', 'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'sender_name', 'created_at']

    def get_sender_name(self, obj):
        return f"{obj.sender.first_name} {obj.sender.last_name}".strip() or obj.sender.email


class ConversationSerializer(serializers.ModelSerializer):
    last_message = MessageSerializer(read_only=True)
    participant_names = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'subject', 'participants', 'participant_names', 'last_message', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_participant_names(self, obj):
        return [
            {
                'id': u.id,
                'name': f"{u.first_name} {u.last_name}".strip() or u.email,
                'email': u.email,
            }
            for u in obj.participants.all()
        ]
