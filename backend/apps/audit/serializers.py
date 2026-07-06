from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__'
        read_only_fields = ['user', 'action', 'resource_type', 'resource_id', 'resource_name', 'details', 'ip_address', 'user_agent', 'created_at']
