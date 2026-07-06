# 🔗 AgrOdiv GED – Structure d'Intégration Frontend ↔ Backend

> Ce document décrit **toutes les fonctions à implémenter** dans chaque page frontend pour rendre l'application dynamique et connectée au backend Django REST API.

---

## 📐 Architecture Globale de l'Intégration

```
src/
├── utils/
│   ├── api.ts                     ✅ FAIT — Instance Axios + intercepteurs JWT
│   └── formatters.ts              ⬜ À CRÉER — Formateurs de dates, tailles, nombres
│
├── context/
│   ├── AuthContext.tsx             ✅ FAIT — Session utilisateur (login, logout, user)
│   └── ThemeContext.tsx            ⬜ À CRÉER — Thème sombre/clair global
│
├── hooks/
│   ├── useDocuments.ts            ⬜ À CRÉER — Hook CRUD documents
│   ├── useCourriers.ts            ⬜ À CRÉER — Hook CRUD courriers
│   ├── useDossiers.ts             ⬜ À CRÉER — Hook CRUD dossiers
│   ├── useWorkflow.ts             ⬜ À CRÉER — Hook CRUD workflow
│   ├── useUsers.ts                ⬜ À CRÉER — Hook CRUD utilisateurs
│   ├── useOrganization.ts         ⬜ À CRÉER — Hook directions/départements/services
│   ├── useNotifications.ts        ⬜ À CRÉER — Hook notifications
│   ├── useOcr.ts                  ⬜ À CRÉER — Hook OCR
│   ├── useDashboard.ts            ⬜ À CRÉER — Hook KPIs et stats
│   └── usePagination.ts           ⬜ À CRÉER — Hook pagination générique
│
├── services/
│   ├── authService.ts             ⬜ À CRÉER — Fonctions API auth
│   ├── documentService.ts         ⬜ À CRÉER — Fonctions API documents
│   ├── courrierService.ts         ⬜ À CRÉER — Fonctions API courriers
│   ├── dossierService.ts          ⬜ À CRÉER — Fonctions API dossiers
│   ├── workflowService.ts         ⬜ À CRÉER — Fonctions API workflow
│   ├── userService.ts             ⬜ À CRÉER — Fonctions API utilisateurs
│   ├── organizationService.ts     ⬜ À CRÉER — Fonctions API organisation
│   ├── ocrService.ts              ⬜ À CRÉER — Fonctions API OCR
│   ├── notificationService.ts     ⬜ À CRÉER — Fonctions API notifications
│   ├── auditService.ts            ⬜ À CRÉER — Fonctions API audit
│   ├── dashboardService.ts        ⬜ À CRÉER — Fonctions API dashboard/stats
│   ├── settingsService.ts         ⬜ À CRÉER — Fonctions API paramètres
│   └── searchService.ts           ⬜ À CRÉER — Fonctions API recherche globale
│
├── types/
│   └── index.ts                   ⬜ À CRÉER — Interfaces TypeScript de tous les modèles
│
└── pages/                         → 37 pages existantes (statiques, avec MOCK DATA)
```

---

## 📦 Fichiers Partagés à Créer

---

### 1. `src/types/index.ts` — Interfaces TypeScript

> Toutes les interfaces TypeScript correspondant aux modèles Django.

