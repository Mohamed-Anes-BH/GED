"""
=======================================================================
 AgrOdiv GED — Script de seed complet (5 instances par table)
=======================================================================
Usage:
    python seed_full_data.py

Fichiers réels utilisés depuis /home/anes/Documents/
=======================================================================
"""

import os
import sys
import django
from datetime import date, timedelta, datetime
from decimal import Decimal

# ── Django setup ────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# ── Imports après setup ─────────────────────────────────────────────
from django.core.files import File
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone

from apps.users.models import Role, Permission, User
from apps.organization.models import (
    Direction, Departement, Service, Categorie, Tag,
    Correspondant, Site, Batiment, Bureau, Armoire, Etagere, BoiteArchive
)
from apps.documents.models import (
    Document, DocumentFile, DocumentVersion, DocumentRelation,
    Favorite, ScanJob
)
from apps.dossiers.models import Dossier, DossierPermission
from apps.courriers.models import (
    PhysicalLocation, CourrierEntrant, CourrierSortant,
    PieceJointe, Diffusion, DiffusionDestinataire, CourrierHistorique
)
from apps.messagerie.models import Conversation, Message
from apps.notifications.models import Notification
from apps.ocr.models import OcrJob, OcrResult, OcrPage
from apps.workflow.models import Workflow, WorkflowStep, WorkflowInstance, StepExecution
from apps.audit.models import AuditLog

# ── Fichiers réels disponibles ──────────────────────────────────────
REAL_FILES = {
    'pdf1': '/home/anes/Documents/ged/backend/test_doc_5.pdf',  # PDF principal
    'pdf2': '/home/anes/Documents/ged/td2-cspp.pdf',           # 2ème PDF
    'cert1': '/home/anes/Documents/certifications/DAA0018679200774.pdf',
    'cert2': '/home/anes/Documents/certifications/AIEDA0014277034188.pdf',
    'cert3': '/home/anes/Documents/certifications/DSA0016939650258.pdf',
    'cert4': '/home/anes/Documents/certifications/DEA0012084461154.pdf',
    'txt1':  '/home/anes/Documents/ged/test_emails.txt',
}

def exists(path):
    return os.path.isfile(path)

def open_file(path):
    """Ouvre un fichier réel s'il existe, sinon retourne None."""
    if exists(path):
        return open(path, 'rb')
    return None

def get_or_create_safe(model, **kwargs):
    obj, created = model.objects.get_or_create(**kwargs)
    status = "créé" if created else "existant"
    print(f"  {model.__name__}: {obj} [{status}]")
    return obj, created


print("\n" + "="*60)
print("  AgrOdiv GED — Seed complet (5 instances/table)")
print("="*60 + "\n")

# ════════════════════════════════════════════════════════════════════
# 1. ROLES & PERMISSIONS
# ════════════════════════════════════════════════════════════════════
print("── 1. Rôles & Permissions ──────────────────────────────────")

roles_data = [
    {'name': 'Super Admin',      'description': 'Accès total au système', 'is_system': True},
    {'name': 'Directeur',        'description': 'Direction et validation de haut niveau', 'is_system': True},
    {'name': 'Manager',          'description': 'Gestion de département', 'is_system': False},
    {'name': 'Archiviste',       'description': 'Gestion des archives physiques', 'is_system': False},
    {'name': 'Employé Standard', 'description': 'Accès de base, lecture et création', 'is_system': False},
]
roles = []
for rd in roles_data:
    r, _ = get_or_create_safe(Role, name=rd['name'], defaults={
        'description': rd['description'], 'is_system': rd['is_system']
    })
    roles.append(r)

RESOURCES = ['documents', 'courriers', 'dossiers', 'workflow', 'rapports']
perms_config = [
    # (role_idx, resource, create, read, update, delete, download, share, approve)
    (0, 'documents',  True, True, True, True, True, True, True),
    (0, 'courriers',  True, True, True, True, True, True, True),
    (1, 'documents',  True, True, True, False, True, True, True),
    (1, 'workflow',   False, True, False, False, False, False, True),
    (2, 'documents',  True, True, True, False, True, True, False),
    (2, 'courriers',  True, True, False, False, True, False, False),
    (3, 'documents',  False, True, False, False, True, False, False),
    (3, 'dossiers',   True, True, True, False, True, False, False),
    (4, 'documents',  True, True, False, False, True, False, False),
    (4, 'courriers',  True, True, False, False, False, False, False),
]
for role_idx, res, cc, cr, cu, cd, cdl, cs, ca in perms_config:
    p, _ = Permission.objects.get_or_create(
        role=roles[role_idx], resource=res,
        defaults=dict(
            can_create=cc, can_read=cr, can_update=cu, can_delete=cd,
            can_download=cdl, can_share=cs, can_approve=ca
        )
    )
    print(f"  Permission: {roles[role_idx].name} / {res}")

# ════════════════════════════════════════════════════════════════════
# 2. UTILISATEURS
# ════════════════════════════════════════════════════════════════════
print("\n── 2. Utilisateurs ─────────────────────────────────────────")

users_data = [
    {'email': 'admin@agrodiv.dz',          'first_name': 'Super',    'last_name': 'Admin',    'role_idx': 0, 'is_staff': True, 'is_superuser': True},
    {'email': 'sofiane.hamidi@agrodiv.dz',  'first_name': 'Sofiane',  'last_name': 'Hamidi',   'role_idx': 0, 'is_staff': True, 'is_superuser': True},
    {'email': 'meryem.benali@agrodiv.dz',   'first_name': 'Meryem',   'last_name': 'Benali',   'role_idx': 2, 'is_staff': False, 'is_superuser': False},
    {'email': 'youssef.elamrani@agrodiv.dz','first_name': 'Youssef',  'last_name': 'El Amrani','role_idx': 2, 'is_staff': False, 'is_superuser': False},
    {'email': 'khadija.lahbabi@agrodiv.dz', 'first_name': 'Khadija',  'last_name': 'Lahbabi',  'role_idx': 4, 'is_staff': False, 'is_superuser': False},
    {'email': 'tariq.ziani@agrodiv.dz',     'first_name': 'Tariq',    'last_name': 'Ziani',    'role_idx': 4, 'is_staff': False, 'is_superuser': False},
]
users = []
for ud in users_data:
    if User.objects.filter(email=ud['email']).exists():
        u = User.objects.get(email=ud['email'])
        print(f"  User: {u} [existant]")
    else:
        u = User.objects.create_user(
            email=ud['email'],
            password='password123' if not ud.get('is_superuser') else 'admin123',
            first_name=ud['first_name'],
            last_name=ud['last_name'],
            role=roles[ud['role_idx']],
            is_staff=ud['is_staff'],
            is_superuser=ud['is_superuser'],
            is_active=True,
        )
        print(f"  User: {u} [créé]")
    users.append(u)

admin_user = users[0]

