from django.contrib.auth import get_user_model
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.test import RequestFactory, TestCase

from apps.audit.models import AuditLog
from apps.authentication.services import blacklist_refresh_token, change_user_password


User = get_user_model()


class AuthenticationSignalTests(TestCase):
	def setUp(self):
		self.factory = RequestFactory()
		self.user = User.objects.create_user(
			email='auth@example.com',
			password='password123',
			first_name='Auth',
			last_name='User',
		)

	def test_login_and_logout_emit_audit_logs(self):
		request = self.factory.get('/')
		request.META['REMOTE_ADDR'] = '127.0.0.1'
		request.META['HTTP_USER_AGENT'] = 'pytest'

		user_logged_in.send(sender=User, request=request, user=self.user)
		user_logged_out.send(sender=User, request=request, user=self.user)

		self.assertTrue(AuditLog.objects.filter(action='login', resource_type='user', resource_id=self.user.pk).exists())
		self.assertTrue(AuditLog.objects.filter(action='logout', resource_type='user', resource_id=self.user.pk).exists())

	def test_password_change_and_blacklist_helpers(self):
		self.assertTrue(change_user_password(self.user, 'password123', 'new-password-123'))
		self.assertFalse(change_user_password(self.user, 'wrong-old', 'another-password'))

		# blacklist helper should reject obviously invalid refresh tokens
		with self.assertRaises(Exception):
			blacklist_refresh_token('invalid-refresh-token')