```typescript
// ─── Auth ───
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  phone: string | null;
  role: Role | null;
  department: number | null;
  service: number | null;
  is_active: boolean;
  date_joined: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  is_system: boolean;
}

export interface Permission {
  id: number;
  role: number;
  resource: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_download: boolean;
  can_share: boolean;
  can_approve: boolean;
}

// ─── Organisation ───
export interface Direction {
  id: number;
  name: string;
  code: string;
  description: string | null;
  responsable: number | null;
  is_active: boolean;
}

export interface Departement {
  id: number;
  name: string;
  code: string;
  direction: number;
  description: string | null;
  responsable: number | null;
  is_active: boolean;
}

export interface Service {
  id: number;
  name: string;
  code: string;
  departement: number;
  description: string | null;
  responsable: number | null;
  is_active: boolean;
}

export interface Categorie {
  id: number;
  name: string;
  code: string;
  description: string | null;
  parent: number | null;
  color: string | null;
  is_active: boolean;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  created_by: number | null;
}

export interface Correspondant {
  id: number;
  name: string;
  organisme: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  type: 'interne' | 'externe' | 'institutionnel';
  is_active: boolean;
}

// ─── Localisation Physique ───
export interface Site { id: number; name: string; address: string | null; description: string | null; }
export interface Batiment { id: number; name: string; site: number; description: string | null; }
export interface Bureau { id: number; name: string; batiment: number; floor: string | null; }
export interface Armoire { id: number; name: string; bureau: number; description: string | null; }
export interface Etagere { id: number; name: string; armoire: number; position: number; }
export interface BoiteArchive {
  id: number;
  code: string;
  etagere: number;
  label: string;
  status: 'disponible' | 'pleine' | 'archivee';
  date_creation: string;
}

// ─── Documents ───
export interface Document {
  id: number;
  title: string;
  description: string | null;
  category: number | null;
  direction: number | null;
  departement: number | null;
  service: number | null;
  dossier: number | null;
  status: 'brouillon' | 'en_revision' | 'valide' | 'archive' | 'rejete';
  priority: 'basse' | 'normale' | 'haute' | 'urgente';
  is_archived: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  tags: number[];
  physical_location: string | null;
  boite_archive: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  // Relations incluses (nested)
  files?: DocumentFile[];
  versions?: DocumentVersion[];
}

export interface DocumentFile {
  id: number;
  document: number;
  file: string;
  filename: string;
  mime_type: string;
  size: number;
  checksum: string;
  uploaded_at: string;
}

export interface DocumentVersion {
  id: number;
  document: number;
  version_number: number;
  file: string;
  changelog: string | null;
  created_by: number;
  created_at: string;
}

export interface Favorite {
  id: number;
  user: number;
  document: number;
  created_at: string;
}

// ─── Dossiers ───
export interface Dossier {
  id: number;
  name: string;
  description: string | null;
  parent: number | null;
  direction: number | null;
  departement: number | null;
  service: number | null;
  responsable: number | null;
  default_workflow: number | null;
  ocr_enabled: boolean;
  physical_location: string | null;
  is_archived: boolean;
  created_by: number;
  created_at: string;
}

// ─── Courriers ───
export interface CourrierEntrant {
  id: number;
  numero: string;
  expediteur: string;
  objet: string;
  date_reception: string;
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  statut: 'nouveau' | 'lu' | 'en_cours' | 'traite' | 'archive';
  categorie: string | null;
  direction: number | null;
  departement: number | null;
  service: number | null;
  assigned_to: number | null;
  notes: string | null;
  created_by: number;
  created_at: string;
}

export interface CourrierSortant {
  id: number;
  numero: string;
  reference: string | null;
  destinataire: string;
  organisme: string | null;
  objet: string;
  date_envoi: string | null;
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  statut: 'brouillon' | 'en_signature' | 'signe' | 'envoye' | 'archive';
  auteur: number;
  departement: number | null;
  service: number | null;
  workflow_status: string | null;
  created_by: number;
  created_at: string;
}

// ─── Workflow ───
export interface Workflow {
  id: number;
  name: string;
  description: string | null;
  document_type: string | null;
  departement: number | null;
  responsable: number | null;
  status: 'brouillon' | 'actif' | 'inactif' | 'archive';
  version: number;
  visibility: 'prive' | 'departement' | 'global';
  created_by: number;
  created_at: string;
  steps?: WorkflowStep[];
}

export interface WorkflowStep {
  id: number;
  workflow: number;
  name: string;
  order: number;
  responsable: number | null;
  role: number | null;
  departement: number | null;
  service: number | null;
  delay_days: number;
  is_required: boolean;
  requires_signature: boolean;
}

export interface WorkflowInstance {
  id: number;
  workflow: number;
  document: number;
  current_step: number;
  status: 'en_cours' | 'valide' | 'rejete' | 'annule';
  started_at: string;
  completed_at: string | null;
}

export interface StepExecution {
  id: number;
  instance: number;
  step: number;
  user: number;
  status: 'en_attente' | 'valide' | 'rejete' | 'expire';
  comment: string | null;
  started_at: string;
  completed_at: string | null;
}

// ─── OCR ───
export interface OcrJob {
  id: number;
  document: number;
  source_file: string;
  language: string;
  engine: string;
  status: 'en_attente' | 'en_cours' | 'termine' | 'erreur';
  progress: number;
  error_message: string | null;
  created_by: number;
  created_at: string;
  result?: OcrResult;
  pages?: OcrPage[];
}

export interface OcrResult {
  id: number;
  job: number;
  full_text: string | null;
  confidence: number | null;
  words_count: number;
  paragraphs: number;
  tables_detected: number;
  signatures_detected: number;
  stamps_detected: number;
  processing_time: number | null;
}

export interface OcrPage {
  id: number;
  job: number;
  page_number: number;
  image_file: string | null;
  text: string | null;
  confidence: number | null;
}

// ─── Notifications ───
export interface Notification {
  id: number;
  user: number;
  title: string;
  message: string;
  type: 'document' | 'courrier' | 'workflow' | 'system' | 'user';
  icon: string | null;
  link: string | null;
  is_read: boolean;
  related_document: number | null;
  related_workflow: number | null;
  created_at: string;
}

// ─── Audit ───
export interface AuditLog {
  id: number;
  user: number | null;
  action: string;
  resource_type: string;
  resource_id: number | null;
  resource_name: string | null;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ─── Settings ───
export interface AppSettings {
  id: number;
  app_name: string;
  logo: string | null;
  primary_color: string;
  language: string;
  timezone: string;
  storage_limit: number;
  max_upload_size: number;
  ocr_default_language: string;
  retention_policy: number;
  auto_backup: boolean;
}

export interface BackupRecord {
  id: number;
  filename: string;
  size: number;
  type: 'full' | 'incremental' | 'manual';
  status: 'in_progress' | 'completed' | 'failed';
  created_at: string;
}

// ─── API Response ───
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
```

---

### 2. `src/utils/formatters.ts` — Fonctions Utilitaires

```typescript
formatDate(iso: string): string              // '2024-05-12T10:45:00' → '12/05/2024 10:45'
formatFileSize(bytes: number): string        // 2457600 → '2.4 Mo'
formatNumber(n: number): string              // 1248 → '1 248'
timeAgo(iso: string): string                 // Date → 'Il y a 10 min'
getStatusLabel(status: string): string       // 'en_revision' → 'En révision'
getPriorityLabel(priority: string): string   // 'haute' → 'Haute'
```

---

# 📋 Détail Page par Page

---

## 🔐 1. `LoginPage.tsx` — Page de Connexion

> **État actuel :** ✅ PARTIELLEMENT CONNECTÉ — Appel `POST /api/auth/login/` déjà en place.

| Fonction                         | Endpoint API              | État                     |
| -------------------------------- | ------------------------- | ------------------------- |
| `handleLogin(email, password)` | `POST /api/auth/login/` | ✅ Fait                   |
| `fetchCurrentUser()`           | `GET /api/auth/me/`     | ✅ Fait (via AuthContext) |

**À compléter :**

- [ ] Validation côté client (email format, password min length)
- [ ] Gestion spécifique des erreurs (compte désactivé, mot de passe expiré)
- [ ] Redirection automatique si déjà connecté (`useEffect` + `useAuth`)

---

## 📊 2. `DashboardPage.tsx` — Tableau de Bord

> **État actuel :** ✅ PARTIELLEMENT CONNECTÉ — KPIs dynamiques, nom de l'utilisateur.

