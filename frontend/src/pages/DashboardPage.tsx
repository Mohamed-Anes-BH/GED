import { Link } from 'react-router-dom';
import {
  Folder, Mail, Send, Clock, Archive, ScanText, Box, FileText,
  FilePlus, FolderPlus, Search, ChevronLeft, ChevronRight,
  MoreVertical, Calendar as CalendarIcon, FileOutput, Loader2
} from 'lucide-react';
import '../styles/dashboard.css';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { formatDate, formatSize } from '../utils/formatters';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/* ─── COMPONENT ──────────────────────────────────────────── */
export function DashboardPage({ onOpenDocument, onNavigate }: { onOpenDocument: (id: number) => void; onNavigate: (page: string) => void }) {
  const { user } = useAuth();
  const { kpis, recentDocs, activities, chartData, loading } = useDashboard();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={48} />
      </div>
    );
  }

  // Base setup mapping real backend variables to UI
  const displayKpis = [
    { label: 'Documents actifs', value: kpis?.total_documents || 0, delta: `Nouveaux: ${kpis?.nouveaux_documents_30_jours || 0}`, color: '#FACC15', icon: Folder, trendDown: false },
    { label: 'Courriers entrants', value: kpis?.courriers_entrants || 0, delta: '-', color: '#FF6B00', icon: Mail, trendDown: false },
    { label: 'Courriers sortants', value: kpis?.courriers_sortants || 0, delta: '-', color: '#FF6B00', icon: Send, trendDown: false },
    { label: 'Tâches en attente', value: kpis?.taches_en_attente || 0, delta: '-', color: '#EF4444', icon: Clock, trendDown: (kpis?.taches_en_attente || 0) > 0 },
    { label: 'Documents archivés', value: kpis?.documents_archives || 0, delta: '-', color: '#A1A1AA', icon: Archive, trendDown: false },
    { label: 'Workflow en cours', value: kpis?.workflows_en_cours || 0, delta: '-', color: '#FACC15', icon: ScanText, trendDown: false },
    { label: 'Dossiers Actifs', value: kpis?.dossiers_actifs || 0, delta: '-', color: '#D97706', icon: Box, trendDown: false },
    { label: 'Total Courriers', value: kpis?.total_courriers || 0, delta: '-', color: '#EF4444', icon: FileOutput, trendDown: false },
  ];

  const actionList = [
    { icon: FilePlus, label: 'Ajouter un document', bg: '#FEF08A', color: '#D97706', action: () => onNavigate('upload') },
    { icon: Mail, label: 'Nouveau courrier', bg: '#FFEDD5', color: '#EA580C', action: () => onNavigate('inbox') },
    { icon: FolderPlus, label: 'Nouveau dossier', bg: '#FEF08A', color: '#D97706', action: () => onNavigate('dossiers') },
    { icon: Search, label: 'Recherche avancée', bg: '#FEF08A', color: '#D97706', action: () => onNavigate('documents') },
  ];

  const getDocIconAndStyle = (fileName: string = '') => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return { bg: '#FEE2E2', color: '#EF4444', label: 'PDF' };
    if (['doc', 'docx'].includes(ext || '')) return { bg: '#DBEAFE', color: '#3B82F6', label: 'W' };
    if (['xls', 'xlsx'].includes(ext || '')) return { bg: '#DCFCE7', color: '#22C55E', label: 'X' };
    return { bg: '#F3F4F6', color: '#6B7280', label: 'TXT' };
  };

  return (
    <div className="dash-v2-page">
      {/* Header */}
      <div className="dash-v2-header">
        <h2 className="dash-v2-title">Bonjour, {user?.first_name || 'Utilisateur'} ! 👋</h2>
        <p className="dash-v2-subtitle">Voici un aperçu de votre activité documentaire aujourd'hui.</p>
      </div>

      {/* KPI Grid */}
      <div className="dash-v2-kpi-grid">
        {displayKpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="dash-v2-kpi-card">
              <div className="dash-v2-kpi-icon" style={{ background: `${kpi.color}1A`, color: kpi.color }}>
                <Icon size={22} />
              </div>
              <div className="dash-v2-kpi-info">
                <span className="dash-v2-kpi-label">{kpi.label}</span>
                <strong className="dash-v2-kpi-value">{kpi.value}</strong>
                <span className="dash-v2-kpi-delta" style={{ color: kpi.trendDown ? '#EF4444' : '#22C55E' }}>
                  {kpi.trendDown ? '↓' : '↑'} {kpi.delta}
                </span>
              </div>
              <div className="dash-v2-mini-chart">
                 <svg viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d={kpi.trendDown
                    ? 'M0,5 Q25,20 50,15 T100,5'
                    : 'M0,15 Q25,5 50,10 T100,2'}
                    fill="none" stroke={`${kpi.color}80`} strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="dash-v2-content">
        
        {/* Left Column */}
        <div className="dash-v2-left">
          
          <div className="dash-v2-row-charts">
            {/* Chart Card */}
            <div className="dash-v2-card dash-chart-card">
              <div className="dash-v2-card-header">
                <h3>Activité documentaire (30 jours)</h3>
              </div>
              
              <div className="dash-legend">
                <span><span className="legend-dot" style={{ background: '#FACC15' }}></span> Documents ajoutés</span>
                <span><span className="legend-dot" style={{ background: '#FF6B00' }}></span> Courriers traités</span>
              </div>
              
              <div className="dash-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAjout" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FACC15" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#FACC15" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A1A1AA' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A1A1AA' }} />
                    <Tooltip cursor={{ stroke: 'rgba(255,255,255,0.1)' }} contentStyle={{ borderRadius: 12, border: 'none', background: 'var(--dash-card-bg)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }} />
                    <Area type="monotone" dataKey="documents" stroke="#FACC15" strokeWidth={2} fill="url(#colorAjout)" />
                    <Area type="monotone" dataKey="courriers" stroke="#FF6B00" strokeWidth={2} fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="dash-v2-card dash-actions-card">
              <div className="dash-v2-card-header">
                <h3>Actions rapides</h3>
              </div>
              <div className="dash-actions-grid">
                {actionList.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button key={idx} className="dash-action-btn" onClick={action.action}>
                      <div className="dash-action-icon" style={{ background: action.bg, color: action.color }}>
                        <Icon size={20} />
                      </div>
                      <span>{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Docs Table */}
          <div className="dash-v2-card">
            <div className="dash-v2-card-header">
              <h3>Documents récents</h3>
              <a href="#tout" className="dash-v2-link" onClick={(e) => { e.preventDefault(); onNavigate('documents'); }}>Voir tout</a>
            </div>
            
            <table className="dash-v2-table">
              <thead>
                <tr>
                  <th>Nom du document</th>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Taille</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentDocs.length === 0 ? (
                   <tr><td colSpan={5} className="text-center p-4 text-gray-500">Aucun document récent.</td></tr>
                ) : null}
                {recentDocs.map((doc: any) => {
                  const fileStr = doc.files && doc.files.length > 0 ? doc.files[0].filename : 'document.pdf';
                  const fileSize = doc.files && doc.files.length > 0 ? doc.files[0].size : null;
                  const typeIcon = getDocIconAndStyle(fileStr);

                  return (
                    <tr key={doc.id} onClick={() => onOpenDocument(Number(doc.id))}>
                      <td>
                        <div className="dash-cell-nom">
                          <span className="dash-type-icon" style={{ background: typeIcon.bg, color: typeIcon.color }}>{typeIcon.label}</span>
                          <span className="dash-doc-name">{doc.title}</span>
                        </div>
                      </td>
                      <td>DOC-{String(doc.id).padStart(4, '0')}</td>
                      <td className="dash-txt-muted">{formatDate(doc.created_at)}</td>
                      <td className="dash-txt-muted">{formatSize(fileSize)}</td>
                      <td>
                        <button className="dash-more-btn" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Column */}
        <div className="dash-v2-right">
          
          {/* Calendar Box */}
          <div className="dash-v2-card dash-calendar-card">
            <div className="dash-v2-card-header">
              <h3>Édition</h3>
            </div>
            <div className="dash-cal-empty">
              <div className="dash-cal-empty-icon"><CalendarIcon size={24} /></div>
              <div className="dash-cal-empty-text">
                <strong>En temps réel</strong>
                <span>Ces statistiques sont synchronisées avec la BDD.</span>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="dash-v2-card dash-activities-card">
            <div className="dash-v2-card-header">
              <h3>Activités récentes</h3>
            </div>
            
            <div className="dash-timeline">
              {activities.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Aucune activité récente.</p>
              ) : null}
              {activities.slice(0, 6).map((act: any, idx: number) => {
                const isAudit = act.type === 'audit';
                const color = isAudit ? '#F59E0B' : '#3B82F6';
                const Icon = isAudit ? ScanText : FilePlus;
                
                return (
                  <div key={idx} className="dash-timeline-item">
                    <div className="dash-tl-icon-wrapper">
                      <div className="dash-tl-line" />
                      <div className="dash-tl-icon" style={{ background: `${color}20`, color: color }}>
                        <Icon size={14} />
                      </div>
                    </div>
                    <div className="dash-tl-content">
                      <div className="dash-tl-title">
                        <strong>{isAudit ? `Audit: ${act.action}` : `Document créé`}</strong>
                        <span>{formatDate(act.created_at)}</span>
                      </div>
                      <p className="text-sm truncate">{isAudit ? act.resource_name : act.title}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}