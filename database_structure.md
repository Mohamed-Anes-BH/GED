# 🗄️ AgrOdiv GED – Structure de la Base de Données (PostgreSQL)

> Ce document décrit la totalité des tables, champs, types, contraintes, relations, et index de la base de données `agrodiv_ged`.

---

## 📐 Vue d'Ensemble

```
Base de données : agrodiv_ged
Moteur         : PostgreSQL 16
Nombre de tables : 30
Encoding       : UTF-8
Timezone       : Africa/Algiers
```

---

## 🔗 Diagramme Relationnel Global

```
                    ┌──────────────┐
                    │     User     │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
    ┌───────────┐   ┌───────────┐   ┌──────────────┐
    │   Role    │   │  Document │   │   Courrier   │
    │           │   │           │   │  (E/S)       │
    └─────┬─────┘   └─────┬─────┘   └──────┬───────┘
          │               │                 │
          ▼               ▼                 ▼
    ┌───────────┐   ┌───────────┐   ┌──────────────┐
    │Permission │   │ DocFile   │   │ PieceJointe  │
    └───────────┘   │ DocVersion│   │ Diffusion    │
                    │ Favorite  │   │ Historique   │
                    └─────┬─────┘   └──────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │  Dossier  │   │ Workflow  │   │    OCR    │
    └───────────┘   │ Instance  │   │  Job/Res  │
                    │ Step/Exec │   └───────────┘
                    └───────────┘

    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │ Direction │──▶│Département│──▶│  Service  │
    └───────────┘   └───────────┘   └───────────┘

    ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐
    │   Site    │──▶│ Batiment  │──▶│  Bureau   │──▶│ Armoire   │──▶│ Etagere   │──▶ BoiteArchive
    └───────────┘   └───────────┘   └───────────┘   └───────────┘   └───────────┘
```

---

# 📋 Tables par Application

---

## 1. `users_user` — Utilisateurs

> App : `users` · Remplace `auth_user` via `AUTH_USER_MODEL`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant unique |
| `email` | `VARCHAR(255)` | `UNIQUE, NOT NULL` | Email (utilisé comme login) |
| `password` | `VARCHAR(128)` | `NOT NULL` | Mot de passe hashé |
| `first_name` | `VARCHAR(150)` | `NOT NULL` | Prénom |
| `last_name` | `VARCHAR(150)` | `NOT NULL` | Nom |
| `avatar` | `VARCHAR(255)` | `NULL` | Chemin photo de profil |
| `phone` | `VARCHAR(20)` | `NULL` | Numéro de téléphone |
| `role_id` | `BIGINT` | `FK → users_role.id, NULL` | Rôle attribué |
| `department_id` | `BIGINT` | `FK → organization_departement.id, NULL` | Département |
| `service_id` | `BIGINT` | `FK → organization_service.id, NULL` | Service |
| `is_active` | `BOOLEAN` | `DEFAULT TRUE` | Compte actif |
| `is_staff` | `BOOLEAN` | `DEFAULT FALSE` | Accès admin Django |
| `is_superuser` | `BOOLEAN` | `DEFAULT FALSE` | Super administrateur |
| `last_login` | `TIMESTAMP` | `NULL` | Dernière connexion |
| `date_joined` | `TIMESTAMP` | `DEFAULT NOW()` | Date de création |

**Index :** `email` (unique), `role_id`, `department_id`, `service_id`, `is_active`

---

## 2. `users_role` — Rôles

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `name` | `VARCHAR(100)` | `UNIQUE, NOT NULL` | Nom du rôle |
| `description` | `TEXT` | `NULL` | Description |
| `is_system` | `BOOLEAN` | `DEFAULT FALSE` | Rôle système (non supprimable) |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date de création |

---

## 3. `users_permission` — Permissions par Rôle

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `role_id` | `BIGINT` | `FK → users_role.id, NOT NULL` | Rôle concerné |
| `resource` | `VARCHAR(50)` | `NOT NULL` | Module (documents, courriers, workflow…) |
| `can_create` | `BOOLEAN` | `DEFAULT FALSE` | Permission de création |
| `can_read` | `BOOLEAN` | `DEFAULT TRUE` | Permission de lecture |
| `can_update` | `BOOLEAN` | `DEFAULT FALSE` | Permission de modification |
| `can_delete` | `BOOLEAN` | `DEFAULT FALSE` | Permission de suppression |
| `can_download` | `BOOLEAN` | `DEFAULT FALSE` | Permission de téléchargement |
| `can_share` | `BOOLEAN` | `DEFAULT FALSE` | Permission de partage |
| `can_approve` | `BOOLEAN` | `DEFAULT FALSE` | Permission d'approbation |

