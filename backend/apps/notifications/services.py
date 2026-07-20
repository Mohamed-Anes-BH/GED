from django.db.models import Count

from .models import Notification


def create_notification(user, title, message, type='system', icon=None, link=None, related_document=None, related_workflow=None):
	return Notification.objects.create(
		user=user,
		title=title,
		message=message,
		type=type,
		icon=icon,
		link=link,
		related_document=related_document,
		related_workflow=related_workflow,
	)


def mark_notification_read(notification):
	notification.is_read = True
	notification.save(update_fields=['is_read'])
	return notification


def mark_all_read(user):
	return Notification.objects.filter(user=user, is_read=False).update(is_read=True)


def clear_notifications(user):
	return Notification.objects.filter(user=user).delete()


def get_unread_count(user):
	return Notification.objects.filter(user=user, is_read=False).count()


def list_notifications(user, unread_only=False):
	queryset = Notification.objects.filter(user=user)
	if unread_only:
		queryset = queryset.filter(is_read=False)
	return queryset

