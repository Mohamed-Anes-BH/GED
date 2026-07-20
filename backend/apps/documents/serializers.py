from rest_framework import serializers
from .models import Document, DocumentFile, DocumentVersion, DocumentRelation, Favorite
from apps.courriers.serializers import PhysicalLocationSerializer, CourrierEntrantSerializer, CourrierSortantSerializer
from apps.dossiers.serializers import DossierSerializer
from apps.dossiers.models import Dossier
from apps.courriers.models import CourrierEntrant, CourrierSortant
from apps.organization.models import Tag


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


class TagNamesField(serializers.Field):
    """
    A custom field that accepts tags as:
    - A list of strings (tag names) → get_or_create by name
    - A list of integers (tag PKs) → look up by pk (for compatibility)
    Returns a list of tag name strings for reading.
    """

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


class DocumentSerializer(serializers.ModelSerializer):
    files = DocumentFileSerializer(many=True, read_only=True)
    versions = DocumentVersionSerializer(many=True, read_only=True)
    physical_location_data = PhysicalLocationSerializer(
        source='physical_location', read_only=True
    )
    physical_location_input = PhysicalLocationSerializer(write_only=True, required=False)
    # Override tags to accept string names
    tags = TagNamesField(required=False, default=list)
    is_favorite = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'deleted_at']

    def get_is_favorite(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user and user.is_authenticated:
            return obj.favorited_by.filter(user=user).exists()
        return False

    def create(self, validated_data):
        from apps.courriers.models import PhysicalLocation
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
        from apps.courriers.models import PhysicalLocation
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


class FavoriteSerializer(serializers.ModelSerializer):
    document_details = DocumentSerializer(source='document', read_only=True)
    folder_details = DossierSerializer(source='folder', read_only=True)
    incoming_mail_details = CourrierEntrantSerializer(source='incoming_mail', read_only=True)
    outgoing_mail_details = CourrierSortantSerializer(source='outgoing_mail', read_only=True)

    class Meta:
        model = Favorite
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

    def to_internal_value(self, data):
        data = data.copy()
        if 'dossier' in data and data['dossier'] is not None:
            data['folder'] = data.pop('dossier')
        if 'courrier_entrant' in data and data['courrier_entrant'] is not None:
            data['incoming_mail'] = data.pop('courrier_entrant')
        if 'courrier_sortant' in data and data['courrier_sortant'] is not None:
            data['outgoing_mail'] = data.pop('courrier_sortant')
        return super().to_internal_value(data)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['document_id'] = ret.get('document')
        ret['document'] = ret.get('document_details')
        ret['dossier'] = ret.get('folder_details')
        ret['courrier_entrant'] = ret.get('incoming_mail_details')
        ret['courrier_sortant'] = ret.get('outgoing_mail_details')
        return ret

    def validate(self, attrs):
        targets = [
            attrs.get('document'),
            attrs.get('folder'),
            attrs.get('incoming_mail'),
            attrs.get('outgoing_mail'),
        ]
        filled_targets = [t for t in targets if t is not None]
        if len(filled_targets) != 1:
            raise serializers.ValidationError("Exactement une cible doit être spécifiée (document, folder, incoming_mail ou outgoing_mail).")
        return attrs

