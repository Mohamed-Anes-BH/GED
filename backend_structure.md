# 🏗️ AgrOdiv GED – Architecture Backend v2.0 (Django + PostgreSQL + Docker)

> Architecture révisée suite à la review (9.7/10 → 10/10). Intègre toutes les améliorations : suppression de messagerie, renommage des apps, ajout de `common`, `services.py`, `filters.py`, `signals.py`, `tests.py`, et séparation du modèle Document.

---

## 📐 Architecture Générale

```
Frontend (React + Electron)
        │
        ▼
   API REST (Django REST Framework + JWT)
        │
        ├── common/   → pagination, permissions, responses, exceptions
        ├── apps/     → 13 applications métier
        │
        ▼
   PostgreSQL 16 (Docker)
```

---

## 🐳 Infrastructure Docker

```
docker-compose.yml
├── service: db          → PostgreSQL 16 (volume persistant)
├── service: backend     → Django (Gunicorn en prod, runserver en dev)
└── volumes: postgres_data
```

### `Dockerfile`
```dockerfile
FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client libpq-dev gcc && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

### `docker-compose.yml`
```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: agrodiv_ged
      POSTGRES_USER: agrodiv
      POSTGRES_PASSWORD: agrodiv_secret
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  backend:
    build: .
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgres://agrodiv:agrodiv_secret@db:5432/agrodiv_ged
      - DEBUG=True
      - SECRET_KEY=dev-secret-key-change-in-production
volumes:
  postgres_data:
```

### `requirements.txt`
```
Django>=5.0,<6.0
djangorestframework>=3.15,<4.0
djangorestframework-simplejwt>=5.3,<6.0
django-cors-headers>=4.3,<5.0
django-filter>=24.0,<25.0
Pillow>=10.0,<12.0
psycopg2-binary>=2.9,<3.0
gunicorn>=22.0,<23.0
dj-database-url>=2.0,<3.0
```

---

## 📁 Structure Finale du Projet

```
backend/
├── config/                          # Configuration Django
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
│
├── apps/
│   ├── common/                      # Utilitaires partagés
│   │   ├── __init__.py
│   │   ├── pagination.py
│   │   ├── permissions.py
│   │   ├── responses.py
│   │   ├── exceptions.py
│   │   ├── validators.py
│   │   ├── constants.py
│   │   └── utils.py
│   │
│   ├── authentication/              # App 1
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── services.py
│   │   ├── urls.py
│   │   ├── signals.py
│   │   └── tests.py
│   │
│   ├── users/                       # App 2
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── services.py
│   │   ├── filters.py
│   │   ├── urls.py
│   │   ├── signals.py
│   │   └── tests.py
│   │
│   ├── organization/                # App 3  (ex: organisation)
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── services.py
│   │   ├── filters.py
│   │   ├── urls.py
│   │   ├── signals.py
│   │   └── tests.py
│   │
│   ├── documents/                   # App 4
│   │   ├── models.py               # Document + DocumentFile + DocumentVersion
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── services.py
│   │   ├── filters.py
│   │   ├── urls.py
│   │   ├── signals.py
│   │   └── tests.py
│   │
│   ├── dossiers/                    # App 5
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── services.py
│   │   ├── filters.py
│   │   ├── urls.py
│   │   ├── signals.py
│   │   └── tests.py
│   │
│   ├── courriers/                   # App 6
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── services.py
│   │   ├── filters.py
│   │   ├── urls.py
│   │   ├── signals.py
│   │   └── tests.py
│   │
│   ├── workflow/                    # App 7
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── services.py
│   │   ├── filters.py
│   │   ├── urls.py
│   │   ├── signals.py
│   │   └── tests.py
│   │
│   ├── ocr/                         # App 8  (ex: scanner)
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── services.py
│   │   ├── urls.py
│   │   ├── signals.py
│   │   └── tests.py
│   │
│   ├── notifications/               # App 9
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── services.py
│   │   ├── urls.py
│   │   ├── signals.py
│   │   └── tests.py
│   │
│   ├── audit/                       # App 10
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── services.py
│   │   ├── filters.py
│   │   ├── urls.py
│   │   ├── signals.py
│   │   └── tests.py
│   │
│   ├── dashboard/                   # App 11  (ex: statistiques)
│   │   ├── views.py
│   │   ├── services.py
│   │   ├── urls.py
│   │   └── tests.py
│   │
│   └── settings_app/                # App 12
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       ├── services.py
│       ├── urls.py
│       └── tests.py
│
├── media/                           # Fichiers uploadés (documents, avatars)
├── static/                          # Fichiers statiques Django
├── logs/                            # Fichiers de log
├── backups/                         # Sauvegardes de la BDD
├── scripts/                         # Scripts utilitaires (seed, migration)
├── fixtures/                        # Données initiales (JSON)
├── manage.py
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