**Contrainte unique :** `(role_id, resource)`

---

## 4. `organization_direction` — Directions

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `name` | `VARCHAR(200)` | `NOT NULL` | Nom de la direction |
| `code` | `VARCHAR(20)` | `UNIQUE, NOT NULL` | Code court (ex: DG, DRH) |
| `description` | `TEXT` | `NULL` | Description |
| `responsable_id` | `BIGINT` | `FK → users_user.id, NULL` | Responsable |
| `is_active` | `BOOLEAN` | `DEFAULT TRUE` | Active |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date de création |

---

## 5. `organization_departement` — Départements

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `name` | `VARCHAR(200)` | `NOT NULL` | Nom du département |
| `code` | `VARCHAR(20)` | `UNIQUE, NOT NULL` | Code court |
| `direction_id` | `BIGINT` | `FK → organization_direction.id, NOT NULL` | Direction parente |
| `description` | `TEXT` | `NULL` | Description |
| `responsable_id` | `BIGINT` | `FK → users_user.id, NULL` | Responsable |
| `is_active` | `BOOLEAN` | `DEFAULT TRUE` | Actif |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date de création |

**Index :** `direction_id`

---

## 6. `organization_service` — Services

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `name` | `VARCHAR(200)` | `NOT NULL` | Nom du service |
| `code` | `VARCHAR(20)` | `UNIQUE, NOT NULL` | Code court |
| `departement_id` | `BIGINT` | `FK → organization_departement.id, NOT NULL` | Département parent |
| `description` | `TEXT` | `NULL` | Description |
| `responsable_id` | `BIGINT` | `FK → users_user.id, NULL` | Responsable |
| `is_active` | `BOOLEAN` | `DEFAULT TRUE` | Actif |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date de création |

**Index :** `departement_id`

---

