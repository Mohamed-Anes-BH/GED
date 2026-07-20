from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.courriers.models import CourrierEntrant
from apps.courriers.services import mark_entrant_read
from apps.organization.models import Direction, Departement, Service


User = get_user_model()


class CourrierServiceTests(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			email='courrier.user@example.com',
			password='password123',
			first_name='Courrier',
			last_name='User',
		)
		self.direction = Direction.objects.create(name='Direction Test', code='DCT')
		self.departement = Departement.objects.create(name='Departement Test', code='DPT', direction=self.direction)
		self.service = Service.objects.create(name='Service Test', code='ST', departement=self.departement)
		self.courrier = CourrierEntrant.objects.create(
			numero='CE-TEST-001',
			expediteur='Expediteur Test',
			objet='Objet Test',
			date_reception='2026-07-06',
			created_by=self.user,
			direction=self.direction,
			departement=self.departement,
			service=self.service,
		)

	def test_mark_entrant_read_changes_status(self):
		mark_entrant_read(self.courrier, user=self.user)
		self.courrier.refresh_from_db()
		self.assertEqual(self.courrier.statut, 'lu')
