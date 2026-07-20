from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.utils import timezone
from datetime import date

from apps.audit.models import AuditLog
from apps.notifications.models import Notification

from .models import CourrierEntrant, CourrierSortant, CourrierHistorique, PieceJointe, Diffusion


def _create_history(courrier, action, user, details=None):
    CourrierHistorique.objects.create(
        content_type=ContentType.objects.get_for_model(courrier.__class__),
        object_id=courrier.pk,
        action=action,
        user=user or getattr(courrier, 'created_by', None),
        details=details or {},
    )


def _log_courrier(courrier, user, action, details=None):
    AuditLog.objects.create(
        user=user or getattr(courrier, 'created_by', None),
        action=action,
        resource_type='courrier',
        resource_id=courrier.pk,
        resource_name=courrier.objet,
        details=details or {},
    )


# ── Numérotation automatique ────────────────────────────────────────────
def generate_numero_entrant():
    year = date.today().year
    last = CourrierEntrant.objects.filter(numero__startswith=f'CE-{year}-').count()
    return f'CE-{year}-{str(last + 1).zfill(4)}'


def generate_numero_sortant():
    year = date.today().year
    last = CourrierSortant.objects.filter(numero__startswith=f'CS-{year}-').count()
    return f'CS-{year}-{str(last + 1).zfill(4)}'


# ── Entrants ────────────────────────────────────────────────────────────
def mark_entrant_read(courrier, user=None):
    if courrier.statut == 'nouveau':
        courrier.statut = 'lu'
        courrier.save(update_fields=['statut'])
        _create_history(courrier, 'read', user, {'status': 'lu'})
        _log_courrier(courrier, user, 'read')
    return courrier


# Alias for views.py compatibility
mark_courrier_traite = lambda courrier, user=None: _mark_courrier_traite(courrier, user)


def _mark_courrier_traite(courrier, user=None):
    courrier.statut = 'traite'
    courrier.save(update_fields=['statut'])
    _create_history(courrier, 'update', user, {'status': 'traite'})
    _log_courrier(courrier, user, 'update', {'status': 'traite'})
    return courrier


def transfer_courrier(courrier, to_user_id, notes='', actor=None):
    from apps.users.models import User
    try:
        assigned_user = User.objects.get(pk=to_user_id)
        courrier.assigned_to = assigned_user
        courrier.statut = 'en_cours'
        if notes:
            courrier.notes = (courrier.notes or '') + f'\n[Transfert] {notes}'
        courrier.save(update_fields=['assigned_to', 'statut', 'notes'])
        _create_history(courrier, 'transfert', actor, {'assigned_to': to_user_id, 'notes': notes})
        _log_courrier(courrier, actor, 'update', {'transferred_to': to_user_id})
        Notification.objects.create(
            user=assigned_user,
            title='Courrier transféré',
            message=f'Le courrier "{courrier.objet}" vous a été transféré.',
            type='courrier',
        )
    except User.DoesNotExist:
        pass
    return courrier


def assign_courrier(courrier, user_id, actor=None):
    from apps.users.models import User
    try:
        assigned_user = User.objects.get(pk=user_id)
        courrier.assigned_to = assigned_user
        courrier.save(update_fields=['assigned_to'])
        _create_history(courrier, 'update', actor, {'assigned_to': user_id})
        _log_courrier(courrier, actor, 'update', {'assigned_to': user_id})
        Notification.objects.create(
            user=assigned_user,
            title='Courrier assigné',
            message=f'Le courrier "{courrier.objet}" vous a été assigné.',
            type='courrier',
        )
    except User.DoesNotExist:
        pass
    return courrier


# ── Sortants ────────────────────────────────────────────────────────────
def send_courrier_sortant(courrier, user=None):
    courrier.statut = 'envoye'
    courrier.date_envoi = timezone.localdate()
    courrier.save(update_fields=['statut', 'date_envoi'])
    _create_history(courrier, 'update', user, {'status': 'envoye'})
    _log_courrier(courrier, user, 'update', {'status': 'envoye'})
    return courrier


def sign_courrier_sortant(courrier, user=None):
    courrier.statut = 'signe'
    courrier.save(update_fields=['statut'])
    _create_history(courrier, 'validate', user, {'status': 'signe'})
    _log_courrier(courrier, user, 'validate', {'status': 'signe'})
    return courrier


def archive_courrier_sortant(courrier, user=None):
    courrier.statut = 'archive'
    courrier.save(update_fields=['statut'])
    _create_history(courrier, 'archive', user, {'status': 'archive'})
    _log_courrier(courrier, user, 'archive', {'status': 'archive'})
    return courrier


# ── Pièces jointes ──────────────────────────────────────────────────────
@transaction.atomic
def add_attachment(content_object, uploaded_file, user=None):
    name = getattr(uploaded_file, 'name', 'attachment')
    attachment = PieceJointe.objects.create(
        content_object=content_object,
        file=uploaded_file,
        name=name,
        size=getattr(uploaded_file, 'size', 0),
        mime_type=getattr(uploaded_file, 'content_type', 'application/octet-stream'),
    )
    _create_history(content_object, 'update', user, {'attachment': name})
    return attachment


def delete_attachment(attachment_id, user=None):
    PieceJointe.objects.filter(pk=attachment_id).delete()


# ── Diffusion ───────────────────────────────────────────────────────────
def create_diffusion(content_object, destinataires, user=None):
    diffusion = Diffusion.objects.create(
        content_object=content_object,
        created_by=user,
        date_diffusion=timezone.now(),
    )
    diffusion.destinataires.set(destinataires)
    _create_history(content_object, 'share', user, {'destinataires': [u.pk for u in destinataires]})
    _log_courrier(content_object, user, 'share', {'destinataires': [u.pk for u in destinataires]})
    return diffusion


# ── KPIs ────────────────────────────────────────────────────────────────
def get_courriers_kpis():
    from django.db.models import Count
    entrants = CourrierEntrant.objects.aggregate(
        total=Count('id'),
        non_lus=Count('id', filter=__import__('django.db.models', fromlist=['Q']).Q(statut='nouveau')),
        en_cours=Count('id', filter=__import__('django.db.models', fromlist=['Q']).Q(statut='en_cours')),
        traites=Count('id', filter=__import__('django.db.models', fromlist=['Q']).Q(statut='traite')),
    )
    sortants = CourrierSortant.objects.aggregate(
        total=Count('id'),
        brouillons=Count('id', filter=__import__('django.db.models', fromlist=['Q']).Q(statut='brouillon')),
        envoyes=Count('id', filter=__import__('django.db.models', fromlist=['Q']).Q(statut='envoye')),
    )
    return {'entrants': entrants, 'sortants': sortants}
