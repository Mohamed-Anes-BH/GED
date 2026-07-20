from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

# pyrefly: ignore [missing-import]
from apps.audit.models import AuditLog

from .models import Document, Favorite
from .services import notify_document_created


@receiver(post_save, sender=Document)
def document_post_save(sender, instance, created, **kwargs):
	if created:
		AuditLog.objects.create(
			user=instance.created_by,
			action='create',
			resource_type='document',
			resource_id=instance.pk,
			resource_name=instance.title,
		)
		notify_document_created(instance)


@receiver(post_delete, sender=Document)
def document_post_delete(sender, instance, **kwargs):
	AuditLog.objects.create(
		user=instance.created_by,
		action='delete',
		resource_type='document',
		resource_id=instance.pk,
		resource_name=instance.title,
		details={'deleted': True},
	)


@receiver(post_save, sender=Favorite)
def favorite_post_save(sender, instance, created, **kwargs):
	if created:
		resource_type = 'document'
		resource_id = None
		resource_name = ''
		if instance.document:
			resource_type = 'document'
			resource_id = instance.document_id
			resource_name = instance.document.title
		elif instance.folder:
			resource_type = 'dossier'
			resource_id = instance.folder_id
			resource_name = instance.folder.name
		elif instance.incoming_mail:
			resource_type = 'courrier_entrant'
			resource_id = instance.incoming_mail_id
			resource_name = instance.incoming_mail.objet
		elif instance.outgoing_mail:
			resource_type = 'courrier_sortant'
			resource_id = instance.outgoing_mail_id
			resource_name = instance.outgoing_mail.objet

		AuditLog.objects.create(
			user=instance.user,
			action='favorite',
			resource_type=resource_type,
			resource_id=resource_id,
			resource_name=resource_name,
			details={'favorite': True},
		)
