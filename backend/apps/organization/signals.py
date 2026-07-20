from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.audit.services import log_action

from .models import Direction, Departement, Service, Categorie, Tag, Correspondant, Site, Batiment, Bureau, Armoire, Etagere, BoiteArchive


def _log_org_change(instance, created, resource_type):
	log_action(
		user=getattr(instance, 'responsable', None) or getattr(instance, 'created_by', None),
		action='create' if created else 'update',
		resource_type=resource_type,
		resource_id=instance.pk,
		resource_name=str(instance),
		details={'model': instance.__class__.__name__},
	)


@receiver(post_save, sender=Direction)
def direction_post_save(sender, instance, created, **kwargs):
	_log_org_change(instance, created, 'dossier')


@receiver(post_save, sender=Departement)
def departement_post_save(sender, instance, created, **kwargs):
	_log_org_change(instance, created, 'dossier')


@receiver(post_save, sender=Service)
def service_post_save(sender, instance, created, **kwargs):
	_log_org_change(instance, created, 'dossier')


@receiver(post_save, sender=Categorie)
@receiver(post_save, sender=Tag)
@receiver(post_save, sender=Correspondant)
@receiver(post_save, sender=Site)
@receiver(post_save, sender=Batiment)
@receiver(post_save, sender=Bureau)
@receiver(post_save, sender=Armoire)
@receiver(post_save, sender=Etagere)
@receiver(post_save, sender=BoiteArchive)
def organization_misc_post_save(sender, instance, created, **kwargs):
	resource_type = 'settings' if sender is BoiteArchive else 'dossier'
	_log_org_change(instance, created, resource_type)
