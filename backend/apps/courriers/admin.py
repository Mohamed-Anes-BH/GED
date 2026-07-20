from django.contrib import admin
from .models import (
    PhysicalLocation,
    CourrierEntrant, CourrierSortant,
    PieceJointe, Diffusion, DiffusionDestinataire, CourrierHistorique
)


@admin.register(PhysicalLocation)
class PhysicalLocationAdmin(admin.ModelAdmin):
    list_display  = ('__str__', 'building', 'office', 'treasury', 'shelf', 'box_number', 'document_number')
    list_filter   = ('building', 'office', 'treasury', 'shelf')
    search_fields = ('box_number', 'document_number')


class PieceJointeInline(admin.TabularInline):
    model  = PieceJointe
    extra  = 0
    ct_field = 'content_type'
    ct_fk_field = 'object_id'


@admin.register(CourrierEntrant)
class CourrierEntrantAdmin(admin.ModelAdmin):
    list_display   = ('numero', 'objet', 'expediteur', 'statut', 'priorite', 'date_reception', 'created_by')
    list_filter    = ('statut', 'priorite', 'type_courrier', 'canal_reception', 'confidentialite')
    search_fields  = ('numero', 'objet', 'expediteur')
    readonly_fields = ('created_by', 'created_at', 'updated_at')
    raw_id_fields  = ('physical_location', 'direction', 'departement', 'service', 'assigned_to', 'created_by')
    date_hierarchy = 'date_reception'
    ordering       = ('-date_reception',)

    fieldsets = (
        ('Informations', {
            'fields': ('numero', 'objet', 'type_courrier', 'expediteur', 'date_reception', 'canal_reception')
        }),
        ('Classification', {
            'fields': ('statut', 'priorite', 'confidentialite', 'categorie', 'notes')
        }),
        ('Références', {
            'fields': ('numero_expedition', 'date_expedition', 'numero_enregistrement')
        }),
        ('Affectation', {
            'fields': ('direction', 'departement', 'service', 'assigned_to')
        }),
        ('Emplacement physique', {
            'fields': ('physical_location',)
        }),
        ('Corbeille', {
            'classes': ('collapse',),
            'fields': ('is_deleted', 'deleted_at')
        }),
        ('Audit', {
            'classes': ('collapse',),
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )


@admin.register(CourrierSortant)
class CourrierSortantAdmin(admin.ModelAdmin):
    list_display   = ('numero', 'objet', 'destinataire', 'statut', 'priorite', 'date_envoi', 'created_by')
    list_filter    = ('statut', 'priorite', 'type_courrier', 'canal_envoi', 'signature', 'confidentialite')
    search_fields  = ('numero', 'objet', 'destinataire')
    readonly_fields = ('created_by', 'created_at', 'updated_at')
    raw_id_fields  = ('physical_location', 'departement', 'service', 'auteur', 'created_by')
    ordering       = ('-created_at',)

    fieldsets = (
        ('Informations', {
            'fields': ('numero', 'objet', 'type_courrier', 'destinataire', 'organisme', 'date_envoi', 'canal_envoi')
        }),
        ('Classification', {
            'fields': ('statut', 'priorite', 'confidentialite', 'signature', 'workflow_status')
        }),
        ('Références', {
            'fields': ('reference', 'numero_expedition', 'date_expedition')
        }),
        ('Affectation', {
            'fields': ('departement', 'service', 'auteur')
        }),
        ('Emplacement physique', {
            'fields': ('physical_location',)
        }),
        ('Corbeille', {
            'classes': ('collapse',),
            'fields': ('is_deleted', 'deleted_at')
        }),
        ('Audit', {
            'classes': ('collapse',),
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )


@admin.register(Diffusion)
class DiffusionAdmin(admin.ModelAdmin):
    list_display  = ('courrier_type', 'courrier_id', 'statut', 'date_diffusion', 'created_by')
    list_filter   = ('courrier_type', 'statut')


@admin.register(CourrierHistorique)
class CourrierHistoriqueAdmin(admin.ModelAdmin):
    list_display  = ('action', 'user', 'created_at')
    list_filter   = ('action',)
    readonly_fields = ('created_at',)