# ════════════════════════════════════════════════════════════════════
# 3. ORGANISATION (Direction → Département → Service)
# ════════════════════════════════════════════════════════════════════
print("\n── 3. Organisation ─────────────────────────────────────────")

dirs_data = [
    {'name': 'Direction Financière',           'code': 'DF'},
    {'name': 'Direction des Ressources Humaines','code': 'DRH'},
    {'name': 'Direction Technique',            'code': 'DT'},
    {'name': 'Direction Commerciale',          'code': 'DC'},
    {'name': 'Direction Générale',             'code': 'DG'},
]
directions = []
for dd in dirs_data:
    d, _ = get_or_create_safe(Direction, code=dd['code'], defaults={'name': dd['name']})
    directions.append(d)

depts_data = [
    {'name': 'Budget & Comptabilité',    'code': 'BC',  'dir_idx': 0},
    {'name': 'Trésorerie',               'code': 'TR',  'dir_idx': 0},
    {'name': 'Recrutement',              'code': 'REC', 'dir_idx': 1},
    {'name': 'Formation & Compétences',  'code': 'FC',  'dir_idx': 1},
    {'name': 'Infrastructure & Réseaux', 'code': 'IR',  'dir_idx': 2},
    {'name': 'Développement Logiciel',   'code': 'DEV', 'dir_idx': 2},
    {'name': 'Ventes & Partenariats',    'code': 'VP',  'dir_idx': 3},
    {'name': 'Marketing & Communication','code': 'MKT', 'dir_idx': 3},
    {'name': 'Secrétariat Général',      'code': 'SG',  'dir_idx': 4},
    {'name': 'Audit Interne',            'code': 'AI',  'dir_idx': 4},
]
departements = []
for dd in depts_data:
    d, _ = get_or_create_safe(Departement, code=dd['code'], defaults={
        'name': dd['name'], 'direction': directions[dd['dir_idx']]
    })
    departements.append(d)

services_data = [
    {'name': 'Paie et Charges',      'code': 'PC',  'dept_idx': 0},
    {'name': 'Contrôle de Gestion',  'code': 'CG',  'dept_idx': 0},
    {'name': 'Gestion de Trésorerie','code': 'GT',  'dept_idx': 1},
    {'name': 'Sourcing & Sélection', 'code': 'SS',  'dept_idx': 2},
    {'name': 'Systèmes & Réseaux',   'code': 'SR',  'dept_idx': 4},
    {'name': 'Backend & API',        'code': 'BA',  'dept_idx': 5},
    {'name': 'Ventes Directes',      'code': 'VD',  'dept_idx': 6},
    {'name': 'Publicité & Médias',   'code': 'PM',  'dept_idx': 7},
    {'name': 'Gestion Documentaire', 'code': 'GD',  'dept_idx': 8},
    {'name': 'Compliance & Risques', 'code': 'CR',  'dept_idx': 9},
]
services = []
for sd in services_data:
    s, _ = get_or_create_safe(Service, code=sd['code'], defaults={
        'name': sd['name'], 'departement': departements[sd['dept_idx']]
    })
    services.append(s)

# Assigner département aux utilisateurs
users[2].department = departements[0]; users[2].service = services[0]; users[2].save()
users[3].department = departements[2]; users[3].service = services[2]; users[3].save()
users[4].department = departements[4]; users[4].service = services[4]; users[4].save()
users[5].department = departements[5]; users[5].service = services[5]; users[5].save()

# ════════════════════════════════════════════════════════════════════
# 4. CATÉGORIES
# ════════════════════════════════════════════════════════════════════
print("\n── 4. Catégories ───────────────────────────────────────────")

cats_data = [
    {'name': 'Contrats',          'code': 'CONTRAT',         'color': '#FF6B00'},
    {'name': 'Factures',          'code': 'FACTURE',         'color': '#3B82F6'},
    {'name': 'Rapports',          'code': 'RAPPORT',         'color': '#10B981'},
    {'name': 'Courrier Entrant',  'code': 'COURRIER_ENTRANT', 'color': '#F59E0B'},
    {'name': 'Courrier Sortant',  'code': 'COURRIER_SORTANT', 'color': '#8B5CF6'},
    {'name': 'Procès-Verbaux',    'code': 'PV',              'color': '#EF4444'},
    {'name': 'Décisions',         'code': 'DECISION',        'color': '#6366F1'},
    {'name': 'Correspondances',   'code': 'CORRESPONDANCE',  'color': '#14B8A6'},
]
categories = []
for cd in cats_data:
    c, _ = get_or_create_safe(Categorie, code=cd['code'], defaults={
        'name': cd['name'], 'color': cd['color']
    })
    categories.append(c)

# ════════════════════════════════════════════════════════════════════
# 5. TAGS
# ════════════════════════════════════════════════════════════════════
print("\n── 5. Tags ─────────────────────────────────────────────────")

tags_data = [
    {'name': 'Urgent',    'color': 'rouge'},
    {'name': 'Confidentiel','color': 'violet'},
    {'name': 'Contrat',   'color': 'bleu'},
    {'name': 'Facture',   'color': 'orange'},
    {'name': 'Archive',   'color': 'vert'},
    {'name': 'RH',        'color': 'bleu'},
    {'name': 'Finance',   'color': 'vert'},
    {'name': 'Projet',    'color': 'orange'},
    {'name': 'Signature', 'color': 'violet'},
    {'name': 'Legal',     'color': 'rouge'},
]
tags = []
for td in tags_data:
    t, _ = get_or_create_safe(Tag, name=td['name'], defaults={'color': td['color'], 'created_by': admin_user})
    tags.append(t)

# ════════════════════════════════════════════════════════════════════
# 6. CORRESPONDANTS
# ════════════════════════════════════════════════════════════════════
print("\n── 6. Correspondants ───────────────────────────────────────")

corr_data = [
    {'name': 'Ministère de l\'Agriculture',  'organisme': 'MADR',                    'email': 'contact@madr.gov.dz',    'type': 'administration'},
    {'name': 'Société Naftal DZ',             'organisme': 'Naftal',                  'email': 'info@naftal.dz',         'type': 'entreprise'},
    {'name': 'Banque d\'Algérie',             'organisme': 'BA',                      'email': 'banque@bank-of-algeria.dz','type': 'administration'},
    {'name': 'Fournisseur IT Solutions',      'organisme': 'IT Solutions SPA',        'email': 'commercial@itspa.dz',    'type': 'fournisseur'},
    {'name': 'Client Céréales Export',        'organisme': 'Céréales Export SARL',    'email': 'export@cereales.dz',     'type': 'client'},
]
correspondants = []
for cd in corr_data:
    c, _ = get_or_create_safe(Correspondant, email=cd['email'], defaults={
        'name': cd['name'], 'organisme': cd['organisme'], 'type': cd['type']
    })
    correspondants.append(c)

