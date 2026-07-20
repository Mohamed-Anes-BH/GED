from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.audit.models import AuditLog
from apps.organization.models import Direction, Departement


User = get_user_model()


class OrganizationSignalTests(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			email='org@example.com',
			password='password123',
			first_name='Org',
			last_name='User',
		)

	def test_direction_creation_logs_audit(self):
		direction = Direction.objects.create(name='Direction Test', code='DIR-TEST', responsable=self.user)
		Departement.objects.create(name='Departement Test', code='DEP-TEST', direction=direction, responsable=self.user)

		self.assertTrue(AuditLog.objects.filter(resource_type='dossier', resource_id=direction.pk, action='create').exists())
		self.assertTrue(AuditLog.objects.filter(resource_type='dossier', action='create').count() >= 2)
