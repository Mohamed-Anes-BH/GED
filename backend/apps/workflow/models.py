from django.db import models
from django.conf import settings
from apps.organization.models import Departement
from apps.documents.models import Document

User = settings.AUTH_USER_MODEL

class Workflow(models.Model):
    STATUS_CHOICES = [
        ('brouillon', 'Brouillon'),
        ('actif', 'Actif'),
        ('inactif', 'Inactif'),
        ('archive', 'Archivé'),
    ]
    VISIBILITY_CHOICES = [
        ('prive', 'Privé'),
        ('departement', 'Département'),
        ('global', 'Global'),
    ]

    TYPE_CHOICES = [
        ('simple', 'Validation simple'),
        ('hierarchique', 'Validation hiérarchique'),
    ]
    name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    workflow_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='simple', verbose_name="Type de workflow")
    document_type = models.CharField(max_length=50, null=True, blank=True)
    departement = models.ForeignKey(Departement, on_delete=models.SET_NULL, null=True, blank=True)
    responsable = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='workflows_responsable')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='brouillon')
    version = models.IntegerField(default=1)
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='departement')
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workflows_crees')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class WorkflowStep(models.Model):
    PASS_CONDITION_CHOICES = [
        ('all', 'Unanimité'),
        ('any', 'Un seul suffit'),
    ]

    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, related_name='steps')
    name = models.CharField(max_length=200)
    order = models.IntegerField()
    responsable = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    # string ref to Role
    role = models.ForeignKey('users.Role', on_delete=models.SET_NULL, null=True, blank=True)
    
    departement = models.ForeignKey('organization.Departement', on_delete=models.SET_NULL, null=True, blank=True)
    service = models.ForeignKey('organization.Service', on_delete=models.SET_NULL, null=True, blank=True)
    
    delay_days = models.IntegerField(default=3)
    is_required = models.BooleanField(default=True)
    requires_signature = models.BooleanField(default=False)
    notify_email = models.BooleanField(default=False)
    notify_internal = models.BooleanField(default=True)
    pass_condition = models.CharField(max_length=20, choices=PASS_CONDITION_CHOICES, default='all')

    class Meta:
        unique_together = ('workflow', 'order')
        ordering = ['order']

    def __str__(self):
        return f"{self.workflow.name} - Étape {self.order} : {self.name}"

class WorkflowInstance(models.Model):
    STATUS_CHOICES = [
        ('en_cours', 'En cours'),
        ('valide', 'Validé'),
        ('rejete', 'Rejeté'),
        ('annule', 'Annulé'),
    ]

    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, related_name='instances')
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='workflows')
    current_step = models.IntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='en_cours')
    
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Instance {self.workflow.name} pour le doc #{self.document.id}"

class StepExecution(models.Model):
    STATUS_CHOICES = [
        ('en_attente', 'En attente'),
        ('valide', 'Validé'),
        ('refuse', 'Refusé'),
    ]
    ACTION_CHOICES = [
        ('valider', 'Valider'),
        ('refuser', 'Refuser'),
        ('retourner', 'Retourner'),
    ]

    instance = models.ForeignKey(WorkflowInstance, on_delete=models.CASCADE, related_name='executions')
    step = models.ForeignKey(WorkflowStep, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='en_attente')
    action_taken = models.CharField(max_length=20, choices=ACTION_CHOICES, null=True, blank=True, verbose_name="Action")
    comment = models.TextField(null=True, blank=True)
    
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Exécution {self.step.name} par {self.user.email} - {self.status}"
