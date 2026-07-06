from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Direction(models.Model):
    name = models.CharField(max_length=200, verbose_name="Nom de la direction")
    code = models.CharField(max_length=20, unique=True, verbose_name="Code court")
    description = models.TextField(null=True, blank=True)
    responsable = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='directions_gerees')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

class Departement(models.Model):
    name = models.CharField(max_length=200, verbose_name="Nom du département")
    code = models.CharField(max_length=20, unique=True, verbose_name="Code court")
    direction = models.ForeignKey(Direction, on_delete=models.CASCADE, related_name='departements')
    description = models.TextField(null=True, blank=True)
    responsable = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='departements_geres')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

class Service(models.Model):
    name = models.CharField(max_length=200, verbose_name="Nom du service")
    code = models.CharField(max_length=20, unique=True, verbose_name="Code court")
    departement = models.ForeignKey(Departement, on_delete=models.CASCADE, related_name='services')
    description = models.TextField(null=True, blank=True)
    responsable = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='services_geres')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


class Categorie(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(null=True, blank=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subcategories')
    color = models.CharField(max_length=7, null=True, blank=True, help_text="Couleur HEX")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=7, default="#6B7280")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Correspondant(models.Model):
    TYPE_CHOICES = [
        ('interne', 'Interne'),
        ('externe', 'Externe'),
        ('institutionnel', 'Institutionnel'),
    ]
    name = models.CharField(max_length=200, verbose_name="Nom complet")
    organisme = models.CharField(max_length=200, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.organisme:
            return f"{self.name} - {self.organisme}"
        return self.name

class Site(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name

class Batiment(models.Model):
    name = models.CharField(max_length=200)
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name="batiments")
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name

class Bureau(models.Model):
    name = models.CharField(max_length=200)
    batiment = models.ForeignKey(Batiment, on_delete=models.CASCADE, related_name="bureaux")
    floor = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return self.name

class Armoire(models.Model):
    name = models.CharField(max_length=200)
    bureau = models.ForeignKey(Bureau, on_delete=models.CASCADE, related_name="armoires")
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name

class Etagere(models.Model):
    name = models.CharField(max_length=100)
    armoire = models.ForeignKey(Armoire, on_delete=models.CASCADE, related_name="etageres")
    position = models.IntegerField()

    def __str__(self):
        return f"{self.armoire.name} - {self.name}"

class BoiteArchive(models.Model):
    STATUS_CHOICES = [
        ('disponible', 'Disponible'),
        ('pleine', 'Pleine'),
        ('archivee', 'Archivée'),
    ]
    code = models.CharField(max_length=50, unique=True)
    etagere = models.ForeignKey(Etagere, on_delete=models.CASCADE, related_name="boites")
    label = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='disponible')
    date_creation = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.code} - {self.label}"
