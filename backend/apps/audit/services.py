from django.utils import timezone
from django.db.models import Count

from .models import AuditLog


def log_action(user=None, action='read', resource_type='system', resource_id=None, resource_name=None, details=None, ip_address=None, user_agent=None):
	return AuditLog.objects.create(
		user=user,
		action=action,
		resource_type=resource_type,
		resource_id=resource_id,
		resource_name=resource_name,
		details=details or {},
		ip_address=ip_address,
		user_agent=user_agent,
		created_at=timezone.now(),
	)


def get_audit_queryset(user=None):
	queryset = AuditLog.objects.all()
	if user and user.is_authenticated and not user.is_superuser:
		queryset = queryset.filter(user=user)
	return queryset


def get_audit_stats(user=None):
	queryset = get_audit_queryset(user)
	return {
		'total': queryset.count(),
		'by_action': list(queryset.values('action').order_by('action').annotate(count=Count('id'))),
		'by_resource': list(queryset.values('resource_type').order_by('resource_type').annotate(count=Count('id'))),
	}

