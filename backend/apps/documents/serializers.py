from rest_framework import serializers
from .models import Document, DocumentFile, DocumentVersion, DocumentRelation, Favorite

class DocumentFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentFile
        fields = '__all__'

class DocumentVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentVersion
        fields = '__all__'

class DocumentRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentRelation
        fields = '__all__'

class DocumentSerializer(serializers.ModelSerializer):
    files = DocumentFileSerializer(many=True, read_only=True)
    versions = DocumentVersionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'deleted_at']

class FavoriteSerializer(serializers.ModelSerializer):
    document_details = DocumentSerializer(source='document', read_only=True)

    class Meta:
        model = Favorite
        fields = '__all__'
        read_only_fields = ['user', 'created_at']
