# 🛠️ AgrOdiv GED — Guide de Résolution Complet (Phase Finale)

> Ce guide détaille **chaque problème identifié** dans la revue totale et fournit les **instructions exactes** (code, commandes, fichiers) pour les résoudre. Suivez les étapes dans l'ordre de priorité.

---

## PHASE 1 — PRIORITÉ HAUTE (Bloquant MVP)

---

### 1.1 Créer les 6 Services TypeScript Manquants

Ces fichiers sont le pont entre vos pages React et les APIs backend. Sans eux, les pages ne peuvent pas communiquer avec le serveur.

#### 📄 Fichier 1 : `src/services/users.ts`

```typescript
import api from '../utils/api';

export const usersService = {
  getUsers: async (params?: any) => {
    const response = await api.get('/users/', { params });
    return response.data;
  },
  getUser: async (id: number) => {
    const response = await api.get(`/users/${id}/`);
    return response.data;
  },
  createUser: async (data: any) => {
    const response = await api.post('/users/', data);
    return response.data;
  },
  updateUser: async (id: number, data: any) => {
    const response = await api.patch(`/users/${id}/`, data);
    return response.data;
  },
  deleteUser: async (id: number) => {
    await api.delete(`/users/${id}/`);
  },
  // Rôles
  getRoles: async () => {
    const response = await api.get('/users/roles/');
    return response.data;
  },
  createRole: async (data: any) => {
    const response = await api.post('/users/roles/', data);
    return response.data;
  },
  updateRole: async (id: number, data: any) => {
    const response = await api.patch(`/users/roles/${id}/`, data);
    return response.data;
  },
  deleteRole: async (id: number) => {
    await api.delete(`/users/roles/${id}/`);
  },
  // Permissions
  getPermissions: async (params?: any) => {
    const response = await api.get('/users/permissions/', { params });
    return response.data;
  },
};
```

#### 📄 Fichier 2 : `src/services/organization.ts`

```typescript
import api from '../utils/api';

// Fabrique de service CRUD générique pour chaque ressource d'organisation
const createCrudService = (basePath: string) => ({
  getAll: async (params?: any) => {
    const response = await api.get(basePath, { params });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`${basePath}${id}/`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post(basePath, data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.patch(`${basePath}${id}/`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`${basePath}${id}/`);
  },
});

export const directionsService    = createCrudService('/organization/directions/');
export const departementsService  = createCrudService('/organization/departements/');
export const servicesService      = createCrudService('/organization/services/');
export const categoriesService    = createCrudService('/organization/categories/');
export const tagsService          = createCrudService('/organization/tags/');
export const correspondantsService = createCrudService('/organization/correspondants/');
export const sitesService         = createCrudService('/organization/sites/');
export const batimentsService     = createCrudService('/organization/batiments/');
export const bureauxService       = createCrudService('/organization/bureaux/');
export const armoiresService      = createCrudService('/organization/armoires/');
export const etageresService      = createCrudService('/organization/etageres/');
export const boitesArchivesService = createCrudService('/organization/boites-archives/');
```

#### 📄 Fichier 3 : `src/services/notifications.ts`

```typescript
import api from '../utils/api';

export const notificationsService = {
  getAll: async (params?: any) => {
    const response = await api.get('/notifications/', { params });
    return response.data;
  },
  markRead: async (id: number) => {
    const response = await api.post(`/notifications/${id}/mark_read/`);
    return response.data;
  },
  markAllRead: async () => {
    const response = await api.post('/notifications/mark_all_read/');
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread_count/');
    return response.data;
  },
  clear: async () => {
    await api.delete('/notifications/clear/');
  },
};
```

#### 📄 Fichier 4 : `src/services/audit.ts`

```typescript
import api from '../utils/api';

export const auditService = {
  getLogs: async (params?: any) => {
    const response = await api.get('/audit/', { params });
    return response.data;
  },
  getLog: async (id: number) => {
    const response = await api.get(`/audit/${id}/`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/audit/stats/');
    return response.data;
  },
};
```