| Fonction                   | Endpoint API                             | État       |
| -------------------------- | ---------------------------------------- | ----------- |
| `fetchKpis()`            | `GET /api/dashboard/kpis/`             | ✅ Fait     |
| `fetchRecentDocuments()` | `GET /api/dashboard/recent-documents/` | ⬜ À faire |
| `fetchRecentActivity()`  | `GET /api/dashboard/recent-activity/`  | ⬜ À faire |
| `fetchStorageInfo()`     | `GET /api/dashboard/storage/`          | ⬜ À faire |
| `fetchCalendarEvents()`  | `GET /api/dashboard/calendar/`         | ⬜ À faire |
| `fetchChartData()`       | `GET /api/stats/evolution/`            | ⬜ À faire |

**À compléter :**

- [ ] Remplacer les `recentDocs` mock par `GET /api/dashboard/recent-documents/`
- [ ] Remplacer les `chartData` mock par `GET /api/stats/evolution/`
- [ ] Remplacer les `activities` mock par `GET /api/dashboard/recent-activity/`
- [ ] Charger les événements du calendrier depuis l'API
- [ ] Actions rapides doivent naviguer vers les pages correspondantes

---

## 📁 3. `DocumentsPage.tsx` — Liste des Documents

> **État actuel :** ⬜ STATIQUE — Données mock hardcodées.

| Fonction                    | Endpoint API                                            | Description                          |
| --------------------------- | ------------------------------------------------------- | ------------------------------------ |
| `fetchDocuments(filters)` | `GET /api/documents/`                                 | Lister avec filtres, tri, pagination |
| `searchDocuments(query)`  | `GET /api/documents/?search=query`                    | Recherche dans les documents         |
| `deleteDocument(id)`      | `DELETE /api/documents/{id}/`                         | Mettre à la corbeille               |
| `archiveDocument(id)`     | `POST /api/documents/{id}/archive/`                   | Archiver                             |
| `downloadDocument(id)`    | `GET /api/documents/{id}/download/`                   | Télécharger le fichier             |
| `toggleFavorite(id)`      | `POST /api/favoris/` ou `DELETE /api/favoris/{id}/` | Ajouter/retirer des favoris          |
| `fetchKpis()`             | `GET /api/dashboard/kpis/` ou agrégat local          | KPIs en haut de page                 |

**À compléter :**

- [ ] Remplacer `const documents = [...]` par `useEffect` + `api.get('documents/')`
- [ ] Implémenter la pagination (backend renvoie `count`, `next`, `previous`)
- [ ] Filtres dynamiques : par catégorie, statut, priorité, direction → query params
- [ ] Toggle d'affichage grille/liste (déjà UI, relier les données)
- [ ] Bouton "Nouveau document" → naviguer vers `/upload`
- [ ] Tri par colonnes : date, titre, taille → `?ordering=created_at`

---

## 📄 4. `DocumentDetailPage.tsx` — Détail d'un Document

> **État actuel :** ⬜ STATIQUE — Mock d'un seul document.

| Fonction                     | Endpoint API                                         | Description                   |
| ---------------------------- | ---------------------------------------------------- | ----------------------------- |
| `fetchDocument(id)`        | `GET /api/documents/{id}/`                         | Charger les détails complets |
| `updateDocument(id, data)` | `PUT /api/documents/{id}/`                         | Modifier les métadonnées    |
| `deleteDocument(id)`       | `DELETE /api/documents/{id}/`                      | Supprimer (corbeille)         |
| `downloadDocument(id)`     | `GET /api/documents/{id}/download/`                | Télécharger                 |
| `previewDocument(id)`      | `GET /api/documents/{id}/preview/`                 | Aperçu inline                |
| `fetchVersions(id)`        | `GET /api/documents/{id}/versions/`                | Historique des versions       |
| `createVersion(id, file)`  | `POST /api/documents/{id}/versions/`               | Créer nouvelle version       |
| `restoreVersion(id, vid)`  | `POST /api/documents/{id}/versions/{vid}/restore/` | Restaurer une version         |
| `fetchRelations(id)`       | `GET /api/documents/{id}/relations/`               | Documents liés               |
| `createRelation(id, data)` | `POST /api/documents/{id}/relations/`              | Créer une relation           |
| `shareDocument(id, data)`  | `POST /api/documents/{id}/share/`                  | Partager                      |
| `archiveDocument(id)`      | `POST /api/documents/{id}/archive/`                | Archiver                      |
| `toggleFavorite(id)`       | `POST/DELETE /api/favoris/`                        | Favori                        |

**À compléter :**

- [ ] Charger les données via `api.get('documents/${id}/')` au montage
- [ ] Afficher les tags du document (depuis M2M)
- [ ] Module de preview PDF (intégrer `<iframe>` ou `react-pdf`)
- [ ] Section versions : liste + upload de nouvelle version
- [ ] Section relations : documents annexes / références
- [ ] Boutons d'action : télécharger, partager, archiver, supprimer

---

## ⬆️ 5. `UploadPage.tsx` — Nouveau Document

> **État actuel :** ⬜ STATIQUE — Formulaire en lecture seule, pas de submit.

| Fonction                     | Endpoint API                               | Description                      |
| ---------------------------- | ------------------------------------------ | -------------------------------- |
| `createDocument(formData)` | `POST /api/documents/`                   | Créer un document + upload      |
| `uploadFile(id, file)`     | `POST /api/documents/{id}/upload/`       | Uploader le fichier              |
| `fetchCategories()`        | `GET /api/categories/`                   | Charger les catégories (select) |
| `fetchDossiers()`          | `GET /api/dossiers/`                     | Charger les dossiers (select)    |
| `fetchDirections()`        | `GET /api/directions/`                   | Charger les directions (select)  |
| `fetchDepartements(dir)`   | `GET /api/departements/?direction={dir}` | Dép. filtrés par direction     |
| `fetchServices(dep)`       | `GET /api/services/?departement={dep}`   | Services filtrés par dép.      |
| `fetchTags()`              | `GET /api/tags/`                         | Charger les tags (multi-select)  |

