from django.db import models
from django.conf import settings
from apps.documents.models import Document

User = settings.AUTH_USER_MODEL

class OcrJob(models.Model):
    STATUS_CHOICES = [
        ('en_attente', 'En attente'),
        ('en_cours', 'En cours'),
        ('termine', 'Terminé'),
        ('erreur', 'Erreur'),
    ]

    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='ocr_jobs')
    source_file = models.CharField(max_length=500)
    language = models.CharField(max_length=10, default='fra')
    engine = models.CharField(max_length=30, default='tesseract')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='en_attente')
    progress = models.IntegerField(default=0)
    error_message = models.TextField(null=True, blank=True)
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"OCR Job #{self.id} - {self.status}"

class OcrResult(models.Model):
    job = models.OneToOneField(OcrJob, on_delete=models.CASCADE, related_name='result')
    full_text = models.TextField(null=True, blank=True)
    confidence = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    words_count = models.IntegerField(default=0)
    paragraphs = models.IntegerField(default=0)
    tables_detected = models.IntegerField(default=0)
    signatures_detected = models.IntegerField(default=0)
    stamps_detected = models.IntegerField(default=0)
    
    processing_time = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Résultat pour Job #{self.job.id}"

class OcrPage(models.Model):
    job = models.ForeignKey(OcrJob, on_delete=models.CASCADE, related_name='pages')
    page_number = models.IntegerField()
    image_file = models.CharField(max_length=500, null=True, blank=True)
    text = models.TextField(null=True, blank=True)
    confidence = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        unique_together = ('job', 'page_number')

    def __str__(self):
        return f"Page {self.page_number} (Job #{self.job.id})"