#### 📄 Fichier 5 : `src/services/settings.ts`

```typescript
import api from '../utils/api';

export const settingsService = {
  getSettings: async () => {
    const response = await api.get('/settings/');
    return response.data;
  },
  updateSettings: async (data: any) => {
    const response = await api.put('/settings/1/', data);
    return response.data;
  },
  getAbout: async () => {
    const response = await api.get('/settings/about/');
    return response.data;
  },
  getStorage: async () => {
    const response = await api.get('/settings/storage/');
    return response.data;
  },
  // Backups
  triggerBackup: async () => {
    const response = await api.post('/settings/backups/trigger_backup/');
    return response.data;
  },
  listBackups: async () => {
    const response = await api.get('/settings/backups/');
    return response.data;
  },
  restoreBackup: async (id: number) => {
    const response = await api.post(`/settings/backups/${id}/restore/`);
    return response.data;
  },
};
```

#### 📄 Fichier 6 : `src/services/ocr.ts`

```typescript
import api from '../utils/api';

export const ocrService = {
  getJobs: async (params?: any) => {
    const response = await api.get('/ocr/jobs/', { params });
    return response.data;
  },
  getJob: async (id: number) => {
    const response = await api.get(`/ocr/jobs/${id}/`);
    return response.data;
  },
  processDocument: async (documentId: number, sourceFile: string, language = 'fra') => {
    const response = await api.post('/ocr/jobs/process/', {
      document: documentId,
      source_file: sourceFile,
      language,
    });
    return response.data;
  },
  retryJob: async (id: number) => {
    const response = await api.post(`/ocr/jobs/${id}/retry/`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/ocr/jobs/stats/');
    return response.data;
  },
  getResults: async (params?: any) => {
    const response = await api.get('/ocr/results/', { params });
    return response.data;
  },
  getPages: async (params?: any) => {
    const response = await api.get('/ocr/pages/', { params });
    return response.data;
  },
};
```

---

### 1.2 Câbler la CorbeillePage au Vrai Backend

**Problème** : La page affiche 8 items hardcodés dans un tableau JS. Les boutons ne font rien.

**Solution** : Remplacer les données statiques par des appels API.

#### Étape 1 : Créer le hook `src/hooks/useTrash.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { documentsService } from '../services/documents';
import api from '../utils/api';

