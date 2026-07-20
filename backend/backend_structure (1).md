# 🏗️ AgrOdiv GED – Architecture Backend v2.1 (Django + PostgreSQL + Docker)

> Architecture révisée suite à la review (9.7/10 → 10/10). Intègre toutes les améliorations : suppression de messagerie, renommage des apps, ajout de `common`, `services.py`, `filters.py`, `signals.py`, `tests.py`, et séparation du modèle Document.

## 📝 Changelog v2.1 (cohérence avec `database_structure.md` v2.1)

1. **Diffusion — endpoints ajoutés.** Le modèle `Diffusion` était documenté (App 6) mais n'avait **aucun endpoint API** en v2.0. Ajoutés ci-dessous : création, détail, liste par courrier, suivi de lecture, marquage lu.
2. **`DiffusionDestinataire` ajouté** comme modèle à part entière (remplace le M2M `destinataires` simple) pour supporter le suivi de lecture par destinataire vu dans l'UI.
3. **Corbeille étendue** à `dossiers` et `courriers` (entrants + sortants) — en v2.0 seule `documents` avait `trash`/`restore`/`permanent`. Endpoints ajoutés dans App 5 et App 6.
4. **`confidentialite` ajouté** au modèle `Document` (App 4) — champ manquant vs les maquettes UI validées.
5. Compteurs mis à jour dans le Résumé Quantitatif Final.

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
| `Document` | `title`, `description`, `category` (FK), `direction` (FK), `departement` (FK), `service` (FK), `dossier` (FK), `status`, `priority`, `confidentialite` ★, `is_archived`, `is_deleted`, `deleted_at`, `created_by` (FK), `tags` (M2M), `physical_location`, `created_at`, `updated_at` | **Métadonnées** du document |
| `DocumentFile` | `document` (FK), `file`, `filename`, `mime_type`, `size`, `checksum`, `uploaded_at` | **Fichier physique** |
| `DocumentVersion` | `document` (FK), `version_number`, `file`, `changelog`, `created_by` (FK), `created_at` | **Versioning** |
| `DocumentRelation` | `source` (FK), `target` (FK), `relation_type` | **Relations** entre documents |
| `Favorite` | `user` (FK), `document` (FK), `created_at` | **Favoris** |

★ = ajouté en v2.1

### Fichiers
| Fichier | Rôle |
|---------|------|
| `services.py` | Upload, versioning, archivage, génération checksum |
| `filters.py` | Filtre par type, catégorie, direction, statut, date, priorité, confidentialité ★ |
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
| `Dossier` | `name`, `description`, `parent` (self FK), `direction` (FK), `departement` (FK), `service` (FK), `responsable` (FK), `default_workflow` (FK), `ocr_enabled`, `physical_location`, `is_archived`, `is_deleted` ★, `deleted_at` ★, `created_by` (FK), `created_at` |
| `DossierPermission` | `dossier` (FK), `user` (FK), `can_read`, `can_write`, `can_share`, `can_delete` |

★ = ajouté en v2.1 (cohérence Corbeille)

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
| `DELETE` | `/api/dossiers/{id}/` | `delete_dossier` | Mettre à la corbeille ★ |
| `GET` | `/api/dossiers/{id}/tree/` | `get_dossier_tree` | Arborescence complète |
| `GET` | `/api/dossiers/{id}/content/` | `get_dossier_content` | Contenu (docs + sous-dossiers) |
| `GET` | `/api/dossiers/{id}/stats/` | `get_dossier_stats` | Statistiques |
| `POST` | `/api/dossiers/{id}/move/` | `move_dossier` | Déplacer |
| `GET` | `/api/dossiers/{id}/permissions/` | `list_dossier_permissions` | Permissions |
| `PUT` | `/api/dossiers/{id}/permissions/` | `update_dossier_permissions` | Modifier permissions |
| `GET` | `/api/dossiers/{id}/activity/` | `get_dossier_activity` | Activité récente |
| `GET` | `/api/dossiers/trash/` | `list_trash_dossiers` | Corbeille des dossiers ★ |
| `POST` | `/api/dossiers/{id}/restore/` | `restore_dossier` | Restaurer depuis corbeille ★ |
| `DELETE` | `/api/dossiers/{id}/permanent/` | `permanent_delete_dossier` | Suppression définitive ★ |
| `POST` | `/api/dossiers/trash/empty/` | `empty_trash_dossiers` | Vider la corbeille des dossiers ★ |

