from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.audit.models import AuditLog
from apps.documents.models import Document
from apps.notifications.models import Notification
from apps.ocr.models import OcrJob, OcrResult
from apps.ocr.services import finish_ocr_job, start_ocr_job
from apps.organization.models import Categorie, Direction, Departement


User = get_user_model()


class OcrServiceTests(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			email='ocr@example.com',
			password='password123',
			first_name='OCR',
			last_name='User',
		)
		self.direction = Direction.objects.create(name='Direction OCR', code='OCR-DIR')
		self.departement = Departement.objects.create(name='Departement OCR', code='OCR-DEP', direction=self.direction)
		self.category = Categorie.objects.create(name='Categorie OCR', code='OCR-CAT')
		self.document = Document.objects.create(
			title='OCR Document',
			category=self.category,
			direction=self.direction,
			departement=self.departement,
			created_by=self.user,
		)

	def test_start_and_finish_ocr_job(self):
		job = start_ocr_job(self.document, 'source.pdf', self.user)
		result = finish_ocr_job(job, full_text='hello world', confidence=98.5)

		job.refresh_from_db()
		self.assertEqual(job.status, 'termine')
		self.assertEqual(result.full_text, 'hello world')
		self.assertTrue(AuditLog.objects.filter(resource_type='document', resource_id=self.document.pk).exists())
		self.assertTrue(Notification.objects.filter(user=self.user, type='document').exists())
