from rest_framework import serializers
from .models import CourrierEntrant, CourrierSortant, PieceJointe, Diffusion, CourrierHistorique

class PieceJointeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PieceJointe
        fields = '__all__'

class CourrierHistoriqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourrierHistorique
        fields = '__all__'

class CourrierEntrantSerializer(serializers.ModelSerializer):
    historique = serializers.SerializerMethodField()
    pieces_jointes = serializers.SerializerMethodField()

    class Meta:
        model = CourrierEntrant
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_historique(self, obj):
        # Requires generic relations resolution, simplified for now
        pass

    def get_pieces_jointes(self, obj):
        # Requires generic relations resolution
        pass

class CourrierSortantSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourrierSortant
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class DiffusionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diffusion
        fields = '__all__'
