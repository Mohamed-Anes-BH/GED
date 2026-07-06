from django.db import models
from django.conf import settings
from apps.organization.models import Direction, Departement, Service

User = settings.AUTH_USER_MODEL

class Dossier(models.Model):
    name = models.CharField(max_length=300)
    description = models.TextField(null=True, blank=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='sub_dossiers')
    direction = models.ForeignKey(Direction, on_delete=models.SET_NULL, null=True, blank=True)
    departement = models.ForeignKey(Departement, on_delete=models.SET_NULL, null=True, blank=True)
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True)
    responsable = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='dossiers_geres')
    
    # string reference to avoid circular dependency
    default_workflow = models.ForeignKey('workflow.Workflow', on_delete=models.SET_NULL, null=True, blank=True)
    
    ocr_enabled = models.BooleanField(default=False)
    physical_location = models.CharField(max_length=500, null=True, blank=True)
    is_archived = models.BooleanField(default=False)
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dossiers_crees')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class DossierPermission(models.Model):
    dossier = models.ForeignKey(Dossier, on_delete=models.CASCADE, related_name='permissions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dossier_permissions')
    can_read = models.BooleanField(default=True)
    can_write = models.BooleanField(default=False)
    can_share = models.BooleanField(default=False)
    can_delete = models.BooleanField(default=False)

    class Meta:
        unique_together = ('dossier', 'user')

    def __str__(self):
        return f"{self.user.email} - {self.dossier.name}"