**À compléter :**

- [ ] Formulaire contrôlé avec `useState` pour chaque champ
- [ ] Upload de fichier avec `FormData` et `Content-Type: multipart/form-data`
- [ ] Sélecteurs en cascade : Direction → Département → Service
- [ ] Multi-select pour les tags
- [ ] Barre de progression d'upload (Axios `onUploadProgress`)
- [ ] Validation : taille max, types autorisés (via settings)
- [ ] Drag & Drop pour le fichier
- [ ] Redirection vers `/documents/{id}` après création

---

## 🔍 6. `SearchPage.tsx` — Recherche Avancée

> **État actuel :** ⬜ STATIQUE — UI de recherche sans backend.

| Fonction                    | Endpoint API                             | Description                  |
| --------------------------- | ---------------------------------------- | ---------------------------- |
| `globalSearch(query)`     | `GET /api/search/?q=query`             | Recherche tous types         |
| `searchDocuments(params)` | `GET /api/search/documents/`           | Recherche avancée documents |
| `searchCourriers(params)` | `GET /api/search/courriers/`           | Recherche courriers          |
| `getSuggestions(query)`   | `GET /api/search/suggestions/?q=query` | Auto-complétion             |

**À compléter :**

- [ ] Input de recherche avec debounce (300ms) pour suggestions
- [ ] Filtres avancés : type MIME, catégorie, date range, statut
- [ ] Affichage des résultats mixtes (docs + courriers + dossiers)
- [ ] Highlight du texte trouvé dans les résultats
- [ ] Pagination des résultats

---

## ⭐ 7. `FavorisPage.tsx` — Documents Favoris

> **État actuel :** ⬜ STATIQUE — Liste mock.

| Fonction                | Endpoint API                     | Description                              |
| ----------------------- | -------------------------------- | ---------------------------------------- |
| `fetchFavorites()`    | `GET /api/favoris/`            | Lister tous les favoris de l'utilisateur |
| `removeFavorite(id)`  | `DELETE /api/favoris/{id}/`    | Retirer un favori                        |
| `openDocument(docId)` | Navigation →`/documents/{id}` | Ouvrir le document                       |

**À compléter :**

- [ ] Charger les favoris au montage
- [ ] Bouton "Retirer" avec confirmation
- [ ] Tri et recherche dans les favoris

---

## 🗑️ 8. `CorbeillePage.tsx` — Corbeille

> **État actuel :** ⬜ STATIQUE — Mock de documents supprimés.

| Fonction                | Endpoint API                              | Description                 |
| ----------------------- | ----------------------------------------- | --------------------------- |
| `fetchTrash()`        | `GET /api/documents/trash/`             | Documents dans la corbeille |
| `restoreDocument(id)` | `POST /api/documents/{id}/restore/`     | Restaurer                   |
| `permanentDelete(id)` | `DELETE /api/documents/{id}/permanent/` | Suppression définitive     |
| `emptyTrash()`        | `POST /api/documents/trash/empty/`      | Vider toute la corbeille    |

**À compléter :**

- [ ] Charger les documents supprimés au montage
- [ ] Actions par lot (sélection multi + restaurer/supprimer)
- [ ] Confirmation de suppression permanente (modal)
- [ ] Afficher la date de suppression et le temps restant avant purge

---

## 📂 9. `GestionDossiersPage.tsx` — Dossiers

> **État actuel :** ⬜ STATIQUE — Arborescence visuelle mock.

| Fonction                    | Endpoint API                            | Description                    |
| --------------------------- | --------------------------------------- | ------------------------------ |
| `fetchDossiers()`         | `GET /api/dossiers/`                  | Lister les dossiers            |
| `createDossier(data)`     | `POST /api/dossiers/`                 | Créer un dossier              |
| `updateDossier(id, data)` | `PUT /api/dossiers/{id}/`             | Modifier                       |
| `deleteDossier(id)`       | `DELETE /api/dossiers/{id}/`          | Supprimer                      |
| `fetchTree(id)`           | `GET /api/dossiers/{id}/tree/`        | Arborescence complète         |
| `fetchContent(id)`        | `GET /api/dossiers/{id}/content/`     | Contenu (docs + sous-dossiers) |
| `fetchStats(id)`          | `GET /api/dossiers/{id}/stats/`       | Stats du dossier               |
| `moveDossier(id, target)` | `POST /api/dossiers/{id}/move/`       | Déplacer un dossier           |
| `fetchPermissions(id)`    | `GET /api/dossiers/{id}/permissions/` | Permissions                    |
| `updatePermissions(id)`   | `PUT /api/dossiers/{id}/permissions/` | Modifier les permissions       |

**À compléter :**

- [ ] Construire l'arborescence imbriquée (récursive) depuis les données `parent`
- [ ] Drag & Drop pour déplacer les dossiers
- [ ] Modal de création/édition de dossier
- [ ] Panneau latéral : stats + permissions du dossier sélectionné
- [ ] Clic sur un dossier charge son contenu (docs + sous-dossiers)

---

## 📨 10. `CourriersEntrantsPage.tsx` — Courriers Entrants

> **État actuel :** ⬜ STATIQUE — 10 courriers mock.

