import django_filters

from .models import Workflow, WorkflowInstance, StepExecution


class WorkflowFilter(django_filters.FilterSet):
	class Meta:
		model = Workflow
		fields = {
			'status': ['exact'],
			'visibility': ['exact'],
			'departement': ['exact'],
		}


class WorkflowInstanceFilter(django_filters.FilterSet):
	class Meta:
		model = WorkflowInstance
		fields = {
			'workflow': ['exact'],
			'document': ['exact'],
			'status': ['exact'],
		}


class StepExecutionFilter(django_filters.FilterSet):
	class Meta:
		model = StepExecution
		fields = {
			'instance': ['exact'],
			'step': ['exact'],
			'user': ['exact'],
			'status': ['exact'],
		}