# ════════════════════════════════════════════════════════════════════
# 7. SITES, BÂTIMENTS, BUREAUX, ARMOIRES, ÉTAGÈRES, BOÎTES
# ════════════════════════════════════════════════════════════════════
print("\n── 7. Infra physique (Sites→Boîtes) ────────────────────────")

sites_data = [
    {'name': 'Siège Social Alger',   'address': '12 Rue des Oliviers, Alger'},
    {'name': 'Agence Oran',          'address': '5 Boulevard de la Paix, Oran'},
    {'name': 'Annexe Constantine',   'address': '8 Rue Larbi Ben M\'Hidi, Constantine'},
    {'name': 'Dépôt Blida',          'address': 'Zone industrielle Blida'},
    {'name': 'Bureau Annaba',        'address': '15 Av. de l\'ALN, Annaba'},
]
sites = []
for sd in sites_data:
    s, _ = get_or_create_safe(Site, name=sd['name'], defaults={'address': sd['address']})
    sites.append(s)

batiments_data = [
    {'name': 'Bâtiment Principal',   'site_idx': 0},
    {'name': 'Bâtiment Annexe',      'site_idx': 0},
    {'name': 'Tour Oran',            'site_idx': 1},
    {'name': 'Immeuble Central',     'site_idx': 2},
    {'name': 'Dépôt Principal',      'site_idx': 3},
]
batiments = []
for bd in batiments_data:
    b, _ = get_or_create_safe(Batiment, name=bd['name'], defaults={'site': sites[bd['site_idx']]})
    batiments.append(b)

bureaux_data = [
    {'name': 'Bureau 101 - DG',         'batiment_idx': 0, 'floor': '1'},
    {'name': 'Bureau 201 - Finance',     'batiment_idx': 0, 'floor': '2'},
    {'name': 'Bureau 301 - RH',          'batiment_idx': 0, 'floor': '3'},
    {'name': 'Salle Archives Centrales', 'batiment_idx': 1, 'floor': 'RDC'},
    {'name': 'Bureau Oran DRH',          'batiment_idx': 2, 'floor': '1'},
]
bureaux = []
for bd in bureaux_data:
    b, _ = get_or_create_safe(Bureau, name=bd['name'], defaults={
        'batiment': batiments[bd['batiment_idx']], 'floor': bd['floor']
    })
    bureaux.append(b)

armoires_data = [
    {'name': 'Armoire Contrats', 'bureau_idx': 0},
    {'name': 'Armoire Finance',  'bureau_idx': 1},
    {'name': 'Armoire RH',       'bureau_idx': 2},
    {'name': 'Armoire Archives', 'bureau_idx': 3},
    {'name': 'Armoire Oran',     'bureau_idx': 4},
]
armoires = []
for ad in armoires_data:
    a, _ = get_or_create_safe(Armoire, name=ad['name'], defaults={'bureau': bureaux[ad['bureau_idx']]})
    armoires.append(a)

etageres_data = [
    {'name': 'Étagère A1', 'armoire_idx': 0, 'position': 1},
    {'name': 'Étagère B1', 'armoire_idx': 1, 'position': 1},
    {'name': 'Étagère C1', 'armoire_idx': 2, 'position': 1},
    {'name': 'Étagère D1', 'armoire_idx': 3, 'position': 1},
    {'name': 'Étagère E1', 'armoire_idx': 4, 'position': 1},
]
etageres = []
for ed in etageres_data:
    e, _ = get_or_create_safe(Etagere, name=ed['name'], defaults={
        'armoire': armoires[ed['armoire_idx']], 'position': ed['position']
    })
    etageres.append(e)

boites_data = [
    {'code': 'BOX-2026-0001', 'label': 'Contrats 2024',   'etagere_idx': 0},
    {'code': 'BOX-2026-0002', 'label': 'Factures T1 2025','etagere_idx': 1},
    {'code': 'BOX-2026-0003', 'label': 'Dossiers RH 2025','etagere_idx': 2},
    {'code': 'BOX-2026-0004', 'label': 'Archives 2023',   'etagere_idx': 3},
    {'code': 'BOX-2026-0005', 'label': 'Courriers Oran',  'etagere_idx': 4},
]
boites = []
for bd in boites_data:
    b, _ = get_or_create_safe(BoiteArchive, code=bd['code'], defaults={
        'label': bd['label'], 'etagere': etageres[bd['etagere_idx']], 'status': 'disponible'
    })
    boites.append(b)

# ════════════════════════════════════════════════════════════════════
# 8. DOSSIERS
# ════════════════════════════════════════════════════════════════════
print("\n── 8. Dossiers ─────────────────────────────────────────────")

dossiers_data = [
    {'name': 'Contrats Fournisseurs 2025', 'dossier_type': 'standard', 'dir_idx': 0, 'dept_idx': 0, 'description': 'Tous les contrats fournisseurs de l\'exercice 2025'},
    {'name': 'Projet Digital GED',          'dossier_type': 'projet',   'dir_idx': 2, 'dept_idx': 5, 'description': 'Documents du projet de digitalisation GED AgrOdiv'},
    {'name': 'Dossiers RH Q1 2025',         'dossier_type': 'standard', 'dir_idx': 1, 'dept_idx': 2, 'description': 'Recrutements et formations du premier trimestre'},
    {'name': 'Archives Financières 2024',   'dossier_type': 'archive',  'dir_idx': 0, 'dept_idx': 1, 'description': 'Documents financiers archivés de l\'exercice 2024'},
    {'name': 'Rapports de Direction 2026',  'dossier_type': 'standard', 'dir_idx': 4, 'dept_idx': 8, 'description': 'Rapports mensuels et trimestriels de la direction générale'},
]
dossiers = []
for dd in dossiers_data:
    d, _ = get_or_create_safe(Dossier, name=dd['name'], defaults={
        'description': dd['description'],
        'dossier_type': dd['dossier_type'],
        'direction': directions[dd['dir_idx']],
        'departement': departements[dd['dept_idx']],
        'responsable': admin_user,
        'created_by': admin_user,
        'status': 'actif',
    })
    dossiers.append(d)

# Sous-dossier (parent)
sub, _ = get_or_create_safe(Dossier, name='Sous-dossier Contrats IT', defaults={
    'dossier_type': 'standard',
    'parent': dossiers[0],
    'direction': directions[2],
    'created_by': admin_user,
})

# DossierPermissions (5 instances)
print("\n── 8b. DossierPermissions ──────────────────────────────────")
perm_configs = [
    (0, 0, True, True, True, True),
    (0, 2, True, True, False, False),
    (1, 1, True, True, True, False),
    (2, 3, False, True, False, False),
    (3, 4, False, True, True, False),
]
for d_idx, u_idx_offset, cr, cw, cs, cd in perm_configs:
    u_idx = min(u_idx_offset + 1, len(users)-1)
    DossierPermission.objects.get_or_create(
        dossier=dossiers[d_idx], user=users[u_idx],
        defaults={'can_read': cr, 'can_write': cw, 'can_share': cs, 'can_delete': cd}
    )
    print(f"  DossierPermission: {dossiers[d_idx].name} ↔ {users[u_idx].email}")