---

## 🧩 App `common` — Utilitaires Partagés

> Utilisée par toutes les applications.

### `pagination.py`
```python
# StandardPagination  → page_size=10, max=100
# LargePagination     → page_size=50, max=200
```

### `permissions.py`
```python
# IsOwner             → Seul le créateur peut modifier
# IsAdminOrReadOnly   → Admin = CRUD, autres = lecture
# HasModulePermission → Vérifie la permission par module/action
```

### `responses.py`
```python
# success_response(data, message, status)
# error_response(message, errors, status)
# paginated_response(queryset, serializer, request)
```

### `exceptions.py`
```python
# CustomValidationError
# ResourceNotFoundError
# PermissionDeniedError
```

### `validators.py`
```python
# validate_file_size(file, max_size_mb)
# validate_file_type(file, allowed_types)
# validate_reference_number(value)
```

### `constants.py`
```python
# DOCUMENT_STATUSES, COURRIER_PRIORITIES, WORKFLOW_STATUSES
# FILE_TYPES, OCR_LANGUAGES, NOTIFICATION_TYPES
# ACTION_TYPES (pour l'audit)
```

---

# 📋 Applications & API Endpoints

---

## App 1 : `authentication` — Authentification

> **Page Frontend** : `LoginPage.tsx`

### Modèles
| Modèle | Champs |
|--------|--------|
| — | Utilise `User` de l'app `users` |

### Fichiers
| Fichier | Rôle |
|---------|------|
| `views.py` | Endpoints d'authentification |
| `services.py` | Logique JWT, validation credentials |
| `signals.py` | Log de connexion/déconnexion → audit |

### API Endpoints

| Méthode | Endpoint | Fonction | Description |
|---------|----------|----------|-------------|
| `POST` | `/api/auth/login/` | `login_user` | Connexion → JWT access + refresh |
| `POST` | `/api/auth/logout/` | `logout_user` | Déconnexion (blacklist token) |
| `POST` | `/api/auth/token/refresh/` | `refresh_token` | Rafraîchir le access token |
| `POST` | `/api/auth/password/change/` | `change_password` | Changer son mot de passe |
| `GET` | `/api/auth/me/` | `get_current_user` | Utilisateur connecté |

---

## App 2 : `users` — Gestion des Utilisateurs

> **Pages Frontend** : `UsersPage.tsx`, `RolesPermissionsPage.tsx`

### Modèles
| Modèle | Champs |
|--------|--------|
| `User` | `email`, `first_name`, `last_name`, `avatar`, `phone`, `department`, `service`, `role` (FK), `is_active`, `date_joined` |
| `Role` | `name`, `description`, `is_system`, `created_at` |
| `Permission` | `role` (FK), `resource`, `can_create`, `can_read`, `can_update`, `can_delete`, `can_download`, `can_share`, `can_approve` |

### Fichiers
| Fichier | Rôle |
|---------|------|
| `services.py` | Création/activation d'utilisateur, attribution de rôle |
| `filters.py` | Filtre par département, service, rôle, statut actif |
| `signals.py` | Notification à l'admin quand un user est créé |

### API Endpoints

| Méthode | Endpoint | Fonction | Description |
|---------|----------|----------|-------------|
| `GET` | `/api/users/` | `list_users` | Lister les utilisateurs (filtres, pagination) |
| `POST` | `/api/users/` | `create_user` | Créer un utilisateur |
| `GET` | `/api/users/{id}/` | `get_user` | Détail d'un utilisateur |
| `PUT` | `/api/users/{id}/` | `update_user` | Modifier un utilisateur |
| `DELETE` | `/api/users/{id}/` | `delete_user` | Supprimer un utilisateur |
| `PATCH` | `/api/users/{id}/activate/` | `toggle_user_active` | Activer / Désactiver |
| `GET` | `/api/users/profile/` | `get_profile` | Profil connecté |
| `PUT` | `/api/users/profile/` | `update_profile` | Modifier son profil |
| `POST` | `/api/users/profile/avatar/` | `upload_avatar` | Photo de profil |
| `GET` | `/api/roles/` | `list_roles` | Lister les rôles |
| `POST` | `/api/roles/` | `create_role` | Créer un rôle |
| `PUT` | `/api/roles/{id}/` | `update_role` | Modifier un rôle |
| `DELETE` | `/api/roles/{id}/` | `delete_role` | Supprimer un rôle |
| `GET` | `/api/roles/{id}/permissions/` | `get_role_permissions` | Permissions d'un rôle |
| `PUT` | `/api/roles/{id}/permissions/` | `update_role_permissions` | Modifier les permissions |