export const useTrash = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ documents: 0, dossiers: 0, courriers: 0, total: 0 });

  const fetchTrash = useCallback(async () => {
    try {
      setLoading(true);
      // Récupérer les documents, dossiers et courriers supprimés en parallèle
      const [docsRes, dossiersRes, courriersEntRes, courriersSortRes] = await Promise.all([
        api.get('/documents/trash/'),
        api.get('/dossiers/trash/'),
        api.get('/courriers/entrants/trash/'),
        api.get('/courriers/sortants/trash/'),
      ]);

      const docs = (docsRes.data.results || docsRes.data || []).map((d: any) => ({ ...d, _type: 'document' }));
      const dossiers = (dossiersRes.data.results || dossiersRes.data || []).map((d: any) => ({ ...d, _type: 'dossier' }));
      const courriersEnt = (courriersEntRes.data.results || courriersEntRes.data || []).map((d: any) => ({ ...d, _type: 'courrier_entrant' }));
      const courriersSort = (courriersSortRes.data.results || courriersSortRes.data || []).map((d: any) => ({ ...d, _type: 'courrier_sortant' }));

      const all = [...docs, ...dossiers, ...courriersEnt, ...courriersSort];
      all.sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime());

      setItems(all);
      setStats({
        documents: docs.length,
        dossiers: dossiers.length,
        courriers: courriersEnt.length + courriersSort.length,
        total: all.length,
      });
    } catch (err) {
      console.error('Erreur chargement corbeille:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTrash(); }, [fetchTrash]);

  const restoreItem = async (item: any) => {
    const endpoints: Record<string, string> = {
      document: `/documents/${item.id}/restore/`,
      dossier: `/dossiers/${item.id}/restore/`,
      courrier_entrant: `/courriers/entrants/${item.id}/restore/`,
      courrier_sortant: `/courriers/sortants/${item.id}/restore/`,
    };
    await api.post(endpoints[item._type]);
    fetchTrash();
  };

  const permanentDelete = async (item: any) => {
    const endpoints: Record<string, string> = {
      document: `/documents/${item.id}/permanent_delete/`,
      dossier: `/dossiers/${item.id}/permanent/`,
      courrier_entrant: `/courriers/entrants/${item.id}/permanent/`,
      courrier_sortant: `/courriers/sortants/${item.id}/permanent/`,
    };
    await api.delete(endpoints[item._type]);
    fetchTrash();
  };

  const emptyTrash = async () => {
    await Promise.all([
      api.post('/documents/trash/empty/'),
      api.post('/dossiers/trash/empty/'),
    ]);
    fetchTrash();
  };

  return { items, loading, stats, restoreItem, permanentDelete, emptyTrash, refetch: fetchTrash };
};
```

#### Étape 2 : Modifier `CorbeillePage.tsx`

Remplacer le tableau statique `const items = [...]` par :

```tsx
import { useTrash } from '../hooks/useTrash';

export function CorbeillePage() {
  const { items, loading, stats, restoreItem, permanentDelete, emptyTrash } = useTrash();

  // Puis utiliser `items` dans le JSX au lieu du tableau hardcodé
  // Brancher les boutons :
  // onClick={() => restoreItem(item)}
  // onClick={() => permanentDelete(item)}
  // onClick={() => emptyTrash()}
}
```

---

### 1.3 Câbler la DiffusionPage au Backend

**Problème** : Le formulaire statique ne soumet rien.

#### Modifier `DiffusionPage.tsx`

```tsx
import { useState, useEffect } from 'react';
import { diffusionsService } from '../services/courriers';
import api from '../utils/api';

export function DiffusionPage() {
  const [diffusions, setDiffusions] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [destinataires, setDestinataires] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);

  // Charger les documents disponibles pour sélection
  useEffect(() => {
    api.get('/documents/').then(res => {
      setDocuments(res.data.results || res.data || []);
    });
    // Charger les diffusions existantes
    diffusionsService.getDiffusions().then(res => {
      setDiffusions(res.results || res || []);
    });
  }, []);

  const handleSubmit = async () => {
    if (!selectedDoc) return;
    setLoading(true);
    try {
      await diffusionsService.createDiffusion({
        courrier_type: 'entrant',  // ou 'sortant' selon le contexte
        courrier_id: selectedDoc,
        note,
        destinataires,
      });
      alert('Diffusion lancée avec succès !');
      // Rafraîchir la liste
      const res = await diffusionsService.getDiffusions();
      setDiffusions(res.results || res || []);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la diffusion');
    } finally {
      setLoading(false);
    }
  };

  // ... Utiliser handleSubmit dans le bouton "Lancer la diffusion"
  // <button onClick={handleSubmit} disabled={loading}>
}
```

---

### 1.4 Câbler UsersPage au Backend

**Problème** : Le tableau UsersPage affiche des données hardcodées.

#### Créer le hook `src/hooks/useUsers.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { usersService } from '../services/users';

export const useUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        usersService.getUsers(),
        usersService.getRoles(),
      ]);
      setUsers(usersData.results || usersData || []);
      setRoles(rolesData.results || rolesData || []);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const createUser = async (data: any) => {
    await usersService.createUser(data);
    fetchData();
  };

  const updateUser = async (id: number, data: any) => {
    await usersService.updateUser(id, data);
    fetchData();
  };

  const deleteUser = async (id: number) => {
    await usersService.deleteUser(id);
    fetchData();
  };

  return { users, roles, loading, createUser, updateUser, deleteUser, refetch: fetchData };
};
```

#### Modifier `UsersPage.tsx` : Remplacer les données statiques

Au début de `UsersPage` :
```tsx
import { useUsers } from '../hooks/useUsers';

