from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.audit.services import log_action

from .services import notify_admin_user_created

from .models import User


@receiver(post_save, sender=User)
def user_post_save(sender, instance, created, **kwargs):
	if not created:
		return

	log_action(
		user=instance,
		action='create',
		resource_type='user',
		resource_id=instance.pk,
		resource_name=instance.email,
		details={'created_via': 'signal'},
	)
	notify_admin_user_created(instance)
