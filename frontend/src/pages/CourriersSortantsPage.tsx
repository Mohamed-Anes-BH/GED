import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, Calendar, Clock, CheckCircle, AlertTriangle, Archive,
  Search, SlidersHorizontal, ChevronDown, Download, Eye, MoreVertical, Plus,
  FileText, Paperclip, ChevronLeft, ChevronRight, Hash, Building2, UserCircle2
} from 'lucide-react';
import '../styles/courriers-sortants.css';

import { useCourriers } from '../hooks/useCourriers';
import { courriersService } from '../services/courriers';
import { formatDate } from '../utils/formatters';
import { CourrierSortant } from '../types';

/* ─── MOCK DATA (For KPIs only) ──────────────────────────────────────────── */
const kpisTemplate = [
  { label: 'Courriers envoyés', key: 'total', subtitle: 'Total', delta: '+4', color: '#3B82F6', icon: Send },
  { label: 'Envoyés aujourd\'hui', key: 'today', subtitle: 'Aujourd\'hui', delta: '+1', color: '#22C55E', icon: Calendar },
  { label: 'En attente d\'envoi', key: 'brouillon', subtitle: 'À envoyer', delta: '0', color: '#F59E0B', icon: Clock, trendDown: true },
  { label: 'Envoyés', key: 'envoye', subtitle: 'Envoyés', delta: '+2', color: '#22C55E', icon: CheckCircle },
  { label: 'Urgents', key: 'urgent', subtitle: 'Priorité haute', delta: '-1', color: '#EF4444', icon: AlertTriangle },
  { label: 'Archivés', key: 'archive', subtitle: 'Archivés', delta: '0', color: '#8B5CF6', icon: Archive },
];

const prioriteStyles: Record<string, { bg: string; color: string; border: string }> = {
  urgente: { bg: '#FEF2F2', color: '#EF4444', border: '#FECACA' },
  haute:   { bg: '#FEF2F2', color: '#EF4444', border: '#FECACA' },
  moyenne: { bg: '#FFF7ED', color: '#F59E0B', border: '#FED7AA' },
  normale: { bg: '#F0FDF4', color: '#22C55E', border: '#BBF7D0' },
  basse:   { bg: '#F0FDF4', color: '#22C55E', border: '#BBF7D0' },
};

const statutStyles: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  'brouillon':     { bg: '#F1F5F9', color: '#64748B', dot: '#64748B', label: 'Brouillon' },
  'en_validation': { bg: '#EFF6FF', color: '#3B82F6', dot: '#3B82F6', label: 'En validation' },
  'valide':        { bg: '#F5F3FF', color: '#8B5CF6', dot: '#8B5CF6', label: 'Validé' },
  'rejete':        { bg: '#FEF2F2', color: '#EF4444', dot: '#EF4444', label: 'Rejeté' },
  'envoye':        { bg: '#F0FDF4', color: '#22C55E', dot: '#22C55E', label: 'Envoyé' },
  'signe':         { bg: '#ECFCCB', color: '#84CC16', dot: '#84CC16', label: 'Signé' },
  'archive':       { bg: '#F8FAFC', color: '#94A3B8', dot: '#94A3B8', label: 'Archivé' },
};