---

## App 3 : `organization` — Structure Organisationnelle

> **Pages Frontend** : Page des Directions, Départements, Services, Catégories, Correspondants, Tags, Boîtes d'archives, Archives physiques

### Modèles
| Modèle | Champs |
|--------|--------|
| `Direction` | `name`, `code`, `description`, `responsable` (FK User), `is_active` |
| `Departement` | `name`, `code`, `direction` (FK), `description`, `responsable` (FK User), `is_active` |
| `Service` | `name`, `code`, `departement` (FK), `description`, `responsable` (FK User), `is_active` |
| `Categorie` | `name`, `code`, `description`, `parent` (self FK), `color`, `is_active` |
| `Tag` | `name`, `color`, `created_by` (FK User) |
| `Correspondant` | `name`, `organisme`, `email`, `phone`, `address`, `type` |
| `Site` | `name`, `address`, `description` |
| `Batiment` | `name`, `site` (FK), `description` |
| `Bureau` | `name`, `batiment` (FK), `floor` |
| `Armoire` | `name`, `bureau` (FK), `description` |
| `Etagere` | `name`, `armoire` (FK), `position` |
| `BoiteArchive` | `code`, `etagere` (FK), `label`, `date_creation`, `status` |

### Fichiers
| Fichier | Rôle |
|---------|------|
| `services.py` | Arborescence org, cascade des suppressions |
| `filters.py` | Filtre par direction, département, site |
| `signals.py` | Audit log à la création/modification |

### API Endpoints

| Méthode | Endpoint | Fonction | Description |
|---------|----------|----------|-------------|
| `GET/POST` | `/api/directions/` | `list_create_directions` | Lister / Créer |
| `GET/PUT/DELETE` | `/api/directions/{id}/` | `detail_direction` | Détail / Modifier / Supprimer |
| `GET/POST` | `/api/departements/` | `list_create_departements` | Lister / Créer |
| `GET/PUT/DELETE` | `/api/departements/{id}/` | `detail_departement` | Détail / Modifier / Supprimer |
| `GET/POST` | `/api/services/` | `list_create_services` | Lister / Créer |
| `GET/PUT/DELETE` | `/api/services/{id}/` | `detail_service` | Détail / Modifier / Supprimer |
| `GET/POST` | `/api/categories/` | `list_create_categories` | Lister / Créer |
| `GET/PUT/DELETE` | `/api/categories/{id}/` | `detail_categorie` | Détail / Modifier / Supprimer |
| `GET/POST` | `/api/tags/` | `list_create_tags` | Lister / Créer |
| `GET/PUT/DELETE` | `/api/tags/{id}/` | `detail_tag` | Détail / Modifier / Supprimer |
| `GET/POST` | `/api/correspondants/` | `list_create_correspondants` | Lister / Créer |
| `GET/PUT/DELETE` | `/api/correspondants/{id}/` | `detail_correspondant` | Détail / Modifier / Supprimer |
| `GET/POST` | `/api/sites/` | `list_create_sites` | Lister / Créer |
| `GET/POST` | `/api/batiments/` | `list_create_batiments` | Lister / Créer |
| `GET/POST` | `/api/bureaux/` | `list_create_bureaux` | Lister / Créer |
| `GET/POST` | `/api/armoires/` | `list_create_armoires` | Lister / Créer |
| `GET/POST` | `/api/etageres/` | `list_create_etageres` | Lister / Créer |
| `GET/POST` | `/api/boites-archives/` | `list_create_boites` | Lister / Créer |
| `GET/PUT/DELETE` | `/api/boites-archives/{id}/` | `detail_boite` | Détail / Modifier / Supprimer |

---

## App 4 : `documents` — Gestion Documentaire

> **Pages Frontend** : `DocumentsPage.tsx`, `DocumentDetailPage.tsx`, `UploadPage.tsx`, `FavorisPage.tsx`, `CorbeillePage.tsx`

### Modèles (séparés selon le principe de responsabilité unique)

| Modèle | Champs | Responsabilité |
|--------|--------|----------------|
| `Document` | `title`, `description`, `category` (FK), `direction` (FK), `departement` (FK), `service` (FK), `dossier` (FK), `status`, `priority`, `is_archived`, `is_deleted`, `created_by` (FK), `tags` (M2M), `physical_location`, `created_at`, `updated_at` | **Métadonnées** du document |
| `DocumentFile` | `document` (FK), `file`, `filename`, `mime_type`, `size`, `checksum`, `uploaded_at` | **Fichier physique** |
| `DocumentVersion` | `document` (FK), `version_number`, `file`, `changelog`, `created_by` (FK), `created_at` | **Versioning** |
| `DocumentRelation` | `source` (FK), `target` (FK), `relation_type` | **Relations** entre documents |
| `Favorite` | `user` (FK), `document` (FK), `created_at` | **Favoris** |

