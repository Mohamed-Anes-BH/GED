from rest_framework import serializers
from .models import (
    Direction, Departement, Service, Categorie, Tag, Correspondant, 
    Site, Batiment, Bureau, Armoire, Etagere, BoiteArchive
)

class DirectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Direction
        fields = '__all__'

class DepartementSerializer(serializers.ModelSerializer):
    direction_details = DirectionSerializer(source='direction', read_only=True)

    class Meta:
        model = Departement
        fields = '__all__'

class ServiceSerializer(serializers.ModelSerializer):
    departement_details = DepartementSerializer(source='departement', read_only=True)

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
