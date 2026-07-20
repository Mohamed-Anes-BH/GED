from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Direction, Departement, Service, Categorie, Tag, Correspondant, 
    Site, Batiment, Bureau, Armoire, Etagere, BoiteArchive, PhysicalLocation
)

User = get_user_model()

class MinimalUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']

class DirectionSerializer(serializers.ModelSerializer):
    manager_details = MinimalUserSerializer(source='manager', read_only=True)
    class Meta:
        model = Direction
        fields = '__all__'

class DepartementSerializer(serializers.ModelSerializer):
    direction_details = DirectionSerializer(source='direction', read_only=True)
    manager_details = MinimalUserSerializer(source='manager', read_only=True)

    class Meta:
        model = Departement
        fields = '__all__'

class ServiceSerializer(serializers.ModelSerializer):
    departement_details = DepartementSerializer(source='departement', read_only=True)
    manager_details = MinimalUserSerializer(source='manager', read_only=True)

    class Meta:
        model = Service
        fields = '__all__'


class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = '__all__'

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'

    def validate_name(self, value):
        queryset = Tag.objects.filter(name__iexact=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("Un tag avec ce nom existe déjà.")
        return value

class CorrespondantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Correspondant
        fields = '__all__'

class SiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Site
        fields = '__all__'

class BatimentSerializer(serializers.ModelSerializer):
    site_details = SiteSerializer(source='site', read_only=True)
    class Meta:
        model = Batiment
        fields = '__all__'

class BureauSerializer(serializers.ModelSerializer):
    batiment_details = BatimentSerializer(source='batiment', read_only=True)
    class Meta:
        model = Bureau
        fields = '__all__'

class ArmoireSerializer(serializers.ModelSerializer):
    bureau_details = BureauSerializer(source='bureau', read_only=True)
    class Meta:
        model = Armoire
        fields = '__all__'

class EtagereSerializer(serializers.ModelSerializer):
    armoire_details = ArmoireSerializer(source='armoire', read_only=True)
    class Meta:
        model = Etagere
        fields = '__all__'

class BoiteArchiveSerializer(serializers.ModelSerializer):
    etagere_details = EtagereSerializer(source='etagere', read_only=True)
    class Meta:
        model = BoiteArchive
        fields = '__all__'

class PhysicalLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhysicalLocation
        fields = '__all__'
