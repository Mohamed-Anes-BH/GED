from rest_framework_simplejwt.tokens import RefreshToken

from apps.audit.services import log_action


def blacklist_refresh_token(refresh_token):
	token = RefreshToken(refresh_token)
	token.blacklist()
	return True


def change_user_password(user, old_password, new_password):
	if not user.check_password(old_password):
		return False
	user.set_password(new_password)
	user.save(update_fields=['password'])
	return True


def log_login(user, request=None):
	log_action(
		user=user,
		action='login',
		resource_type='user',
		resource_id=user.pk,
		resource_name=user.email,
		ip_address=getattr(request, 'META', {}).get('REMOTE_ADDR') if request else None,
		user_agent=getattr(request, 'META', {}).get('HTTP_USER_AGENT') if request else None,
	)


def log_logout(user, request=None):
	log_action(
		user=user,
		action='logout',
		resource_type='user',
		resource_id=user.pk,
		resource_name=user.email,
		ip_address=getattr(request, 'META', {}).get('REMOTE_ADDR') if request else None,
		user_agent=getattr(request, 'META', {}).get('HTTP_USER_AGENT') if request else None,
	)

