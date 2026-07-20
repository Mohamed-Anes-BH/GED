// ============================================================
//  AgrOdiv GED — Shared dropdown constants
// ============================================================

// ── Document ─────────────────────────────────────────────
export const DOCUMENT_CATEGORIES = [
  { value: 'administratif', label: 'Administratif' },
  { value: 'juridique',     label: 'Juridique' },
  { value: 'rh',            label: 'RH' },
  { value: 'finance',       label: 'Finance' },
  { value: 'technique',     label: 'Technique' },
  { value: 'autre',         label: 'Autre' },
];

export const DOCUMENT_STATUSES = [
  { value: 'actif',     label: 'Actif' },
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'archive',   label: 'Archivé' },
];

export const DOSSIERS_STATIC = [
  'Administration', 'RH', 'Finance', 'Juridique',
  'Contrats', 'Factures', 'Rapports', 'Projets', 'Archives',
];

export const DOCUMENT_TAGS = [
  'Urgent', 'Contrat', 'Facture', 'RH', 'Projet', 'Signature',
];

// ── Courrier Entrant ─────────────────────────────────────
export const CE_TYPES = [
  { value: 'lettre',  label: 'Lettre' },
  { value: 'demande', label: 'Demande' },
  { value: 'facture', label: 'Facture' },
  { value: 'contrat', label: 'Contrat' },
  { value: 'rapport', label: 'Rapport' },
  { value: 'autre',   label: 'Autre' },
];

export const CE_CANAUX = [
  { value: 'email',          label: 'Email' },
  { value: 'courrier_postal', label: 'Courrier postal' },
  { value: 'depot_physique', label: 'Dépôt physique' },
];

export const CE_STATUSES = [
  { value: 'nouveau',       label: 'Nouveau' },
  { value: 'en_traitement', label: 'En traitement' },
  { value: 'traite',        label: 'Traité' },
  { value: 'archive',       label: 'Archivé' },
];

export const CE_WORKFLOWS = [
  { value: 'validation_simple',    label: 'Validation simple' },
  { value: 'validation_direction', label: 'Validation Direction' },
  { value: 'validation_rh',        label: 'Validation RH' },
];

export const CE_TAGS = [
  'Urgent', 'Ministère', 'Contrat', 'Signature', 'Facture',
];

// ── Courrier Sortant ─────────────────────────────────────
export const CS_TYPES = [
  { value: 'lettre',  label: 'Lettre' },
  { value: 'reponse', label: 'Réponse' },
  { value: 'facture', label: 'Facture' },
  { value: 'contrat', label: 'Contrat' },
  { value: 'rapport', label: 'Rapport' },
];

export const CS_CANAUX = [
  { value: 'email',          label: 'Email' },
  { value: 'courrier_postal', label: 'Courrier postal' },
  { value: 'main_propre',    label: 'Remise en main propre' },
];

export const CS_SIGNATURES = [
  { value: 'aucune',       label: 'Aucune' },
  { value: 'electronique', label: 'Électronique' },
  { value: 'manuscrite',   label: 'Manuscrite' },
];

export const CS_STATUSES = [
  { value: 'brouillon',    label: 'Brouillon' },
  { value: 'en_validation', label: 'En validation' },
  { value: 'a_envoyer',   label: 'À envoyer' },
  { value: 'envoye',      label: 'Envoyé' },
  { value: 'archive',     label: 'Archivé' },
];

export const CS_WORKFLOWS = [
  { value: 'validation_simple',    label: 'Validation simple' },
  { value: 'validation_direction', label: 'Validation Direction' },
  { value: 'validation_rh',        label: 'Validation RH' },
];

export const CS_TAGS = [
  'Signature', 'Contrat', 'Fournisseur', 'Client', 'Urgent',
];

// ── Shared: Priority & Confidentiality ──────────────────
export const PRIORITIES = [
  { value: 'normale',  label: '🔵 Normale' },
  { value: 'haute',    label: '🟡 Haute' },
  { value: 'urgente',  label: '🔴 Urgente' },
];

export const CONFIDENTIALITIES = [
  { value: 'public',       label: '🌐 Public' },
  { value: 'interne',      label: '🏢 Interne' },
  { value: 'confidentiel', label: '🔒 Confidentiel' },
];

// ── Organisation (static fallback when API returns empty) ─
export const DIRECTIONS_STATIC = [
  { id: 'DG',   name: 'Direction Générale' },
  { id: 'DRH',  name: 'Direction RH' },
  { id: 'DFI',  name: 'Direction Financière' },
  { id: 'DIT',  name: 'Direction Informatique' },
  { id: 'DJU',  name: 'Direction Juridique' },
  { id: 'DCO',  name: 'Direction Commerciale' },
];