/* ─── COMPONENT ──────────────────────────────────────────── */
export function CourriersSortantsPage({ variant = 1 }: { variant?: 1 | 2 | 3 }) {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: courriers, loading, totalCount, refetch } = useCourriers('sortants');
  const selected = courriers.find(c => c.id === selectedId) as (CourrierSortant & { pieces_jointes?: any[], historique?: any[], auteur_nom?: string }) | null;
  
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
        {kpisTemplate.map((kpi, i) => {
          const Icon = kpi.icon;
          let val = 0;
          if (kpi.key === 'total') val = courriers.length;
          else if (kpi.key === 'today') val = courriers.filter((c: any) => new Date(c.date_envoi || c.created_at).toDateString() === new Date().toDateString()).length;
          else if (kpi.key === 'urgent') val = courriers.filter((c: any) => c.priorite?.toLowerCase() === 'urgente' || c.priorite?.toLowerCase() === 'haute').length;
          else val = courriers.filter((c: any) => c.statut === kpi.key).length;

          return (
            <div key={i} className="cs-kpi-card">
              <div className="cs-kpi-icon" style={{ background: `${kpi.color}1A`, color: kpi.color }}>
                <Icon size={22} />
              </div>
              <div className="cs-kpi-info">
                <span className="cs-kpi-label">{kpi.label}</span>
                <strong className="cs-kpi-value">{loading ? '-' : val}</strong>
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
              <button className="cs-primary-btn" onClick={() => navigate('/courriers-sortants/nouveau')}><Plus size={14} /> Nouveau courrier</button>
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
                {loading ? (
                  <tr>
                    <td colSpan={13} style={{ textAlign: 'center', padding: '2rem' }}>
                      Chargement...
                    </td>
                  </tr>
                ) : courriers.map((c: any) => {
                  const prio = c.priorite?.toLowerCase() || 'normale';
                  const ps = prioriteStyles[prio] || prioriteStyles.normale;
                  const ss = statutStyles[c.statut] || statutStyles['brouillon'];
                  const pjCount = c.pieces_jointes?.length || 0;
                  return (
                    <tr key={c.id} className={selectedId === c.id ? 'selected' : ''} onClick={() => setSelectedId(c.id)}>
                      <td><input type="checkbox" onClick={e => e.stopPropagation()} /></td>
                      <td className="cs-txt-bold">{c.numero}</td>
                      <td className="cs-txt-muted">-</td>
                      <td>{formatDate(c.created_at).split(' à')[0]}</td>
                      <td>{c.destinataire}</td>
                      <td>-</td>
                      <td className="cs-objet-cell">{c.objet}</td>
                      <td>
                        <span className="cs-badge-outline capitalize" style={{ color: ps.color, borderColor: ps.border }}>
                          ↑ {c.priorite}
                        </span>
                      </td>
                      <td>
                        <span className="cs-badge-dot" style={{ color: ss.color }}>
                          <span className="cs-dot" style={{ background: ss.dot }} /> {ss.label}
                        </span>
                      </td>
                      <td>{c.auteur_nom || 'Auteur'}</td>
                      <td><div className="cs-badge-icon"><Eye size={12} /> {pjCount}</div></td>
                      <td><span className="cs-wf-ring" style={{ borderColor: ss.color }}></span></td>
                      <td><button className="cs-icon-btn"><MoreVertical size={16} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="cs-pagination">
            <span>Affichage de 1 à {courriers.length} sur {totalCount} courriers</span>
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
        {selected ? (
        <div className="cs-preview-column">
          <div className="cs-preview-header">
            <h3>Aperçu du courrier</h3>
            <span className="cs-badge-active capitalize">
              {(statutStyles[selected.statut] || statutStyles['brouillon']).label}
            </span>
          </div>
          
          <div className="cs-preview-image-placeholder">
            <div className="cs-doc-graphic">📄 Illustration du Document</div>
          </div>
          
          <div className="cs-preview-details">
            <div className="cs-preview-title-row">
              <h4>{selected.numero}</h4>
              <span className="cs-badge-outline capitalize" style={{ 
                color: (prioriteStyles[selected.priorite?.toLowerCase()] || prioriteStyles.normale).color, 
                borderColor: (prioriteStyles[selected.priorite?.toLowerCase()] || prioriteStyles.normale).border 
              }}>{selected.priorite} priorité</span>
            </div>
            
            <table className="cs-preview-table">
              <tbody>
                <tr><td><UserCircle2 size={14}/> Destinataire</td><td>{selected.destinataire}</td></tr>
                <tr><td><Calendar size={14}/> Date de création</td><td>{formatDate(selected.created_at)}</td></tr>
                {selected.date_envoi && (
                   <tr><td><Calendar size={14}/> Date d'envoi</td><td>{formatDate(selected.date_envoi)}</td></tr>
                )}
                <tr><td><UserCircle2 size={14}/> Auteur</td><td>{selected.auteur_nom || 'Auteur'}</td></tr>
                <tr><td><Paperclip size={14}/> Pièces jointes</td><td>{selected.pieces_jointes?.length || 0} fichiers</td></tr>
                <tr><td><CheckCircle size={14}/> Statut d'envoi</td><td style={{ color: (statutStyles[selected.statut] || statutStyles['brouillon']).color }}>● {(statutStyles[selected.statut] || statutStyles['brouillon']).label}</td></tr>
              </tbody>
            </table>
            
            <button className="cs-secondary-btn-full">Voir le courrier complet</button>
          </div>
        </div>
        ) : (
          <div className="cs-preview-column">
            <div className="flex flex-col items-center justify-center p-12 text-gray-400">
               <span>Sélectionnez un courrier pour voir l'aperçu</span>
            </div>
          </div>
        )}
        
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
        <button className="cs-primary-btn" onClick={() => navigate('/courriers-sortants/nouveau')}><Plus size={16}/> Nouveau courrier</button>
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
