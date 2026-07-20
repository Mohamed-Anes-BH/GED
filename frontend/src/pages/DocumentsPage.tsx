import { useState } from 'react';
import {
  Folder, FileText, Send, Clock, Archive, List, LayoutGrid, ChevronDown,
  Search, SlidersHorizontal, Eye, Download, MoreVertical, Plus,
  User, Calendar, Star, Share2, AlertCircle, Settings
} from 'lucide-react';
import '../styles/documents.css';
import { useDocuments } from '../hooks/useDocuments';
import { formatDate, formatSize, getStatusColor } from '../utils/formatters';
import { Document } from '../types';

const kpis = [
  { label: 'Tous les documents', color: '#FACC15', icon: Folder },
  { label: 'Documents actifs', color: '#22C55E', icon: FileText },
  { label: 'En révision', color: '#3B82F6', icon: Send },
  { label: 'Brouillons', color: '#F59E0B', icon: Clock },
  { label: 'Archives', color: '#94A3B8', icon: Archive },
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

/* ─── COMPONENT ──────────────────────────────────────────── */
export function DocumentsPage({ onOpenDocument, onNavigate, initialFilters = {} }: { onOpenDocument: (id: number) => void; onNavigate: (page: string) => void; initialFilters?: any }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { documents, loading, totalCount, deleteDocument, archiveDocument, toggleFavorite } = useDocuments(initialFilters);

  const getDocIconAndStyle = (fileName: string = '') => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return { bg: '#FEE2E2', color: '#EF4444', label: 'PDF' };
    if (['doc', 'docx'].includes(ext || '')) return { bg: '#DBEAFE', color: '#3B82F6', label: 'W' };
    if (['xls', 'xlsx'].includes(ext || '')) return { bg: '#DCFCE7', color: '#22C55E', label: 'X' };
    return { bg: '#F3F4F6', color: '#6B7280', label: 'TXT' };
  };

  const kpisData = [
    documents.length,
    documents.filter(d => ['actif', 'valide'].includes((d.status || '').toLowerCase())).length,
    documents.filter(d => (d.status || '').toLowerCase() === 'en_revision').length,
    documents.filter(d => (d.status || '').toLowerCase() === 'brouillon').length,
    documents.filter(d => (d.status || '').toLowerCase() === 'archive').length,
  ];

  const recentCount = documents.filter(d => new Date().getTime() - new Date(d.created_at).getTime() < 7 * 24 * 3600 * 1000).length;
  
  const totalStorageBytes = documents.reduce((acc, doc) => {
    return acc + (doc.files && doc.files.length > 0 ? doc.files[0].size : 0);
  }, 0);
  const usedStorageGB = (totalStorageBytes / (1024 * 1024 * 1024)).toFixed(4);

  return (
    <div className="doc-page">
      {/* Header */}
      <div className="doc-header">
        <h2 className="doc-page-title">Documents</h2>
        <p className="doc-page-subtitle">Gérez, consultez et organisez tous vos documents.</p>
      </div>

      {/* KPIs */}
      <div className="doc-kpi-row">
        {/* We reuse the KPI layout and fill the first box with real Total */}
        <div className="doc-kpi-card">
          <div className="doc-kpi-icon" style={{ background: `${kpis[0].color}1A`, color: kpis[0].color }}>
            <Folder size={22} />
          </div>
          <div className="doc-kpi-info">
            <span className="doc-kpi-label">{kpis[0].label}</span>
            <strong className="doc-kpi-value">{kpisData[0]}</strong>
          </div>
        </div>
        {kpis.slice(1).map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="doc-kpi-card">
              <div className="doc-kpi-icon" style={{ background: `${kpi.color}1A`, color: kpi.color }}>
                <Icon size={22} />
              </div>
              <div className="doc-kpi-info">
                <span className="doc-kpi-label">{kpi.label}</span>
                <strong className="doc-kpi-value">{kpisData[i + 1]}</strong>
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
                  <th>ID</th>
                  <th>Catégorie</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Taille</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc: Document) => {
                  const catName = typeof doc.category === 'object' ? (doc.category as any)?.name : 'Catégorie';
                  const catStyle = categoryStyles[catName] || { color: '#64748B', border: '#CBD5E1' };
                  
                  const fileStr = doc.files && doc.files.length > 0 ? doc.files[0].filename : 'document.pdf';
                  const fileSize = doc.files && doc.files.length > 0 ? doc.files[0].size : null;
                  const typeIcon = getDocIconAndStyle(fileStr);

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
                          <span className="doc-name font-medium">{doc.title}</span>
                        </div>
                      </td>
                      <td>DOC-{String(doc.id).padStart(4, '0')}</td>
                      <td>
                        <span className="doc-cat-badge" style={{ color: catStyle.color, borderColor: catStyle.border }}>
                          {catName}
                        </span>
                      </td>
                      <td>
                         <span className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="doc-date-cell">
                        {formatDate(doc.created_at).split(' à ')[0]}<br/>
                        <small>{formatDate(doc.created_at).split(' à ')[1]}</small>
                      </td>
                      <td>{formatSize(fileSize)}</td>
                      <td>
                        <div className="doc-actions">
                          <button title="Favori" onClick={(e) => { e.stopPropagation(); toggleFavorite(doc.id); }}>
                            <Star size={16} className={doc.is_favorite ? "text-yellow-500 fill-current" : "text-gray-400"} />
                          </button>
                          <button title="Voir" onClick={(e) => { e.stopPropagation(); onOpenDocument(Number(doc.id)); }}><Eye size={16} /></button>
                          <button title="Archiver" onClick={(e) => { e.stopPropagation(); archiveDocument(doc.id); }}><Archive size={16} /></button>
                          <button title="Options"><MoreVertical size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className="doc-pagination">
              <span>Affichage 1 à {documents.length} sur {totalCount} résultats</span>
              <div className="doc-pager">
                <button>«</button>
                <button>‹</button>
                <button className="active">1</button>
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
                <Clock size={16} className="doc-qf-icon" /> Récemment ajoutés <span className="doc-qf-count">{recentCount}</span>
              </button>
              <button className="doc-qf-btn">
                <Star size={16} className="doc-qf-icon" /> Favoris <span className="doc-qf-count">0</span>
              </button>
              <button className="doc-qf-btn">
                <AlertCircle size={16} className="doc-qf-icon" /> Documents expirés <span className="doc-qf-count">0</span>
              </button>
            </div>
          </div>

          <div className="doc-side-card">
            <div className="doc-side-header">
              <h3>Stockage</h3>
            </div>
            
            <div className="doc-storage-chart">
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
              <div className="doc-s-row"><span>Utilisé</span><strong>{usedStorageGB === '0.0000' ? '< 0.01' : usedStorageGB} Go</strong></div>
              <div className="doc-s-row"><span>Disponible</span><strong>{(500 - parseFloat(usedStorageGB)).toFixed(2)} Go</strong></div>
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