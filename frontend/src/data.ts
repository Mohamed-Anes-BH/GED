export type DocumentItem = {
  id: number;
  name: string;
  type: string;
  size: string;
  dept: string;
  cat: string;
  date: string;
  status: string;
  views: number;
  dl: number;
  pages: number;
  author: string;
  desc: string;
};

export type UserItem = {
  id: number;
  ini: string;
  name: string;
  email: string;
  dept: string;
  role: string;
  status: string;
  lastLogin: string;
  color: string;
};

export type AuditItem = {
  id: number;
  user: string;
  ini: string;
  col: string;
  action: string;
  resource: string;
  ip: string;
  date: string;
};

export type FolderItem = {
  id: number;
  name: string;
  count: number;
  color: string;
};

export const documents: DocumentItem[] = [
  { id: 1, name: 'Rapport Annuel 2025.pdf', type: 'pdf', size: '12.4 MB', dept: 'Direction Générale', cat: 'Rapports', date: '12 Juin 2025', status: 'approved', views: 234, dl: 45, pages: 695, author: 'Ahmed Mansour', desc: "Rapport complet des activités et résultats financiers de l'exercice 2025. Approuvé par la direction générale après validation des commissaires aux comptes." },
  { id: 2, name: 'Contrat Fournisseur v3.docx', type: 'docx', size: '2.1 MB', dept: 'Service Achats', cat: 'Contrats', date: '08 Juin 2025', status: 'pending', views: 56, dl: 12, pages: 24, author: 'Samira Bouzid', desc: 'Contrat de prestation avec Techno-Maghreb pour la fourniture de matériel informatique 2025-2026.' },
  { id: 3, name: 'Budget Q2 2025.xlsx', type: 'xlsx', size: '4.7 MB', dept: 'Comptabilité', cat: 'Budgets', date: '01 Juin 2025', status: 'approved', views: 189, dl: 78, pages: 12, author: 'Leila Amrani', desc: 'Tableau budgétaire détaillé du deuxième trimestre 2025 par département et par nature de charges.' },
  { id: 4, name: 'Politique RH 2025.pdf', type: 'pdf', size: '0.8 MB', dept: 'Ressources Humaines', cat: 'Politiques', date: '28 Mai 2025', status: 'draft', views: 34, dl: 5, pages: 38, author: 'Nadia Messaoudi', desc: 'Document interne de politique des ressources humaines - congés, avantages, formation continue.' },
  { id: 5, name: 'Présentation Q2.pptx', type: 'pptx', size: '18.2 MB', dept: 'Marketing', cat: 'Présentations', date: '22 Mai 2025', status: 'approved', views: 312, dl: 89, pages: 45, author: 'Omar Benhocine', desc: 'Bilan marketing et axes stratégiques du deuxième trimestre 2025.' },
  { id: 6, name: 'Audit Sécurité.pdf', type: 'pdf', size: '3.4 MB', dept: 'Informatique', cat: 'Audits', date: '15 Mai 2025', status: 'approved', views: 67, dl: 23, pages: 88, author: 'Karim Djamel', desc: "Rapport d'audit de sécurité informatique des systèmes internes - 2025." },
];

export const folders: FolderItem[] = [
  { id: 1, name: 'Direction Générale', count: 24, color: '#4F72F9' },
  { id: 2, name: 'Ressources Humaines', count: 67, color: '#7C5BE6' },
  { id: 3, name: 'Comptabilité', count: 128, color: '#22C55E' },
  { id: 4, name: 'Informatique', count: 89, color: '#F59E0B' },
  { id: 5, name: 'Marketing', count: 45, color: '#EF4444' },
  { id: 6, name: 'Service Achats', count: 31, color: '#F97316' },
];

export const users: UserItem[] = [
  { id: 1, ini: 'AM', name: 'Ahmed Mansour', email: 'ahmed@ged.dz', dept: 'Direction Générale', role: 'admin', status: 'active', lastLogin: 'Il y a 2h', color: '#4F72F9' },
  { id: 2, ini: 'SB', name: 'Samira Bouzid', email: 'samira@ged.dz', dept: 'Ressources Humaines', role: 'manager', status: 'active', lastLogin: 'Il y a 1j', color: '#7C5BE6' },
  { id: 3, ini: 'KD', name: 'Karim Djamel', email: 'karim@ged.dz', dept: 'Informatique', role: 'employee', status: 'active', lastLogin: 'Il y a 3j', color: '#22C55E' },
  { id: 4, ini: 'LA', name: 'Leila Amrani', email: 'leila@ged.dz', dept: 'Comptabilité', role: 'employee', status: 'inactive', lastLogin: 'Il y a 14j', color: '#F59E0B' },
  { id: 5, ini: 'OB', name: 'Omar Benhocine', email: 'omar@ged.dz', dept: 'Marketing', role: 'employee', status: 'active', lastLogin: 'Il y a 5h', color: '#EF4444' },
  { id: 6, ini: 'NM', name: 'Nadia Messaoudi', email: 'nadia@ged.dz', dept: 'Service Achats', role: 'manager', status: 'active', lastLogin: 'Il y a 30min', color: '#F97316' },
];

export const audit: AuditItem[] = [
  { id: 1, user: 'Ahmed Mansour', ini: 'AM', col: '#4F72F9', action: 'upload', resource: 'Rapport Annuel 2025.pdf', ip: '192.168.1.45', date: '12 Juin · 14:32' },
  { id: 2, user: 'Samira Bouzid', ini: 'SB', col: '#7C5BE6', action: 'download', resource: 'Contrat Fournisseur v3.docx', ip: '192.168.1.52', date: '12 Juin · 14:18' },
  { id: 3, user: 'Karim Djamel', ini: 'KD', col: '#22C55E', action: 'view', resource: 'Budget Q2 2025.xlsx', ip: '192.168.1.63', date: '12 Juin · 13:55' },
  { id: 4, user: 'Ahmed Mansour', ini: 'AM', col: '#4F72F9', action: 'approve', resource: 'Politique RH 2025.pdf', ip: '192.168.1.45', date: '12 Juin · 12:20' },
  { id: 5, user: 'Leila Amrani', ini: 'LA', col: '#F59E0B', action: 'login', resource: 'Authentification', ip: '192.168.1.71', date: '12 Juin · 11:45' },
  { id: 6, user: 'Nadia Messaoudi', ini: 'NM', col: '#F97316', action: 'share', resource: 'Audit Sécurité.pdf', ip: '192.168.1.84', date: '12 Juin · 10:30' },
  { id: 7, user: 'Omar Benhocine', ini: 'OB', col: '#EF4444', action: 'delete', resource: 'Archive Q1 2024.pdf', ip: '192.168.1.92', date: '12 Juin · 09:15' },
  { id: 8, user: 'Karim Djamel', ini: 'KD', col: '#22C55E', action: 'upload', resource: 'Plan Sécurité IT.docx', ip: '192.168.1.63', date: '11 Juin · 17:44' },
];

export const dashboardCards = [
  { label: 'Total documents', value: '2.4K', delta: '+12%' },
  { label: 'Utilisateurs actifs', value: '18', delta: '+4%' },
  { label: 'Dossiers', value: '46', delta: '+2%' },
  { label: 'Téléchargements du jour', value: '137', delta: '+9%' },
];