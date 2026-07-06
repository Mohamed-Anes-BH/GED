from rest_framework import serializers
from .models import OcrJob, OcrResult, OcrPage

class OcrResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcrResult
        fields = '__all__'

class OcrPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcrPage
        fields = '__all__'

class OcrJobSerializer(serializers.ModelSerializer):
    result = OcrResultSerializer(read_only=True)
    pages = OcrPageSerializer(many=True, read_only=True)

    class Meta:
        model = OcrJob
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at']
