from django.db import models
from django.conf import settings
from apps.organization.models import Categorie, Direction, Departement, Service, Tag, BoiteArchive

User = settings.AUTH_USER_MODEL

class Document(models.Model):
    STATUS_CHOICES = [
        ('actif', 'Actif'),
        ('brouillon', 'Brouillon'),
        ('archive', 'Archivé'),
    ]
    PRIORITY_CHOICES = [
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
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='actif')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normale')
    
    CONFIDENTIALITE_CHOICES = [
        ('public', 'Public'),
        ('interne', 'Interne'),
        ('confidentiel', 'Confidentiel'),
        ('secret', 'Secret'),
    ]
    confidentialite = models.CharField(max_length=20, choices=CONFIDENTIALITE_CHOICES, default='interne')
    
    is_archived = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    # FK to PhysicalLocation (shared with courriers)
    physical_location = models.OneToOneField(
        'courriers.PhysicalLocation', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='document',
        verbose_name="Emplacement physique"
    )
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
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='favorited_by', null=True, blank=True)
    folder = models.ForeignKey('dossiers.Dossier', on_delete=models.CASCADE, related_name='favorited_by', null=True, blank=True)
    incoming_mail = models.ForeignKey('courriers.CourrierEntrant', on_delete=models.CASCADE, related_name='favorited_by', null=True, blank=True)
    outgoing_mail = models.ForeignKey('courriers.CourrierSortant', on_delete=models.CASCADE, related_name='favorited_by', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.document:
            return f"Favori Doc: {self.document.title}"
        if self.folder:
            return f"Favori Dossier: {self.folder.name}"
        if self.incoming_mail:
            return f"Favori Courrier Entrant: {self.incoming_mail.objet}"
        if self.outgoing_mail:
            return f"Favori Courrier Sortant: {self.outgoing_mail.objet}"
        return f"Favori #{self.id}"

class ScanJob(models.Model):
    document = models.OneToOneField(Document, on_delete=models.CASCADE, related_name='scan_job')
    scanner_name = models.CharField(max_length=255, default='Unknown Scanner')
    dpi = models.IntegerField(default=300)
    color_mode = models.CharField(max_length=50)
    paper_size = models.CharField(max_length=50)
    duplex = models.BooleanField(default=False)
    format = models.CharField(max_length=50, default='PDF')
    scan_status = models.CharField(max_length=50, default='completed')
    ocr_status = models.CharField(max_length=50, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

class ScannedPage(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='scanned_pages')
    scan_job = models.ForeignKey(ScanJob, on_delete=models.CASCADE, related_name='pages')
    page_number = models.IntegerField()
    image = models.FileField(upload_to='scans/pages/')
    created_at = models.DateTimeField(auto_now_add=True)

class OCRResult(models.Model):
    document = models.OneToOneField(Document, on_delete=models.CASCADE, related_name='ocr_result')
    extracted_text = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='completed')
    completed_at = models.DateTimeField(auto_now_add=True)
