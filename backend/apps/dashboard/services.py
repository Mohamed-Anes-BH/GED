from datetime import timedelta

from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone

from apps.audit.models import AuditLog
from apps.courriers.models import CourrierEntrant, CourrierSortant
from apps.documents.models import Document
from apps.dossiers.models import Dossier
from apps.notifications.models import Notification
from apps.workflow.models import StepExecution, WorkflowInstance


def get_global_kpis(user=None):
	now = timezone.now()
	thirty_days_ago = now - timedelta(days=30)

	from apps.users.models import User as UserModel

	documents_qs = Document.objects.filter(is_deleted=False)
	courriers_entrant_qs = CourrierEntrant.objects.all()
	courriers_sortant_qs = CourrierSortant.objects.all()
	workflows_qs = WorkflowInstance.objects.all()

	data = {
		'total_documents': documents_qs.count(),
		'documents_archives': documents_qs.filter(is_archived=True).count(),
		'documents_en_corbeille': Document.objects.filter(is_deleted=True).count(),
		'total_courriers': courriers_entrant_qs.count() + courriers_sortant_qs.count(),
		'courriers_entrants': courriers_entrant_qs.count(),
		'courriers_sortants': courriers_sortant_qs.count(),
		'workflows_en_cours': workflows_qs.filter(status='en_cours').count(),
		'workflows_valide': workflows_qs.filter(status='valide').count(),
		'taches_en_attente': StepExecution.objects.filter(status='en_attente').count(),
		'notifications_non_lues': Notification.objects.filter(is_read=False).count(),
		'dossiers_actifs': Dossier.objects.filter(is_archived=False, is_deleted=False).count(),
		'dossiers_supprimes': Dossier.objects.filter(is_deleted=True).count(),
		'utilisateurs_actifs': UserModel.objects.filter(is_active=True).count(),
		'nouveaux_documents_30_jours': documents_qs.filter(created_at__gte=thirty_days_ago).count(),
		'activite_30_jours': AuditLog.objects.filter(created_at__gte=thirty_days_ago).count(),
	}

	if user and user.is_authenticated and not user.is_superuser:
		data.update({
			'mes_documents': documents_qs.filter(created_by=user).count(),
			'mes_notifications_non_lues': Notification.objects.filter(user=user, is_read=False).count(),
			'mes_taches_en_attente': StepExecution.objects.filter(status='en_attente', user=user).count(),
		})

	return data


def get_recent_activity(user=None, limit=10):
	docs_qs = Document.objects.filter(is_deleted=False)
	if user and user.is_authenticated and not user.is_superuser:
		docs_qs = docs_qs.filter(created_by=user)

	documents = list(
		docs_qs.order_by('-created_at')[:limit].values('id', 'title', 'created_at')
	)
	for item in documents:
		item['type'] = 'document'

	logs = AuditLog.objects.all()
	if user and user.is_authenticated and not user.is_superuser:
		logs = logs.filter(user=user)

	audit_items = list(
		logs.order_by('-created_at')[:limit].values('id', 'action', 'resource_type', 'resource_name', 'created_at')
	)
	for item in audit_items:
		item['type'] = 'audit'

	merged = documents + audit_items
	merged.sort(key=lambda item: item['created_at'], reverse=True)
	return merged[:limit]


def get_recent_documents(user=None, limit=10):
	queryset = Document.objects.filter(is_deleted=False).order_by('-created_at')
	if user and user.is_authenticated and not user.is_superuser:
		queryset = queryset.filter(created_by=user)
	return queryset[:limit]


def get_storage_info():
	total_documents = Document.objects.filter(is_deleted=False).count()
	archived_documents = Document.objects.filter(is_archived=True, is_deleted=False).count()
	trashed_documents = Document.objects.filter(is_deleted=True).count()
	total_files = sum(document.files.count() for document in Document.objects.all())
	total_size = Document.objects.filter(is_deleted=False).aggregate(total=Sum('files__size')).get('total') or 0

	return {
		'total_documents': total_documents,
		'archived_documents': archived_documents,
		'trashed_documents': trashed_documents,
		'total_files': total_files,
		'used_bytes': total_size,
	}


def get_calendar_events(days=30):
	since = timezone.now() - timedelta(days=days)
	document_events = Document.objects.filter(created_at__gte=since).annotate(day=TruncDate('created_at')).values('day').annotate(count=Count('id')).order_by('day')
	courier_events = CourrierEntrant.objects.filter(created_at__gte=since).annotate(day=TruncDate('created_at')).values('day').annotate(count=Count('id')).order_by('day')
	return {
		'documents': list(document_events),
		'courriers': list(courier_events),
	}


def get_documents_stats():
	return list(
		Document.objects.filter(is_deleted=False)
		.values('status')
		.annotate(count=Count('id'))
		.order_by('status')
	)


def get_courriers_stats():
	entrants = list(
		CourrierEntrant.objects.values('statut').annotate(count=Count('id')).order_by('statut')
	)
	sortants = list(
		CourrierSortant.objects.values('statut').annotate(count=Count('id')).order_by('statut')
	)
	return {'entrants': entrants, 'sortants': sortants}


def get_users_stats():
	from apps.users.models import User

	return {
		'total_users': User.objects.count(),
		'active_users': User.objects.filter(is_active=True).count(),
		'staff_users': User.objects.filter(is_staff=True).count(),
		'by_role': list(User.objects.values('role__name').annotate(count=Count('id')).order_by('role__name')),
	}


def get_storage_stats():
	return get_storage_info()


def get_evolution_stats(days=30):
	since = timezone.now() - timedelta(days=days)
	return {
		'documents': list(
			Document.objects.filter(created_at__gte=since)
			.annotate(day=TruncDate('created_at'))
			.values('day')
			.annotate(count=Count('id'))
			.order_by('day')
		),
		'courriers_entrants': list(
			CourrierEntrant.objects.filter(created_at__gte=since)
			.annotate(day=TruncDate('created_at'))
			.values('day')
			.annotate(count=Count('id'))
			.order_by('day')
		),
		'courriers_sortants': list(
			CourrierSortant.objects.filter(created_at__gte=since)
			.annotate(day=TruncDate('created_at'))
			.values('day')
			.annotate(count=Count('id'))
			.order_by('day')
		),
		'logins': list(
			AuditLog.objects.filter(created_at__gte=since, action__icontains='LOGIN')
			.annotate(day=TruncDate('created_at'))
			.values('day')
			.annotate(count=Count('id'))
			.order_by('day')
		),
		'views': list(
			AuditLog.objects.filter(created_at__gte=since, action__icontains='VIEW')
			.annotate(day=TruncDate('created_at'))
			.values('day')
			.annotate(count=Count('id'))
			.order_by('day')
		),
	}


def get_category_stats():
	return list(
		Document.objects.filter(is_deleted=False)
		.values('category__name')
		.annotate(count=Count('id'))
		.order_by('category__name')
	)


def get_department_stats():
	return list(
		Document.objects.filter(is_deleted=False)
		.values('departement__name')
		.annotate(count=Count('id'))
		.order_by('departement__name')
	)


def export_stats_payload():
	return {
		'kpis': get_global_kpis(),
		'documents': get_documents_stats(),
		'courriers': get_courriers_stats(),
		'users': get_users_stats(),
		'storage': get_storage_stats(),
		'evolution': get_evolution_stats(),
	}