★ = ajouté en v2.1

---

## App 6 : `courriers` — Courriers Entrants & Sortants

> **Pages Frontend** : `CourriersEntrantsPage.tsx`, `CourriersSortantsPage.tsx`, `DiffusionPage.tsx`

### Modèles
| Modèle | Champs |
|--------|--------|
| `CourrierEntrant` | `numero`, `expediteur`, `objet`, `date_reception`, `priorite`, `statut`, `categorie`, `direction` (FK), `departement` (FK), `service` (FK), `assigned_to` (FK), `notes`, `is_deleted` ★, `deleted_at` ★, `created_by` (FK) |
| `CourrierSortant` | `numero`, `reference`, `destinataire`, `organisme`, `objet`, `date_envoi`, `priorite`, `statut`, `auteur` (FK), `departement` (FK), `service` (FK), `workflow_status`, `is_deleted` ★, `deleted_at` ★, `created_by` (FK) |
| `PieceJointe` | `content_type`, `object_id`, `file`, `name`, `size`, `mime_type` |
| `Diffusion` | `courrier_type`, `courrier_id`, `note` ★, `date_diffusion`, `date_expiration` ★, `statut`, `created_by` (FK) |
| `DiffusionDestinataire` ★ | `diffusion` (FK), `user` (FK), `lu`, `date_lecture` |
| `CourrierHistorique` | `content_type`, `object_id`, `action`, `user` (FK), `details`, `created_at` |

★ = ajouté/modifié en v2.1 — `Diffusion.destinataires` (M2M simple en v2.0) est remplacé par le modèle `DiffusionDestinataire` (through model) car un M2M seul ne permet pas de savoir **qui** a lu, uniquement qui est destinataire. C'est ce que montre l'UI ("État de lecture" par destinataire).

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
| `DELETE` | `/api/courriers/entrants/{id}/` | `delete_courrier_entrant` | Mettre à la corbeille ★ |
| `POST` | `/api/courriers/entrants/{id}/mark-read/` | `mark_courrier_read` | Marquer lu |
| `POST` | `/api/courriers/entrants/{id}/mark-treated/` | `mark_courrier_treated` | Marquer traité |
| `POST` | `/api/courriers/entrants/{id}/transfer/` | `transfer_courrier` | Transférer |
| `POST` | `/api/courriers/entrants/{id}/assign/` | `assign_courrier` | Assigner |
| `GET` | `/api/courriers/entrants/{id}/history/` | `get_entrant_history` | Historique |
| `GET` | `/api/courriers/entrants/trash/` | `list_trash_entrants` | Corbeille courriers entrants ★ |
| `POST` | `/api/courriers/entrants/{id}/restore/` | `restore_courrier_entrant` | Restaurer ★ |
| `DELETE` | `/api/courriers/entrants/{id}/permanent/` | `permanent_delete_entrant` | Suppression définitive ★ |
| `GET` | `/api/courriers/sortants/` | `list_courriers_sortants` | Lister |
| `POST` | `/api/courriers/sortants/` | `create_courrier_sortant` | Créer |
| `GET` | `/api/courriers/sortants/{id}/` | `get_courrier_sortant` | Détail |
| `PUT` | `/api/courriers/sortants/{id}/` | `update_courrier_sortant` | Modifier |
| `DELETE` | `/api/courriers/sortants/{id}/` | `delete_courrier_sortant` | Mettre à la corbeille ★ |
| `POST` | `/api/courriers/sortants/{id}/send/` | `send_courrier_sortant` | Marquer envoyé |
| `POST` | `/api/courriers/sortants/{id}/sign/` | `sign_courrier_sortant` | Signer |
| `POST` | `/api/courriers/sortants/{id}/archive/` | `archive_courrier_sortant` | Archiver |
| `GET` | `/api/courriers/sortants/{id}/history/` | `get_sortant_history` | Historique |
| `GET` | `/api/courriers/sortants/trash/` | `list_trash_sortants` | Corbeille courriers sortants ★ |
| `POST` | `/api/courriers/sortants/{id}/restore/` | `restore_courrier_sortant` | Restaurer ★ |
| `DELETE` | `/api/courriers/sortants/{id}/permanent/` | `permanent_delete_sortant` | Suppression définitive ★ |
| `POST` | `/api/courriers/{id}/attachments/` | `upload_attachment` | Pièce jointe |
| `DELETE` | `/api/courriers/{id}/attachments/{aid}/` | `delete_attachment` | Supprimer PJ |
| `GET` | `/api/courriers/{id}/attachments/{aid}/download/` | `download_attachment` | Télécharger PJ |
| `GET` | `/api/courriers/kpis/` | `get_courriers_kpis` | KPIs courriers |
| `POST` | `/api/diffusion/` | `create_diffusion` | Diffuser un courrier à plusieurs utilisateurs ★ |
| `GET` | `/api/diffusion/{id}/` | `get_diffusion` | Détail d'une diffusion ★ |
| `GET` | `/api/courriers/{type}/{id}/diffusions/` | `list_diffusions_for_courrier` | Diffusions d'un courrier donné ★ |
| `GET` | `/api/diffusion/{id}/tracking/` | `get_diffusion_tracking` | Suivi de lecture par destinataire ★ |
| `POST` | `/api/diffusion/{id}/read/` | `mark_diffusion_read` | Marquer comme lu (destinataire courant) ★ |