| Fonction                       | Endpoint API                                            | Description         |
| ------------------------------ | ------------------------------------------------------- | ------------------- |
| `fetchCourriers(filters)`    | `GET /api/courriers/entrants/`                        | Lister avec filtres |
| `createCourrier(data)`       | `POST /api/courriers/entrants/`                       | Créer              |
| `getCourrier(id)`            | `GET /api/courriers/entrants/{id}/`                   | Détail             |
| `updateCourrier(id, data)`   | `PUT /api/courriers/entrants/{id}/`                   | Modifier            |
| `deleteCourrier(id)`         | `DELETE /api/courriers/entrants/{id}/`                | Supprimer           |
| `markRead(id)`               | `POST /api/courriers/entrants/{id}/mark-read/`        | Marquer lu          |
| `markTreated(id)`            | `POST /api/courriers/entrants/{id}/mark-treated/`     | Marquer traité     |
| `transferCourrier(id, data)` | `POST /api/courriers/entrants/{id}/transfer/`         | Transférer         |
| `assignCourrier(id, userId)` | `POST /api/courriers/entrants/{id}/assign/`           | Assigner            |
| `getHistory(id)`             | `GET /api/courriers/entrants/{id}/history/`           | Historique          |
| `uploadAttachment(id, file)` | `POST /api/courriers/{id}/attachments/`               | Pièce jointe       |
| `downloadAttachment(id,aid)` | `GET /api/courriers/{id}/attachments/{aid}/download/` | Télécharger PJ    |

**À compléter :**

- [ ] Remplacer les `const courriers` mock par l'API
- [ ] Modal de création d'un nouveau courrier entrant
- [ ] Panneau latéral de détail (clic sur une ligne)
- [ ] Actions sur chaque ligne : marquer lu, transférer, assigner, archiver
- [ ] Upload de pièces jointes dans le panneau de détail
- [ ] Pagination et filtres (priorité, statut, date, direction)

---

## 📤 11. `CourriersSortantsPage.tsx` — Courriers Sortants

> **État actuel :** ⬜ STATIQUE — Mock de courriers sortants.

| Fonction                     | Endpoint API                                   | Description     |
| ---------------------------- | ---------------------------------------------- | --------------- |
| `fetchCourriers(filters)`  | `GET /api/courriers/sortants/`               | Lister          |
| `createCourrier(data)`     | `POST /api/courriers/sortants/`              | Créer          |
| `getCourrier(id)`          | `GET /api/courriers/sortants/{id}/`          | Détail         |
| `updateCourrier(id, data)` | `PUT /api/courriers/sortants/{id}/`          | Modifier        |
| `deleteCourrier(id)`       | `DELETE /api/courriers/sortants/{id}/`       | Supprimer       |
| `sendCourrier(id)`         | `POST /api/courriers/sortants/{id}/send/`    | Marquer envoyé |
| `signCourrier(id)`         | `POST /api/courriers/sortants/{id}/sign/`    | Signer          |
| `archiveCourrier(id)`      | `POST /api/courriers/sortants/{id}/archive/` | Archiver        |
| `getHistory(id)`           | `GET /api/courriers/sortants/{id}/history/`  | Historique      |

**À compléter :**

- [ ] Même structure que les entrants mais avec le cycle de vie sortant
- [ ] Boutons d'action différents : "Envoyer", "Signer", "Archiver"
- [ ] Modal de rédaction d'un nouveau courrier sortant
- [ ] Sélecteur de destinataire (depuis correspondants)
- [ ] Pièces jointes

---

## 📡 12. `DiffusionPage.tsx` — Diffusion de Courriers

> **État actuel :** ⬜ STATIQUE — Placeholder.

| Fonction                  | Endpoint API                        | Description                 |
| ------------------------- | ----------------------------------- | --------------------------- |
| `fetchDiffusions()`     | `GET /api/courriers/diffusions/`  | Lister les diffusions       |
| `createDiffusion(data)` | `POST /api/courriers/diffusions/` | Créer une diffusion        |
| `fetchUsers()`          | `GET /api/users/`                 | Sélecteur de destinataires |

**À compléter :**

- [ ] Formulaire de diffusion : sélection courrier + multi-sélection destinataires
- [ ] Historique des diffusions avec statut

---

## ⚙️ 13. `WorkflowPage.tsx` — Circuit de Validation

> **État actuel :** ⬜ STATIQUE — UI riche avec mock.

| Fonction                        | Endpoint API                                    | Description          |
| ------------------------------- | ----------------------------------------------- | -------------------- |
| `fetchWorkflows()`            | `GET /api/workflows/`                         | Lister les workflows |
| `createWorkflow(data)`        | `POST /api/workflows/`                        | Créer               |
| `updateWorkflow(id, data)`    | `PUT /api/workflows/{id}/`                    | Modifier             |
| `deleteWorkflow(id)`          | `DELETE /api/workflows/{id}/`                 | Supprimer            |
| `activateWorkflow(id)`        | `POST /api/workflows/{id}/activate/`          | Activer              |
| `deactivateWorkflow(id)`      | `POST /api/workflows/{id}/deactivate/`        | Désactiver          |
| `fetchSteps(id)`              | `GET /api/workflows/{id}/steps/`              | Étapes              |
| `createStep(id, data)`        | `POST /api/workflows/{id}/steps/`             | Ajouter étape       |
| `updateStep(id, sid, data)`   | `PUT /api/workflows/{id}/steps/{sid}/`        | Modifier étape      |
| `deleteStep(id, sid)`         | `DELETE /api/workflows/{id}/steps/{sid}/`     | Supprimer étape     |
| `fetchInstances()`            | `GET /api/workflow-instances/`                | Instances en cours   |
| `startInstance(data)`         | `POST /api/workflow-instances/`               | Démarrer            |
| `validateStep(instId)`        | `POST /api/workflow-instances/{id}/validate/` | Valider              |
| `rejectStep(instId, comment)` | `POST /api/workflow-instances/{id}/reject/`   | Rejeter              |
| `fetchKpis()`                 | `GET /api/workflows/kpis/`                    | Statistiques         |

**À compléter :**

- [ ] Tableau des workflows depuis l'API
- [ ] Éditeur visuel des étapes (drag & drop pour réordonner)
- [ ] Panneau latéral des instances en cours
- [ ] Boutons "Valider" / "Rejeter" avec modal de commentaire
- [ ] KPIs dynamiques en haut de page
- [ ] Filtre par statut, département

---

## 🔬 14. `OcrPage.tsx` — Résultats OCR

> **État actuel :** ⬜ STATIQUE — UI de visualisation mock.