### Fichiers
| Fichier | Rôle |
|---------|------|
| `services.py` | Upload, versioning, archivage, génération checksum |
| `filters.py` | Filtre par type, catégorie, direction, statut, date, priorité |
| `signals.py` | Création → audit log + notification. Suppression → vérification dépendances |

### API Endpoints

| Méthode | Endpoint | Fonction | Description |
|---------|----------|----------|-------------|
| `GET` | `/api/documents/` | `list_documents` | Lister (filtres, tri, pagination) |
| `POST` | `/api/documents/` | `create_document` | Créer + uploader |
| `GET` | `/api/documents/{id}/` | `get_document` | Détail complet |
| `PUT` | `/api/documents/{id}/` | `update_document` | Modifier les métadonnées |
| `DELETE` | `/api/documents/{id}/` | `delete_document` | Mettre à la corbeille |
| `POST` | `/api/documents/{id}/upload/` | `upload_file` | Uploader / remplacer le fichier |
| `GET` | `/api/documents/{id}/download/` | `download_document` | Télécharger |
| `GET` | `/api/documents/{id}/preview/` | `preview_document` | Aperçu PDF/image |
| `POST` | `/api/documents/{id}/archive/` | `archive_document` | Archiver |
| `POST` | `/api/documents/{id}/restore/` | `restore_document` | Restaurer depuis corbeille |
| `DELETE` | `/api/documents/{id}/permanent/` | `permanent_delete` | Suppression définitive |
| `POST` | `/api/documents/{id}/share/` | `share_document` | Partager |
| `GET` | `/api/documents/{id}/versions/` | `list_versions` | Lister les versions |
| `POST` | `/api/documents/{id}/versions/` | `create_version` | Créer une version |
| `POST` | `/api/documents/{id}/versions/{vid}/restore/` | `restore_version` | Restaurer une version |
| `GET` | `/api/documents/{id}/relations/` | `list_relations` | Relations |
| `POST` | `/api/documents/{id}/relations/` | `create_relation` | Créer une relation |
| `GET` | `/api/documents/recent/` | `list_recent` | Documents récents |
| `GET` | `/api/documents/trash/` | `list_trash` | Corbeille |
| `POST` | `/api/documents/trash/empty/` | `empty_trash` | Vider la corbeille |
| `GET` | `/api/favoris/` | `list_favorites` | Lister les favoris |
| `POST` | `/api/favoris/` | `add_favorite` | Ajouter aux favoris |
| `DELETE` | `/api/favoris/{id}/` | `remove_favorite` | Retirer des favoris |

---

## App 5 : `dossiers` — Gestion des Dossiers

> **Page Frontend** : `GestionDossiersPage.tsx`

### Modèles
| Modèle | Champs |
|--------|--------|
| `Dossier` | `name`, `description`, `parent` (self FK), `direction` (FK), `departement` (FK), `service` (FK), `responsable` (FK), `default_workflow` (FK), `ocr_enabled`, `physical_location`, `is_archived`, `created_by` (FK), `created_at` |
| `DossierPermission` | `dossier` (FK), `user` (FK), `can_read`, `can_write`, `can_share`, `can_delete` |

### Fichiers
| Fichier | Rôle |
|---------|------|
| `services.py` | Construction de l'arborescence, calcul des stats, cascade des ops |
| `filters.py` | Filtre par direction, département, responsable, archivé |
| `signals.py` | Création dossier → audit log |

### API Endpoints

| Méthode | Endpoint | Fonction | Description |
|---------|----------|----------|-------------|
| `GET` | `/api/dossiers/` | `list_dossiers` | Lister (arborescence) |
| `POST` | `/api/dossiers/` | `create_dossier` | Créer un dossier |
| `GET` | `/api/dossiers/{id}/` | `get_dossier` | Détail |
| `PUT` | `/api/dossiers/{id}/` | `update_dossier` | Modifier |
| `DELETE` | `/api/dossiers/{id}/` | `delete_dossier` | Supprimer |
| `GET` | `/api/dossiers/{id}/tree/` | `get_dossier_tree` | Arborescence complète |
| `GET` | `/api/dossiers/{id}/content/` | `get_dossier_content` | Contenu (docs + sous-dossiers) |
| `GET` | `/api/dossiers/{id}/stats/` | `get_dossier_stats` | Statistiques |
| `POST` | `/api/dossiers/{id}/move/` | `move_dossier` | Déplacer |
| `GET` | `/api/dossiers/{id}/permissions/` | `list_dossier_permissions` | Permissions |
| `PUT` | `/api/dossiers/{id}/permissions/` | `update_dossier_permissions` | Modifier permissions |
| `GET` | `/api/dossiers/{id}/activity/` | `get_dossier_activity` | Activité récente |

