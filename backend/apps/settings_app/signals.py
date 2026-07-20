from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.audit.services import log_action

from .models import AppSettings, BackupRecord


@receiver(post_save, sender=AppSettings)
def app_settings_post_save(sender, instance, created, **kwargs):
	log_action(
		user=None,
		action='update' if not created else 'create',
		resource_type='settings',
		resource_id=instance.pk,
		resource_name='AppSettings',
		details={'app_name': instance.app_name},
	)


@receiver(post_save, sender=BackupRecord)
def backup_record_post_save(sender, instance, created, **kwargs):
	log_action(
		user=None,
		action='create' if created else 'update',
		resource_type='settings',
		resource_id=instance.pk,
		resource_name=instance.filename,
		details={'status': instance.status, 'type': instance.type},
	)