| Fonction                    | Endpoint API                      | Description                  |
| --------------------------- | --------------------------------- | ---------------------------- |
| `fetchJobs()`             | `GET /api/ocr/jobs/`            | Lister les jobs OCR          |
| `processOcr(docId, lang)` | `POST /api/ocr/process/`        | Lancer l'OCR                 |
| `getResult(jobId)`        | `GET /api/ocr/{id}/`            | Résultat d'un job           |
| `updateText(id, text)`    | `PUT /api/ocr/{id}/text/`       | Corriger le texte extrait    |
| `reprocessOcr(id)`        | `POST /api/ocr/{id}/reprocess/` | Relancer                     |
| `validateOcr(id)`         | `POST /api/ocr/{id}/validate/`  | Valider les résultats       |
| `downloadOcrPdf(id)`      | `GET /api/ocr/{id}/download/`   | Télécharger PDF avec texte |

**À compléter :**

- [ ] Vue comparative : image de la page ↔ texte extrait
- [ ] Édition du texte directement dans l'interface
- [ ] Statistiques de confiance par page
- [ ] Barre de progression pendant le traitement

---

## 📷 15. `ScannerPage.tsx` — Scanner de Documents

> **État actuel :** ⬜ STATIQUE — Interface de scan mock.

| Fonction                    | Endpoint API               | Description            |
| --------------------------- | -------------------------- | ---------------------- |
| `uploadScannedFile(file)` | `POST /api/documents/`   | Créer doc depuis scan |
| `launchOcr(docId)`        | `POST /api/ocr/process/` | Lancer OCR automatique |

**À compléter :**

- [ ] Accès caméra/scanner via `navigator.mediaDevices`
- [ ] Capture et upload d'image
- [ ] Création automatique du document + lancement OCR

---

## 🔔 16. `NotificationsPage.tsx` — Notifications

> **État actuel :** ⬜ STATIQUE — Liste mock.

| Fonction                   | Endpoint API                             | Description     |
| -------------------------- | ---------------------------------------- | --------------- |
| `fetchNotifications()`   | `GET /api/notifications/`              | Lister          |
| `getUnreadCount()`       | `GET /api/notifications/unread-count/` | Badge non-lues  |
| `markRead(id)`           | `POST /api/notifications/{id}/read/`   | Marquer lue     |
| `markAllRead()`          | `POST /api/notifications/read-all/`    | Tout marquer lu |
| `deleteNotification(id)` | `DELETE /api/notifications/{id}/`      | Supprimer       |
| `clearAll()`             | `DELETE /api/notifications/clear/`     | Tout supprimer  |

**À compléter :**

- [ ] Charger les notifications au montage
- [ ] Badge dans le header/sidebar (compteur non-lues)
- [ ] Clic sur une notification → navigation vers la ressource liée
- [ ] Séparer par type (document, courrier, workflow, système)
- [ ] Polling toutes les 30s ou WebSocket pour temps réel

---

## 📋 17. `AuditLogPage.tsx` — Journal d'Audit

> **État actuel :** ⬜ STATIQUE — Tableau mock.

| Fonction                 | Endpoint API                          | Description           |
| ------------------------ | ------------------------------------- | --------------------- |
| `fetchLogs(filters)`   | `GET /api/audit/`                   | Lister avec filtres   |
| `getLogDetail(id)`     | `GET /api/audit/{id}/`              | Détail d'un log      |
| `exportLogs(format)`   | `GET /api/audit/export/?format=csv` | Exporter CSV/PDF      |
| `getAuditStats()`      | `GET /api/audit/stats/`             | Statistiques          |
| `getUserAudit(userId)` | `GET /api/audit/user/{uid}/`        | Logs d'un utilisateur |

**À compléter :**

- [ ] Tableau paginé avec filtres (action, utilisateur, type, date range)
- [ ] Bouton d'export CSV + PDF
- [ ] Modal de détail (JSON des anciens/nouveaux champs)
- [ ] Graphique d'activité (chart des actions par jour)

---

## 📈 18. `StatistiquesPage.tsx` — Statistiques

> **État actuel :** ⬜ STATIQUE — Graphiques avec données mock.

| Fonction                 | Endpoint API                          | Description                   |
| ------------------------ | ------------------------------------- | ----------------------------- |
| `fetchDocStats()`      | `GET /api/stats/documents/`         | Stats documents               |
| `fetchCourrierStats()` | `GET /api/stats/courriers/`         | Stats courriers               |
| `fetchUserStats()`     | `GET /api/stats/users/`             | Stats utilisateurs            |
| `fetchStorageStats()`  | `GET /api/stats/storage/`           | Stats stockage                |
| `fetchEvolution()`     | `GET /api/stats/evolution/`         | Courbes temporelles           |
| `fetchByCategory()`    | `GET /api/stats/by-category/`       | Répartition par catégorie   |
| `fetchByDepartment()`  | `GET /api/stats/by-department/`     | Répartition par département |
| `exportStats(format)`  | `GET /api/stats/export/?format=pdf` | Exporter                      |

**À compléter :**

- [ ] Remplacer toutes les données mock des graphiques Recharts
- [ ] Filtres par période (7j, 30j, 90j, 1an, personnalisé)
- [ ] Export PDF du rapport statistique
- [ ] Charts par catégorie et par département

---

## 👥 19. `UsersPage.tsx` — Gestion des Utilisateurs

> **État actuel :** ⬜ STATIQUE — 8 utilisateurs mock.

| Fonction                   | Endpoint API                        | Description                 |
| -------------------------- | ----------------------------------- | --------------------------- |
| `fetchUsers(filters)`    | `GET /api/users/`                 | Lister                      |
| `createUser(data)`       | `POST /api/users/`                | Créer                      |
| `getUser(id)`            | `GET /api/users/{id}/`            | Détail                     |
| `updateUser(id, data)`   | `PUT /api/users/{id}/`            | Modifier                    |
| `deleteUser(id)`         | `DELETE /api/users/{id}/`         | Supprimer                   |
| `toggleActive(id)`       | `PATCH /api/users/{id}/activate/` | Activer/Désactiver         |
| `uploadAvatar(id, file)` | `POST /api/users/profile/avatar/` | Photo de profil             |
| `fetchRoles()`           | `GET /api/roles/`                 | Pour le sélecteur de rôle |
| `fetchDepartements()`    | `GET /api/departements/`          | Pour le sélecteur          |