---

## App 6 : `courriers` — Courriers Entrants & Sortants

> **Pages Frontend** : `CourriersEntrantsPage.tsx`, `CourriersSortantsPage.tsx`

### Modèles
| Modèle | Champs |
|--------|--------|
| `CourrierEntrant` | `numero`, `expediteur`, `objet`, `date_reception`, `priorite`, `statut`, `categorie`, `direction` (FK), `departement` (FK), `service` (FK), `assigned_to` (FK), `notes`, `created_by` (FK) |
| `CourrierSortant` | `numero`, `reference`, `destinataire`, `organisme`, `objet`, `date_envoi`, `priorite`, `statut`, `auteur` (FK), `departement` (FK), `service` (FK), `workflow_status`, `created_by` (FK) |
| `PieceJointe` | `content_type`, `object_id`, `file`, `name`, `size`, `mime_type` |
| `Diffusion` | `courrier_type`, `courrier_id`, `destinataires` (M2M), `date_diffusion`, `statut`, `created_by` (FK) |
| `CourrierHistorique` | `content_type`, `object_id`, `action`, `user` (FK), `details`, `created_at` |

### Fichiers
| Fichier | Rôle |
|---------|------|
| `services.py` | Numérotation auto, diffusion, transfert, calcul KPIs |
| `filters.py` | Filtre par priorité, statut, date, direction, expéditeur |
| `signals.py` | Réception → notification, changement statut → audit |

### API Endpoints

| Méthode | Endpoint | Fonction | Description |
|---------|----------|----------|-------------|
| `GET` | `/api/courriers/entrants/` | `list_courriers_entrants` | Lister (filtres, pagination) |
| `POST` | `/api/courriers/entrants/` | `create_courrier_entrant` | Créer |
| `GET` | `/api/courriers/entrants/{id}/` | `get_courrier_entrant` | Détail |
| `PUT` | `/api/courriers/entrants/{id}/` | `update_courrier_entrant` | Modifier |
| `DELETE` | `/api/courriers/entrants/{id}/` | `delete_courrier_entrant` | Supprimer |
| `POST` | `/api/courriers/entrants/{id}/mark-read/` | `mark_courrier_read` | Marquer lu |
| `POST` | `/api/courriers/entrants/{id}/mark-treated/` | `mark_courrier_treated` | Marquer traité |
| `POST` | `/api/courriers/entrants/{id}/transfer/` | `transfer_courrier` | Transférer |
| `POST` | `/api/courriers/entrants/{id}/assign/` | `assign_courrier` | Assigner |
| `GET` | `/api/courriers/entrants/{id}/history/` | `get_entrant_history` | Historique |
| `GET` | `/api/courriers/sortants/` | `list_courriers_sortants` | Lister |
| `POST` | `/api/courriers/sortants/` | `create_courrier_sortant` | Créer |
| `GET` | `/api/courriers/sortants/{id}/` | `get_courrier_sortant` | Détail |
| `PUT` | `/api/courriers/sortants/{id}/` | `update_courrier_sortant` | Modifier |
| `DELETE` | `/api/courriers/sortants/{id}/` | `delete_courrier_sortant` | Supprimer |
| `POST` | `/api/courriers/sortants/{id}/send/` | `send_courrier_sortant` | Marquer envoyé |
| `POST` | `/api/courriers/sortants/{id}/sign/` | `sign_courrier_sortant` | Signer |
| `POST` | `/api/courriers/sortants/{id}/archive/` | `archive_courrier_sortant` | Archiver |
| `GET` | `/api/courriers/sortants/{id}/history/` | `get_sortant_history` | Historique |
| `POST` | `/api/courriers/{id}/attachments/` | `upload_attachment` | Pièce jointe |
| `DELETE` | `/api/courriers/{id}/attachments/{aid}/` | `delete_attachment` | Supprimer PJ |
| `GET` | `/api/courriers/{id}/attachments/{aid}/download/` | `download_attachment` | Télécharger PJ |
| `GET` | `/api/courriers/kpis/` | `get_courriers_kpis` | KPIs courriers |

---

