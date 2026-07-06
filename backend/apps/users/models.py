from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'email doit être renseigné")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser doit avoir is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser doit avoir is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class Role(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Nom du rôle")
    description = models.TextField(null=True, blank=True)
    is_system = models.BooleanField(default=False, help_text="Rôle système non supprimable")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Rôle"
        verbose_name_plural = "Rôles"


class Permission(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='permissions')
    resource = models.CharField(max_length=50, help_text="Module: documents, courriers, workflow, etc.")
    can_create = models.BooleanField(default=False)
    can_read = models.BooleanField(default=True)
    can_update = models.BooleanField(default=False)
    can_delete = models.BooleanField(default=False)
    can_download = models.BooleanField(default=False)
    can_share = models.BooleanField(default=False)
    can_approve = models.BooleanField(default=False)

    class Meta:
        unique_together = ('role', 'resource')
        verbose_name = "Permission"
        verbose_name_plural = "Permissions"

    def __str__(self):
        return f"{self.role.name} - {self.resource}"


class User(AbstractUser):
    username = None  # Remove username, email is unique identifier
    email = models.EmailField('adresse email', unique=True, max_length=255)
    first_name = models.CharField('prénom', max_length=150)
    last_name = models.CharField('nom', max_length=150)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    
    # FK vers Role
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    
    # string-based FK to avoid circular import and allow order of implementation
    department = models.ForeignKey('organization.Departement', on_delete=models.SET_NULL, null=True, blank=True, related_name='users_in_dept')
    service = models.ForeignKey('organization.Service', on_delete=models.SET_NULL, null=True, blank=True, related_name='users_in_service')
    
    # the existing is_active, is_staff, is_superuser, default fields are from AbstractUser

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = UserManager()

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
