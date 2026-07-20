from django.db import transaction
from django.utils import timezone

from apps.common.utils import file_checksum
from apps.notifications.models import Notification
from apps.audit.models import AuditLog

from .models import Document, DocumentFile, DocumentVersion, Favorite


def soft_delete_document(document, user=None):
	document.is_deleted = True
	document.deleted_at = timezone.now()
	document.save(update_fields=['is_deleted', 'deleted_at', 'updated_at'])
	AuditLog.objects.create(
		user=user,
		action='delete',
		resource_type='document',
		resource_id=document.pk,
		resource_name=document.title,
	)
	return document


def restore_document(document, user=None):
	document.is_deleted = False
	document.deleted_at = None
	document.save(update_fields=['is_deleted', 'deleted_at', 'updated_at'])
	AuditLog.objects.create(
		user=user,
		action='update',
		resource_type='document',
		resource_id=document.pk,
		resource_name=document.title,
		details={'restored': True},
	)
	return document


def permanently_delete_document(document, user=None):
	document_id = document.pk
	title = document.title
	document.delete()
	AuditLog.objects.create(
		user=user,
		action='delete',
		resource_type='document',
		resource_id=document_id,
		resource_name=title,
		details={'permanent': True},
	)


@transaction.atomic
def add_document_file(document, uploaded_file, user=None, mime_type=None):
	checksum = file_checksum(uploaded_file)
	document_file = DocumentFile.objects.create(
		document=document,
		file=uploaded_file,
		filename=getattr(uploaded_file, 'name', 'document'),
		mime_type=mime_type or getattr(uploaded_file, 'content_type', 'application/octet-stream'),
		size=getattr(uploaded_file, 'size', 0),
		checksum=checksum,
	)
	AuditLog.objects.create(
		user=user,
		action='create',
		resource_type='document',
		resource_id=document.pk,
		resource_name=document.title,
		details={'file_id': document_file.pk, 'checksum': checksum},
	)
	return document_file


@transaction.atomic
def create_document_version(document, uploaded_file, user, changelog=''):
	current_max = document.versions.order_by('-version_number').values_list('version_number', flat=True).first() or 0
	version = DocumentVersion.objects.create(
		document=document,
		version_number=current_max + 1,
		file=uploaded_file,
		changelog=changelog,
		created_by=user,
	)
	AuditLog.objects.create(
		user=user,
		action='update',
		resource_type='document',
		resource_id=document.pk,
		resource_name=document.title,
		details={'version': version.version_number},
	)
	return version


def add_favorite(user, document):
	favorite, _ = Favorite.objects.get_or_create(user=user, document=document)
	AuditLog.objects.create(
		user=user,
		action='share',
		resource_type='document',
		resource_id=document.pk,
		resource_name=document.title,
		details={'favorite': True},
	)
	return favorite


def remove_favorite(user, document):
	Favorite.objects.filter(user=user, document=document).delete()


def notify_document_created(document):
	Notification.objects.create(
		user=document.created_by,
		title='Document créé',
		message=f'Le document "{document.title}" a été créé.',
		type='document',
		related_document=document,
	)


def empty_trash(user=None):
	"""Supprime définitivement tous les documents dans la corbeille."""
	qs = Document.objects.filter(is_deleted=True)
	count = qs.count()
	if user:
		AuditLog.objects.create(
			user=user,
			action='delete',
			resource_type='document',
			resource_name='Corbeille vidée',
			details={'count': count},
		)
	qs.delete()
	return count


def archive_document(document, user=None):
	"""Archive un document (is_archived=True, status='archive')."""
	document.is_archived = True
	document.status = 'archive'
	document.save(update_fields=['is_archived', 'status', 'updated_at'])
	AuditLog.objects.create(
		user=user,
		action='archive',
		resource_type='document',
		resource_id=document.pk,
		resource_name=document.title,
	)
	return document


def share_document(document, users, message='', actor=None):
	"""Envoie une notification de partage aux utilisateurs."""
	from apps.users.models import User as UserModel
	for uid in users:
		try:
			target = UserModel.objects.get(pk=uid)
			Notification.objects.create(
				user=target,
				title='Document partagé',
				message=f'{actor} vous a partagé le document "{document.title}". {message}',
				type='document',
				related_document=document,
			)
		except UserModel.DoesNotExist:
			pass
	AuditLog.objects.create(
		user=actor,
		action='share',
		resource_type='document',
		resource_id=document.pk,
		resource_name=document.title,
		details={'shared_with': users},
	)


@transaction.atomic
def restore_document_version(document, version, user):
	# 1. Copier le fichier de la version sur un nouveau DocumentFile
	from django.core.files.base import ContentFile
	import os

	ver_file = version.file
	filename = os.path.basename(ver_file.name)

	# Lire le contenu
	ver_file.seek(0)
	file_content = ver_file.read()

	document_file = DocumentFile.objects.create(
		document=document,
		file=ContentFile(file_content, name=filename),
		filename=filename,
		mime_type='application/octet-stream',
		size=len(file_content),
		checksum='restored',
	)

	# 2. Créer une nouvelle entrée de version pour archiver cette action
	current_max = document.versions.order_by('-version_number').values_list('version_number', flat=True).first() or 0
	new_version = DocumentVersion.objects.create(
		document=document,
		version_number=current_max + 1,
		file=document_file.file,
		changelog=f"Restauration de la version {version.version_number}",
		created_by=user,
	)

	AuditLog.objects.create(
		user=user,
		action='update',
		resource_type='document',
		resource_id=document.pk,
		resource_name=document.title,
		details={'version_restored': version.version_number, 'new_version': new_version.version_number},
	)
	return new_version