# ════════════════════════════════════════════════════════════════════
# 9. DOCUMENTS
# ════════════════════════════════════════════════════════════════════
print("\n── 9. Documents ────────────────────────────────────────────")

docs_data = [
    {
        'title': 'Contrat de prestation IT 2025',
        'description': 'Contrat de prestation de services informatiques pour la mise en place du système GED.',
        'category': categories[0],  # Contrats
        'status': 'actif',
        'direction': directions[2],
        'departement': departements[5],
        'service': services[5],
        'dossier': dossiers[1],
        'tags_list': [tags[2], tags[0]],  # Contrat, Urgent
        'file_key': 'cert1',
    },
    {
        'title': 'Facture Fournisseur IT Solutions – Janvier 2025',
        'description': 'Facture mensuelle IT Solutions SPA pour hébergement et maintenance.',
        'category': categories[1],  # Factures
        'status': 'actif',
        'direction': directions[0],
        'departement': departements[0],
        'service': services[0],
        'dossier': dossiers[0],
        'tags_list': [tags[3], tags[6]],  # Facture, Finance
        'file_key': 'cert2',
    },
    {
        'title': 'Rapport Annuel RH 2024',
        'description': 'Rapport complet des activités RH pour l\'exercice 2024. Bilan recrutements, formations.',
        'category': categories[2],  # Rapports
        'status': 'actif',
        'direction': directions[1],
        'departement': departements[2],
        'service': services[3],
        'dossier': dossiers[2],
        'tags_list': [tags[5], tags[7]],  # RH, Projet
        'file_key': 'cert3',
    },
    {
        'title': 'Procès-Verbal Réunion DG – Mars 2026',
        'description': 'Procès-verbal de la réunion mensuelle de la Direction Générale. Ordre du jour: budget, RH, IT.',
        'category': categories[5],  # PV
        'status': 'actif',
        'direction': directions[4],
        'departement': departements[8],
        'service': services[8],
        'dossier': dossiers[4],
        'tags_list': [tags[1], tags[8]],  # Confidentiel, Signature
        'file_key': 'cert4',
    },
    {
        'title': 'Cahier des charges – Système de Gestion Documentaire',
        'description': 'Document de spécification technique et fonctionnelle pour le développement de la GED AgrOdiv.',
        'category': categories[6],  # Décisions
        'status': 'actif',
        'direction': directions[2],
        'departement': departements[5],
        'service': services[5],
        'dossier': dossiers[1],
        'tags_list': [tags[7], tags[9]],  # Projet, Legal
        'file_key': 'pdf2',
    },
]
documents = []
for dd in docs_data:
    if Document.objects.filter(title=dd['title']).exists():
        doc = Document.objects.get(title=dd['title'])
        print(f"  Document: {doc.title[:50]} [existant]")
    else:
        doc = Document.objects.create(
            title=dd['title'],
            description=dd['description'],
            category=dd['category'],
            status=dd['status'],
            direction=dd['direction'],
            departement=dd['departement'],
            service=dd['service'],
            dossier=dd['dossier'],
            created_by=admin_user,
        )
        doc.tags.set(dd['tags_list'])
        print(f"  Document: {doc.title[:50]} [créé]")

        # Attacher un fichier réel
        file_path = REAL_FILES.get(dd['file_key'])
        if file_path and exists(file_path):
            with open(file_path, 'rb') as f:
                filename = os.path.basename(file_path)
                df = DocumentFile.objects.create(
                    document=doc,
                    file=File(f, name=filename),
                    filename=filename,
                    mime_type='application/pdf',
                    size=os.path.getsize(file_path),
                    checksum=f'sha256-{doc.id:08x}',
                )
            print(f"    → Fichier attaché: {filename}")
    documents.append(doc)

# DocumentRelations (5 instances)
print("\n── 9b. DocumentRelations ───────────────────────────────────")
relation_pairs = [
    (0, 1, 'reference'),
    (0, 2, 'annexe'),
    (1, 0, 'reponse'),
    (2, 3, 'annexe'),
    (4, 0, 'version_de'),
]
for src_i, tgt_i, rtype in relation_pairs:
    from apps.documents.models import DocumentRelation
    rel, created = DocumentRelation.objects.get_or_create(
        source=documents[src_i], target=documents[tgt_i], relation_type=rtype
    )
    print(f"  Relation: {documents[src_i].title[:30]} --{rtype}--> {documents[tgt_i].title[:30]}")

# DocumentVersions (5 instanecs)
print("\n── 9c. DocumentVersions ────────────────────────────────────")
file_for_version = REAL_FILES['pdf1']
if exists(file_for_version):
    for i, doc in enumerate(documents[:5]):
        if not doc.versions.exists():
            with open(file_for_version, 'rb') as f:
                ver = DocumentVersion.objects.create(
                    document=doc,
                    version_number=1,
                    file=File(f, name=f'v1_{os.path.basename(file_for_version)}'),
                    changelog='Version initiale créée par seed',
                    created_by=admin_user,
                )
            print(f"  Version v1: {doc.title[:40]}")

# Favorites (5 instances)
print("\n── 9d. Favoris ─────────────────────────────────────────────")
fav_configs = [(0,0), (1,1), (2,2), (3,3), (4,4)]
for d_idx, u_idx in fav_configs:
    Favorite.objects.get_or_create(
        document=documents[d_idx], user=users[u_idx]
    )
    print(f"  Favori: {users[u_idx].email} ♥ {documents[d_idx].title[:40]}")

# ════════════════════════════════════════════════════════════════════
# 10. EMPLACEMENTS PHYSIQUES
# ════════════════════════════════════════════════════════════════════
print("\n── 10. Emplacements physiques ──────────────────────────────")
phys_data = [
    {'building': 'A', 'office': 'archives', 'treasury': 'principale', 'shelf': 'A'},
    {'building': 'B', 'office': '101',      'treasury': 'secondaire',  'shelf': 'B'},
    {'building': 'A', 'office': '201',      'treasury': 'principale',  'shelf': 'C'},
    {'building': 'C', 'office': '102',      'treasury': 'secondaire',  'shelf': 'A'},
    {'building': 'B', 'office': '202',      'treasury': 'principale',  'shelf': 'B'},
]
phys_locs = []
for pd in phys_data:
    pl = PhysicalLocation.objects.create(**pd)
    phys_locs.append(pl)
    print(f"  PhysicalLocation: {pl}")

# ════════════════════════════════════════════════════════════════════
# 11. COURRIERS ENTRANTS
# ════════════════════════════════════════════════════════════════════
print("\n── 11. Courriers Entrants ──────────────────────────────────")