**À compléter :**

- [ ] Remplacer `const usersList` par l'API
- [ ] Modal de création avec formulaire complet
- [ ] Filtres par département, rôle, statut actif
- [ ] Bouton toggle actif/inactif avec `PATCH`
- [ ] Modal d'édition de profil
- [ ] Upload d'avatar

---

## 🔑 20. `RolesPermissionsPage.tsx` — Rôles & Permissions

> **État actuel :** ⬜ STATIQUE — Matrice de permissions mock.

| Fonction                      | Endpoint API                         | Description            |
| ----------------------------- | ------------------------------------ | ---------------------- |
| `fetchRoles()`              | `GET /api/roles/`                  | Lister les rôles      |
| `createRole(data)`          | `POST /api/roles/`                 | Créer un rôle        |
| `updateRole(id, data)`      | `PUT /api/roles/{id}/`             | Modifier               |
| `deleteRole(id)`            | `DELETE /api/roles/{id}/`          | Supprimer              |
| `getPermissions(roleId)`    | `GET /api/roles/{id}/permissions/` | Permissions d'un rôle |
| `updatePermissions(roleId)` | `PUT /api/roles/{id}/permissions/` | Modifier permissions   |

**À compléter :**

- [ ] Charger la matrice des permissions depuis l'API
- [ ] Toggle checkboxes → `PUT` permissions
- [ ] Protection des rôles système (`is_system = true`)
- [ ] Modal de création de nouveau rôle

---

## 👤 21. `ProfilPage.tsx` — Profil Utilisateur

> **État actuel :** ⬜ STATIQUE — Profil mock.

| Fonction                 | Endpoint API                        | Description          |
| ------------------------ | ----------------------------------- | -------------------- |
| `fetchProfile()`       | `GET /api/users/profile/`         | Mon profil           |
| `updateProfile(data)`  | `PUT /api/users/profile/`         | Modifier             |
| `uploadAvatar(file)`   | `POST /api/users/profile/avatar/` | Photo                |
| `changePassword(data)` | `POST /api/auth/password/change/` | Changer mot de passe |

**À compléter :**

- [ ] Charger les infos du profil (prénom, nom, email, téléphone, département)
- [ ] Formulaire d'édition inline
- [ ] Upload d'avatar avec preview
- [ ] Section "Sécurité" pour changer le mot de passe

---

## 🏢 22-27. Pages Organisation (Admin)

> Ces 6 pages suivent toutes le même pattern CRUD simple.

### `DirectionsPage.tsx`

| `fetchDirections()` | `GET /api/directions/` |
| `createDirection(data)` | `POST /api/directions/` |
| `updateDirection(id, data)` | `PUT /api/directions/{id}/` |
| `deleteDirection(id)` | `DELETE /api/directions/{id}/` |

### `DepartementsPage.tsx`

| `fetchDepartements()` | `GET /api/departements/` |
| `createDepartement(data)` | `POST /api/departements/` |
| `updateDepartement(id, data)` | `PUT /api/departements/{id}/` |
| `deleteDepartement(id)` | `DELETE /api/departements/{id}/` |
| `fetchDirections()` | `GET /api/directions/` | Pour sélecteur FK |

### `ServicesPage.tsx`

| `fetchServices()` | `GET /api/services/` |
| `createService(data)` | `POST /api/services/` |
| `updateService(id, data)` | `PUT /api/services/{id}/` |
| `deleteService(id)` | `DELETE /api/services/{id}/` |
| `fetchDepartements()` | `GET /api/departements/` | Pour sélecteur FK |

### `CategoriesPage.tsx`

| `fetchCategories()` | `GET /api/categories/` |
| `createCategorie(data)` | `POST /api/categories/` |
| `updateCategorie(id, data)` | `PUT /api/categories/{id}/` |
| `deleteCategorie(id)` | `DELETE /api/categories/{id}/` |

### `TagsPage.tsx`

| `fetchTags()` | `GET /api/tags/` |
| `createTag(data)` | `POST /api/tags/` |
| `updateTag(id, data)` | `PUT /api/tags/{id}/` |
| `deleteTag(id)` | `DELETE /api/tags/{id}/` |

### `CorrespondantsPage.tsx`

| `fetchCorrespondants()` | `GET /api/correspondants/` |
| `createCorrespondant(data)` | `POST /api/correspondants/` |
| `updateCorrespondant(id, data)` | `PUT /api/correspondants/{id}/` |
| `deleteCorrespondant(id)` | `DELETE /api/correspondants/{id}/` |

**Pattern commun à compléter :**

- [ ] Hook CRUD générique `useCrud<T>(endpoint)`
- [ ] Modal de création/édition (formulaire dynamique)
- [ ] Confirmation avant suppression
- [ ] Recherche et filtres dans le tableau

---

## 🗄️ 28-29. Pages Archives Physiques

### `ArchivesPhysiquesPage.tsx`

| Fonction                     | Endpoint API                        |
| ---------------------------- | ----------------------------------- |
| `fetchSites()`             | `GET /api/sites/`                 |
| `fetchBatiments(siteId)`   | `GET /api/batiments/?site={id}`   |
| `fetchBureaux(batId)`      | `GET /api/bureaux/?batiment={id}` |
| `fetchArmoires(bureauId)`  | `GET /api/armoires/?bureau={id}`  |
| `fetchEtageres(armoireId)` | `GET /api/etageres/?armoire={id}` |
| CRUD pour chaque niveau      | `POST/PUT/DELETE` correspondants  |

