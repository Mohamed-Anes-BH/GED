export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role?: number | Role;
  department?: number;
  service?: number;
  is_active: boolean;
  avatar?: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  is_system: boolean;
}

export interface Departement {
  id: number;
  name: string;
  code: string;
  direction?: number;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Categorie {
  id: number;
  name: string;
  code: string;
  color: string;
}

export interface DocumentFile {
  id: number;
  file: string;
  filename: string;
  mime_type: string;
  size: number;
  uploaded_at: string;
}

export interface Document {
  id: number;
  title: string;
  description: string;
  category: number | Categorie;
  status: string;
  priority: string;
  is_archived: boolean;
  is_deleted: boolean;
  dossier: number | null;
  created_at: string;
  updated_at: string;
  created_by: number | User;
  tags: number[] | Tag[];
  files?: DocumentFile[];
  is_favorite?: boolean;
}

export interface CourrierEntrant {
  id: number;
  numero: string;
  expediteur: string;
  objet: string;
  date_reception: string;
  statut: 'nouveau' | 'lu' | 'en_cours' | 'traite' | 'archive';
  priorite: string;
  created_at: string;
  assigned_to?: number;
  is_favorite?: boolean;
}

export interface CourrierSortant {
  id: number;
  numero: string;
  destinataire: string;
  objet: string;
  date_envoi: string | null;
  statut: 'brouillon' | 'en_validation' | 'valide' | 'rejete' | 'envoye' | 'signe' | 'archive';
  priorite: string;
  created_at: string;
  auteur: number;
  is_favorite?: boolean;
}

export interface Dossier {
  id: number;
  name: string;
  code: string;
  description: string;
  parent: number | null;
  is_archived: boolean;
  created_at: string;
  is_favorite?: boolean;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  related_document?: number;
  related_courrier?: number;
}

export interface GlobalStats {
  total_documents: number;
  documents_archives: number;
  total_courriers: number;
  courriers_entrants: number;
  courriers_sortants: number;
  workflows_en_cours: number;
  dossiers_actifs: number;
  taches_en_attente: number;
}