export function UtilisateursPage() {
  const { users, roles, loading, createUser, updateUser, deleteUser } = useUsers();
  // Remplacer le tableau hardcodé par `users`
  // Brancher les formulaires de création/modification
}
```

---

### 1.5 Câbler NotificationsPage

#### Modifier `NotificationsPage.tsx`

Au début du composant, remplacer les données statiques :

```tsx
import { useState, useEffect } from 'react';
import { notificationsService } from '../services/notifications';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notifs, count] = await Promise.all([
          notificationsService.getAll(),
          notificationsService.getUnreadCount(),
        ]);
        setNotifications(notifs.results || notifs || []);
        setUnreadCount(count.count || 0);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleMarkRead = async (id: number) => {
    await notificationsService.markRead(id);
    // Rafraîchir
  };

  const handleMarkAllRead = async () => {
    await notificationsService.markAllRead();
    // Rafraîchir
  };

  const handleClear = async () => {
    await notificationsService.clear();
    setNotifications([]);
  };

  // ... Utiliser `notifications` au lieu des données hardcodées
}
```

---

### 1.6 Câbler AuditLogPage

#### Modifier `AuditLogPage.tsx`

```tsx
import { useState, useEffect } from 'react';
import { auditService } from '../services/audit';

export function HistoriquePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsData, statsData] = await Promise.all([
          auditService.getLogs(),
          auditService.getStats(),
        ]);
        setLogs(logsData.results || logsData || []);
        setStats(statsData);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // Utiliser `logs` et `stats` dans le JSX
}
```

---

### 1.7 Câbler ProfilPage à `auth.user`

#### Modifier `ProfilPage.tsx`

```tsx
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export function ProfilPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });

  const handleSave = async () => {
    try {
      await api.patch('/auth/me/', formData);
      alert('Profil mis à jour !');
    } catch (err) {
      alert('Erreur lors de la mise à jour');
    }
  };

  // Utiliser `user` pour afficher les infos et `formData` pour le formulaire
}
```

> **Note** : Il faudra aussi ajouter un endpoint `PATCH /api/auth/me/` côté backend si ce n'est pas déjà le cas.

---

### 1.8 Tester Electron + Corriger BrowserRouter → HashRouter

#### Étape 1 : Changer le Router

**Fichier** : `src/main.tsx`

Remplacer :
```tsx
import { BrowserRouter } from 'react-router-dom';
// ...
<BrowserRouter>
  <App />
</BrowserRouter>
```

Par :
```tsx
import { HashRouter } from 'react-router-dom';
// ...
<HashRouter>
  <App />
</HashRouter>
```

> **Pourquoi ?** `BrowserRouter` utilise `pushState` qui nécessite un serveur web. En Electron prod (`file://`), les routes comme `/dashboard` retournent une erreur 404. `HashRouter` utilise `#/dashboard` ce qui fonctionne partout.

#### Étape 2 : Tester Electron Dev

```bash
cd /home/anes/Documents/ged/frontend
npm run electron:dev
```

#### Problèmes potentiels et solutions :

| Erreur probable | Solution |
|---|---|
| `Cannot find module 'electron'` | Vérifier que `electron` est bien dans `devDependencies`. Relancer `npm install` |
| `CORS error` dans la console | Normal en dev. `webSecurity: false` dans `main.cjs` devrait le gérer. Sinon ajouter `http://localhost:5173` aux CORS Django |
| Fenêtre blanche | Vérifier que Vite est bien démarré sur le port 5173. Le script `wait-on tcp:5173` attend que Vite soit prêt |
| `Refused to load local resource` | C'est le problème BrowserRouter → HashRouter (étape 1) |