ce_data = [
    {
        'numero': 'CE-2026-001',
        'objet': 'Demande de renouvellement de contrat de maintenance informatique',
        'expediteur': 'IT Solutions SPA',
        'date_reception': date(2026, 7, 1),
        'statut': 'en_traitement',
        'type_courrier': 'contrat',
        'priorite': 'haute',
        'notes': 'Contrat expirant le 31/08/2026. Traitement urgent demandé.',
        'direction': directions[2],
        'departement': departements[5],
    },
    {
        'numero': 'CE-2026-002',
        'objet': 'Facture prestations conseil Q2 2026 – Banque d\'Algérie',
        'expediteur': 'Banque d\'Algérie',
        'date_reception': date(2026, 7, 5),
        'statut': 'nouveau',
        'type_courrier': 'facture',
        'priorite': 'normale',
        'notes': 'Facture pour prestation conseil financier Q2 2026.',
        'direction': directions[0],
        'departement': departements[0],
    },
    {
        'numero': 'CE-2026-003',
        'objet': 'Rapport d\'inspection sanitaire installations agricoles – MADR',
        'expediteur': 'Ministère de l\'Agriculture (MADR)',
        'date_reception': date(2026, 7, 8),
        'statut': 'traite',
        'type_courrier': 'rapport',
        'priorite': 'urgente',
        'notes': 'Rapport suite inspection du 01/07/2026. Conformité des installations.',
        'direction': directions[4],
        'departement': departements[8],
    },
    {
        'numero': 'CE-2026-004',
        'objet': 'Demande de collaboration commerciale – Céréales Export SARL',
        'expediteur': 'Céréales Export SARL',
        'date_reception': date(2026, 7, 10),
        'statut': 'en_traitement',
        'type_courrier': 'demande',
        'priorite': 'normale',
        'notes': 'Proposition de partenariat pour export de céréales vers l\'Europe.',
        'direction': directions[3],
        'departement': departements[6],
    },
    {
        'numero': 'CE-2026-005',
        'objet': 'Notification de mise à jour réglementaire – Direction des Impôts',
        'expediteur': 'Direction Générale des Impôts',
        'date_reception': date(2026, 7, 12),
        'statut': 'nouveau',
        'type_courrier': 'lettre',
        'priorite': 'haute',
        'notes': 'Nouvelle réglementation fiscale applicable au 01/01/2027.',
        'direction': directions[0],
        'departement': departements[0],
    },
]
courriers_entrants = []
for i, cd in enumerate(ce_data):
    if CourrierEntrant.objects.filter(numero=cd['numero']).exists():
        ce = CourrierEntrant.objects.get(numero=cd['numero'])
        print(f"  CourrierEntrant: {ce.numero} [existant]")
    else:
        ce = CourrierEntrant.objects.create(
            numero=cd['numero'],
            objet=cd['objet'],
            expediteur=cd['expediteur'],
            date_reception=cd['date_reception'],
            statut=cd['statut'],
            type_courrier=cd['type_courrier'],
            priorite=cd['priorite'],
            notes=cd['notes'],
            direction=cd['direction'],
            departement=cd['departement'],
            created_by=admin_user,
            physical_location=phys_locs[i] if i < len(phys_locs) else None,
        )
        print(f"  CourrierEntrant: {ce.numero} [créé]")

        # Attacher une pièce jointe réelle
        file_path = list(REAL_FILES.values())[i % len(REAL_FILES)]
        if exists(file_path):
            ct = ContentType.objects.get_for_model(CourrierEntrant)
            with open(file_path, 'rb') as f:
                fname = os.path.basename(file_path)
                pj = PieceJointe.objects.create(
                    content_type=ct,
                    object_id=ce.id,
                    file=File(f, name=fname),
                    name=fname,
                    size=os.path.getsize(file_path),
                    mime_type='application/pdf',
                )
            print(f"    → PièceJointe: {fname}")
    courriers_entrants.append(ce)

# ════════════════════════════════════════════════════════════════════
# 12. COURRIERS SORTANTS
# ════════════════════════════════════════════════════════════════════
print("\n── 12. Courriers Sortants ──────────────────────────────────")

cs_data = [
    {
        'numero': 'CS-2026-001',
        'objet': 'Réponse à la demande de renouvellement contrat IT Solutions',
        'destinataire': 'IT Solutions SPA',
        'organisme': 'IT Solutions',
        'statut': 'envoye',
        'type_courrier': 'reponse',
        'priorite': 'haute',
        'canal_envoi': 'email',
        'date_envoi': date(2026, 7, 3),
        'departement': departements[5],
        'service': services[5],
    },
    {
        'numero': 'CS-2026-002',
        'objet': 'Bon de commande équipements réseau – IT Solutions SPA',
        'destinataire': 'IT Solutions SPA',
        'organisme': 'IT Solutions',
        'statut': 'en_validation',
        'type_courrier': 'contrat',
        'priorite': 'normale',
        'canal_envoi': 'courrier_postal',
        'date_envoi': None,
        'departement': departements[4],
        'service': services[4],
    },
    {
        'numero': 'CS-2026-003',
        'objet': 'Rapport de conformité suite inspection MADR',
        'destinataire': 'MADR – Direction de l\'Inspection',
        'organisme': 'MADR',
        'statut': 'envoye',
        'type_courrier': 'rapport',
        'priorite': 'urgente',
        'canal_envoi': 'email',
        'date_envoi': date(2026, 7, 10),
        'departement': departements[8],
        'service': services[8],
    },
    {
        'numero': 'CS-2026-004',
        'objet': 'Accord de principe pour partenariat commercial – Céréales Export SARL',
        'destinataire': 'Direction Commerciale – Céréales Export SARL',
        'organisme': 'Céréales Export SARL',
        'statut': 'brouillon',
        'type_courrier': 'lettre',
        'priorite': 'normale',
        'canal_envoi': 'email',
        'date_envoi': None,
        'departement': departements[6],
        'service': services[6],
    },
    {
        'numero': 'CS-2026-005',
        'objet': 'Déclaration fiscale annuelle 2025 – Direction des Impôts',
        'destinataire': 'Direction Générale des Impôts',
        'organisme': 'DGI',
        'statut': 'a_envoyer',
        'type_courrier': 'rapport',
        'priorite': 'urgente',
        'canal_envoi': 'main_propre',
        'date_envoi': None,
        'departement': departements[0],
        'service': services[0],
    },
]
courriers_sortants = []
for i, cd in enumerate(cs_data):
    if CourrierSortant.objects.filter(numero=cd['numero']).exists():
        cs = CourrierSortant.objects.get(numero=cd['numero'])
        print(f"  CourrierSortant: {cs.numero} [existant]")
    else:
        cs = CourrierSortant.objects.create(
            numero=cd['numero'],
            objet=cd['objet'],
            destinataire=cd['destinataire'],
            organisme=cd['organisme'],
            statut=cd['statut'],
            type_courrier=cd['type_courrier'],
            priorite=cd['priorite'],
            canal_envoi=cd['canal_envoi'],
            date_envoi=cd['date_envoi'],
            departement=cd['departement'],
            service=cd['service'],
            created_by=admin_user,
            auteur=users[1],
        )
        print(f"  CourrierSortant: {cs.numero} [créé]")

        # Pièce jointe
        file_path = list(REAL_FILES.values())[(i+1) % len(REAL_FILES)]
        if exists(file_path):
            ct = ContentType.objects.get_for_model(CourrierSortant)
            with open(file_path, 'rb') as f:
                fname = os.path.basename(file_path)
                PieceJointe.objects.create(
                    content_type=ct,
                    object_id=cs.id,
                    file=File(f, name=fname),
                    name=fname,
                    size=os.path.getsize(file_path),
                    mime_type='application/pdf',
                )
            print(f"    → PièceJointe: {fname}")
    courriers_sortants.append(cs)