export type DeptKey = 'DG' | 'DRH' | 'DFI' | 'DIT' | 'DJU' | 'DCO';

export const DEPARTEMENTS_BY_DIR: Record<DeptKey, { id: string; name: string }[]> = {
  DG:  [{ id: 'SG', name: 'Secrétariat Général' }, { id: 'PL', name: 'Planification' }],
  DRH: [{ id: 'ADM_RH', name: 'Administration RH' }, { id: 'REC', name: 'Recrutement' }, { id: 'FOR', name: 'Formation' }],
  DFI: [{ id: 'CPT', name: 'Comptabilité' }, { id: 'TRE', name: 'Trésorerie' }],
  DIT: [{ id: 'DEV', name: 'Développement' }, { id: 'INF', name: 'Infrastructure' }, { id: 'SUP', name: 'Support' }],
  DJU: [{ id: 'AFF_JUR', name: 'Affaires Juridiques' }],
  DCO: [{ id: 'VEN', name: 'Ventes' }, { id: 'MKT', name: 'Marketing' }],
};

export type SvcKey = 'DEV' | 'INF' | 'SUP' | 'CPT' | 'ADM_RH' | 'REC' | 'AFF_JUR' | 'VEN' | 'MKT';

export const SERVICES_BY_DEPT: Record<SvcKey, { id: string; name: string }[]> = {
  DEV:     [{ id: 'WEB', name: 'Web' }, { id: 'MOB', name: 'Mobile' }, { id: 'API', name: 'API' }],
  INF:     [{ id: 'NET', name: 'Réseau' }, { id: 'SYS', name: 'Systèmes' }],
  SUP:     [{ id: 'HLP', name: 'Help Desk' }],
  CPT:     [{ id: 'CPT_GEN', name: 'Générale' }, { id: 'CPT_CLI', name: 'Clients' }, { id: 'CPT_FOU', name: 'Fournisseurs' }],
  ADM_RH:  [{ id: 'GES_PER', name: 'Gestion du personnel' }, { id: 'PAI', name: 'Paie' }],
  REC:     [{ id: 'INT_REC', name: 'Recrutement' }, { id: 'INT_INT', name: 'Intégration' }],
  AFF_JUR: [{ id: 'CONT_JUR', name: 'Contrats' }, { id: 'CONT_JUR2', name: 'Contentieux' }],
  VEN:     [{ id: 'B2B', name: 'B2B' }, { id: 'B2C', name: 'B2C' }],
  MKT:     [{ id: 'COM', name: 'Communication' }, { id: 'DIG', name: 'Digital' }],
};

// ── Physical Archive ─────────────────────────────────────
export const SITES = [
  { value: 'siege',  label: 'Siège' },
  { value: 'annexe', label: 'Annexe' },
];

export const BATIMENTS = [
  { value: 'A', label: 'Bâtiment A' },
  { value: 'B', label: 'Bâtiment B' },
  { value: 'C', label: 'Bâtiment C' },
];

export const BUREAUX = [
  { value: 'archives', label: 'Archives' },
  { value: '101',      label: '101' },
  { value: '102',      label: '102' },
  { value: '201',      label: '201' },
  { value: '202',      label: '202' },
];

// ── Physical Location (nouvelle carte) ───────────────────
export const PHYSICAL_BUILDINGS = [
  { value: 'A', label: 'Bâtiment A' },
  { value: 'B', label: 'Bâtiment B' },
  { value: 'C', label: 'Bâtiment C' },
];

export const PHYSICAL_OFFICES = [
  { value: 'archives', label: 'Archives' },
  { value: '101',      label: '101' },
  { value: '102',      label: '102' },
  { value: '201',      label: '201' },
  { value: '202',      label: '202' },
];

export const PHYSICAL_TREASURIES = [
  { value: 'principale', label: 'Trésorerie principale' },
  { value: 'secondaire', label: 'Trésorerie secondaire' },
];

export const PHYSICAL_SHELVES = [
  { value: 'A', label: 'Étagère A' },
  { value: 'B', label: 'Étagère B' },
  { value: 'C', label: 'Étagère C' },
];

// ── Distribution (incoming / outgoing) ───────────────────
export const CE_DISTRIBUTIONS = [
  { value: 'direction_generale', label: 'Direction Générale' },
  { value: 'rh',                 label: 'RH' },
  { value: 'finance',            label: 'Finance' },
  { value: 'informatique',       label: 'Informatique' },
  { value: 'juridique',          label: 'Juridique' },
];

export const CS_DISTRIBUTIONS = [
  { value: 'direction_generale', label: 'Direction Générale' },
  { value: 'rh',                 label: 'RH' },
  { value: 'finance',            label: 'Finance' },
  { value: 'informatique',       label: 'Informatique' },
  { value: 'juridique',          label: 'Juridique' },
];