---

## PHASE 2 — PRIORITÉ MOYENNE

---

### 2.1 Câbler les 7 Pages Admin (Organization)

Toutes ces pages suivent le même pattern. Voici le modèle générique :

#### Hook générique `src/hooks/useOrganization.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';

export const useOrganizationCrud = (service: any) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await service.getAll();
      setItems(data.results || data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [service]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const create = async (data: any) => { await service.create(data); fetchData(); };
  const update = async (id: number, data: any) => { await service.update(id, data); fetchData(); };
  const remove = async (id: number) => { await service.delete(id); fetchData(); };

  return { items, loading, create, update, remove, refetch: fetchData };
};
```

#### Exemple d'application pour `DirectionsPage.tsx`

```tsx
import { useOrganizationCrud } from '../hooks/useOrganization';
import { directionsService } from '../services/organization';

export function DirectionsPage() {
  const { items: directions, loading, create, update, remove } = useOrganizationCrud(directionsService);

  // Utiliser `directions` pour remplir le tableau
  // Brancher les boutons CRUD
}
```

Même pattern pour : `DepartementsPage`, `ServicesPage`, `CategoriesPage`, `TagsPage`, `CorrespondantsPage`, `BoitesArchivesPage`.

---

### 2.2 Câbler WorkflowPage

```tsx
import { useState, useEffect } from 'react';
import api from '../utils/api';

export function WorkflowPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [instances, setInstances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wfRes, instRes] = await Promise.all([
          api.get('/workflows/'),
          api.get('/workflows/instances/'),
        ]);
        setWorkflows(wfRes.data.results || wfRes.data || []);
        setInstances(instRes.data.results || instRes.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const startInstance = async (workflowId: number, documentId: number) => {
    await api.post('/workflows/executions/start_instance/', {
      workflow: workflowId,
      document: documentId,
    });
    // Rafraîchir
  };

  const validateStep = async (executionId: number, comment: string) => {
    await api.post(`/workflows/executions/${executionId}/validate/`, { comment });
  };

  const rejectStep = async (executionId: number, comment: string) => {
    await api.post(`/workflows/executions/${executionId}/reject/`, { comment });
  };
}
```

---

### 2.3 Câbler SettingsPage

```tsx
import { useState, useEffect } from 'react';
import { settingsService } from '../services/settings';

export function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [about, setAbout] = useState<any>(null);
  const [storage, setStorage] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [s, a, st] = await Promise.all([
        settingsService.getSettings(),
        settingsService.getAbout(),
        settingsService.getStorage(),
      ]);
      setSettings(Array.isArray(s) ? s[0] : s);
      setAbout(a);
      setStorage(st);
    };
    fetchData();
  }, []);

  const handleBackup = async () => {
    await settingsService.triggerBackup();
    alert('Backup lancé !');
  };
}
```

---

### 2.4 Intégrer un Vrai Lecteur PDF

#### Installer react-pdf

```bash
cd /home/anes/Documents/ged/frontend
npm install react-pdf
```

#### Modifier `VisionneusePdfPage.tsx`

```tsx
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configurer le worker PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function VisionneusePdfPage() {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);

  // L'URL du PDF viendrait d'un paramètre de route ou d'un state
  const pdfUrl = 'http://localhost:8000/api/documents/1/download/';

  return (
    <div>
      <Document
        file={{
          url: pdfUrl,
          httpHeaders: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        <Page pageNumber={pageNumber} />
      </Document>
      <div>
        <button onClick={() => setPageNumber(p => Math.max(1, p - 1))}>Précédent</button>
        <span>Page {pageNumber} / {numPages}</span>
        <button onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}>Suivant</button>
      </div>
    </div>
  );
}
```

---

### 2.5 Corriger DocumentsActifsPage et DocumentsRecentsPage

**Fichier** : `src/pages/DocumentsActifsPage.tsx`

```tsx
import { DocumentsPage } from './DocumentsPage';

