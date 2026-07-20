from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.audit.models import AuditLog
from apps.courriers.models import CourrierEntrant, CourrierSortant
from apps.dashboard.services import get_global_kpis, get_recent_activity
from apps.documents.models import Document
from apps.notifications.models import Notification
from apps.organization.models import Categorie, Direction, Departement


User = get_user_model()


class DashboardServiceTests(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			email='dash.user@example.com',
			password='password123',
			first_name='Dash',
			last_name='User',
		)
		self.direction = Direction.objects.create(name='Direction Dashboard', code='DDD')
		self.departement = Departement.objects.create(name='Departement Dashboard', code='DDP', direction=self.direction)
		self.category = Categorie.objects.create(name='Categorie Dashboard', code='DASH-CAT')
		Document.objects.create(
			title='Dashboard Document',
			category=self.category,
			direction=self.direction,
			departement=self.departement,
			created_by=self.user,
		)
		CourrierEntrant.objects.create(
			numero='CE-DASH-001',
			expediteur='Dash Expediteur',
			objet='Dash Objet',
			date_reception='2026-07-06',
			created_by=self.user,
		)
		CourrierSortant.objects.create(
			numero='CS-DASH-001',
			destinataire='Dash Destinataire',
			objet='Dash Objet Sortant',
			created_by=self.user,
		)
		Notification.objects.create(
			user=self.user,
			title='Notification Test',
			message='Message test',
			type='system',
		)
		AuditLog.objects.create(
			user=self.user,
			action='read',
			resource_type='document',
			resource_name='Dashboard Document',
		)

	def test_get_global_kpis_reflects_seeded_data(self):
		kpis = get_global_kpis(self.user)
		self.assertEqual(kpis['total_documents'], 1)
		self.assertEqual(kpis['total_courriers'], 2)
		self.assertEqual(kpis['notifications_non_lues'], 2)
		self.assertEqual(kpis['mes_documents'], 1)

	def test_get_recent_activity_returns_recent_entries(self):
		activity = get_recent_activity(self.user, limit=5)
		self.assertTrue(activity)
		self.assertLessEqual(len(activity), 5)