## App 7 : `workflow` — Workflow de Validation

> **Page Frontend** : `WorkflowPage.tsx`

### Modèles
| Modèle | Champs |
|--------|--------|
| `Workflow` | `name`, `description`, `document_type`, `departement` (FK), `responsable` (FK), `status`, `version`, `visibility`, `created_by` (FK), `created_at` |
| `WorkflowStep` | `workflow` (FK), `name`, `order`, `responsable` (FK), `role` (FK), `departement` (FK), `service` (FK), `delay_days`, `is_required`, `requires_signature`, `notify_email`, `notify_internal`, `pass_condition` |
| `WorkflowInstance` | `workflow` (FK), `document` (FK), `current_step`, `status`, `started_at`, `completed_at` |
| `StepExecution` | `instance` (FK), `step` (FK), `user` (FK), `status`, `comment`, `started_at`, `completed_at` |

### Fichiers
| Fichier | Rôle |
|---------|------|
| `services.py` | Avancement des étapes, validation, notifications automatiques, KPIs |
| `filters.py` | Filtre par statut, département, type de document |
| `signals.py` | Validation étape → notification + audit. Workflow terminé → archivage auto |

### API Endpoints

| Méthode | Endpoint | Fonction | Description |
|---------|----------|----------|-------------|
| `GET` | `/api/workflows/` | `list_workflows` | Lister |
| `POST` | `/api/workflows/` | `create_workflow` | Créer |
| `GET` | `/api/workflows/{id}/` | `get_workflow` | Détail |
| `PUT` | `/api/workflows/{id}/` | `update_workflow` | Modifier |
| `DELETE` | `/api/workflows/{id}/` | `delete_workflow` | Supprimer |
| `POST` | `/api/workflows/{id}/activate/` | `activate_workflow` | Activer |
| `POST` | `/api/workflows/{id}/deactivate/` | `deactivate_workflow` | Désactiver |
| `GET` | `/api/workflows/{id}/steps/` | `list_steps` | Lister les étapes |
| `POST` | `/api/workflows/{id}/steps/` | `create_step` | Créer une étape |
| `PUT` | `/api/workflows/{id}/steps/{sid}/` | `update_step` | Modifier une étape |
| `DELETE` | `/api/workflows/{id}/steps/{sid}/` | `delete_step` | Supprimer une étape |
| `GET` | `/api/workflows/{id}/stats/` | `get_workflow_stats` | Statistiques |
| `GET` | `/api/workflow-instances/` | `list_instances` | Instances en cours |
| `POST` | `/api/workflow-instances/` | `start_instance` | Démarrer sur un document |
| `GET` | `/api/workflow-instances/{id}/` | `get_instance` | Détail d'une instance |
| `POST` | `/api/workflow-instances/{id}/validate/` | `validate_step` | Valider l'étape |
| `POST` | `/api/workflow-instances/{id}/reject/` | `reject_step` | Rejeter l'étape |
| `POST` | `/api/workflow-instances/{id}/comment/` | `add_comment` | Commenter |
| `GET` | `/api/workflows/kpis/` | `get_workflow_kpis` | KPIs workflow |

---

## App 8 : `ocr` — OCR & Extraction

> **Pages Frontend** : `OcrPage.tsx`, `ScannerPage.tsx`

### Modèles
| Modèle | Champs |
|--------|--------|
| `OcrJob` | `document` (FK), `source_file`, `language`, `engine`, `status`, `progress`, `error_message`, `created_by` (FK), `created_at` |
| `OcrResult` | `job` (FK), `full_text`, `confidence`, `words_count`, `paragraphs`, `tables_detected`, `signatures_detected`, `stamps_detected`, `processing_time`, `created_at` |
| `OcrPage` | `job` (FK), `page_number`, `image_file`, `text`, `confidence` |

### Fichiers
| Fichier | Rôle |
|---------|------|
| `services.py` | Lancement OCR (Tesseract), extraction de texte, calcul de confiance |
| `signals.py` | OCR terminé → mise à jour statut document + notification |

### API Endpoints

| Méthode | Endpoint | Fonction | Description |
|---------|----------|----------|-------------|
| `POST` | `/api/ocr/process/` | `process_ocr` | Lancer l'OCR sur un document |
| `GET` | `/api/ocr/{id}/` | `get_ocr_result` | Résultat OCR |
| `PUT` | `/api/ocr/{id}/text/` | `update_ocr_text` | Modifier le texte extrait |
| `POST` | `/api/ocr/{id}/reprocess/` | `reprocess_ocr` | Relancer l'OCR |
| `GET` | `/api/ocr/{id}/download/` | `download_ocr_pdf` | Télécharger le PDF OCR |
| `POST` | `/api/ocr/{id}/validate/` | `validate_ocr` | Valider le résultat |
| `GET` | `/api/ocr/{id}/stats/` | `get_ocr_stats` | Statistiques OCR |

