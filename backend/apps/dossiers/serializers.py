from rest_framework import serializers
from .models import Dossier, DossierPermission

class DossierPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DossierPermission
        fields = '__all__'

class DossierSerializer(serializers.ModelSerializer):
    permissions = DossierPermissionSerializer(many=True, read_only=True)
    is_favorite = serializers.SerializerMethodField()
    
    class Meta:
        model = Dossier
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at']

    def get_is_favorite(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user and user.is_authenticated:
            return obj.favorited_by.filter(user=user).exists()
        return False
