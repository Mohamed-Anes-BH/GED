from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from apps.organization.models import Direction, Departement, Service

User = settings.AUTH_USER_MODEL

class BaseCourrier(models.Model):
    PRIORITY_CHOICES = [
        ('basse', 'Basse'),
        ('normale', 'Normale'),
        ('haute', 'Haute'),
        ('urgente', 'Urgente'),
    ]

    numero = models.CharField(max_length=50, unique=True, verbose_name="Numéro de référence")
    objet = models.CharField(max_length=500)
    priorite = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normale')
    departement = models.ForeignKey(Departement, on_delete=models.SET_NULL, null=True, blank=True)
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="%(class)s_crees")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class CourrierEntrant(BaseCourrier):
    STATUS_CHOICES = [
        ('nouveau', 'Nouveau'),
        ('lu', 'Lu'),
        ('en_cours', 'En cours'),
        ('traite', 'Traité'),
        ('archive', 'Archivé'),
    ]

    expediteur = models.CharField(max_length=300)
    date_reception = models.DateField()
    statut = models.CharField(max_length=20, choices=STATUS_CHOICES, default='nouveau')
    categorie = models.CharField(max_length=50, null=True, blank=True)
    direction = models.ForeignKey(Direction, on_delete=models.SET_NULL, null=True, blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="courriers_assignes")
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.numero} - {self.objet}"

class CourrierSortant(BaseCourrier):
    STATUS_CHOICES = [
        ('brouillon', 'Brouillon'),
        ('en_signature', 'En signature'),
        ('signe', 'Signé'),
        ('envoye', 'Envoyé'),
        ('archive', 'Archivé'),
    ]

    reference = models.CharField(max_length=100, null=True, blank=True)
    destinataire = models.CharField(max_length=300)
    organisme = models.CharField(max_length=300, null=True, blank=True)
    date_envoi = models.DateField(null=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUS_CHOICES, default='brouillon')
    auteur = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="courriers_rediges")
    workflow_status = models.CharField(max_length=30, null=True, blank=True)

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

    def __str__(self):
        return self.name

class Diffusion(models.Model):
    STATUS_CHOICES = [
        ('en_attente', 'En attente'),
        ('diffuse', 'Diffusé'),
        ('lu', 'Lu'),
    ]
    
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.BigIntegerField()
    courrier = GenericForeignKey('content_type', 'object_id')
    
    destinataires = models.ManyToManyField(User, related_name="diffusions_recues")
    date_diffusion = models.DateTimeField(null=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUS_CHOICES, default='en_attente')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="diffusions_creees")

    def __str__(self):
        return f"Diffusion {self.courrier}"

class CourrierHistorique(models.Model):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.BigIntegerField()
    courrier = GenericForeignKey('content_type', 'object_id')
    
    action = models.CharField(max_length=50)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    details = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} par {self.user.email}"
