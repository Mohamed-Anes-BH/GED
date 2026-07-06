from rest_framework import serializers
from .models import Dossier, DossierPermission

class DossierPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DossierPermission
        fields = '__all__'

class DossierSerializer(serializers.ModelSerializer):
    permissions = DossierPermissionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Dossier
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at']