export function DocumentsActifsPage() {
  // Passer un filtre pour n'afficher que les documents non archivés
  return <DocumentsPage initialFilters={{ is_archived: false }} />;
}
```

**Fichier** : `src/pages/DocumentsRecentsPage.tsx`

```tsx
import { DocumentsPage } from './DocumentsPage';

export function DocumentsRecentsPage() {
  // Passer un tri par date de création décroissante
  return <DocumentsPage initialFilters={{ ordering: '-created_at' }} />;
}
```

> **Note** : Il faudra aussi modifier `DocumentsPage` pour accepter une prop `initialFilters` et la passer à `useDocuments(initialFilters)`.

---

### 2.6 Ajouter un ErrorBoundary React Global

#### Créer `src/components/ErrorBoundary.tsx`

```tsx
import React from 'react';

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2>Une erreur est survenue</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Recharger</button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

#### Modifier `src/main.tsx`

```tsx
import { ErrorBoundary } from './components/ErrorBoundary';

// Envelopper <App /> avec <ErrorBoundary>
<ErrorBoundary>
  <AuthProvider>
    <HashRouter>
      <App />
    </HashRouter>
  </AuthProvider>
</ErrorBoundary>
```

---

### 2.7 Générer le Premier Build Electron

```bash
cd /home/anes/Documents/ged/frontend

# 1. Build React pour production
npm run build

# 2. Générer l'exécutable Linux
npx electron-builder --linux

# Le résultat sera dans: frontend/dist_electron/
# Fichiers générés: AgrOdiv GED-0.1.0.AppImage, agrodiv-ged_0.1.0_amd64.deb
```

---

## PHASE 3 — PRIORITÉ BASSE (Post-MVP)

---

### 3.1 Implémenter Celery + Redis pour OCR Asynchrone

#### Ajouter au `docker-compose.yml`

```yaml
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  celery:
    build: .
    command: celery -A config worker -l info
    volumes:
      - .:/app
    depends_on:
      - redis
      - db
    environment:
      - CELERY_BROKER_URL=redis://redis:6379/0
```

#### Créer `apps/ocr/tasks.py`

```python
from celery import shared_task
from .services import execute_ocr_job

@shared_task
def run_ocr_task(job_id):
    """Exécute le traitement OCR de manière asynchrone."""
    execute_ocr_job(job_id)
```

#### Modifier `apps/ocr/services.py` — Ajouter `execute_ocr_job`

```python
import subprocess
from .models import OcrJob, OcrResult

def execute_ocr_job(job_id):
    job = OcrJob.objects.get(pk=job_id)
    job.status = 'en_cours'
    job.save()

    try:
        # Appel Tesseract via subprocess
        result = subprocess.run(
            ['tesseract', job.source_file, 'stdout', '-l', job.language],
            capture_output=True, text=True, timeout=300
        )

        OcrResult.objects.create(
            job=job,
            extracted_text=result.stdout,
            confidence=0.85,  # Tesseract peut retourner la confiance
        )

        job.status = 'termine'
        job.progress = 100
        job.save()
    except Exception as e:
        job.status = 'erreur'
        job.error_message = str(e)
        job.save()
```

#### Modifier le ViewSet OCR pour dispatcher la tâche

```python
# Dans apps/ocr/views.py, méthode process()
from .tasks import run_ocr_task

def process(self, request):
    # ... Après création du job ...
    run_ocr_task.delay(job.id)  # Lance en arrière-plan
    return Response(OcrJobSerializer(job).data, status=status.HTTP_201_CREATED)
```

---

### 3.2 Configurer un Backend d'Email SMTP

#### Dans `config/settings.py`

