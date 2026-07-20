from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import AuditLog


@receiver(post_save, sender=AuditLog)
def auditlog_post_save(sender, instance, created, **kwargs):
	# Audit logs are terminal records; this hook exists to keep the module active and allow future extensions.
	return None
