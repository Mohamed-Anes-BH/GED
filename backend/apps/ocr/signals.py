from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.audit.services import log_action
from apps.notifications.services import create_notification

from .models import OcrJob, OcrResult


@receiver(post_save, sender=OcrJob)
def ocr_job_post_save(sender, instance, created, **kwargs):
	log_action(
		user=instance.created_by,
		action='create' if created else 'update',
		resource_type='document',
		resource_id=instance.document_id,
		resource_name=instance.document.title,
		details={'ocr_job_id': instance.pk, 'status': instance.status, 'progress': instance.progress},
	)


@receiver(post_save, sender=OcrResult)
def ocr_result_post_save(sender, instance, created, **kwargs):
	log_action(
		user=instance.job.created_by,
		action='update',
		resource_type='document',
		resource_id=instance.job.document_id,
		resource_name=instance.job.document.title,
		details={'ocr_result_id': instance.pk, 'confidence': instance.confidence},
	)

	if created:
		create_notification(
			user=instance.job.created_by,
			title='OCR terminé',
			message=f'L\'OCR du document "{instance.job.document.title}" est disponible.',
			type='document',
			related_document=instance.job.document,
		)
