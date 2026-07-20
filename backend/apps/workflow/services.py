from django.db import transaction
from django.utils import timezone

from apps.audit.models import AuditLog
from apps.notifications.models import Notification

from .models import Workflow, WorkflowStep, WorkflowInstance, StepExecution


def create_instance(workflow, document, user=None):
	instance = WorkflowInstance.objects.create(workflow=workflow, document=document)
	first_step = workflow.steps.order_by('order').first()
	if first_step:
		StepExecution.objects.create(instance=instance, step=first_step, user=user or workflow.created_by)
	return instance


def validate_execution(execution, user=None, comment=''):
	execution.status = 'valide'
	execution.comment = comment
	execution.completed_at = timezone.now()
	execution.save(update_fields=['status', 'comment', 'completed_at'])
	AuditLog.objects.create(
		user=user or execution.user,
		action='validate',
		resource_type='workflow',
		resource_id=execution.instance_id,
		resource_name=execution.instance.workflow.name,
		details={'step_id': execution.step_id},
	)
	advance_instance(execution.instance, user=user)
	return execution


def reject_execution(execution, user=None, comment=''):
	execution.status = 'rejete'
	execution.comment = comment
	execution.completed_at = timezone.now()
	execution.save(update_fields=['status', 'comment', 'completed_at'])
	AuditLog.objects.create(
		user=user or execution.user,
		action='reject',
		resource_type='workflow',
		resource_id=execution.instance_id,
		resource_name=execution.instance.workflow.name,
		details={'step_id': execution.step_id},
	)
	# Mettre à jour l'instance et le document en rejeté
	instance = execution.instance
	instance.status = 'rejete'
	instance.completed_at = timezone.now()
	instance.save(update_fields=['status', 'completed_at'])

	doc = instance.document
	doc.status = 'rejete'
	doc.save(update_fields=['status', 'updated_at'])
	return execution


def advance_instance(instance, user=None):
	steps = list(instance.workflow.steps.order_by('order'))
	next_index = max(instance.current_step - 1, 0) + 1
	if next_index >= len(steps):
		instance.status = 'valide'
		instance.completed_at = timezone.now()
		instance.save(update_fields=['status', 'completed_at'])
		if instance.document.status != 'valide':
			instance.document.status = 'valide'
			instance.document.save(update_fields=['status', 'updated_at'])
		Notification.objects.create(
			user=instance.document.created_by,
			title='Workflow terminé',
			message=f'Le workflow "{instance.workflow.name}" est terminé pour le document "{instance.document.title}".',
			type='workflow',
			related_document=instance.document,
			related_workflow=instance,
		)
		return instance

	instance.current_step = next_index + 1
	instance.save(update_fields=['current_step'])
	next_step = steps[next_index]
	StepExecution.objects.get_or_create(
		instance=instance,
		step=next_step,
		defaults={'user': user or instance.workflow.created_by},
	)
	return instance
