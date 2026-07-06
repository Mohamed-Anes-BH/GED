from rest_framework import serializers
from .models import Workflow, WorkflowStep, WorkflowInstance, StepExecution

class WorkflowStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowStep
        fields = '__all__'

class WorkflowSerializer(serializers.ModelSerializer):
    steps = WorkflowStepSerializer(many=True, read_only=True)

    class Meta:
        model = Workflow
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class StepExecutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StepExecution
        fields = '__all__'

class WorkflowInstanceSerializer(serializers.ModelSerializer):
    executions = StepExecutionSerializer(many=True, read_only=True)

    class Meta:
        model = WorkflowInstance
        fields = '__all__'