### `BoitesArchivesPage.tsx`

| `fetchBoites(filters)` | `GET /api/boites-archives/` |
| `createBoite(data)` | `POST /api/boites-archives/` |
| `updateBoite(id, data)` | `PUT /api/boites-archives/{id}/` |
| `deleteBoite(id)` | `DELETE /api/boites-archives/{id}/` |

**À compléter :**

- [ ] Navigation en cascade : Site → Bâtiment → Bureau → Armoire → Étagère → Boîte
- [ ] Vue hiérarchique (tree view)
- [ ] Affichage du statut de chaque boîte (disponible, pleine, archivée)

---

## 📊 30. `HistoriqueVersionsPage.tsx`

| Fonction                       | Endpoint API                                         |
| ------------------------------ | ---------------------------------------------------- |
| `fetchVersions(docId)`       | `GET /api/documents/{id}/versions/`                |
| `restoreVersion(docId, vid)` | `POST /api/documents/{id}/versions/{vid}/restore/` |
| `downloadVersion(file)`      | Direct download du fichier                           |

---

## ⚙️ 31. `SettingsPage.tsx` — Paramètres

> **État actuel :** ⬜ STATIQUE.

| Fonction                  | Endpoint API                                 | Description             |
| ------------------------- | -------------------------------------------- | ----------------------- |
| `fetchSettings()`       | `GET /api/settings/`                       | Charger les paramètres |
| `updateSettings(data)`  | `PUT /api/settings/`                       | Sauvegarder             |
| `fetchStorageDetails()` | `GET /api/settings/storage/`               | Détails stockage       |
| `createBackup()`        | `POST /api/settings/backup/`               | Déclencher sauvegarde  |
| `fetchBackups()`        | `GET /api/settings/backups/`               | Historique sauvegardes  |
| `restoreBackup(id)`     | `POST /api/settings/backups/{id}/restore/` | Restaurer               |

**À compléter :**

- [ ] Formulaire : nom de l'app, logo, couleur, langue, timezone
- [ ] Section stockage avec jauge visuelle
- [ ] Section sauvegardes avec historique + bouton "Sauvegarder maintenant"
- [ ] Protection admin uniquement (`is_staff`)

---

## ℹ️ 32. `AProposPage.tsx`

| Fonction             | Endpoint API                 |
| -------------------- | ---------------------------- |
| `fetchAboutInfo()` | `GET /api/settings/about/` |

---

## 💬 33. `MessageriePage.tsx`

> **Note :** La messagerie n'est pas incluse dans le backend actuel (supprimée lors de la review v2.0).
> **Décision :** La page reste en mode UI-only, ou bien on implémente un backend de messagerie interne dans le futur.

---

## 📄 34-35. Pages Documents Filtrées

### `DocumentsActifsPage.tsx`

- Réutilise `DocumentsPage` avec filtre `?is_deleted=false&is_archived=false`

### `DocumentsRecentsPage.tsx`

- Réutilise `DocumentsPage` avec `?ordering=-created_at&page_size=20`

---

## 📺 36. `VisionneusePdfPage.tsx`

| Fonction                   | Endpoint API                          |
| -------------------------- | ------------------------------------- |
| `getDocumentPreview(id)` | `GET /api/documents/{id}/preview/`  |
| `downloadDocument(id)`   | `GET /api/documents/{id}/download/` |

**À compléter :**

- [ ] Intégrer `react-pdf` ou `<iframe>` pour afficher le PDF
- [ ] Zoom, navigation entre pages, téléchargement

---

# 📊 Résumé Quantitatif

| Métrique                                | Valeur                              |
| ---------------------------------------- | ----------------------------------- |
| **Pages frontend totales**         | 37                                  |
| **Pages connectées**              | 2 (Login + Dashboard partiellement) |
| **Pages à connecter**             | 35                                  |
| **Fonctions API à implémenter**  | ~130                                |
| **Services à créer**             | 13                                  |
| **Hooks customs à créer**        | 10                                  |
| **Fichiers types à créer**       | 1 (types/index.ts)                  |
| **Fichiers utilitaires à créer** | 1 (utils/formatters.ts)             |

---

# 🗓️ Ordre de Développement Recommandé

| Phase                               | Pages                                                                                | Priorité    |
| ----------------------------------- | ------------------------------------------------------------------------------------ | ------------ |
| **Phase 1 — Auth & Core**    | LoginPage ✅, ProfilPage, DashboardPage                                              | 🔴 Critique  |
| **Phase 2 — Documents**      | DocumentsPage, DocumentDetailPage, UploadPage, FavorisPage, CorbeillePage            | 🔴 Critique  |
| **Phase 3 — Courriers**      | CourriersEntrantsPage, CourriersSortantsPage, DiffusionPage                          | 🟠 Important |
| **Phase 4 — Dossiers**       | GestionDossiersPage, CategoriesPage, TagsPage                                        | 🟠 Important |
| **Phase 5 — Workflow**       | WorkflowPage                                                                         | 🟠 Important |
| **Phase 6 — OCR**            | OcrPage, ScannerPage                                                                 | 🟡 Moyen     |
| **Phase 7 — Administration** | UsersPage, RolesPermissionsPage, Directions, Départements, Services, Correspondants | 🟡 Moyen     |
| **Phase 8 — Système**       | NotificationsPage, AuditLogPage, StatistiquesPage, SettingsPage                      | 🟢 Normal    |
| **Phase 9 — Archives**       | ArchivesPhysiquesPage, BoitesArchivesPage, HistoriqueVersionsPage                    | 🟢 Normal    |
| **Phase 10 — Finition**      | SearchPage, VisionneusePdfPage, AProposPage, MessageriePage                          | 🔵 Bonus     |

---

> ✅ **Ce fichier constitue le plan d'intégration complet Frontend ↔ Backend pour AgrOdiv GED.** Chaque checkbox `[ ]` représente une tâche unitaire d'implémentation.
