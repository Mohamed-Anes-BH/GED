from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('create', 'Create'),
        ('read', 'Read'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('download', 'Download'),
        ('share', 'Share'),
        ('archive', 'Archive'),
        ('validate', 'Validate'),
        ('reject', 'Reject'),
    ]

    RESOURCE_TYPE_CHOICES = [
        ('document', 'Document'),
        ('courrier', 'Courrier'),
        ('workflow', 'Workflow'),
        ('user', 'Utilisateur'),
        ('dossier', 'Dossier'),
        ('settings', 'Paramètres'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    resource_type = models.CharField(max_length=50, choices=RESOURCE_TYPE_CHOICES)
    resource_id = models.BigIntegerField(null=True, blank=True)
    resource_name = models.CharField(max_length=500, null=True, blank=True)
    
    details = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} on {self.resource_type} by {self.user.email if self.user else 'System'}"
