from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.audit.models import AuditLog
from apps.notifications.models import Notification
from apps.notifications.services import get_unread_count, mark_all_read, mark_notification_read, clear_notifications


User = get_user_model()


class NotificationSignalTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.user = User.objects.create_user(
			email='notif@example.com',
			password='password123',
			first_name='Notif',
			last_name='User',
		)
		self.client.force_authenticate(user=self.user)

	def test_notification_creation_logs_audit(self):
		notification = Notification.objects.create(
			user=self.user,
			title='Test Notification',
			message='Message',
			type='system',
		)
		self.assertTrue(AuditLog.objects.filter(resource_type='system', resource_id=notification.pk, action='create').exists())

	def test_notification_service_helpers(self):
		first = Notification.objects.create(user=self.user, title='First', message='One', type='system')
		second = Notification.objects.create(user=self.user, title='Second', message='Two', type='system')

		self.assertEqual(get_unread_count(self.user), 2)
		mark_notification_read(first)
		self.assertEqual(get_unread_count(self.user), 1)
		mark_all_read(self.user)
		self.assertEqual(get_unread_count(self.user), 0)
		clear_notifications(self.user)
		self.assertEqual(Notification.objects.filter(user=self.user).count(), 0)

	def test_notification_api_endpoints(self):
		first = Notification.objects.create(user=self.user, title='First', message='One', type='system')
		Notification.objects.create(user=self.user, title='Second', message='Two', type='system')

		response = self.client.get('/api/notifications/')
		self.assertEqual(response.status_code, 200)
		results = response.data.get('results', response.data)
		self.assertEqual(len(results), 2)

		response = self.client.get('/api/notifications/unread_count/')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['count'], 2)

		response = self.client.post(f'/api/notifications/{first.pk}/mark_read/')
		self.assertEqual(response.status_code, 200)

		response = self.client.post('/api/notifications/mark_all_read/')
		self.assertEqual(response.status_code, 200)

		response = self.client.delete('/api/notifications/clear/')
		self.assertEqual(response.status_code, 204)
