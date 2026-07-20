from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.audit.models import AuditLog
from apps.documents.models import Document
from apps.organization.models import Categorie, Direction, Departement
from apps.notifications.models import Notification
from apps.users.models import Role


User = get_user_model()


class UserSignalTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.admin = User.objects.create_user(
			email='admin@example.com',
			password='password123',
			first_name='Admin',
			last_name='User',
			is_staff=True,
		)
		self.client.force_authenticate(user=self.admin)
		self.role = Role.objects.create(name='Manager')
		self.direction = Direction.objects.create(name='Direction API', code='USR-DIR')
		self.departement = Departement.objects.create(name='Departement API', code='USR-DEP', direction=self.direction)
		self.category = Categorie.objects.create(name='Categorie API', code='USR-CAT')
		self.target = User.objects.create_user(
			email='target@example.com',
			password='password123',
			first_name='Target',
			last_name='User',
		)

	def test_user_creation_emits_audit_and_admin_notification_if_staff_exists(self):
		User.objects.create_user(
			email='staff@example.com',
			password='password123',
			first_name='Staff',
			last_name='Member',
			is_staff=True,
		)
		user = User.objects.create_user(
			email='new@example.com',
			password='password123',
			first_name='New',
			last_name='User',
		)

		self.assertTrue(AuditLog.objects.filter(resource_type='user', resource_id=user.pk, action='create').exists())
		self.assertTrue(Notification.objects.filter(type='user').exists())

	def test_profile_and_activate_endpoints(self):
		response = self.client.get('/api/users/profile/')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['email'], self.admin.email)

		response = self.client.patch(f'/api/users/{self.target.pk}/activate/', {'is_active': False}, format='json')
		self.assertEqual(response.status_code, 200)
		self.target.refresh_from_db()
		self.assertFalse(self.target.is_active)

	def test_role_permissions_endpoint(self):
		response = self.client.put(
			f'/api/roles/{self.role.pk}/permissions/',
			[
				{
					'resource': 'documents',
					'can_read': True,
					'can_create': True,
				},
			],
			format='json',
		)
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data[0]['resource'], 'documents')