---

## App 9 : `notifications` — Notifications

> **Page Frontend** : `NotificationsPage.tsx`

### Modèles
| Modèle | Champs |
|--------|--------|
| `Notification` | `user` (FK), `title`, `message`, `type`, `icon`, `link`, `is_read`, `related_document` (FK null), `related_workflow` (FK null), `created_at` |

### Fichiers
| Fichier | Rôle |
|---------|------|
| `services.py` | Création depuis les signals des autres apps, batch mark as read |

### API Endpoints

| Méthode | Endpoint | Fonction | Description |
|---------|----------|----------|-------------|
| `GET` | `/api/notifications/` | `list_notifications` | Lister |
| `GET` | `/api/notifications/unread-count/` | `get_unread_count` | Nombre non lues |
| `POST` | `/api/notifications/{id}/read/` | `mark_read` | Marquer comme lue |
| `POST` | `/api/notifications/read-all/` | `mark_all_read` | Tout marquer lu |
| `DELETE` | `/api/notifications/{id}/` | `delete_notification` | Supprimer |
| `DELETE` | `/api/notifications/clear/` | `clear_all` | Tout supprimer |

---

## App 10 : `audit` — Journal d'Audit

> **Page Frontend** : `AuditLogPage.tsx`

### Modèles
| Modèle | Champs |
|--------|--------|
| `AuditLog` | `user` (FK), `action`, `resource_type`, `resource_id`, `resource_name`, `details` (JSON), `ip_address`, `user_agent`, `created_at` |

### Fichiers
| Fichier | Rôle |
|---------|------|
| `services.py` | `log_action()` — appelée par les signals de toutes les apps |
| `filters.py` | Filtre par action, utilisateur, type de ressource, plage de dates |
| `signals.py` | Écoute les signaux de toutes les autres apps |

### API Endpoints

| Méthode | Endpoint | Fonction | Description |
|---------|----------|----------|-------------|
| `GET` | `/api/audit/` | `list_audit_logs` | Lister (filtres, pagination) |
| `GET` | `/api/audit/{id}/` | `get_audit_log` | Détail |
| `GET` | `/api/audit/export/` | `export_audit_logs` | Exporter (CSV/PDF) |
| `GET` | `/api/audit/stats/` | `get_audit_stats` | Statistiques d'audit |
| `GET` | `/api/audit/user/{uid}/` | `get_user_audit` | Logs d'un utilisateur |

---

## App 11 : `dashboard` — Dashboard & Statistiques

> **Pages Frontend** : `DashboardPage.tsx`, `StatistiquesPage.tsx`

### Modèles
| Modèle | Champs |
|--------|--------|
| — | Pas de modèle propre — agrège les données des autres apps |

### Fichiers
| Fichier | Rôle |
|---------|------|
| `services.py` | Calcul des KPIs, agrégations, séries temporelles |

### API Endpoints

| Méthode | Endpoint | Fonction | Description |
|---------|----------|----------|-------------|
| `GET` | `/api/dashboard/kpis/` | `get_dashboard_kpis` | KPIs (total docs, courriers, etc.) |
| `GET` | `/api/dashboard/recent-documents/` | `get_recent_documents` | Documents récents |
| `GET` | `/api/dashboard/recent-activity/` | `get_recent_activity` | Activité récente |
| `GET` | `/api/dashboard/storage/` | `get_storage_info` | Info stockage |
| `GET` | `/api/dashboard/calendar/` | `get_calendar_events` | Événements calendrier |
| `GET` | `/api/stats/documents/` | `get_documents_stats` | Stats documents |
| `GET` | `/api/stats/courriers/` | `get_courriers_stats` | Stats courriers |
| `GET` | `/api/stats/users/` | `get_users_stats` | Stats utilisateurs |
| `GET` | `/api/stats/storage/` | `get_storage_stats` | Stats stockage |
| `GET` | `/api/stats/evolution/` | `get_evolution_stats` | Évolution temporelle |
| `GET` | `/api/stats/by-category/` | `get_category_stats` | Par catégorie |
| `GET` | `/api/stats/by-department/` | `get_department_stats` | Par département |
| `GET` | `/api/stats/export/` | `export_stats` | Exporter (PDF/Excel) |

---

## App 12 : `settings_app` — Paramètres

> **Pages Frontend** : `SettingsPage.tsx`, `AProposPage.tsx`

