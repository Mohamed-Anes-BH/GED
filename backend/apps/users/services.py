from apps.audit.services import log_action
from apps.notifications.services import create_notification

from .models import User, Role, Permission


def create_user(**kwargs):
	password = kwargs.pop('password', None)
	user = User.objects.create(**kwargs)
	if password:
		user.set_password(password)
		user.save(update_fields=['password'])
	return user


def activate_user(user, active=True, actor=None):
	user.is_active = active
	user.save(update_fields=['is_active'])
	log_action(user=actor, action='update', resource_type='user', resource_id=user.pk, resource_name=user.email, details={'is_active': active})
	return user


def assign_role(user, role, actor=None):
	user.role = role
	user.save(update_fields=['role'])
	log_action(user=actor, action='update', resource_type='user', resource_id=user.pk, resource_name=user.email, details={'role': role.name if role else None})
	return user


def create_role_permission(role, resource, **flags):
	permission, _ = Permission.objects.get_or_create(role=role, resource=resource)
	for field, value in flags.items():
		if hasattr(permission, field):
			setattr(permission, field, value)
	permission.save()
	return permission


def notify_admin_user_created(user):
	admin = User.objects.filter(is_staff=True).first()
	if admin:
		create_notification(
			user=admin,
			title='Nouvel utilisateur créé',
			message=f'Un nouvel utilisateur a été créé: {user.email}',
			type='user',
		)

