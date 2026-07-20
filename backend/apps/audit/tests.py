from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.audit.models import AuditLog
from apps.audit.services import log_action, get_audit_stats


User = get_user_model()


class AuditServiceTests(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			email='audit@example.com',
			password='password123',
			first_name='Audit',
			last_name='User',
		)

	def test_log_action_and_stats(self):
		log_action(user=self.user, action='read', resource_type='document', resource_id=1, resource_name='Doc')
		log_action(user=self.user, action='update', resource_type='document', resource_id=1, resource_name='Doc')

		stats = get_audit_stats(self.user)
		self.assertGreaterEqual(stats['total'], 2)
		self.assertGreaterEqual(AuditLog.objects.count(), 2)
