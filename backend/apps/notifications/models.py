from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Notification(models.Model):
    TYPE_CHOICES = [
        ('document', 'Document'),
        ('courrier', 'Courrier'),
        ('workflow', 'Workflow'),
        ('system', 'Système'),
        ('user', 'Utilisateur'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', verbose_name="Destinataire")
    title = models.CharField(max_length=300)
    message = models.TextField()
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    icon = models.CharField(max_length=50, null=True, blank=True, help_text="Nom d'icône Tabler")
    link = models.CharField(max_length=500, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    
    # Optional generic link or specific string ref
    related_document = models.ForeignKey('documents.Document', on_delete=models.SET_NULL, null=True, blank=True)
    related_workflow = models.ForeignKey('workflow.WorkflowInstance', on_delete=models.SET_NULL, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notif #{self.id} -> {self.user.email} : {self.title}"
