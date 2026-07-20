from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.audit.models import AuditLog
from apps.documents.models import Document
from apps.notifications.models import Notification
from apps.organization.models import Categorie, Direction, Departement
from apps.workflow.models import Workflow, WorkflowStep, WorkflowInstance, StepExecution
from apps.workflow.services import create_instance, validate_execution, reject_execution, advance_instance


User = get_user_model()


class WorkflowServiceTests(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			email='workflow@example.com',
			password='password123',
			first_name='Workflow',
			last_name='User',
		)
		self.direction = Direction.objects.create(name='Direction Workflow', code='WF-DIR')
		self.departement = Departement.objects.create(name='Departement Workflow', code='WF-DEP', direction=self.direction)
		self.category = Categorie.objects.create(name='Categorie Workflow', code='WF-CAT')
		self.document = Document.objects.create(
			title='Workflow Document',
			category=self.category,
			direction=self.direction,
			departement=self.departement,
			created_by=self.user,
		)
		self.workflow = Workflow.objects.create(
			name='Workflow Test',
			departement=self.departement,
			created_by=self.user,
		)
		self.step1 = WorkflowStep.objects.create(workflow=self.workflow, name='Step 1', order=1, responsable=self.user)
		self.step2 = WorkflowStep.objects.create(workflow=self.workflow, name='Step 2', order=2, responsable=self.user)

	def test_create_validate_and_advance_instance(self):
		instance = create_instance(self.workflow, self.document, user=self.user)
		self.assertEqual(instance.status, 'en_cours')
		self.assertEqual(instance.executions.count(), 1)

		execution = instance.executions.first()
		validate_execution(execution, user=self.user, comment='ok')
		execution.refresh_from_db()
		self.assertEqual(execution.status, 'valide')

		advance_instance(instance, user=self.user)
		instance.refresh_from_db()
		self.assertEqual(instance.current_step, 2)

	def test_reject_execution_sets_status(self):
		instance = create_instance(self.workflow, self.document, user=self.user)
		execution = instance.executions.first()
		reject_execution(execution, user=self.user, comment='not ok')
		execution.refresh_from_db()
		self.assertEqual(execution.status, 'rejete')
		self.assertTrue(AuditLog.objects.filter(action='reject', resource_type='workflow').exists())
