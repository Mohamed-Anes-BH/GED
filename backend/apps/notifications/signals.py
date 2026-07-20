from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync

from apps.audit.services import log_action

from .models import Notification


@receiver(post_save, sender=Notification)
def notification_post_save(sender, instance, created, **kwargs):
    log_action(
        user=instance.user,
        action='create' if created else 'update',
        resource_type='system',
        resource_id=instance.pk,
        resource_name=instance.title,
        details={'type': instance.type, 'is_read': instance.is_read},
    )

    # Real-time push via Django Channels WebSocket
    if created:
        try:
            from channels.layers import get_channel_layer
            channel_layer = get_channel_layer()
            if channel_layer is not None:
                group_name = f'notifications_{instance.user_id}'
                async_to_sync(channel_layer.group_send)(
                    group_name,
                    {
                        'type': 'notification_message',
                        'id': instance.pk,
                        'title': instance.title,
                        'message': instance.message,
                        'notification_type': instance.type,
                        'created_at': instance.created_at.isoformat(),
                    }
                )
        except Exception:
            # Don't break request if channel layer is unavailable (tests, no Redis, etc.)
            pass
