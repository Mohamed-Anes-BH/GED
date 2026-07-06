from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkflowViewSet, WorkflowStepViewSet, WorkflowInstanceViewSet, StepExecutionViewSet

app_name = 'workflow'

router = DefaultRouter()
router.register(r'definitions', WorkflowViewSet, basename='workflow')
router.register(r'steps', WorkflowStepViewSet, basename='workflowstep')
router.register(r'instances', WorkflowInstanceViewSet, basename='workflowinstance')
router.register(r'executions', StepExecutionViewSet, basename='stepexecution')

urlpatterns = [
    path('workflows/', include(router.urls)),
]
