from django.db import models
from django.conf import settings
from apps.organization.models import Categorie, Direction, Departement, Service, Tag, BoiteArchive

User = settings.AUTH_USER_MODEL

class Document(models.Model):
    STATUS_CHOICES = [
        ('brouillon', 'Brouillon'),
        ('en_revision', 'En révision'),
        ('valide', 'Validé'),
        ('archive', 'Archivé'),
        ('rejete', 'Rejeté'),
    ]
    PRIORITY_CHOICES = [
        ('basse', 'Basse'),
        ('normale', 'Normale'),
        ('haute', 'Haute'),
        ('urgente', 'Urgente'),
    ]

    title = models.CharField(max_length=500)
    description = models.TextField(null=True, blank=True)
    category = models.ForeignKey(Categorie, on_delete=models.SET_NULL, null=True, blank=True)
    direction = models.ForeignKey(Direction, on_delete=models.SET_NULL, null=True, blank=True)
    departement = models.ForeignKey(Departement, on_delete=models.SET_NULL, null=True, blank=True)
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True)
    
    # string reference to avoid circular dependency since dossiers is not yet created
    dossier = models.ForeignKey('dossiers.Dossier', on_delete=models.SET_NULL, null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='brouillon')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normale')
    
    is_archived = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    physical_location = models.CharField(max_length=500, null=True, blank=True)
    boite_archive = models.ForeignKey(BoiteArchive, on_delete=models.SET_NULL, null=True, blank=True)
    
    tags = models.ManyToManyField(Tag, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents_crees')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class DocumentFile(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='documents/')
    filename = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=100)
    size = models.BigIntegerField()
    checksum = models.CharField(max_length=64)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.filename

class DocumentVersion(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='versions')
    version_number = models.IntegerField()
    file = models.FileField(upload_to='documents/versions/')
    changelog = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('document', 'version_number')

    def __str__(self):
        return f"{self.document.title} - v{self.version_number}"

class DocumentRelation(models.Model):
    RELATION_CHOICES = [
        ('annexe', 'Annexe'),
        ('reference', 'Référence'),
        ('reponse', 'Réponse'),
        ('version_de', 'Version de'),
    ]
    source = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='relations_sortantes')
    target = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='relations_entrantes')
    relation_type = models.CharField(max_length=30, choices=RELATION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('source', 'target', 'relation_type')

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'document')