# ════════════════════════════════════════════════════════════════════
# 13. DIFFUSIONS
# ════════════════════════════════════════════════════════════════════
print("\n── 13. Diffusions & Destinataires ──────────────────────────")

diff_data = [
    {'courrier_type': 'entrant', 'courrier': courriers_entrants[0], 'note': 'Diffusion urgente pour traitement.'},
    {'courrier_type': 'entrant', 'courrier': courriers_entrants[2], 'note': 'Rapport MADR à lire immédiatement.'},
    {'courrier_type': 'sortant', 'courrier': courriers_sortants[0], 'note': 'Réponse IT Solutions envoyée.'},
    {'courrier_type': 'sortant', 'courrier': courriers_sortants[2], 'note': 'Rapport conformité MADR en diffusion.'},
    {'courrier_type': 'entrant', 'courrier': courriers_entrants[4], 'note': 'Notification fiscale – lire avant le 30/07.'},
]
diffusions = []
for dd in diff_data:
    d, created = Diffusion.objects.get_or_create(
        courrier_type=dd['courrier_type'],
        courrier_id=dd['courrier'].id,
        defaults={
            'note': dd['note'],
            'created_by': admin_user,
            'statut': 'en_cours',
        }
    )
    diffusions.append(d)
    print(f"  Diffusion: {d} [{'créé' if created else 'existant'}]")

# DiffusionDestinataires (5 instances)
print("\n── 13b. DiffusionDestinataires ─────────────────────────────")
for i, diff in enumerate(diffusions):
    target_user = users[(i+1) % len(users)]
    DiffusionDestinataire.objects.get_or_create(
        diffusion=diff, user=target_user,
        defaults={'lu': i % 2 == 0}
    )
    print(f"  DiffDestinaire: {diff} → {target_user.email}")

# CourrierHistoriques (5 instances)
print("\n── 13c. CourrierHistoriques ────────────────────────────────")
ce_ct = ContentType.objects.get_for_model(CourrierEntrant)
hist_data = [
    (courriers_entrants[0], 'creation',   admin_user,  {'ref': 'CE-2026-001'}),
    (courriers_entrants[0], 'lecture',    users[2],    {'page': 1}),
    (courriers_entrants[1], 'creation',   admin_user,  {'ref': 'CE-2026-002'}),
    (courriers_entrants[2], 'traitement', users[3],    {'action': 'validé'}),
    (courriers_entrants[3], 'transfert',  users[1],    {'to': 'DRH'}),
]
for ce_obj, action, user_obj, details in hist_data:
    h = CourrierHistorique.objects.create(
        content_type=ce_ct,
        object_id=ce_obj.id,
        action=action,
        user=user_obj,
        details=details,
    )
    print(f"  Historique: {h}")

# ════════════════════════════════════════════════════════════════════
# 14. MESSAGERIE
# ════════════════════════════════════════════════════════════════════
print("\n── 14. Messagerie ──────────────────────────────────────────")

conv_data = [
    {'subject': 'Discussion: Contrat IT Solutions 2025',      'participants': [users[0], users[2]]},
    {'subject': 'Revue rapport RH Q1 2025',                   'participants': [users[1], users[2], users[3]]},
    {'subject': 'Questions sur la facture Banque d\'Algérie',  'participants': [users[0], users[3]]},
    {'subject': 'Coordination projet GED',                    'participants': [users[0], users[1], users[4]]},
    {'subject': 'Préparation rapport DG Mars 2026',           'participants': [users[1], users[5]]},
]
convs = []
for cd in conv_data:
    c, created = Conversation.objects.get_or_create(subject=cd['subject'])
    if created:
        c.participants.set(cd['participants'])
        print(f"  Conversation: {c.subject[:50]} [créé]")
    else:
        print(f"  Conversation: {c.subject[:50]} [existant]")
    convs.append(c)

# Messages (5x5 = 25 messages)
messages_configs = [
    (0, users[0], "Bonjour, j'ai reçu la demande de renouvellement IT Solutions. Pouvez-vous vérifier les termes?"),
    (0, users[2], "J'ai consulté les termes. Le contrat précédent expire le 31/08. Je recommande un renouvellement pour 2 ans."),
    (1, users[1], "Le rapport RH est complet. 47 recrutements, 23 formations en Q1. Taux de satisfaction: 87%."),
    (1, users[3], "Excellent bilan! Pour Q2, nous prévoyons 15 recrutements supplémentaires dans la DT."),
    (2, users[0], "La facture Banque d'Algérie de 450 000 DZD est en attente de validation. Délai: 15 jours."),
    (2, users[3], "Validé côté RH. La DF peut procéder au paiement après vérification des services rendus."),
    (3, users[0], "Le projet GED avance bien. Sprint 3 terminé. 85% des fonctionnalités implementées."),
    (3, users[4], "Tests utilisateurs la semaine prochaine. Besoin de 10 testeurs volontaires."),
    (4, users[1], "Le PV de la réunion DG est prêt. Envoi à tous les participants avant fin de semaine."),
    (4, users[5], "Reçu. Je prépare les slides pour la présentation du 20/07."),
]
for conv_idx, sender, content in messages_configs:
    msg, created = Message.objects.get_or_create(
        conversation=convs[conv_idx], sender=sender, content=content[:50],
        defaults={'content': content}
    )
    if created:
        print(f"  Message: [{convs[conv_idx].subject[:25]}] {sender.first_name}: {content[:40]}...")

# ════════════════════════════════════════════════════════════════════
# 15. NOTIFICATIONS
# ════════════════════════════════════════════════════════════════════
print("\n── 15. Notifications ───────────────────────────────────────")

