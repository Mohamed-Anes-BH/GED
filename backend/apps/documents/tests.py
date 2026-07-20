from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from apps.documents.models import Document, DocumentFile, DocumentVersion
from apps.documents.services import restore_document, soft_delete_document, add_document_file, create_document_version
from apps.organization.models import Categorie, Direction, Departement


User = get_user_model()


class DocumentServiceTests(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			email='doc.user@example.com',
			password='password123',
			first_name='Doc',
			last_name='User',
		)
		self.direction = Direction.objects.create(name='Direction Test', code='DT')
		self.departement = Departement.objects.create(name='Departement Test', code='DEP-TEST', direction=self.direction)
		self.category = Categorie.objects.create(name='Categorie Test', code='CAT-TEST')
		self.document = Document.objects.create(
			title='Document Test',
			category=self.category,
			direction=self.direction,
			departement=self.departement,
			created_by=self.user,
		)

	def test_soft_delete_and_restore_document(self):
		soft_delete_document(self.document, user=self.user)
		self.document.refresh_from_db()
		self.assertTrue(self.document.is_deleted)
		self.assertIsNotNone(self.document.deleted_at)

		restore_document(self.document, user=self.user)
		self.document.refresh_from_db()
		self.assertFalse(self.document.is_deleted)
		self.assertIsNone(self.document.deleted_at)

	def test_add_document_file_and_version(self):
		file_one = SimpleUploadedFile('document.pdf', b'pdf-bytes', content_type='application/pdf')
		document_file = add_document_file(self.document, file_one, user=self.user)
		self.assertIsInstance(document_file, DocumentFile)
		self.assertEqual(self.document.files.count(), 1)

		file_two = SimpleUploadedFile('document-v2.pdf', b'pdf-v2-bytes', content_type='application/pdf')
		version = create_document_version(self.document, file_two, user=self.user, changelog='Second version')
		self.assertIsInstance(version, DocumentVersion)
		self.assertEqual(self.document.versions.count(), 1)
		self.assertEqual(version.version_number, 1)
