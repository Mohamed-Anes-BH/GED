from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from apps.audit.models import AuditLog

from .models import StepExecution
from .services import advance_instance


@receiver(pre_save, sender=StepExecution)
def step_execution_pre_save(sender, instance, **kwargs):
    if not instance.pk:
        instance._previous_status = None
        return

    previous_status = StepExecution.objects.filter(pk=instance.pk).values_list('status', flat=True).first()
    instance._previous_status = previous_status


@receiver(post_save, sender=StepExecution)
def step_execution_post_save(sender, instance, created, **kwargs):
	if created:
		AuditLog.objects.create(
			user=instance.user,
			action='create',
			resource_type='workflow',
			resource_id=instance.instance_id,
			resource_name=instance.instance.workflow.name,
			details={'step_id': instance.step_id, 'status': instance.status},
		)
		return

	previous_status = getattr(instance, '_previous_status', None)
	if previous_status == instance.status:
		return

	if instance.status == 'valide':
		advance_instance(instance.instance, user=instance.user)
		AuditLog.objects.create(
			user=instance.user,
			action='validate',
			resource_type='workflow',
			resource_id=instance.instance_id,
			resource_name=instance.instance.workflow.name,
			details={'step_id': instance.step_id},
		)
	elif instance.status == 'rejete':
		instance.instance.status = 'rejete'
		instance.instance.completed_at = instance.completed_at
		instance.instance.save(update_fields=['status', 'completed_at'])
		AuditLog.objects.create(
			user=instance.user,
			action='reject',
			resource_type='workflow',
			resource_id=instance.instance_id,
			resource_name=instance.instance.workflow.name,
			details={'step_id': instance.step_id},
		)
