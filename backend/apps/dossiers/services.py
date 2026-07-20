from apps.audit.models import AuditLog

from .models import Dossier


def build_tree(dossier):
	return {
		'id': dossier.id,
		'name': dossier.name,
		'description': dossier.description,
		'is_archived': dossier.is_archived,
		'children': [build_tree(child) for child in dossier.sub_dossiers.order_by('name')],
	}


def get_content(dossier):
	from apps.documents.models import Document
	from apps.documents.serializers import DocumentSerializer

	subfolders = Dossier.objects.filter(parent=dossier).order_by('name')
	documents = Document.objects.filter(dossier=dossier, is_deleted=False).order_by('-updated_at')
	return {
		'dossiers': subfolders,
		'documents': documents,
		'document_serializer': DocumentSerializer,
	}


def log_dossier_action(dossier, user, action, details=None):
	AuditLog.objects.create(
		user=user,
		action=action,
		resource_type='dossier',
		resource_id=dossier.pk,
		resource_name=dossier.name,
		details=details or {},
	)
