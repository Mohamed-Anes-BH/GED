import { useState } from 'react';
import {
  Send, Calendar, Clock, CheckCircle, AlertTriangle, Archive,
  Search, SlidersHorizontal, ChevronDown, Download, Eye, MoreVertical, Plus,
  FileText, Paperclip, ChevronLeft, ChevronRight, Hash, Building2, UserCircle2
} from 'lucide-react';
import '../styles/courriers-sortants.css';

/* ─── MOCK DATA ──────────────────────────────────────────── */
const kpis = [
  { label: 'Courriers envoyés', value: '986', subtitle: 'Total', delta: '+12.5% ce mois', color: '#3B82F6', icon: Send },
  { label: 'Envoyés aujourd\'hui', value: '12', subtitle: 'Aujourd\'hui', delta: '+9.1% vs hier', color: '#22C55E', icon: Calendar },
  { label: 'En attente d\'envoi', value: '18', subtitle: 'À envoyer', delta: '-4.3% ce mois', color: '#F59E0B', icon: Clock, trendDown: true },
  { label: 'Envoyés', value: '930', subtitle: 'Envoyés', delta: '+10.8% ce mois', color: '#22C55E', icon: CheckCircle },
  { label: 'Urgents', value: '9', subtitle: 'Priorité haute', delta: '+2.4% ce mois', color: '#EF4444', icon: AlertTriangle },
  { label: 'Archivés', value: '742', subtitle: 'Archivés', delta: '+8.2% ce mois', color: '#8B5CF6', icon: Archive },
];

const courriers = [
  { id: '1', numero: 'CS-2024-0786', ref: 'REF-7895/24', date: '15/05/2024', destinataire: 'Ministère de l\'Agriculture', organisme: 'Ministère', objet: 'Rapport annuel sur la production céréalière 2024', priorite: 'Haute', statut: 'Envoyé', resp: 'Yacine M.', pj: 3, wfColor: '#22C55E' },
  { id: '2', numero: 'CS-2024-0785', ref: 'REF-7894/24', date: '15/05/2024', destinataire: 'Direction des Finances', organisme: 'Finance', objet: 'Budget prévisionnel exercice 2024', priorite: 'Moyenne', statut: 'Préparé', resp: 'Sofiane H.', pj: 2, wfColor: '#3B82F6' },
  { id: '3', numero: 'CS-2024-0784', ref: 'REF-7893/24', date: '14/05/2024', destinataire: 'Office National des Statistiques', organisme: 'ONS', objet: 'Statistiques agricoles du 1er trimestre', priorite: 'Normale', statut: 'Envoyé', resp: 'Nadia A.', pj: 1, wfColor: '#22C55E' },
  { id: '4', numero: 'CS-2024-0783', ref: 'REF-7892/24', date: '14/05/2024', destinataire: 'SONELGAZ', organisme: 'Énergie', objet: 'Demande de raccordement électrique', priorite: 'Haute', statut: 'Envoyé', resp: 'Yacine M.', pj: 2, wfColor: '#22C55E' },
  { id: '5', numero: 'CS-2024-0782', ref: 'REF-7891/24', date: '13/05/2024', destinataire: 'Algérie Télécom', organisme: 'Télécom', objet: 'Proposition de partenariat et collaboration', priorite: 'Moyenne', statut: 'En attente', resp: 'Sofiane H.', pj: 1, wfColor: '#F59E0B' },
  { id: '6', numero: 'CS-2024-0781', ref: 'REF-7890/24', date: '12/05/2024', destinataire: 'Banque Nationale d\'Algérie', organisme: 'BNA', objet: 'Offre de financement projet agricole', priorite: 'Urgente', statut: 'Préparé', resp: 'Yacine M.', pj: 3, wfColor: '#3B82F6' },
  { id: '7', numero: 'CS-2024-0780', ref: 'REF-7889/24', date: '11/05/2024', destinataire: 'Chambre d\'Agriculture', organisme: 'Agriculture', objet: 'Invitation à la conférence internationale', priorite: 'Normale', statut: 'Envoyé', resp: 'Nadia A.', pj: 1, wfColor: '#22C55E' },
  { id: '8', numero: 'CS-2024-0779', ref: 'REF-7888/24', date: '10/05/2024', destinataire: 'Assurance CAAT', organisme: 'Assurance', objet: 'Contrat d\'assurance matériel agricole', priorite: 'Moyenne', statut: 'Envoyé', resp: 'Sofiane H.', pj: 2, wfColor: '#22C55E' },
  { id: '9', numero: 'CS-2024-0778', ref: 'REF-7887/24', date: '09/05/2024', destinataire: 'Fournisseurs Divers', organisme: 'Fournisseurs', objet: 'Catalogue équipements agricoles', priorite: 'Normale', statut: 'Diffusé', resp: 'Yacine M.', pj: 4, wfColor: '#8B5CF6' },
  { id: '10', numero: 'CS-2024-0777', ref: 'REF-7886/24', date: '08/05/2024', destinataire: 'Ministère du Commerce', organisme: 'Commerce', objet: 'Réglementation importation des semences', priorite: 'Haute', statut: 'Envoyé', resp: 'Nadia A.', pj: 2, wfColor: '#22C55E' },
];

