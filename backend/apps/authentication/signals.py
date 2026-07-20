from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver

from apps.audit.services import log_action


@receiver(user_logged_in)
def authentication_user_logged_in(sender, request, user, **kwargs):
	log_action(
		user=user,
		action='login',
		resource_type='user',
		resource_id=user.pk,
		resource_name=user.email,
		ip_address=request.META.get('REMOTE_ADDR'),
		user_agent=request.META.get('HTTP_USER_AGENT'),
	)


@receiver(user_logged_out)
def authentication_user_logged_out(sender, request, user, **kwargs):
	if not user:
		return

	log_action(
		user=user,
		action='logout',
		resource_type='user',
		resource_id=user.pk,
		resource_name=user.email,
		ip_address=request.META.get('REMOTE_ADDR'),
		user_agent=request.META.get('HTTP_USER_AGENT'),
	)