★ = ajouté en v2.1 (endpoints Diffusion totalement absents en v2.0 malgré le modèle documenté, + corbeille)

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

## 📊 Résumé Quantitatif Final (v2.1)

| Élément | Quantité | v2.0 |
|---------|----------|------|
| **Applications Django** | 12 + common | 12 + common |
| **Modèles (tables DB)** | ~32 | ~30 |
| **Endpoints API** | ~145 | ~130 |
| **Fichiers services.py** | 12 | 12 |
| **Fichiers filters.py** | 8 | 8 |
| **Fichiers signals.py** | 12 | 12 |
| **Fichiers tests.py** | 12 | 12 |

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

Diffusion créée (courriers/signals.py) ★
    ├── → Notification vers chaque DiffusionDestinataire
    └── → AuditLog.create()

Workflow étape validée (workflow/signals.py)
    ├── → AuditLog.create()
    ├── → Notification vers le prochain valideur
    ├── → Si dernière étape → Document.status = "validé"
    └── → Si rejeté → Notification vers le créateur

User créé (users/signals.py)
    ├── → AuditLog.create()
    └── → Notification vers les admins
```

★ = ajouté en v2.1

---

# 🔧 Fonctions à Implémenter par Application (Checklist Complète)

> Contrairement aux tableaux "API Endpoints" ci-dessus (qui listent les fonctions de `views.py` uniquement), cette section couvre **toutes** les fonctions à écrire dans **tous** les fichiers de chaque app : `views.py`, `services.py`, `filters.py`, `signals.py`. Les fonctions `services.py`/`signals.py` n'avaient que des descriptions prose en v2.1 — elles sont ici nommées concrètement pour servir de squelette direct.

---

## `common`

**`pagination.py`**
- [ ] `StandardPagination` (classe)
- [ ] `LargePagination` (classe)

**`permissions.py`**
- [ ] `IsOwner` (classe)
- [ ] `IsAdminOrReadOnly` (classe)
- [ ] `HasModulePermission` (classe)

**`responses.py`**
- [ ] `success_response(data, message, status)`
- [ ] `error_response(message, errors, status)`
- [ ] `paginated_response(queryset, serializer, request)`

**`exceptions.py`**
- [ ] `CustomValidationError` (classe)
- [ ] `ResourceNotFoundError` (classe)
- [ ] `PermissionDeniedError` (classe)

**`validators.py`**
- [ ] `validate_file_size(file, max_size_mb)`
- [ ] `validate_file_type(file, allowed_types)`
- [ ] `validate_reference_number(value)`

---

## App 1 : `authentication`

**`views.py`** (CRUD/Auth)
- [ ] `login_user`
- [ ] `logout_user`
- [ ] `refresh_token`
- [ ] `change_password`
- [ ] `get_current_user`

**`services.py`**
- [ ] `authenticate_user(email, password)` — vérifie les credentials
- [ ] `generate_tokens(user)` — génère access + refresh JWT
- [ ] `blacklist_token(refresh_token)` — invalide au logout
- [ ] `validate_password_strength(password)` — règles de complexité

**`signals.py`**
- [ ] `log_login(sender, user, request, **kwargs)` — signal `user_logged_in`
- [ ] `log_logout(sender, user, request, **kwargs)` — signal `user_logged_out`

---

## App 2 : `users`

**`views.py`** — CRUD
- [ ] `list_users` · `create_user` · `get_user` · `update_user` · `delete_user`

**`views.py`** — Actions custom
- [ ] `toggle_user_active`
- [ ] `get_profile` · `update_profile` · `upload_avatar`
- [ ] `list_roles` · `create_role` · `update_role` · `delete_role`
- [ ] `get_role_permissions` · `update_role_permissions`

**`services.py`**
- [ ] `create_user_with_role(data)` — crée l'utilisateur + assigne le rôle par défaut
- [ ] `activate_user(user)` / `deactivate_user(user)`
- [ ] `assign_role(user, role)` — change le rôle et propage les permissions
- [ ] `reset_user_password(user)` — génère un mot de passe temporaire + envoi email

**`filters.py`**
- [ ] `UserFilter` (department, service, role, is_active)

**`signals.py`**
- [ ] `notify_admin_on_user_created(sender, instance, created, **kwargs)`

---

## App 3 : `organization`

> ⚠️ Gap détecté dans le tableau API Endpoints existant : `sites`, `batiments`, `bureaux`, `armoires`, `etageres` n'ont que `list_create` (`GET/POST`) — pas de `detail/update/delete` individuel, contrairement à `boites-archives` qui a le CRUD complet. Si c'est voulu (infrastructure physique rarement modifiée unitairement), très bien ; sinon il manque 5×3 fonctions (`get_X`, `update_X`, `delete_X`).

**`views.py`** — CRUD (par ressource : directions, departements, services, categories, tags, correspondants, boites-archives)
- [ ] `list_create_X` · `detail_X` (×7 ressources avec CRUD complet)
- [ ] `list_create_X` seul (×5 : sites, batiments, bureaux, armoires, etageres)

**`services.py`**
- [ ] `build_organization_tree()` — direction → département → service
- [ ] `build_location_tree()` — site → bâtiment → bureau → armoire → étagère → boîte
- [ ] `cascade_delete_check(instance)` — vérifie les dépendances avant suppression (ex: département avec users actifs)

**`filters.py`**
- [ ] `DirectionFilter`
- [ ] `DepartementFilter` (by direction)
- [ ] `ServiceFilter` (by departement)
- [ ] `SiteFilter`

**`signals.py`**
- [ ] `log_organization_change(sender, instance, created, **kwargs)`

---

## App 4 : `documents`

**`views.py`** — CRUD
- [ ] `list_documents` · `create_document` · `get_document` · `update_document` · `delete_document`

**`views.py`** — Actions custom
- [ ] `upload_file` · `download_document` · `preview_document`
- [ ] `archive_document` · `restore_document` · `permanent_delete`
- [ ] `share_document`
- [ ] `list_versions` · `create_version` · `restore_version`
- [ ] `list_relations` · `create_relation`
- [ ] `list_recent` · `list_trash` · `empty_trash`
- [ ] `list_favorites` · `add_favorite` · `remove_favorite`

**`services.py`**
- [ ] `save_document_file(document, file)` — sauvegarde + calcule le checksum SHA-256
- [ ] `create_new_version(document, file, user, changelog)` — incrémente `version_number`
- [ ] `generate_checksum(file)` — SHA-256
- [ ] `soft_delete_document(document)` / `restore_document_from_trash(document)`
- [ ] `check_confidentiality_access(user, document)` ★ — vérifie le niveau de confidentialité vs rôle de l'utilisateur

**`filters.py`**
- [ ] `DocumentFilter` (category, direction, status, date_range, priority, confidentialite ★)

**`signals.py`**
- [ ] `on_document_created(sender, instance, created, **kwargs)` — audit + notification
- [ ] `on_document_deleted(sender, instance, **kwargs)` — vérifie dépendances (workflow actif ?)

---

## App 5 : `dossiers`

**`views.py`** — CRUD
- [ ] `list_dossiers` · `create_dossier` · `get_dossier` · `update_dossier` · `delete_dossier`

**`views.py`** — Actions custom
- [ ] `get_dossier_tree` · `get_dossier_content` · `get_dossier_stats`
- [ ] `move_dossier`
- [ ] `list_dossier_permissions` · `update_dossier_permissions`
- [ ] `get_dossier_activity`
- [ ] `list_trash_dossiers` ★ · `restore_dossier` ★ · `permanent_delete_dossier` ★ · `empty_trash_dossiers` ★

**`services.py`**
- [ ] `build_dossier_tree(dossier)` — récursif parent/enfants
- [ ] `compute_dossier_stats(dossier)` — nb documents, taille totale, sous-dossiers
- [ ] `cascade_move(dossier, new_parent)` — déplace + met à jour tous les enfants
- [ ] `check_dossier_permission(user, dossier, action)`

**`filters.py`**
- [ ] `DossierFilter` (direction, departement, responsable, is_archived)

**`signals.py`**
- [ ] `on_dossier_created(sender, instance, created, **kwargs)`

---

## App 6 : `courriers`

**`views.py`** — CRUD Entrants
- [ ] `list_courriers_entrants` · `create_courrier_entrant` · `get_courrier_entrant` · `update_courrier_entrant` · `delete_courrier_entrant`

**`views.py`** — Actions Entrants
- [ ] `mark_courrier_read` · `mark_courrier_treated` · `transfer_courrier` · `assign_courrier` · `get_entrant_history`
- [ ] `list_trash_entrants` ★ · `restore_courrier_entrant` ★ · `permanent_delete_entrant` ★

**`views.py`** — CRUD Sortants
- [ ] `list_courriers_sortants` · `create_courrier_sortant` · `get_courrier_sortant` · `update_courrier_sortant` · `delete_courrier_sortant`

**`views.py`** — Actions Sortants
- [ ] `send_courrier_sortant` · `sign_courrier_sortant` · `archive_courrier_sortant` · `get_sortant_history`
- [ ] `list_trash_sortants` ★ · `restore_courrier_sortant` ★ · `permanent_delete_sortant` ★

**`views.py`** — Pièces jointes & Diffusion ★
- [ ] `upload_attachment` · `delete_attachment` · `download_attachment` · `get_courriers_kpis`
- [ ] `create_diffusion` ★ · `get_diffusion` ★ · `list_diffusions_for_courrier` ★ · `get_diffusion_tracking` ★ · `mark_diffusion_read` ★

**`services.py`**
- [ ] `generate_courrier_numero(type)` — `CE-2024-XXXX` / `CS-2024-XXXX` auto-incrémenté
- [ ] `create_diffusion_with_recipients(courrier, users, note, expiration)` ★
- [ ] `transfer_courrier_to_user(courrier, target_user)`
- [ ] `compute_courriers_kpis(period)` — reçus, en attente, traités, urgents

**`filters.py`**
- [ ] `CourrierEntrantFilter` · `CourrierSortantFilter` (priorite, statut, date, direction, expediteur)

**`signals.py`**
- [ ] `on_courrier_entrant_created(sender, instance, created, **kwargs)`
- [ ] `on_courrier_statut_changed(sender, instance, **kwargs)`
- [ ] `on_diffusion_created(sender, instance, created, **kwargs)` ★ — notifie chaque `DiffusionDestinataire`

---

## App 7 : `workflow`

**`views.py`** — CRUD Workflows
- [ ] `list_workflows` · `create_workflow` · `get_workflow` · `update_workflow` · `delete_workflow`
- [ ] `activate_workflow` · `deactivate_workflow`

**`views.py`** — Étapes
- [ ] `list_steps` · `create_step` · `update_step` · `delete_step` · `get_workflow_stats`

**`views.py`** — Instances
- [ ] `list_instances` · `start_instance` · `get_instance`
- [ ] `validate_step` · `reject_step` · `add_comment` · `get_workflow_kpis`

**`services.py`**
- [ ] `advance_workflow_step(instance, user, decision, comment)` — logique centrale de progression
- [ ] `check_step_completion_condition(step, executions)` — respecte `pass_condition` (`all`/`any`)
- [ ] `compute_workflow_stats(workflow)` — temps moyen/étape, taux de validation/rejet
- [ ] `auto_archive_on_completion(instance)` — si `archivage_automatique=True`

**`filters.py`**
- [ ] `WorkflowFilter` (statut, departement, type_document)

**`signals.py`**
- [ ] `on_step_validated(sender, instance, **kwargs)` — notif + audit
- [ ] `on_workflow_completed(sender, instance, **kwargs)` — archivage auto

---

## App 8 : `ocr`

**`views.py`**
- [ ] `process_ocr` · `get_ocr_result` · `update_ocr_text` · `reprocess_ocr` · `download_ocr_pdf` · `validate_ocr` · `get_ocr_stats`

**`services.py`**
- [ ] `run_tesseract_ocr(file, language)` — appel Tesseract
- [ ] `extract_text_per_page(pdf_path)` — découpe page par page
- [ ] `compute_confidence_score(ocr_output)`
- [ ] `generate_searchable_pdf(original, text_layer)`

**`signals.py`**
- [ ] `on_ocr_completed(sender, instance, **kwargs)` — update `Document.status` + notification

---

## App 9 : `notifications`

**`views.py`**
- [ ] `list_notifications` · `get_unread_count` · `mark_read` · `mark_all_read` · `delete_notification` · `clear_all`

**`services.py`**
- [ ] `create_notification(user, title, message, type, link=None)`
- [ ] `notify_multiple_users(users, title, message, type)`
- [ ] `mark_all_as_read(user)`

---

## App 10 : `audit`

**`views.py`**
- [ ] `list_audit_logs` · `get_audit_log` · `export_audit_logs` · `get_audit_stats` · `get_user_audit`

**`services.py`**
- [ ] `log_action(user, action, resource_type, resource_id, resource_name, details=None, request=None)` — fonction centrale appelée par **toutes** les autres apps
- [ ] `export_logs_to_csv(queryset)` / `export_logs_to_pdf(queryset)`
- [ ] `compute_audit_stats(period)`

**`filters.py`**
- [ ] `AuditLogFilter` (action, user, resource_type, date_range)

---

## App 11 : `dashboard`

**`views.py`**
- [ ] `get_dashboard_kpis` · `get_recent_documents` · `get_recent_activity` · `get_storage_info` · `get_calendar_events`
- [ ] `get_documents_stats` · `get_courriers_stats` · `get_users_stats` · `get_storage_stats`
- [ ] `get_evolution_stats` · `get_category_stats` · `get_department_stats` · `export_stats`

**`services.py`**
- [ ] `compute_dashboard_kpis()` — agrège documents + courriers + workflow
- [ ] `compute_storage_usage()` — parcourt `media/` (ou requête S3 en prod)
- [ ] `compute_time_series(model, date_field, period)` — générique pour les graphes d'évolution
- [ ] `export_stats_to_excel(data)` / `export_stats_to_pdf(data)`

---

## App 12 : `settings_app`

**`views.py`**
- [ ] `get_settings` · `update_settings` · `get_about_info` · `get_storage_details`
- [ ] `create_backup` · `list_backups` · `restore_backup`

**`services.py`**
- [ ] `create_database_backup()` — `pg_dump`
- [ ] `restore_database_backup(backup_file)` — `psql` restore
- [ ] `get_app_version_info()` — lit la version depuis settings ou tag git
- [ ] `cleanup_old_backups(retention_days)`

---

★ = ajouté en v2.1

---

> ✅ **Architecture v2.1.** Cohérente avec `database_structure.md` v2.1. Checklist de fonctions complète ajoutée. Prête pour l'implémentation des `serializers.py` et `views.py`.