notif_data = [
    {'user': users[1], 'title': 'Nouveau courrier entrant', 'message': 'Un courrier CE-2026-001 vous a été assigné. Priorité: Haute.', 'type': 'courrier', 'doc': None},
    {'user': users[2], 'title': 'Document à valider',       'message': 'Le document "Contrat IT 2025" attend votre validation dans le workflow.', 'type': 'workflow', 'doc': documents[0]},
    {'user': users[3], 'title': 'Diffusion reçue',          'message': 'Vous avez reçu une diffusion: Rapport MADR – À lire immédiatement.', 'type': 'document', 'doc': None},
    {'user': users[4], 'title': 'Document partagé',         'message': 'Sofiane Hamidi vous a partagé "Rapport Annuel RH 2024".', 'type': 'document', 'doc': documents[2]},
    {'user': users[0], 'title': 'Système: Sauvegarde',      'message': 'Sauvegarde automatique réussie. 125 documents archivés.', 'type': 'system', 'doc': None},
]
for nd in notif_data:
    n, created = Notification.objects.get_or_create(
        user=nd['user'], title=nd['title'],
        defaults={
            'message': nd['message'],
            'type': nd['type'],
            'related_document': nd['doc'],
        }
    )
    print(f"  Notification: {n.user.email} ← {n.title} [{'créé' if created else 'existant'}]")

# ════════════════════════════════════════════════════════════════════
# 16. WORKFLOWS
# ════════════════════════════════════════════════════════════════════
print("\n── 16. Workflows ───────────────────────────────────────────")

wf_data = [
    {'name': 'Validation Contrats',       'workflow_type': 'hierarchique', 'document_type': 'CONTRAT',  'status': 'actif',  'dept_idx': 5, 'visibility': 'global'},
    {'name': 'Approbation Factures',      'workflow_type': 'simple',       'document_type': 'FACTURE',  'status': 'actif',  'dept_idx': 0, 'visibility': 'departement'},
    {'name': 'Revue Rapports RH',         'workflow_type': 'simple',       'document_type': 'RAPPORT',  'status': 'actif',  'dept_idx': 2, 'visibility': 'departement'},
    {'name': 'Validation PV Direction',   'workflow_type': 'hierarchique', 'document_type': 'PV',       'status': 'actif',  'dept_idx': 8, 'visibility': 'global'},
    {'name': 'Workflow Standard General', 'workflow_type': 'simple',       'document_type': None,       'status': 'brouillon', 'dept_idx': 8, 'visibility': 'global'},
]
workflows = []
for wd in wf_data:
    wf, created = Workflow.objects.get_or_create(
        name=wd['name'],
        defaults={
            'workflow_type': wd['workflow_type'],
            'document_type': wd['document_type'],
            'status': wd['status'],
            'departement': departements[wd['dept_idx']],
            'responsable': admin_user,
            'created_by': admin_user,
            'visibility': wd['visibility'],
        }
    )
    workflows.append(wf)
    print(f"  Workflow: {wf.name} [{'créé' if created else 'existant'}]")

# WorkflowSteps (5 instances, pour le premier workflow)
print("\n── 16b. WorkflowSteps ──────────────────────────────────────")
steps_data = [
    {'wf_idx': 0, 'name': 'Vérification technique', 'order': 1, 'user': users[4], 'delay': 2, 'required': True},
    {'wf_idx': 0, 'name': 'Validation Manager IT',  'order': 2, 'user': users[2], 'delay': 3, 'required': True},
    {'wf_idx': 0, 'name': 'Approbation Direction',  'order': 3, 'user': users[1], 'delay': 5, 'required': True},
    {'wf_idx': 1, 'name': 'Contrôle Comptable',     'order': 1, 'user': users[2], 'delay': 2, 'required': True},
    {'wf_idx': 2, 'name': 'Revue RH Manager',       'order': 1, 'user': users[3], 'delay': 3, 'required': True},
]
steps = []
for sd in steps_data:
    step, created = WorkflowStep.objects.get_or_create(
        workflow=workflows[sd['wf_idx']], order=sd['order'],
        defaults={
            'name': sd['name'],
            'responsable': sd['user'],
            'delay_days': sd['delay'],
            'is_required': sd['required'],
            'notify_internal': True,
        }
    )
    steps.append(step)
    print(f"  Step: {step.workflow.name} → Étape {step.order}: {step.name} [{'créé' if created else 'existant'}]")

# WorkflowInstances (5 instances)
print("\n── 16c. WorkflowInstances ──────────────────────────────────")
wf_instances = []
for i, (doc, wf) in enumerate(zip(documents[:5], workflows[:5])):
    inst, created = WorkflowInstance.objects.get_or_create(
        workflow=wf, document=doc,
        defaults={'current_step': 1, 'status': 'en_cours'}
    )
    wf_instances.append(inst)
    print(f"  WorkflowInstance: [{wf.name}] doc: {doc.title[:30]} [{'créé' if created else 'existant'}]")

# StepExecutions (5 instances)
print("\n── 16d. StepExecutions ─────────────────────────────────────")
for i, (inst, step) in enumerate(zip(wf_instances[:3], steps[:3])):
    se, created = StepExecution.objects.get_or_create(
        instance=inst, step=step, user=step.responsable,
        defaults={
            'status': 'valide' if i < 2 else 'en_attente',
            'action_taken': 'valider' if i < 2 else None,
            'comment': f'Validation étape {i+1} – Aucun commentaire particulier.' if i < 2 else None,
        }
    )
    print(f"  StepExecution: {step.name} par {step.responsable.email} → {se.status} [{'créé' if created else 'existant'}]")

# ════════════════════════════════════════════════════════════════════
# 17. OCR JOBS, RESULTS, PAGES
# ════════════════════════════════════════════════════════════════════
print("\n── 17. OCR ─────────────────────────────────────────────────")

