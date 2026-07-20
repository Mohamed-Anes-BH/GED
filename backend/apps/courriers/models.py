from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from apps.organization.models import Categorie, Direction, Departement, Service, Tag

User = settings.AUTH_USER_MODEL


class PhysicalLocation(models.Model):
    """Emplacement physique d'un document ou courrier dans les archives."""

    SITE_CHOICES = [
        ('Siège', 'Siège'),
        ('Annexe', 'Annexe'),
    ]
    BUILDING_CHOICES = [
        ('A', 'A'),
        ('B', 'B'),
        ('C', 'C'),
    ]
    OFFICE_CHOICES = [
        ('Archives', 'Archives'),
        ('101',      '101'),
        ('102',      '102'),
        ('201',      '201'),
        ('202',      '202'),
    ]
    TREASURY_CHOICES = [
        ('Trésorerie principale',  'Trésorerie principale'),
        ('Trésorerie secondaire',  'Trésorerie secondaire'),
    ]
    SHELF_CHOICES = [
        ('Étagère A', 'Étagère A'),
        ('Étagère B', 'Étagère B'),
        ('C', 'Étagère C'),
    ]

    site           = models.CharField(max_length=50,  choices=SITE_CHOICES,      default='Siège', verbose_name="Site")
    building       = models.CharField(max_length=50,  choices=BUILDING_CHOICES,  null=True, blank=True, verbose_name="Bâtiment")
    office         = models.CharField(max_length=50,  choices=OFFICE_CHOICES,    null=True, blank=True, verbose_name="Bureau")
    treasury       = models.CharField(max_length=50,  choices=TREASURY_CHOICES,  null=True, blank=True, verbose_name="Trésorerie")
    shelf          = models.CharField(max_length=50,  choices=SHELF_CHOICES,     null=True, blank=True, verbose_name="Étagère")
    box_number     = models.CharField(max_length=50,  null=True, blank=True, verbose_name="Numéro de boîte")
    document_number= models.CharField(max_length=50,  null=True, blank=True, verbose_name="Numéro de document")
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name         = "Emplacement physique"
        verbose_name_plural  = "Emplacements physiques"

    def __str__(self):
        parts = [p for p in [self.building, self.office, self.shelf, self.box_number] if p]
        return " / ".join(parts) if parts else f"Emplacement #{self.pk}"

    def save(self, *args, **kwargs):
        # Auto-generate box_number if not set
        if not self.box_number:
            from django.utils import timezone as tz
            self.box_number = f"BOX-{tz.now().year}-{(self.pk or 0) + 1:04d}"
        if not self.document_number:
            from django.utils import timezone as tz
            self.document_number = f"DOC-{tz.now().year}-{(self.pk or 0) + 1:04d}"
        super().save(*args, **kwargs)
        # Re-save with pk-based number if they were just created
        needs_resave = False
        if self.box_number.endswith('-1') and self.pk:
            self.box_number = f"BOX-{timezone.now().year}-{self.pk:04d}"
            needs_resave = True
        if self.document_number.endswith('-1') and self.pk:
            self.document_number = f"DOC-{timezone.now().year}-{self.pk:04d}"
            needs_resave = True
        if needs_resave:
            super().save(update_fields=['box_number', 'document_number'])


class BaseCourrier(models.Model):
    PRIORITY_CHOICES = [
        ('normale', 'Normale'),
        ('haute', 'Haute'),
        ('urgente', 'Urgente'),
    ]
    CONFIDENTIALITE_CHOICES = [
        ('public',      'Public'),
        ('interne',     'Interne'),
        ('confidentiel','Confidentiel'),
    ]

    numero = models.CharField(max_length=50, unique=True, verbose_name="Numéro de référence")
    objet = models.CharField(max_length=500)
    priorite = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normale')
    confidentialite = models.CharField(max_length=20, choices=CONFIDENTIALITE_CHOICES, default='public', verbose_name="Confidentialité")
    category = models.ForeignKey(Categorie, on_delete=models.SET_NULL, null=True, blank=True)
    tags = models.ManyToManyField(Tag, blank=True)
    direction = models.ForeignKey(Direction, on_delete=models.SET_NULL, null=True, blank=True)
    departement = models.ForeignKey(Departement, on_delete=models.SET_NULL, null=True, blank=True)
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="%(class)s_crees")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class CourrierEntrant(BaseCourrier):
    TYPE_CHOICES = [
        ('lettre',  'Lettre'),
        ('demande', 'Demande'),
        ('facture', 'Facture'),
        ('contrat', 'Contrat'),
        ('rapport', 'Rapport'),
        ('autre',   'Autre'),
    ]
    STATUS_CHOICES = [
        ('nouveau',       'Nouveau'),
        ('en_traitement', 'En traitement'),
        ('traite',        'Traité'),
        ('archive',       'Archivé'),
    ]
    CANAL_CHOICES = [
        ('email',          'Email'),
        ('courrier_postal','Courrier postal'),
        ('depot_physique', 'Dépôt physique'),
    ]

    type_courrier     = models.CharField(max_length=20, choices=TYPE_CHOICES, default='lettre', verbose_name="Type")
    canal_reception   = models.CharField(max_length=20, choices=CANAL_CHOICES, default='email', verbose_name="Canal de réception")
    expediteur        = models.CharField(max_length=300)
    date_reception    = models.DateField()
    statut            = models.CharField(max_length=20, choices=STATUS_CHOICES, default='nouveau')
    assigned_to       = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="courriers_assignes")
    notes             = models.TextField(null=True, blank=True)

    # Metadata
    numero_expedition     = models.CharField(max_length=100, null=True, blank=True, verbose_name="Numéro d'expédition")
    date_expedition       = models.DateField(null=True, blank=True, verbose_name="Date d'expédition")
    numero_enregistrement = models.CharField(max_length=100, null=True, blank=True, verbose_name="Numéro d'enregistrement")

    # Physical Location
    physical_location = models.OneToOneField(
        PhysicalLocation, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='courrier_entrant',
        verbose_name="Emplacement physique"
    )

    # v2.1 – Corbeille
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['statut']),
            models.Index(fields=['priorite']),
            models.Index(fields=['is_deleted']),
        ]

    def __str__(self):
        return f"{self.numero} - {self.objet}"

