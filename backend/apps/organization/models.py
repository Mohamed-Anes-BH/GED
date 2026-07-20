from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Direction(models.Model):
    STATUS_CHOICES = [('actif', 'Actif'), ('inactif', 'Inactif')]
    
    code = models.CharField(max_length=50, unique=True, blank=True)
    name = models.CharField(max_length=200)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='directions_gerees')
    responsable = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='directions_responsable') # kept for backward compatibility if needed by old code
    description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='actif')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.name[:3].upper() if self.name else 'DIR'
        super().save(*args, **kwargs)

class Departement(models.Model):
    STATUS_CHOICES = [('actif', 'Actif'), ('inactif', 'Inactif')]

    code = models.CharField(max_length=50, unique=True, blank=True)
    direction = models.ForeignKey(Direction, on_delete=models.CASCADE, related_name='departements')
    name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='departements_geres')
    responsable = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='departements_responsable')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='actif')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.name[:3].upper() if self.name else 'DEP'
        super().save(*args, **kwargs)

class Service(models.Model):
    STATUS_CHOICES = [('actif', 'Actif'), ('inactif', 'Inactif')]

    code = models.CharField(max_length=50, unique=True, blank=True)
    departement = models.ForeignKey(Departement, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='services_geres')
    responsable = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='services_responsable')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='actif')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.name[:3].upper() if self.name else 'SRV'
        super().save(*args, **kwargs)

class Categorie(models.Model):
    STATUS_CHOICES = [('actif', 'Actif'), ('inactif', 'Inactif')]

    code = models.CharField(max_length=50, unique=True, blank=True)
    name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subcategories')
    color = models.CharField(max_length=20, null=True, blank=True, help_text="Couleur HEX ou classe Tailwind")
    icon = models.CharField(max_length=50, null=True, blank=True, help_text="Nom d'icône")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='actif')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.name[:3].upper() if self.name else 'CAT'
        super().save(*args, **kwargs)

class Tag(models.Model):
    COLOR_CHOICES = [
        ('bleu', 'Bleu'),
        ('vert', 'Vert'),
        ('orange', 'Orange'),
        ('rouge', 'Rouge'),
        ('violet', 'Violet'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('archived', 'Archived'),
    ]
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    color = models.CharField(max_length=20, default='#3B82F6')
    description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Correspondant(models.Model):
    TYPE_CHOICES = [
        ('administration', 'Administration'),
        ('entreprise', 'Entreprise'),
        ('fournisseur', 'Fournisseur'),
        ('client', 'Client'),
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

class PhysicalLocation(models.Model):
    site = models.CharField(max_length=200, default='Siège')
    building = models.CharField(max_length=200, default='A')
    office = models.CharField(max_length=200, default='Archives')
    treasury = models.CharField(max_length=200, default='Trésorerie principale')
    shelf = models.CharField(max_length=200, default='Étagère A')
    box_number = models.CharField(max_length=100, unique=True, blank=True)
    document_number = models.CharField(max_length=100, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.box_number:
            import random
            self.box_number = f"BOX-{random.randint(100000, 999999)}"
        if not self.document_number:
            import random
            self.document_number = f"DOC-{random.randint(100000, 999999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.site} - {self.building} - {self.office} (Box: {self.box_number}, Doc: {self.document_number})"
