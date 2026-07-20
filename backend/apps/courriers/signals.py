from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.audit.models import AuditLog

from .models import CourrierEntrant, CourrierSortant


@receiver(post_save, sender=CourrierEntrant)
def courrier_entrant_post_save(sender, instance, created, **kwargs):
	AuditLog.objects.create(
		user=instance.created_by,
		action='create' if created else 'update',
		resource_type='courrier',
		resource_id=instance.pk,
		resource_name=instance.objet,
		details={'kind': 'entrant', 'status': instance.statut},
	)


@receiver(post_save, sender=CourrierSortant)
def courrier_sortant_post_save(sender, instance, created, **kwargs):
	AuditLog.objects.create(
		user=instance.created_by,
		action='create' if created else 'update',
		resource_type='courrier',
		resource_id=instance.pk,
		resource_name=instance.objet,
		details={'kind': 'sortant', 'status': instance.statut},
	)
