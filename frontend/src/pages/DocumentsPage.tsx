import { useState } from 'react';
import {
  Folder, FileText, Send, Clock, Archive, List, LayoutGrid, ChevronDown, 
  Search, SlidersHorizontal, Eye, Download, MoreVertical, Plus,
  User, Calendar, Star, Share2, AlertCircle, Settings
} from 'lucide-react';
import '../styles/documents.css';

/* ─── MOCK DATA ──────────────────────────────────────────── */
const kpis = [
  { label: 'Tous les documents', value: '5,248', delta: '+12% ce mois', color: '#FACC15', icon: Folder },
  { label: 'Documents actifs', value: '3,842', delta: '+8% ce mois', color: '#22C55E', icon: FileText },
  { label: 'Diffusés', value: '956', delta: '+6% ce mois', color: '#FF6B00', icon: Send },
  { label: 'En attente', value: '320', delta: '-3% ce mois', color: '#F59E0B', icon: Clock, trendDown: true },
  { label: 'Archives', value: '130', delta: '+4% ce mois', color: '#94A3B8', icon: Archive },
];

const documents = [
  { id: '1', nom: 'Contrat_prestation_2024.pdf', favori: true, type: 'pdf', dossier: 'Contrats', categorie: 'Contrats', statut: 'Actif', ajoutPar: 'Sofiane Hamidi', date: '12/05/2024 10:45', taille: '2.4 Mo' },
  { id: '2', nom: 'Rapport_activite_T1_2024.docx', favori: false, type: 'doc', dossier: 'Rapports', categorie: 'Rapports', statut: 'Diffusé', ajoutPar: 'Imane B.', date: '11/05/2024 14:22', taille: '1.1 Mo' },
  { id: '3', nom: 'Courrier_Ministere_0456.pdf', favori: false, type: 'pdf', dossier: 'Courriers entrants', categorie: 'Administratif', statut: 'En attente', ajoutPar: 'Yacine M.', date: '11/05/2024 09:15', taille: '856 Ko' },
  { id: '4', nom: 'Liste_fournisseurs_2024.xlsx', favori: false, type: 'xls', dossier: 'Fournisseurs', categorie: 'Fournisseurs', statut: 'Actif', ajoutPar: 'Sofiane Hamidi', date: '10/05/2024 16:30', taille: '320 Ko' },
  { id: '5', nom: 'Note_interne_0324.pdf', favori: false, type: 'pdf', dossier: 'Notes internes', categorie: 'Interne', statut: 'Diffusé', ajoutPar: 'Imane B.', date: '09/05/2024 11:05', taille: '512 Ko' },
  { id: '6', nom: 'Guide_procedure_GED.pdf', favori: false, type: 'pdf', dossier: 'Procédures', categorie: 'Procédures', statut: 'Actif', ajoutPar: 'Sofiane Hamidi', date: '08/05/2024 15:42', taille: '3.7 Mo' },
  { id: '7', nom: 'PV_reunion_comite.docx', favori: false, type: 'doc', dossier: 'Réunions', categorie: 'Réunions', statut: 'En attente', ajoutPar: 'Yacine M.', date: '07/05/2024 10:20', taille: '1.5 Mo' },
  { id: '8', nom: 'Facture_2024_1205.pdf', favori: false, type: 'pdf', dossier: 'Factures', categorie: 'Finance', statut: 'Actif', ajoutPar: 'Imane B.', date: '06/05/2024 09:10', taille: '989 Ko' },
];

const categoryStyles: Record<string, { color: string; border: string }> = {
  Contrats:      { color: '#F59E0B', border: '#FDE68A' },
  Rapports:      { color: '#FACC15', border: '#FEF08A' },
  Administratif: { color: '#EF4444', border: '#FECACA' },
  Fournisseurs:  { color: '#22C55E', border: '#BBF7D0' },
  Interne:       { color: '#3B82F6', border: '#BFDBFE' },
  Procédures:    { color: '#8B5CF6', border: '#DDD6FE' },
  Réunions:      { color: '#06B6D4', border: '#A5F3FC' },
  Finance:       { color: '#10B981', border: '#A7F3D0' },
};