```python
# Email
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'  # ou votre serveur SMTP
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'noreply@agrodiv.dz'
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_PASSWORD', '')
DEFAULT_FROM_EMAIL = 'AgrOdiv GED <noreply@agrodiv.dz>'
```

---

### 3.3 Écrire des Tests Unitaires Django

#### Fichier : `apps/authentication/tests.py`

```python
from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@agrodiv.dz', password='testpass123'
        )

    def test_login_success(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'test@agrodiv.dz',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_wrong_password(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'test@agrodiv.dz',
            'password': 'wrongpass'
        })
        self.assertEqual(response.status_code, 401)

    def test_me_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['email'], 'test@agrodiv.dz')

    def test_me_unauthenticated(self):
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, 401)
```

#### Lancer les tests

```bash
docker exec backend-backend-1 python manage.py test apps.authentication
```

---

### 3.4 Créer une App Django Messagerie (pour MessageriePage)

```bash
docker exec backend-backend-1 python manage.py startapp messagerie apps/messagerie
```

#### `apps/messagerie/models.py`

```python
from django.db import models
from django.conf import settings

class Conversation(models.Model):
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='conversations')
    subject = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
```

---

### 3.5 Scanner IPC Natif (Electron + node-twain)

#### Installer

```bash
npm install node-twain  # Windows uniquement
# ou pour Linux :
# Utiliser un appel CLI à `scanimage` (SANE)
```

#### Modifier `electron/main.cjs`

```javascript
ipcMain.handle('scan-document', async (event, args) => {
  const { exec } = require('child_process');

  return new Promise((resolve, reject) => {
    // Linux : utiliser scanimage (SANE)
    const outputPath = `/tmp/scan-${Date.now()}.pdf`;
    exec(`scanimage --format=pdf --output-file=${outputPath}`, (error, stdout, stderr) => {
      if (error) {
        reject({ success: false, error: error.message });
      } else {
        resolve({ success: true, file: outputPath });
      }
    });
  });
});
```

#### Côté React (`ScannerPage.tsx`)

```tsx
const handleScan = async () => {
  if (window.electronAPI) {
    const result = await window.electronAPI.scanDocument({});
    if (result.success) {
      // Upload le fichier scanné vers le backend
      // result.file contient le chemin local du PDF
    }
  } else {
    alert('Le scanner nécessite l\'application de bureau Electron.');
  }
};
```

---

### 3.6 Ajouter `webSecurity` conditionnel en Production

#### Modifier `electron/main.cjs`

```javascript
webPreferences: {
  preload: path.join(__dirname, 'preload.cjs'),
  nodeIntegration: false,
  contextIsolation: true,
  webSecurity: !isDev  // true en production, false en dev uniquement
}
```

---

## 📋 Checklist Finale de Validation

Après avoir appliqué toutes les corrections :

```
[ ] npm run build              → 0 erreurs TypeScript
[ ] npm run electron:dev       → L'app desktop s'ouvre
[ ] Login admin@agrodiv.dz     → Redirige vers Dashboard avec vrais KPIs  
[ ] Page Corbeille             → Affiche les items supprimés depuis l'API
[ ] Page Diffusion             → Peut créer une diffusion  
[ ] Page Utilisateurs          → Affiche les 6 users du seed
[ ] Page Notifications         → Affiche les notifs (vide = OK si pas de seed)
[ ] Page Audit                 → Affiche les logs
[ ] Page Profil                → Affiche les infos de l'utilisateur connecté
[ ] Page Directions            → Affiche "Direction Financière" et "Direction des RH"
[ ] Page Départements          → Affiche "Comptabilité" et "Recrutement"
[ ] Page Workflow              → Affiche les workflows (vide = OK si pas de seed)
[ ] npm run electron:build     → Génère un .AppImage ou .deb fonctionnel
```

---

> **Temps total estimé** : ~25 heures pour tout résoudre et atteindre une note de **9.5/10**.