class CourrierSortant(BaseCourrier):
    TYPE_CHOICES = [
        ('lettre',  'Lettre'),
        ('reponse', 'Réponse'),
        ('facture', 'Facture'),
        ('contrat', 'Contrat'),
        ('rapport', 'Rapport'),
    ]
    STATUS_CHOICES = [
        ('brouillon',    'Brouillon'),
        ('en_validation','En validation'),
        ('a_envoyer',    'À envoyer'),
        ('envoye',       'Envoyé'),
        ('archive',      'Archivé'),
    ]
    CANAL_CHOICES = [
        ('email',         'Email'),
        ('courrier_postal','Courrier postal'),
        ('main_propre',   'Remise en main propre'),
    ]
    SIGNATURE_CHOICES = [
        ('aucune',       'Aucune'),
        ('electronique', 'Électronique'),
        ('manuscrite',   'Manuscrite'),
    ]

    type_courrier   = models.CharField(max_length=20, choices=TYPE_CHOICES, default='lettre', verbose_name="Type")
    canal_envoi     = models.CharField(max_length=20, choices=CANAL_CHOICES, default='email', verbose_name="Canal d'envoi")
    signature       = models.CharField(max_length=20, choices=SIGNATURE_CHOICES, default='electronique', verbose_name="Signature")
    reference       = models.CharField(max_length=100, null=True, blank=True)
    destinataire    = models.CharField(max_length=300)
    organisme       = models.CharField(max_length=300, null=True, blank=True)
    date_envoi      = models.DateField(null=True, blank=True)
    statut          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='brouillon')
    auteur          = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="courriers_rediges")
    workflow_status = models.CharField(max_length=30, null=True, blank=True)

    # Metadata
    numero_expedition = models.CharField(max_length=100, null=True, blank=True, verbose_name="Numéro d'expédition")
    date_expedition   = models.DateField(null=True, blank=True, verbose_name="Date d'expédition")

    # Physical Location
    physical_location = models.OneToOneField(
        PhysicalLocation, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='courrier_sortant',
        verbose_name="Emplacement physique"
    )

    # v2.1 – Corbeille
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['statut']),
            models.Index(fields=['priorite']),
            models.Index(fields=['is_deleted']),
        ]

    def __str__(self):
        return f"{self.numero} - {self.objet}"

class PieceJointe(models.Model):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.BigIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    file = models.FileField(upload_to='pieces_jointes/')
    name = models.CharField(max_length=255)
    size = models.BigIntegerField()
    mime_type = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
        ]

    def __str__(self):
        return self.name

class Diffusion(models.Model):
    """
    v2.1 – Remplacé: GenericFK → courrier_type + courrier_id (polymorphisme simple)
    Ajout: note, date_expiration, statut mis à jour.
    """
    STATUT_CHOICES = [
        ('en_cours', 'En cours'),
        ('terminee', 'Terminée'),
    ]
    COURRIER_TYPE_CHOICES = [
        ('entrant', 'Entrant'),
        ('sortant', 'Sortant'),
    ]

    courrier_type = models.CharField(max_length=10, choices=COURRIER_TYPE_CHOICES)
    courrier_id = models.BigIntegerField()
    note = models.TextField(null=True, blank=True)
    date_diffusion = models.DateTimeField(default=timezone.now)
    date_expiration = models.DateTimeField(null=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_cours')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="diffusions_creees")

    class Meta:
        indexes = [
            models.Index(fields=['courrier_type', 'courrier_id']),
        ]

    def __str__(self):
        return f"Diffusion {self.courrier_type}/{self.courrier_id}"


class DiffusionDestinataire(models.Model):
    """
    v2.1 – Nouveau: remplace le M2M simple pour permettre le suivi de lecture individuel.
    """
    diffusion = models.ForeignKey(Diffusion, on_delete=models.CASCADE, related_name='destinataires')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='diffusions_recues')
    lu = models.BooleanField(default=False)
    date_lecture = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('diffusion', 'user')

    def __str__(self):
        return f"{self.user.email} – {'Lu' if self.lu else 'Non lu'}"


class CourrierHistorique(models.Model):
    ACTION_CHOICES = [
        ('creation', 'Création'),
        ('lecture', 'Lecture'),
        ('transfert', 'Transfert'),
        ('traitement', 'Traitement'),
        ('archivage', 'Archivage'),
    ]

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.BigIntegerField()
    courrier = GenericForeignKey('content_type', 'object_id')
    
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    details = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['user']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.action} par {self.user.email}"
