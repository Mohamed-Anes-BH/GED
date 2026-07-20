from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.documents.models import Document
from apps.dossiers.models import Dossier
from apps.dossiers.services import build_tree, get_content
from apps.organization.models import Categorie, Direction, Departement


User = get_user_model()


class DossierServiceTests(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			email='dossier@example.com',
			password='password123',
			first_name='Dossier',
			last_name='User',
		)
		self.direction = Direction.objects.create(name='Direction Dossier', code='DSR-DIR')
		self.departement = Departement.objects.create(name='Departement Dossier', code='DSR-DEP', direction=self.direction)
		self.category = Categorie.objects.create(name='Categorie Dossier', code='DSR-CAT')
		self.root = Dossier.objects.create(name='Root', direction=self.direction, departement=self.departement, created_by=self.user)
		self.child = Dossier.objects.create(name='Child', parent=self.root, direction=self.direction, departement=self.departement, created_by=self.user)
		self.document = Document.objects.create(title='Dossier Document', category=self.category, direction=self.direction, departement=self.departement, dossier=self.root, created_by=self.user)

	def test_build_tree_returns_nested_structure(self):
		tree = build_tree(self.root)
		self.assertEqual(tree['name'], 'Root')
		self.assertEqual(tree['children'][0]['name'], 'Child')

	def test_get_content_returns_documents_and_children(self):
		content = get_content(self.root)
		self.assertEqual(content['dossiers'].count(), 1)
		self.assertEqual(content['documents'].count(), 1)