const statutStyles: Record<string, string> = {
  'Actif':      '#22C55E',
  'Diffusé':    '#FF6B00',
  'En attente': '#FACC15',
};

const typeIcons: Record<string, { bg: string; color: string; label: string }> = {
  pdf: { bg: '#FEE2E2', color: '#EF4444', label: 'PDF' },
  doc: { bg: '#DBEAFE', color: '#3B82F6', label: 'W' },
  xls: { bg: '#DCFCE7', color: '#22C55E', label: 'X' },
};

/* ─── COMPONENT ──────────────────────────────────────────── */
export function DocumentsPage({ onOpenDocument, onNavigate }: { onOpenDocument: (id: number) => void; onNavigate: (page: string) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="doc-page">
      {/* Header */}
      <div className="doc-header">
        <h2 className="doc-page-title">Documents</h2>
        <p className="doc-page-subtitle">Gérez, consultez et organisez tous vos documents.</p>
      </div>

      {/* KPIs */}
      <div className="doc-kpi-row">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="doc-kpi-card">
              <div className="doc-kpi-icon" style={{ background: `${kpi.color}1A`, color: kpi.color }}>
                <Icon size={22} />
              </div>
              <div className="doc-kpi-info">
                <span className="doc-kpi-label">{kpi.label}</span>
                <strong className="doc-kpi-value">{kpi.value}</strong>
                <span className="doc-kpi-delta" style={{ color: kpi.trendDown ? '#EF4444' : '#22C55E' }}>
                  {kpi.trendDown ? '↓' : '↑'} {kpi.delta}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Layout */}
      <div className="doc-main-layout">
        
        {/* Left Column - Table */}
        <div className="doc-table-section">
          <div className="doc-table-card">
            <div className="doc-table-header-wrap">
              <h3>Liste des documents</h3>
              <div className="doc-view-toggles">
                <button className="active"><List size={14} /></button>
                <button><LayoutGrid size={14} /></button>
              </div>
            </div>

            <div className="doc-filters-row">
              <FilterDropdown label="Statut" value="Tous" />
              <FilterDropdown label="Catégorie" value="Toutes" />
              <FilterDropdown label="Dossier" value="Tous" />
              <FilterDropdown label="Tag" value="Tous" />
              <button className="doc-filter-btn"><SlidersHorizontal size={14} /> + Filtres</button>
            </div>

            <table className="doc-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}><input type="checkbox" /></th>
                  <th>Nom du document</th>
                  <th>Dossier</th>
                  <th>Catégorie</th>
                  <th>Statut</th>
                  <th>Ajouté par</th>
                  <th>Date</th>
                  <th>Taille</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => {
                  const catStyle = categoryStyles[doc.categorie] || { color: '#64748B', border: '#CBD5E1' };
                  const stColor = statutStyles[doc.statut];
                  const typeIcon = typeIcons[doc.type];

                  return (
                    <tr 
                      key={doc.id} 
                      className={selectedId === doc.id ? 'selected' : ''}
                      onClick={() => setSelectedId(doc.id)}
                    >
                      <td><input type="checkbox" onClick={e => e.stopPropagation()} /></td>
                      <td>
                        <div className="doc-name-cell">
                          <span className="doc-type-icon" style={{ background: typeIcon.bg, color: typeIcon.color }}>
                            {typeIcon.label}
                          </span>
                          <span className="doc-name">{doc.nom}</span>
                          {doc.favori && <Star size={12} fill="#FACC15" color="#FACC15" />}
                        </div>
                      </td>
                      <td>{doc.dossier}</td>
                      <td>
                        <span className="doc-cat-badge" style={{ color: catStyle.color, borderColor: catStyle.border }}>
                          {doc.categorie}
                        </span>
                      </td>
                      <td>
                        <span className="doc-statut">
                          <span className="doc-dot" style={{ background: stColor }} />
                          {doc.statut}
                        </span>
                      </td>
                      <td>
                        <div className="doc-user-cell">
                          <img src={`https://ui-avatars.com/api/?name=${doc.ajoutPar.replace(' ', '+')}&background=random`} alt="" />
                          <span>{doc.ajoutPar}</span>
                        </div>
                      </td>
                      <td className="doc-date-cell">
                        {doc.date.split(' ')[0]}<br/>
                        <small>{doc.date.split(' ')[1]}</small>
                      </td>
                      <td>{doc.taille}</td>
                      <td>
                        <div className="doc-actions">
                          <button title="Voir" onClick={(e) => { e.stopPropagation(); onOpenDocument(Number(doc.id)); }}><Eye size={16} /></button>
                          <button title="Télécharger"><Download size={16} /></button>
                          <button title="Plus"><MoreVertical size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className="doc-pagination">
              <span>Affichage 1 à 10 sur 5,248 résultats</span>
              <div className="doc-pager">
                <button>«</button>
                <button>‹</button>
                <button className="active">1</button>
                <button>2</button>
                <button>3</button>
                <button>4</button>
                <button>5</button>
                <span>...</span>
                <button>525</button>
                <button>›</button>
                <button>»</button>
              </div>
              <div className="doc-per-page">
                <select defaultValue="10"><option>10</option></select>
                Lignes par page
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="doc-side-section">
          <button className="doc-primary-btn" onClick={() => onNavigate('upload')}>
            <Plus size={16} /> Ajouter un document <ChevronDown size={14} />
          </button>

          <div className="doc-side-card">
            <div className="doc-side-header">
              <h3>Filtres rapides</h3>
              <ChevronDown size={14} className="doc-chevron-muted" />
            </div>
            <div className="doc-quick-filters">
              <button className="doc-qf-btn">
                <User size={16} className="doc-qf-icon" /> Mes documents
              </button>
              <button className="doc-qf-btn">
                <Clock size={16} className="doc-qf-icon" /> Récemment ajoutés <span className="doc-qf-count">24</span>
              </button>
              <button className="doc-qf-btn">
                <Star size={16} className="doc-qf-icon" /> Favoris <span className="doc-qf-count">15</span>
              </button>
              <button className="doc-qf-btn">
                <Share2 size={16} className="doc-qf-icon" /> Documents partagés
              </button>
              <button className="doc-qf-btn">
                <AlertCircle size={16} className="doc-qf-icon" /> Documents expirés <span className="doc-qf-count">7</span>
              </button>
            </div>
          </div>

          <div className="doc-side-card">
            <div className="doc-side-header">
              <h3>Stockage</h3>
            </div>
            
            <div className="doc-storage-chart">
              {/* Custom Donut Chart implementation representing exactly the design */}
              <div className="doc-donut-wrap">
                <svg viewBox="0 0 100 100" className="doc-donut">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--dash-border)" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#FACC15" strokeWidth="12" strokeDasharray="170 251" strokeLinecap="round" transform="rotate(-90 50 50)" />
                </svg>
                <div className="doc-donut-label">
                  <strong>68%</strong>
                  <span>Utilisé</span>
                </div>
              </div>
            </div>

            <div className="doc-storage-stats">
              <div className="doc-s-row"><span>Utilisé</span><strong>340 Go</strong></div>
              <div className="doc-s-row"><span>Disponible</span><strong>160 Go</strong></div>
              <div className="doc-s-row total"><span>Total</span><strong>500 Go</strong></div>
            </div>

            <button className="doc-stockage-btn">
              Gérer le stockage <Settings size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function FilterDropdown({ label, value }: { label: string; value: string }) {
  return (
    <div className="doc-filter-col">
      <span className="doc-fc-label">{label}</span>
      <div className="doc-fc-select">
        <span>{value}</span>
        <ChevronDown size={14} />
      </div>
    </div>
  );
}