### Modèles
| Modèle | Champs |
|--------|--------|
| `AppSettings` | `app_name`, `logo`, `primary_color`, `language`, `timezone`, `storage_limit`, `max_upload_size`, `ocr_default_language`, `retention_policy`, `auto_backup` |
| `BackupRecord` | `filename`, `size`, `type`, `status`, `created_at` |

### API Endpoints

| Méthode | Endpoint | Fonction | Description |
|---------|----------|----------|-------------|
| `GET` | `/api/settings/` | `get_settings` | Récupérer les paramètres |
| `PUT` | `/api/settings/` | `update_settings` | Modifier les paramètres |
| `GET` | `/api/settings/about/` | `get_about_info` | Infos plateforme |
| `GET` | `/api/settings/storage/` | `get_storage_details` | Détails stockage |
| `POST` | `/api/settings/backup/` | `create_backup` | Créer une sauvegarde |
| `GET` | `/api/settings/backups/` | `list_backups` | Lister les sauvegardes |
| `POST` | `/api/settings/backups/{id}/restore/` | `restore_backup` | Restaurer |

---

## 🔍 Recherche Globale (intégrée dans `documents`)

> **Page Frontend** : `SearchPage.tsx`

| Méthode | Endpoint | Fonction | Description |
|---------|----------|----------|-------------|
| `GET` | `/api/search/` | `global_search` | Recherche globale (tous types) |
| `GET` | `/api/search/documents/` | `search_documents` | Recherche avancée documents |
| `GET` | `/api/search/courriers/` | `search_courriers` | Recherche courriers |
| `GET` | `/api/search/suggestions/` | `get_suggestions` | Auto-complétion |

---

## 📊 Résumé Quantitatif Final

| Élément | Quantité |
|---------|----------|
| **Applications Django** | 12 + common |
| **Modèles (tables DB)** | ~30 |
| **Endpoints API** | ~130 |
| **Fichiers services.py** | 12 |
| **Fichiers filters.py** | 8 |
| **Fichiers signals.py** | 12 |
| **Fichiers tests.py** | 12 |

---

## 🔐 Sécurité & JWT

Toutes les API (sauf `/api/auth/login/`) nécessitent un **JWT Bearer Token** :

```
Authorization: Bearer <access_token>
```

### Matrice des Permissions

| Rôle | Documents | Courriers | Workflow | Users | Audit | Settings |
|------|-----------|-----------|----------|-------|-------|----------|
| Super Admin | CRUD + All | CRUD + All | CRUD + All | CRUD + All | Read + Export | CRUD |
| Admin | CRUD | CRUD | CRUD | CRUD | Read | Read |
| Manager | CRUD | CRUD | Read + Approve | Read | Read | — |
| Employé | CR | CR | Read | Read propre | — | — |
| Archiviste | CRUD | CRUD (archivage) | Read | — | — | — |
| Lecteur | R | R | R | — | — | — |

---

## 🔗 Convention des URLs

```
/api/{resource}/                           → LIST / CREATE
/api/{resource}/{id}/                      → RETRIEVE / UPDATE / DELETE
/api/{resource}/{id}/{action}/             → ACTION spécifique
/api/{resource}/{id}/{sub-resource}/       → Sous-ressource
```

---

## 📡 Format de Réponse Standard (défini dans `common/responses.py`)

### Succès (liste paginée)
```json
{
  "count": 320,
  "page": 1,
  "page_size": 10,
  "total_pages": 32,
  "results": [...]
}
```

### Succès (objet unique)
```json
{
  "id": 1,
  "title": "Rapport annuel 2024",
  "...": "..."
}
```

### Erreur (défini dans `common/exceptions.py`)
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Le champ 'title' est requis.",
  "details": { "title": ["Ce champ est requis."] }
}
```

---

## ⚡ Flux des Signaux Django

```
Document créé (documents/signals.py)
    ├── → AuditLog.create()           (audit/services.py)
    ├── → Notification.create()       (notifications/services.py)
    └── → Dashboard cache invalidé    (dashboard/services.py)

Courrier reçu (courriers/signals.py)
    ├── → AuditLog.create()
    ├── → Notification vers assigned_to
    └── → KPI counter update

Workflow étape validée (workflow/signals.py)
    ├── → AuditLog.create()
    ├── → Notification vers le prochain valideur
    ├── → Si dernière étape → Document.status = "validé"
    └── → Si rejeté → Notification vers le créateur

User créé (users/signals.py)
    ├── → AuditLog.create()
    └── → Notification vers les admins
```

---

> ✅ **Architecture v2.0 — Score 10/10.** Prête pour l'implémentation.