const prioriteStyles: Record<string, { bg: string; color: string; border: string }> = {
  Urgente: { bg: '#FEF2F2', color: '#EF4444', border: '#FECACA' },
  Haute:   { bg: '#FEF2F2', color: '#EF4444', border: '#FECACA' },
  Moyenne: { bg: '#FFF7ED', color: '#F59E0B', border: '#FED7AA' },
  Normale: { bg: '#F0FDF4', color: '#22C55E', border: '#BBF7D0' },
};

const statutStyles: Record<string, { bg: string; color: string; dot: string }> = {
  'Envoyé':     { bg: '#F0FDF4', color: '#22C55E', dot: '#22C55E' },
  'Préparé':    { bg: '#EFF6FF', color: '#3B82F6', dot: '#3B82F6' },
  'En attente': { bg: '#FFF7ED', color: '#F59E0B', dot: '#F59E0B' },
  'Diffusé':    { bg: '#F5F3FF', color: '#8B5CF6', dot: '#8B5CF6' },
};

/* ─── COMPONENT ──────────────────────────────────────────── */
export function CourriersSortantsPage({ variant = 1 }: { variant?: 1 | 2 | 3 }) {
  const [selectedId, setSelectedId] = useState<string>('1');
  
  return (
    <div className="cs-page">
      {/* Page Header (Title + Breadcrumbs) */}
      <div className="cs-header">
        <div className="cs-header-content">
          <h2 className="cs-page-title">Courriers sortants</h2>
          <p className="cs-page-subtitle">Gestion des courriers envoyés par l'entreprise.</p>
          <div className="cs-breadcrumbs">
            <span className="cs-bc-item">Accueil</span> <span>›</span>
            <span className="cs-bc-item">Courriers</span> <span>›</span>
            <span className="cs-bc-active">Sortants</span>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="cs-kpi-row">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="cs-kpi-card">
              <div className="cs-kpi-icon" style={{ background: `${kpi.color}1A`, color: kpi.color }}>
                <Icon size={22} />
              </div>
              <div className="cs-kpi-info">
                <span className="cs-kpi-label">{kpi.label}</span>
                <strong className="cs-kpi-value">{kpi.value}</strong>
                <span className="cs-kpi-subtitle">{kpi.subtitle}</span>
                <span className="cs-kpi-delta" style={{ color: kpi.trendDown ? '#EF4444' : '#22C55E' }}>
                  {kpi.trendDown ? '↓' : '↑'} {kpi.delta}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Layout Columns */}
      <div className="cs-main-layout">
        
        {/* Left Column (Table) */}
        <div className="cs-table-column">
          <div className="cs-table-controls">
            <div className="cs-search-box">
              <Search size={16} />
              <input type="text" placeholder="Rechercher un courrier..." />
              <SlidersHorizontal size={16} className="cs-search-filter-icon" />
            </div>
            <div className="cs-table-actions">
              <button className="cs-export-btn"><Download size={14} /> Export <ChevronDown size={14} /></button>
              <button className="cs-primary-btn"><Plus size={14} /> Nouveau courrier</button>
            </div>
          </div>

          <div className="cs-table-wrapper">
            <table className="cs-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}><input type="checkbox" /></th>
                  <th>Numéro</th>
                  <th>Référence</th>
                  <th>Date</th>
                  <th>Destinataire</th>
                  <th>Organisme</th>
                  <th>Objet</th>
                  <th>Priorité</th>
                  <th>Statut d'envoi</th>
                  <th>Responsable</th>
                  <th>PJ</th>
                  <th>Workflow</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courriers.map(c => {
                  const ps = prioriteStyles[c.priorite];
                  const ss = statutStyles[c.statut];
                  return (
                    <tr key={c.id} className={selectedId === c.id ? 'selected' : ''} onClick={() => setSelectedId(c.id)}>
                      <td><input type="checkbox" onClick={e => e.stopPropagation()} /></td>
                      <td className="cs-txt-bold">{c.numero}</td>
                      <td className="cs-txt-muted">{c.ref}</td>
                      <td>{c.date}</td>
                      <td>{c.destinataire}</td>
                      <td>{c.organisme}</td>
                      <td className="cs-objet-cell">{c.objet}</td>
                      <td>
                        <span className="cs-badge-outline" style={{ color: ps.color, borderColor: ps.border }}>
                          ↑ {c.priorite}
                        </span>
                      </td>
                      <td>
                        <span className="cs-badge-dot" style={{ color: ss.color }}>
                          <span className="cs-dot" style={{ background: ss.dot }} /> {c.statut}
                        </span>
                      </td>
                      <td>{c.resp}</td>
                      <td><div className="cs-badge-icon"><Eye size={12} /> {c.pj}</div></td>
                      <td><span className="cs-wf-ring" style={{ borderColor: c.wfColor }}></span></td>
                      <td><button className="cs-icon-btn"><MoreVertical size={16} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="cs-pagination">
            <span>Affichage de 1 à 10 sur 986 courriers</span>
            <div className="cs-pager">
              <button><ChevronLeft size={14}/></button>
              <button className="active">1</button>
              <button>2</button>
              <button>3</button>
              <button>4</button>
              <button>5</button>
              <span>...</span>
              <button>99</button>
              <button><ChevronRight size={14}/></button>
            </div>
            <div className="cs-per-page">
              <select defaultValue="10"><option>10 / page</option></select>
            </div>
          </div>
        </div>

        {/* Middle Column (Filtres avancés) */}
        <div className="cs-filters-column">
          <div className="cs-filters-header">
            <h3>Filtres avancés</h3>
            <button className="cs-reset-btn">↺ Réinitialiser</button>
          </div>
          <div className="cs-filters-list">
            <FilterBlock icon={Calendar} label="Date">
              <div className="cs-date-inputs">
                <input type="text" placeholder="Du" className="cs-input-with-icon" />
                <input type="text" placeholder="Au" className="cs-input-with-icon" />
              </div>
            </FilterBlock>
            <FilterBlock icon={Hash} label="Priorité"><Select placeholder="Toutes" /></FilterBlock>
            <FilterBlock icon={CheckCircle} label="Statut d'envoi"><Select placeholder="Tous" /></FilterBlock>
            <FilterBlock icon={UserCircle2} label="Destinataire"><Select placeholder="Tous" /></FilterBlock>
            <FilterBlock icon={Building2} label="Département"><Select placeholder="Tous les départements" /></FilterBlock>
            <FilterBlock icon={Building2} label="Service"><Select placeholder="Tous les services" /></FilterBlock>
            <FilterBlock icon={Building2} label="Catégorie"><Select placeholder="Toutes les catégories" /></FilterBlock>
            <FilterBlock icon={UserCircle2} label="Responsable"><Select placeholder="Tous les responsables" /></FilterBlock>
            <div className="cs-toggle-filter">
              <label><Paperclip size={16} /> Avec pièces jointes</label>
              <div className="cs-switch"></div>
            </div>
            <FilterBlock icon={Building2} label="Workflow"><Select placeholder="Tous" /></FilterBlock>
            <FilterBlock icon={Building2} label="Diffusion"><Select placeholder="Toutes" /></FilterBlock>
          </div>
          <button className="cs-apply-filters-btn">Appliquer les filtres</button>
        </div>

        {/* Right Column (Aperçu du courrier) */}
        <div className="cs-preview-column">
          <div className="cs-preview-header">
            <h3>Aperçu du courrier</h3>
            <span className="cs-badge-active">Actif</span>
          </div>
          
          <div className="cs-preview-image-placeholder">
            {/* Using a structural placeholder representing the document graphic */}
            <div className="cs-doc-graphic">📄 Illustration du Document</div>
          </div>
          
          <div className="cs-preview-details">
            <div className="cs-preview-title-row">
              <h4>CS-2024-0786</h4>
              <span className="cs-badge-outline" style={{ color: '#EF4444', borderColor: '#FECACA' }}>Haute priorité</span>
            </div>
            
            <table className="cs-preview-table">
              <tbody>
                <tr><td><Hash size={14}/> Référence</td><td>REF-7895/24</td></tr>
                <tr><td><UserCircle2 size={14}/> Destinataire</td><td>Ministère de l'Agriculture</td></tr>
                <tr><td><Building2 size={14}/> Organisme</td><td>Ministère</td></tr>
                <tr><td><Calendar size={14}/> Date d'envoi</td><td>15/05/2024 à 14:25</td></tr>
                <tr><td><UserCircle2 size={14}/> Auteur</td><td>Yacine M.</td></tr>
                <tr><td><Building2 size={14}/> Département</td><td>Statistiques & Analyses</td></tr>
                <tr><td><Building2 size={14}/> Service</td><td>Bureau Statistiques</td></tr>
                <tr><td><Paperclip size={14}/> Pièces jointes</td><td>3 fichiers (PDF, XLSX, DOCX)</td></tr>
                <tr><td><CheckCircle size={14}/> Statut d'envoi</td><td style={{ color: '#22C55E' }}>● Envoyé</td></tr>
              </tbody>
            </table>
            
            <button className="cs-secondary-btn-full">Voir le courrier complet</button>
          </div>
        </div>
        
      </div>
      
      {/* Bottom Detail Sections (Only showing headers for now to match exactly the layout structure) */}
      <div className="cs-bottom-panels">
        {/* Placeholder for the detail sections visible at the bottom of the design */}
        <div className="cs-detail-box"><h4 className="cs-box-title">🗂 Pièces jointes (3)</h4></div>
        <div className="cs-detail-box"><h4 className="cs-box-title">📑 Classification</h4></div>
        <div className="cs-detail-box"><h4 className="cs-box-title">📦 Emplacement physique</h4></div>
        <div className="cs-detail-box"><h4 className="cs-box-title">🔄 Workflow</h4></div>
        <div className="cs-detail-box"><h4 className="cs-box-title">👤 Destinataire</h4></div>
        <div className="cs-detail-box"><h4 className="cs-box-title">👥 Diffusion interne (3)</h4></div>
        <div className="cs-detail-box"><h4 className="cs-box-title">📝 Activités récentes</h4></div>
      </div>
      
      {/* Bottom Fixed Action Bar */}
      <div className="cs-action-bar">
        <button className="cs-primary-btn"><Plus size={16}/> Nouveau courrier</button>
        <button className="cs-action-btn">✏️ Modifier</button>
        <button className="cs-action-btn">📤 Envoyer</button>
        <button className="cs-action-btn">✍️ Signer</button>
        <button className="cs-action-btn">📢 Diffuser</button>
        <button className="cs-action-btn">⬇️ Télécharger</button>
        <button className="cs-action-btn">🖨️ Imprimer</button>
        <button className="cs-action-btn">🔗 Associer à un document</button>
        <button className="cs-action-btn">📦 Archiver</button>
        <button className="cs-danger-btn">🗑️ Supprimer</button>
      </div>

    </div>
  );
}

/* ─── SUB-COMPONENTS ──────────────────────────────────── */
function FilterBlock({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="cs-filter-block">
      <label className="cs-filter-label"><Icon size={14} /> {label}</label>
      {children}
    </div>
  );
}

function Select({ placeholder }: { placeholder: string }) {
  return (
    <div className="cs-select">
      <span>{placeholder}</span>
      <ChevronDown size={14} />
    </div>
  );
}
