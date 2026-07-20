from rest_framework import serializers
from .models import (
    CourrierEntrant, CourrierSortant, PieceJointe,
    Diffusion, CourrierHistorique, PhysicalLocation
)
from django.contrib.contenttypes.models import ContentType
from apps.organization.models import Tag


class TagNamesField(serializers.Field):
    def to_representation(self, value):
        return [tag.name for tag in value.all()]

    def to_internal_value(self, data):
        if not isinstance(data, list):
            raise serializers.ValidationError("Expected a list of tag names or IDs.")
        tag_objs = []
        for item in data:
            if isinstance(item, str):
                name = item.strip()
                if name:
                    tag, _ = Tag.objects.get_or_create(name=name)
                    tag_objs.append(tag)
            elif isinstance(item, int):
                try:
                    tag_objs.append(Tag.objects.get(pk=item))
                except Tag.DoesNotExist:
                    raise serializers.ValidationError(f"Tag with id {item} does not exist.")
            else:
                raise serializers.ValidationError(f"Invalid tag value: {item!r}")
        return tag_objs


class PhysicalLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = PhysicalLocation
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class PieceJointeSerializer(serializers.ModelSerializer):
    class Meta:
        model  = PieceJointe
        fields = '__all__'


class CourrierHistoriqueSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CourrierHistorique
        fields = '__all__'


class CourrierEntrantSerializer(serializers.ModelSerializer):
    historique        = serializers.SerializerMethodField()
    pieces_jointes    = serializers.SerializerMethodField()
    physical_location_data = PhysicalLocationSerializer(
        source='physical_location', read_only=True
    )
    physical_location_input = PhysicalLocationSerializer(write_only=True, required=False)
    tags = TagNamesField(required=False, default=list)
    is_favorite = serializers.SerializerMethodField()

    class Meta:
        model  = CourrierEntrant
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_historique(self, obj):
        content_type = ContentType.objects.get_for_model(CourrierEntrant)
        history = CourrierHistorique.objects.filter(content_type=content_type, object_id=obj.pk)
        return CourrierHistoriqueSerializer(history, many=True).data

    def get_pieces_jointes(self, obj):
        content_type = ContentType.objects.get_for_model(CourrierEntrant)
        attachments = PieceJointe.objects.filter(content_type=content_type, object_id=obj.pk)
        return PieceJointeSerializer(attachments, many=True).data

    def get_is_favorite(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user and user.is_authenticated:
            return obj.favorited_by.filter(user=user).exists()
        return False

    def create(self, validated_data):
        loc_data = validated_data.pop('physical_location_input', None)
        tag_objs = validated_data.pop('tags', [])
        location = None
        if loc_data:
            location = PhysicalLocation.objects.create(**loc_data)
        instance = super().create(validated_data)
        if location:
            instance.physical_location = location
            instance.save(update_fields=['physical_location'])
        if tag_objs is not None:
            instance.tags.set(tag_objs)
        return instance

    def update(self, instance, validated_data):
        loc_data = validated_data.pop('physical_location_input', None)
        tag_objs = validated_data.pop('tags', None)
        if loc_data:
            if instance.physical_location:
                for attr, val in loc_data.items():
                    setattr(instance.physical_location, attr, val)
                instance.physical_location.save()
            else:
                location = PhysicalLocation.objects.create(**loc_data)
                instance.physical_location = location
        instance = super().update(instance, validated_data)
        if tag_objs is not None:
            instance.tags.set(tag_objs)
        return instance


class CourrierSortantSerializer(serializers.ModelSerializer):
    physical_location_data = PhysicalLocationSerializer(
        source='physical_location', read_only=True
    )
    physical_location_input = PhysicalLocationSerializer(write_only=True, required=False)
    tags = TagNamesField(required=False, default=list)
    is_favorite = serializers.SerializerMethodField()

    class Meta:
        model  = CourrierSortant
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_is_favorite(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user and user.is_authenticated:
            return obj.favorited_by.filter(user=user).exists()
        return False

    def create(self, validated_data):
        loc_data = validated_data.pop('physical_location_input', None)
        tag_objs = validated_data.pop('tags', [])
        location = None
        if loc_data:
            location = PhysicalLocation.objects.create(**loc_data)
        instance = super().create(validated_data)
        if location:
            instance.physical_location = location
            instance.save(update_fields=['physical_location'])
        if tag_objs is not None:
            instance.tags.set(tag_objs)
        return instance

    def update(self, instance, validated_data):
        loc_data = validated_data.pop('physical_location_input', None)
        tag_objs = validated_data.pop('tags', None)
        if loc_data:
            if instance.physical_location:
                for attr, val in loc_data.items():
                    setattr(instance.physical_location, attr, val)
                instance.physical_location.save()
            else:
                location = PhysicalLocation.objects.create(**loc_data)
                instance.physical_location = location
        instance = super().update(instance, validated_data)
        if tag_objs is not None:
            instance.tags.set(tag_objs)
        return instance


class DiffusionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Diffusion
        fields = '__all__'