ocr_data = [
    {'doc_idx': 0, 'status': 'termine',   'progress': 100, 'lang': 'fra'},
    {'doc_idx': 1, 'status': 'termine',   'progress': 100, 'lang': 'fra'},
    {'doc_idx': 2, 'status': 'en_cours',  'progress': 65,  'lang': 'fra'},
    {'doc_idx': 3, 'status': 'en_attente','progress': 0,   'lang': 'ara'},
    {'doc_idx': 4, 'status': 'erreur',    'progress': 0,   'lang': 'fra', 'error': 'Fichier corrompu'},
]
ocr_jobs = []
for od in ocr_data:
    doc = documents[od['doc_idx']]
    if not doc.ocr_jobs.exists():
        job = OcrJob.objects.create(
            document=doc,
            source_file=f'documents/seed_doc_{doc.id}.pdf',
            language=od['lang'],
            status=od['status'],
            progress=od['progress'],
            error_message=od.get('error'),
            created_by=admin_user,
        )
        ocr_jobs.append(job)
        print(f"  OcrJob: doc={doc.title[:30]} status={od['status']} [créé]")

        # OcrResult pour les jobs terminés
        if od['status'] == 'termine':
            sample_texts = [
                "CONTRAT DE PRESTATION DE SERVICES\n\nEntre les soussignés :\nAgrOdiv – Etablissement public à caractère industriel et commercial\net IT Solutions SPA – Fournisseur de services informatiques\n\nIl est convenu ce qui suit...",
                "FACTURE N° FAC-2025-0147\n\nDate: 31/01/2025\nClient: AgrOdiv\nFournisseur: IT Solutions SPA\n\nDésignation: Hébergement serveur + maintenance\nMontant HT: 350 000 DZD\nTVA 19%: 66 500 DZD\nMontant TTC: 416 500 DZD",
            ]
            result = OcrResult.objects.create(
                job=job,
                full_text=sample_texts[od['doc_idx'] % len(sample_texts)],
                confidence=round(87.50 + od['doc_idx'] * 2.3, 2),
                words_count=250 + od['doc_idx'] * 75,
                paragraphs=5 + od['doc_idx'],
                processing_time=2.45,
            )
            print(f"    → OcrResult: {result}")

            # OcrPages (2 par job terminé)
            for page_num in range(1, 3):
                OcrPage.objects.create(
                    job=job,
                    page_number=page_num,
                    text=f"Page {page_num} – extrait du document {doc.title[:30]}...",
                    confidence=round(85.00 + page_num * 2, 2),
                )
            print(f"    → 2 OcrPages créées")
    else:
        job = doc.ocr_jobs.first()
        ocr_jobs.append(job)
        print(f"  OcrJob: doc={doc.title[:30]} [existant]")

# ════════════════════════════════════════════════════════════════════
# 18. SCANJOBS
# ════════════════════════════════════════════════════════════════════
print("\n── 18. ScanJobs ────────────────────────────────────────────")
scan_data = [
    {'doc_idx': 0, 'scanner': 'HP ScanJet Pro 3600',  'dpi': 300, 'color': 'Couleur',     'format': 'PDF'},
    {'doc_idx': 1, 'scanner': 'Canon DR-C225',          'dpi': 200, 'color': 'Niveaux gris','format': 'PDF'},
    {'doc_idx': 2, 'scanner': 'Fujitsu fi-7160',        'dpi': 600, 'color': 'Couleur',     'format': 'TIFF'},
    {'doc_idx': 3, 'scanner': 'Brother ADS-2800W',      'dpi': 300, 'color': 'Couleur',     'format': 'PDF'},
    {'doc_idx': 4, 'scanner': 'Epson DS-530',           'dpi': 300, 'color': 'Niveaux gris','format': 'PDF'},
]
for sd in scan_data:
    doc = documents[sd['doc_idx']]
    if not hasattr(doc, 'scan_job'):
        try:
            sj = ScanJob.objects.create(
                document=doc,
                scanner_name=sd['scanner'],
                dpi=sd['dpi'],
                color_mode=sd['color'],
                paper_size='A4',
                format=sd['format'],
                scan_status='completed',
                ocr_status='pending',
                created_by=admin_user,
            )
            print(f"  ScanJob: {sj.scanner_name} → {doc.title[:35]} [créé]")
        except Exception as e:
            print(f"  ScanJob: [déjà existant pour ce document] {e}")

# ════════════════════════════════════════════════════════════════════
# 19. AUDIT LOGS
# ════════════════════════════════════════════════════════════════════
print("\n── 19. AuditLogs ───────────────────────────────────────────")
audit_data = [
    {'user': admin_user, 'action': 'create', 'rtype': 'document', 'rid': documents[0].id, 'rname': documents[0].title, 'details': {'source': 'seed'}},
    {'user': users[1],   'action': 'update', 'rtype': 'document', 'rid': documents[1].id, 'rname': documents[1].title, 'details': {'field': 'status', 'from': 'brouillon', 'to': 'actif'}},
    {'user': users[2],   'action': 'create', 'rtype': 'courrier', 'rid': courriers_entrants[0].id, 'rname': courriers_entrants[0].objet, 'details': {}},
    {'user': users[3],   'action': 'share',  'rtype': 'document', 'rid': documents[2].id, 'rname': documents[2].title, 'details': {'shared_with': [users[4].id]}},
    {'user': admin_user, 'action': 'delete', 'rtype': 'document', 'rid': 999, 'rname': 'Document test supprimé', 'details': {'permanent': False}},
]
for ad in audit_data:
    log = AuditLog.objects.create(
        user=ad['user'],
        action=ad['action'],
        resource_type=ad['rtype'],
        resource_id=ad.get('rid'),
        resource_name=ad['rname'],
        details=ad['details'],
    )
    print(f"  AuditLog: {log.user.email} {log.action} {log.resource_type}#{log.resource_id}")

# ════════════════════════════════════════════════════════════════════
# RÉSUMÉ FINAL
# ════════════════════════════════════════════════════════════════════
print("\n" + "="*60)
print("  ✅ SEED TERMINÉ — Résumé des données créées")
print("="*60)

from django.apps import apps
tables_to_check = [
    ('users', 'Role'), ('users', 'Permission'), ('users', 'User'),
    ('organization', 'Direction'), ('organization', 'Departement'), ('organization', 'Service'),
    ('organization', 'Categorie'), ('organization', 'Tag'), ('organization', 'Correspondant'),
    ('organization', 'Site'), ('organization', 'Batiment'), ('organization', 'Bureau'),
    ('organization', 'Armoire'), ('organization', 'Etagere'), ('organization', 'BoiteArchive'),
    ('dossiers', 'Dossier'), ('dossiers', 'DossierPermission'),
    ('documents', 'Document'), ('documents', 'DocumentFile'), ('documents', 'DocumentVersion'),
    ('documents', 'DocumentRelation'), ('documents', 'Favorite'), ('documents', 'ScanJob'),
    ('courriers', 'CourrierEntrant'), ('courriers', 'CourrierSortant'), ('courriers', 'PieceJointe'),
    ('courriers', 'Diffusion'), ('courriers', 'DiffusionDestinataire'), ('courriers', 'CourrierHistorique'),
    ('messagerie', 'Conversation'), ('messagerie', 'Message'),
    ('notifications', 'Notification'),
    ('ocr', 'OcrJob'), ('ocr', 'OcrResult'), ('ocr', 'OcrPage'),
    ('workflow', 'Workflow'), ('workflow', 'WorkflowStep'), ('workflow', 'WorkflowInstance'), ('workflow', 'StepExecution'),
    ('audit', 'AuditLog'),
]
print(f"\n{'Table':<35} {'Count':>8}")
print(f"{'─'*35} {'─'*8}")
for app_label, model_name in tables_to_check:
    try:
        model = apps.get_model(app_label, model_name)
        count = model.objects.count()
        print(f"  {app_label}.{model_name:<30} {count:>5}")
    except Exception as e:
        print(f"  {app_label}.{model_name:<30} ERROR: {e}")

print("\n  🚀 Base de données prête pour les tests !")
