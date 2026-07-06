from django.db import models

class AppSettings(models.Model):
    app_name = models.CharField(max_length=100, default="AgrOdiv GED")
    logo = models.CharField(max_length=500, null=True, blank=True)
    primary_color = models.CharField(max_length=7, default="#F59E0B")
    language = models.CharField(max_length=5, default="fr")
    timezone = models.CharField(max_length=50, default="Africa/Algiers")
    
    storage_limit = models.BigIntegerField(default=10737418240) # 10 GB
    max_upload_size = models.IntegerField(default=52428800) # 50 MB
    ocr_default_language = models.CharField(max_length=10, default="fra")
    retention_policy = models.IntegerField(default=365) # jours
    
    auto_backup = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Paramètre de l'Application"

    def save(self, *args, **kwargs):
        # Implement singleton pattern
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_settings(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "Paramètres Globaux"


class BackupRecord(models.Model):
    TYPE_CHOICES = [
        ('full', 'Complet'),
        ('incremental', 'Incrémental'),
        ('manual', 'Manuel'),
    ]
    STATUS_CHOICES = [
        ('in_progress', 'En cours'),
        ('completed', 'Terminé'),
        ('failed', 'Échoué'),
    ]

    filename = models.CharField(max_length=300)
    size = models.BigIntegerField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.filename