## 7. `organization_categorie` — Catégories de Documents

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `name` | `VARCHAR(200)` | `NOT NULL` | Nom de la catégorie |
| `code` | `VARCHAR(20)` | `UNIQUE, NOT NULL` | Code court |
| `description` | `TEXT` | `NULL` | Description |
| `parent_id` | `BIGINT` | `FK → self, NULL` | Catégorie parente (arborescence) |
| `color` | `VARCHAR(7)` | `NULL` | Couleur hex (#FFFFFF) |
| `is_active` | `BOOLEAN` | `DEFAULT TRUE` | Active |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date de création |

---

## 8. `organization_tag` — Tags

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `name` | `VARCHAR(50)` | `UNIQUE, NOT NULL` | Nom du tag |
| `color` | `VARCHAR(7)` | `DEFAULT '#6B7280'` | Couleur hex |
| `created_by_id` | `BIGINT` | `FK → users_user.id, NULL` | Créateur |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date de création |

---

## 9. `organization_correspondant` — Correspondants Externes

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `name` | `VARCHAR(200)` | `NOT NULL` | Nom complet |
| `organisme` | `VARCHAR(200)` | `NULL` | Organisme / Entreprise |
| `email` | `VARCHAR(254)` | `NULL` | Email |
| `phone` | `VARCHAR(20)` | `NULL` | Téléphone |
| `address` | `TEXT` | `NULL` | Adresse postale |
| `type` | `VARCHAR(20)` | `NOT NULL` | Type : `interne`, `externe`, `institutionnel` |
| `is_active` | `BOOLEAN` | `DEFAULT TRUE` | Actif |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date de création |

---

## 10-14. Tables de Localisation Physique

### `organization_site`
| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `name` | `VARCHAR(200)` | `NOT NULL` | Nom du site |
| `address` | `TEXT` | `NULL` | Adresse |
| `description` | `TEXT` | `NULL` | Description |

### `organization_batiment`
| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `name` | `VARCHAR(200)` | `NOT NULL` | Nom du bâtiment |
| `site_id` | `BIGINT` | `FK → organization_site.id, NOT NULL` | Site parent |
| `description` | `TEXT` | `NULL` | Description |

### `organization_bureau`
| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `name` | `VARCHAR(200)` | `NOT NULL` | Nom / Numéro du bureau |
| `batiment_id` | `BIGINT` | `FK → organization_batiment.id, NOT NULL` | Bâtiment parent |
| `floor` | `VARCHAR(20)` | `NULL` | Étage |

### `organization_armoire`
| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `name` | `VARCHAR(200)` | `NOT NULL` | Nom / Numéro de l'armoire |
| `bureau_id` | `BIGINT` | `FK → organization_bureau.id, NOT NULL` | Bureau parent |
| `description` | `TEXT` | `NULL` | Description |

### `organization_etagere`
| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `name` | `VARCHAR(100)` | `NOT NULL` | Nom / Position |
| `armoire_id` | `BIGINT` | `FK → organization_armoire.id, NOT NULL` | Armoire parente |
| `position` | `INTEGER` | `NOT NULL` | Position dans l'armoire |

### `organization_boitearchive`
| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `code` | `VARCHAR(50)` | `UNIQUE, NOT NULL` | Code de la boîte |
| `etagere_id` | `BIGINT` | `FK → organization_etagere.id, NOT NULL` | Étagère parente |
| `label` | `VARCHAR(200)` | `NOT NULL` | Étiquette |
| `status` | `VARCHAR(20)` | `DEFAULT 'disponible'` | `disponible`, `pleine`, `archivee` |
| `date_creation` | `DATE` | `DEFAULT NOW()` | Date de création |

---

## 15. `documents_document` — Documents (Métadonnées)

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `title` | `VARCHAR(500)` | `NOT NULL` | Titre du document |
| `description` | `TEXT` | `NULL` | Description |
| `category_id` | `BIGINT` | `FK → organization_categorie.id, NULL` | Catégorie |
| `direction_id` | `BIGINT` | `FK → organization_direction.id, NULL` | Direction |
| `departement_id` | `BIGINT` | `FK → organization_departement.id, NULL` | Département |
| `service_id` | `BIGINT` | `FK → organization_service.id, NULL` | Service |
| `dossier_id` | `BIGINT` | `FK → dossiers_dossier.id, NULL` | Dossier parent |
| `status` | `VARCHAR(20)` | `DEFAULT 'brouillon'` | `brouillon`, `en_revision`, `valide`, `archive`, `rejete` |
| `priority` | `VARCHAR(10)` | `DEFAULT 'normale'` | `basse`, `normale`, `haute`, `urgente` |
| `is_archived` | `BOOLEAN` | `DEFAULT FALSE` | Archivé |
| `is_deleted` | `BOOLEAN` | `DEFAULT FALSE` | Dans la corbeille |
| `deleted_at` | `TIMESTAMP` | `NULL` | Date de mise en corbeille |
| `physical_location` | `VARCHAR(500)` | `NULL` | Localisation physique (texte libre) |
| `boite_archive_id` | `BIGINT` | `FK → organization_boitearchive.id, NULL` | Boîte d'archive |
| `created_by_id` | `BIGINT` | `FK → users_user.id, NOT NULL` | Créateur |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date de création |
| `updated_at` | `TIMESTAMP` | `AUTO` | Dernière modification |

**Index :** `status`, `category_id`, `direction_id`, `departement_id`, `dossier_id`, `created_by_id`, `is_deleted`, `is_archived`, `created_at`

---

## 16. `documents_document_tags` — Tags ↔ Documents (M2M)

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `document_id` | `BIGINT` | `FK → documents_document.id, NOT NULL` | Document |
| `tag_id` | `BIGINT` | `FK → organization_tag.id, NOT NULL` | Tag |

**Contrainte unique :** `(document_id, tag_id)`

---

## 17. `documents_documentfile` — Fichiers Physiques

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `document_id` | `BIGINT` | `FK → documents_document.id, NOT NULL` | Document parent |
| `file` | `VARCHAR(500)` | `NOT NULL` | Chemin du fichier (media/) |
| `filename` | `VARCHAR(255)` | `NOT NULL` | Nom original du fichier |
| `mime_type` | `VARCHAR(100)` | `NOT NULL` | Type MIME (application/pdf, image/png…) |
| `size` | `BIGINT` | `NOT NULL` | Taille en octets |
| `checksum` | `VARCHAR(64)` | `NOT NULL` | Hash SHA-256 du fichier |
| `uploaded_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date d'upload |

**Index :** `document_id`

---

## 18. `documents_documentversion` — Versions

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `document_id` | `BIGINT` | `FK → documents_document.id, NOT NULL` | Document parent |
| `version_number` | `INTEGER` | `NOT NULL` | Numéro de version (1, 2, 3…) |
| `file` | `VARCHAR(500)` | `NOT NULL` | Chemin du fichier de cette version |
| `changelog` | `TEXT` | `NULL` | Notes de modification |
| `created_by_id` | `BIGINT` | `FK → users_user.id, NOT NULL` | Auteur de la version |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date de création |

**Contrainte unique :** `(document_id, version_number)`

---

## 19. `documents_documentrelation` — Relations entre Documents

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `source_id` | `BIGINT` | `FK → documents_document.id, NOT NULL` | Document source |
| `target_id` | `BIGINT` | `FK → documents_document.id, NOT NULL` | Document cible |
| `relation_type` | `VARCHAR(30)` | `NOT NULL` | `annexe`, `reference`, `reponse`, `version_de` |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date de création |

**Contrainte unique :** `(source_id, target_id, relation_type)`

---

## 20. `documents_favorite` — Favoris

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `user_id` | `BIGINT` | `FK → users_user.id, NOT NULL` | Utilisateur |
| `document_id` | `BIGINT` | `FK → documents_document.id, NOT NULL` | Document |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date d'ajout |

**Contrainte unique :** `(user_id, document_id)`

---

## 21. `dossiers_dossier` — Dossiers

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `name` | `VARCHAR(300)` | `NOT NULL` | Nom du dossier |
| `description` | `TEXT` | `NULL` | Description |
| `parent_id` | `BIGINT` | `FK → self, NULL` | Dossier parent (arborescence) |
| `direction_id` | `BIGINT` | `FK → organization_direction.id, NULL` | Direction |
| `departement_id` | `BIGINT` | `FK → organization_departement.id, NULL` | Département |
| `service_id` | `BIGINT` | `FK → organization_service.id, NULL` | Service |
| `responsable_id` | `BIGINT` | `FK → users_user.id, NULL` | Responsable |
| `default_workflow_id` | `BIGINT` | `FK → workflow_workflow.id, NULL` | Workflow par défaut |
| `ocr_enabled` | `BOOLEAN` | `DEFAULT FALSE` | OCR automatique activé |
| `physical_location` | `VARCHAR(500)` | `NULL` | Localisation physique |
| `is_archived` | `BOOLEAN` | `DEFAULT FALSE` | Archivé |
| `created_by_id` | `BIGINT` | `FK → users_user.id, NOT NULL` | Créateur |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date de création |

**Index :** `parent_id`, `direction_id`, `responsable_id`

---

## 22. `dossiers_dossierpermission` — Permissions Dossiers

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `dossier_id` | `BIGINT` | `FK → dossiers_dossier.id, NOT NULL` | Dossier |
| `user_id` | `BIGINT` | `FK → users_user.id, NOT NULL` | Utilisateur |
| `can_read` | `BOOLEAN` | `DEFAULT TRUE` | Lecture |
| `can_write` | `BOOLEAN` | `DEFAULT FALSE` | Écriture |
| `can_share` | `BOOLEAN` | `DEFAULT FALSE` | Partage |
| `can_delete` | `BOOLEAN` | `DEFAULT FALSE` | Suppression |

**Contrainte unique :** `(dossier_id, user_id)`

---

## 23. `courriers_courrierentrant` — Courriers Entrants

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `numero` | `VARCHAR(50)` | `UNIQUE, NOT NULL` | Numéro de référence (auto-généré) |
| `expediteur` | `VARCHAR(300)` | `NOT NULL` | Expéditeur |
| `objet` | `VARCHAR(500)` | `NOT NULL` | Objet du courrier |
| `date_reception` | `DATE` | `NOT NULL` | Date de réception |
| `priorite` | `VARCHAR(10)` | `DEFAULT 'normale'` | `basse`, `normale`, `haute`, `urgente` |
| `statut` | `VARCHAR(20)` | `DEFAULT 'nouveau'` | `nouveau`, `lu`, `en_cours`, `traite`, `archive` |
| `categorie` | `VARCHAR(50)` | `NULL` | Catégorie du courrier |
| `direction_id` | `BIGINT` | `FK → organization_direction.id, NULL` | Direction destinataire |
| `departement_id` | `BIGINT` | `FK → organization_departement.id, NULL` | Département destinataire |
| `service_id` | `BIGINT` | `FK → organization_service.id, NULL` | Service destinataire |
| `assigned_to_id` | `BIGINT` | `FK → users_user.id, NULL` | Assigné à |
| `notes` | `TEXT` | `NULL` | Notes internes |
| `created_by_id` | `BIGINT` | `FK → users_user.id, NOT NULL` | Créateur |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date de création |
| `updated_at` | `TIMESTAMP` | `AUTO` | Dernière modification |

**Index :** `numero`, `statut`, `priorite`, `date_reception`, `direction_id`, `assigned_to_id`

---

## 24. `courriers_courriersortant` — Courriers Sortants

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `numero` | `VARCHAR(50)` | `UNIQUE, NOT NULL` | Numéro de référence |
| `reference` | `VARCHAR(100)` | `NULL` | Référence interne |
| `destinataire` | `VARCHAR(300)` | `NOT NULL` | Destinataire |
| `organisme` | `VARCHAR(300)` | `NULL` | Organisme destinataire |
| `objet` | `VARCHAR(500)` | `NOT NULL` | Objet du courrier |
| `date_envoi` | `DATE` | `NULL` | Date d'envoi |
| `priorite` | `VARCHAR(10)` | `DEFAULT 'normale'` | `basse`, `normale`, `haute`, `urgente` |
| `statut` | `VARCHAR(20)` | `DEFAULT 'brouillon'` | `brouillon`, `en_signature`, `signe`, `envoye`, `archive` |
| `auteur_id` | `BIGINT` | `FK → users_user.id, NOT NULL` | Auteur / Rédacteur |
| `departement_id` | `BIGINT` | `FK → organization_departement.id, NULL` | Département émetteur |
| `service_id` | `BIGINT` | `FK → organization_service.id, NULL` | Service émetteur |
| `workflow_status` | `VARCHAR(30)` | `NULL` | Statut du workflow lié |
| `created_by_id` | `BIGINT` | `FK → users_user.id, NOT NULL` | Créateur |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date de création |
| `updated_at` | `TIMESTAMP` | `AUTO` | Dernière modification |

**Index :** `numero`, `statut`, `priorite`, `date_envoi`, `auteur_id`

---

## 25. `courriers_piecejointe` — Pièces Jointes (Générique)

> Utilise `ContentType` de Django pour pointer vers `CourrierEntrant` ou `CourrierSortant`.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `content_type_id` | `INTEGER` | `FK → django_content_type.id, NOT NULL` | Type de l'objet parent |
| `object_id` | `BIGINT` | `NOT NULL` | ID de l'objet parent |
| `file` | `VARCHAR(500)` | `NOT NULL` | Chemin du fichier |
| `name` | `VARCHAR(255)` | `NOT NULL` | Nom du fichier |
| `size` | `BIGINT` | `NOT NULL` | Taille en octets |
| `mime_type` | `VARCHAR(100)` | `NOT NULL` | Type MIME |
| `uploaded_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date d'upload |

**Index :** `(content_type_id, object_id)`

---

## 26. `courriers_courrierhistorique` — Historique des Courriers

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `content_type_id` | `INTEGER` | `FK → django_content_type.id, NOT NULL` | Type courrier |
| `object_id` | `BIGINT` | `NOT NULL` | ID du courrier |
| `action` | `VARCHAR(50)` | `NOT NULL` | `creation`, `lecture`, `transfert`, `traitement`, `archivage` |
| `user_id` | `BIGINT` | `FK → users_user.id, NOT NULL` | Utilisateur ayant effectué l'action |
| `details` | `JSONB` | `NULL` | Détails supplémentaires |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date de l'action |

**Index :** `(content_type_id, object_id)`, `user_id`, `created_at`

---

## 27. `workflow_workflow` — Définitions de Workflow

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `name` | `VARCHAR(200)` | `NOT NULL` | Nom du workflow |
| `description` | `TEXT` | `NULL` | Description |
| `document_type` | `VARCHAR(50)` | `NULL` | Type de document concerné |
| `departement_id` | `BIGINT` | `FK → organization_departement.id, NULL` | Département associé |
| `responsable_id` | `BIGINT` | `FK → users_user.id, NULL` | Responsable du workflow |
| `status` | `VARCHAR(20)` | `DEFAULT 'brouillon'` | `brouillon`, `actif`, `inactif`, `archive` |
| `version` | `INTEGER` | `DEFAULT 1` | Version du workflow |
| `visibility` | `VARCHAR(20)` | `DEFAULT 'departement'` | `prive`, `departement`, `global` |
| `created_by_id` | `BIGINT` | `FK → users_user.id, NOT NULL` | Créateur |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date de création |
| `updated_at` | `TIMESTAMP` | `AUTO` | Dernière modification |

---

## 28. `workflow_workflowstep` — Étapes de Workflow

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `workflow_id` | `BIGINT` | `FK → workflow_workflow.id, NOT NULL, CASCADE` | Workflow parent |
| `name` | `VARCHAR(200)` | `NOT NULL` | Nom de l'étape |
| `order` | `INTEGER` | `NOT NULL` | Ordre (1, 2, 3…) |
| `responsable_id` | `BIGINT` | `FK → users_user.id, NULL` | Responsable de l'étape |
| `role_id` | `BIGINT` | `FK → users_role.id, NULL` | Rôle requis |
| `departement_id` | `BIGINT` | `FK → organization_departement.id, NULL` | Département |
| `service_id` | `BIGINT` | `FK → organization_service.id, NULL` | Service |
| `delay_days` | `INTEGER` | `DEFAULT 3` | Délai maximum en jours |
| `is_required` | `BOOLEAN` | `DEFAULT TRUE` | Étape obligatoire |
| `requires_signature` | `BOOLEAN` | `DEFAULT FALSE` | Signature requise |
| `notify_email` | `BOOLEAN` | `DEFAULT FALSE` | Notifier par email |
| `notify_internal` | `BOOLEAN` | `DEFAULT TRUE` | Notification interne |
| `pass_condition` | `VARCHAR(20)` | `DEFAULT 'all'` | `all` (unanimité), `any` (un seul suffit) |

**Contrainte unique :** `(workflow_id, order)`

---

## 29. `workflow_workflowinstance` — Instances en Cours

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `workflow_id` | `BIGINT` | `FK → workflow_workflow.id, NOT NULL` | Workflow utilisé |
| `document_id` | `BIGINT` | `FK → documents_document.id, NOT NULL` | Document en validation |
| `current_step` | `INTEGER` | `DEFAULT 1` | Étape en cours |
| `status` | `VARCHAR(20)` | `DEFAULT 'en_cours'` | `en_cours`, `valide`, `rejete`, `annule` |
| `started_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date de démarrage |
| `completed_at` | `TIMESTAMP` | `NULL` | Date de fin |

**Index :** `workflow_id`, `document_id`, `status`

---

## 30. `workflow_stepexecution` — Exécution des Étapes

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `instance_id` | `BIGINT` | `FK → workflow_workflowinstance.id, NOT NULL, CASCADE` | Instance |
| `step_id` | `BIGINT` | `FK → workflow_workflowstep.id, NOT NULL` | Étape |
| `user_id` | `BIGINT` | `FK → users_user.id, NOT NULL` | Valideur |
| `status` | `VARCHAR(20)` | `DEFAULT 'en_attente'` | `en_attente`, `valide`, `rejete`, `expire` |
| `comment` | `TEXT` | `NULL` | Commentaire de validation |
| `started_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date de début |
| `completed_at` | `TIMESTAMP` | `NULL` | Date de fin |

**Index :** `instance_id`, `step_id`, `user_id`, `status`

---

## 31. `ocr_ocrjob` — Tâches OCR

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `document_id` | `BIGINT` | `FK → documents_document.id, NOT NULL` | Document source |
| `source_file` | `VARCHAR(500)` | `NOT NULL` | Fichier source |
| `language` | `VARCHAR(10)` | `DEFAULT 'fra'` | Langue OCR (fra, ara, eng) |
| `engine` | `VARCHAR(30)` | `DEFAULT 'tesseract'` | Moteur OCR |
| `status` | `VARCHAR(20)` | `DEFAULT 'en_attente'` | `en_attente`, `en_cours`, `termine`, `erreur` |
| `progress` | `INTEGER` | `DEFAULT 0` | Progression 0-100 |
| `error_message` | `TEXT` | `NULL` | Message d'erreur |
| `created_by_id` | `BIGINT` | `FK → users_user.id, NOT NULL` | Demandeur |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date de lancement |

---

## 32. `ocr_ocrresult` — Résultats OCR

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `job_id` | `BIGINT` | `FK → ocr_ocrjob.id, NOT NULL, UNIQUE` | Tâche OCR (1:1) |
| `full_text` | `TEXT` | `NULL` | Texte extrait complet |
| `confidence` | `DECIMAL(5,2)` | `NULL` | Confiance globale (%) |
| `words_count` | `INTEGER` | `DEFAULT 0` | Nb de mots détectés |
| `paragraphs` | `INTEGER` | `DEFAULT 0` | Nb de paragraphes |
| `tables_detected` | `INTEGER` | `DEFAULT 0` | Nb de tableaux |
| `signatures_detected` | `INTEGER` | `DEFAULT 0` | Nb de signatures |
| `stamps_detected` | `INTEGER` | `DEFAULT 0` | Nb de cachets |
| `processing_time` | `DECIMAL(8,2)` | `NULL` | Temps de traitement (secondes) |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date de fin |

---

## 33. `ocr_ocrpage` — Pages OCR

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `job_id` | `BIGINT` | `FK → ocr_ocrjob.id, NOT NULL, CASCADE` | Tâche OCR |
| `page_number` | `INTEGER` | `NOT NULL` | Numéro de page |
| `image_file` | `VARCHAR(500)` | `NULL` | Image de la page |
| `text` | `TEXT` | `NULL` | Texte extrait de cette page |
| `confidence` | `DECIMAL(5,2)` | `NULL` | Confiance de la page (%) |

**Contrainte unique :** `(job_id, page_number)`

---

## 34. `notifications_notification` — Notifications

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `user_id` | `BIGINT` | `FK → users_user.id, NOT NULL` | Destinataire |
| `title` | `VARCHAR(300)` | `NOT NULL` | Titre |
| `message` | `TEXT` | `NOT NULL` | Contenu |
| `type` | `VARCHAR(30)` | `NOT NULL` | `document`, `courrier`, `workflow`, `system`, `user` |
| `icon` | `VARCHAR(50)` | `NULL` | Nom d'icône (Tabler) |
| `link` | `VARCHAR(500)` | `NULL` | Lien vers la ressource |
| `is_read` | `BOOLEAN` | `DEFAULT FALSE` | Lue |
| `related_document_id` | `BIGINT` | `FK → documents_document.id, NULL` | Document lié |
| `related_workflow_id` | `BIGINT` | `FK → workflow_workflowinstance.id, NULL` | Workflow lié |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date de création |

**Index :** `user_id`, `is_read`, `type`, `created_at`

---

## 35. `audit_auditlog` — Journal d'Audit

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `user_id` | `BIGINT` | `FK → users_user.id, NULL` | Utilisateur (NULL = système) |
| `action` | `VARCHAR(50)` | `NOT NULL` | `create`, `read`, `update`, `delete`, `login`, `logout`, `download`, `share`, `archive`, `validate`, `reject` |
| `resource_type` | `VARCHAR(50)` | `NOT NULL` | `document`, `courrier`, `workflow`, `user`, `dossier`, `settings` |
| `resource_id` | `BIGINT` | `NULL` | ID de la ressource |
| `resource_name` | `VARCHAR(500)` | `NULL` | Nom lisible de la ressource |
| `details` | `JSONB` | `NULL` | Détails supplémentaires (ancien/nouveau état) |
| `ip_address` | `INET` | `NULL` | Adresse IP |
| `user_agent` | `TEXT` | `NULL` | Navigateur / Client |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date de l'action |

**Index :** `user_id`, `action`, `resource_type`, `created_at`, `(resource_type, resource_id)`

---

## 36. `settings_app_appsettings` — Paramètres Application

> Table singleton (un seul enregistrement).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `app_name` | `VARCHAR(100)` | `DEFAULT 'AgrOdiv GED'` | Nom de l'application |
| `logo` | `VARCHAR(500)` | `NULL` | Chemin du logo |
| `primary_color` | `VARCHAR(7)` | `DEFAULT '#F59E0B'` | Couleur principale |
| `language` | `VARCHAR(5)` | `DEFAULT 'fr'` | Langue par défaut |
| `timezone` | `VARCHAR(50)` | `DEFAULT 'Africa/Algiers'` | Fuseau horaire |
| `storage_limit` | `BIGINT` | `DEFAULT 10737418240` | Limite stockage (octets, 10 GB) |
| `max_upload_size` | `INTEGER` | `DEFAULT 52428800` | Taille max upload (octets, 50 MB) |
| `ocr_default_language` | `VARCHAR(10)` | `DEFAULT 'fra'` | Langue OCR par défaut |
| `retention_policy` | `INTEGER` | `DEFAULT 365` | Durée de rétention corbeille (jours) |
| `auto_backup` | `BOOLEAN` | `DEFAULT FALSE` | Sauvegarde automatique |
| `updated_at` | `TIMESTAMP` | `AUTO` | Dernière modification |

---

## 37. `settings_app_backuprecord` — Historique des Sauvegardes

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `BIGSERIAL` | `PK` | Identifiant |
| `filename` | `VARCHAR(300)` | `NOT NULL` | Nom du fichier de sauvegarde |
| `size` | `BIGINT` | `NOT NULL` | Taille en octets |
| `type` | `VARCHAR(20)` | `NOT NULL` | `full`, `incremental`, `manual` |
| `status` | `VARCHAR(20)` | `DEFAULT 'completed'` | `in_progress`, `completed`, `failed` |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Date de la sauvegarde |

---

# 📊 Résumé

| Métrique | Valeur |
|----------|--------|
| **Nombre total de tables** | 37 (dont 7 tables Django internes) |
| **Tables métier** | 30 |
| **Clés étrangères (FK)** | ~55 |
| **Relations Many-to-Many** | 1 (`document_tags`) |
| **Champs JSONB** | 2 (`audit.details`, `courrier_historique.details`) |
| **Tables GenericFK** | 2 (`piecejointe`, `courrier_historique`) |
| **Index personnalisés** | ~35 |

---

# 🔑 Valeurs des Champs `status` / `choices`

### Document `status`
```
brouillon → en_revision → valide → archive
                       ↘ rejete
```

### Courrier Entrant `statut`
```
nouveau → lu → en_cours → traite → archive
```

### Courrier Sortant `statut`
```
brouillon → en_signature → signe → envoye → archive
```

### Workflow Instance `status`
```
en_cours → valide
         → rejete
         → annule
```

### Step Execution `status`
```
en_attente → valide
           → rejete
           → expire
```

### OCR Job `status`
```
en_attente → en_cours → termine
                      → erreur
```

### Priorité (courriers / documents)
```
basse | normale | haute | urgente
```

---

# 🔗 Arborescences Hiérarchiques

### Structure Organisationnelle
```
Direction
  └── Département
        └── Service
```

### Localisation Physique
```
Site
  └── Bâtiment
        └── Bureau
              └── Armoire
                    └── Étagère
                          └── Boîte d'archive
```

### Dossiers (self-referencing)
```
Dossier racine
  ├── Sous-dossier 1
  │     └── Sous-sous-dossier
  └── Sous-dossier 2
```

### Catégories (self-referencing)
```
Catégorie parente
  ├── Sous-catégorie 1
  └── Sous-catégorie 2
```

---

> ✅ Ce fichier constitue la spécification complète de la base de données PostgreSQL pour AgrOdiv GED. Il peut servir de référence pour l'implémentation des `models.py` Django et pour la documentation du mémoire/PFE.
