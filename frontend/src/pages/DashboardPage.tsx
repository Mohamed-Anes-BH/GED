import { useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Folder, Mail, Send, Clock, Archive, ScanText, Box, FileText,
  FilePlus, FolderPlus, Scan, Search, ChevronLeft, ChevronRight,
  MoreVertical, Calendar as CalendarIcon, FileOutput
} from 'lucide-react';
import '../styles/dashboard.css';

/* ─── MOCK DATA ──────────────────────────────────────────── */
const kpis = [
  { label: 'Documents actifs', value: '1,248', delta: '+12% ce mois', color: '#FACC15', icon: Folder },
  { label: 'Courriers entrants', value: '320', delta: '+5% ce mois', color: '#FF6B00', icon: Mail },
  { label: 'Courriers sortants', value: '215', delta: '+8% ce mois', color: '#FF6B00', icon: Send },
  { label: 'Workflow en attente', value: '18', delta: '-3% ce mois', color: '#EF4444', icon: Clock, trendDown: true },
  { label: 'Documents archivés', value: '2,451', delta: '+18% ce mois', color: '#A1A1AA', icon: Archive },
  { label: 'OCR effectués', value: '892', delta: '+22% ce mois', color: '#FACC15', icon: ScanText },
  { label: 'Boîtes physiques', value: '156', delta: '+7% ce mois', color: '#D97706', icon: Box },
  { label: 'Documents diffusés', value: '530', delta: '+14% ce mois', color: '#EF4444', icon: FileOutput },
];

const chartData = [
  { name: '15 Avr', ajout: 10, entrants: 20, sortants: 15, archives: 5 },
  { name: '20 Avr', ajout: 25, entrants: 35, sortants: 20, archives: 10 },
  { name: '25 Avr', ajout: 15, entrants: 25, sortants: 30, archives: 8 },
  { name: '30 Avr', ajout: 45, entrants: 45, sortants: 25, archives: 12 },
  { name: '05 Mai', ajout: 30, entrants: 55, sortants: 40, archives: 20 },
  { name: '10 Mai', ajout: 50, entrants: 35, sortants: 35, archives: 15 },
  { name: 'Auj', ajout: 72, entrants: 38, sortants: 28, archives: 15 },
];

const actionList = [
  { icon: FilePlus, label: 'Ajouter un document', bg: '#FEF08A', color: '#D97706' },
  { icon: Mail, label: 'Nouveau courrier', bg: '#FFEDD5', color: '#EA580C' },
  { icon: FolderPlus, label: 'Nouveau dossier', bg: '#FEF08A', color: '#D97706' },
  { icon: Scan, label: 'Scanner un document', bg: '#FFEDD5', color: '#EA580C' },
  { icon: Box, label: 'Créer une boîte', bg: '#FEF08A', color: '#D97706' },
  { icon: Search, label: 'Recherche avancée', bg: '#FEF08A', color: '#D97706' },
];

const recentDocs = [
  { id: '1', nom: 'Contrat_prestation_2024.pdf', dossier: 'Contrats', categorie: 'Contrats', ajoutPar: 'Sofiane Hamidi', date: '12/05/2024 10:45', taille: '2.4 Mo', type: 'pdf' },
  { id: '2', nom: 'Rapport_activite_T1_2024.docx', dossier: 'Rapports', categorie: 'Rapports', ajoutPar: 'Imane B.', date: '11/05/2024 14:22', taille: '1.1 Mo', type: 'doc' },
  { id: '3', nom: 'Courrier_Ministere_0456.pdf', dossier: 'Courriers entrants', categorie: 'Administratif', ajoutPar: 'Yacine M.', date: '11/05/2024 09:15', taille: '856 Ko', type: 'pdf' },
  { id: '4', nom: 'Liste_fournisseurs_2024.xlsx', dossier: 'Fournisseurs', categorie: 'Fournisseurs', ajoutPar: 'Sofiane Hamidi', date: '10/05/2024 16:30', taille: '320 Ko', type: 'xls' },
];

const categoryStyles: Record<string, { color: string; border: string }> = {
  Contrats:      { color: '#F59E0B', border: '#FDE68A' },
  Rapports:      { color: '#FACC15', border: '#FEF08A' },
  Administratif: { color: '#EF4444', border: '#FECACA' },
  Fournisseurs:  { color: '#D97706', border: '#FDE68A' },
};

const activities = [
  { title: 'Nouveau document ajouté', desc: 'Contrat_prestation_2024.pdf', time: 'Il y a 10 min', color: '#FACC15', icon: FilePlus },
  { title: 'Nouveau courrier entrant', desc: 'Lettre_Ministere_0421.pdf', time: 'Il y a 35 min', color: '#FF6B00', icon: Mail },
  { title: 'OCR terminé', desc: 'Rapport_activite_T1_2024.pdf', time: 'Il y a 1 h', color: '#22C55E', icon: ScanText },
  { title: 'Dossier modifié', desc: 'Dossier "Contrats" mis à jour', time: 'Il y a 2 h', color: '#F59E0B', icon: Folder },
  { title: 'Nouvelle boîte créée', desc: 'Boîte "B-2024-15"', time: 'Il y a 3 h', color: '#D97706', icon: Box },
];

const typeIcons: Record<string, { bg: string; color: string; label: string }> = {
  pdf: { bg: '#FEE2E2', color: '#EF4444', label: 'PDF' },
  doc: { bg: '#DBEAFE', color: '#3B82F6', label: 'W' },
  xls: { bg: '#DCFCE7', color: '#22C55E', label: 'X' },
};

/* ─── COMPONENT ──────────────────────────────────────────── */
import { useEffect, useState as reactUseState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export function DashboardPage({ onOpenDocument, onNavigate }: { onOpenDocument: (id: number) => void; onNavigate: (page: string) => void }) {
  const { user } = useAuth();
  const [kpiData, setKpiData] = useState<any>(null);

  useEffect(() => {
    api.get('dashboard/kpis/')
      .then(res => setKpiData(res.data))
      .catch(console.error);
  }, []);

  // Map backend stats to the UI structure if available, otherwise use mock
  const displayKpis = kpiData ? [
    { label: 'Documents actifs', value: kpiData.total_documents, delta: `Nouveaux: ${kpiData.nouveaux_documents_30_jours}`, color: '#FACC15', icon: Folder },
    { label: 'Total Courriers', value: kpiData.total_courriers, delta: '-', color: '#FF6B00', icon: Mail },
    { label: 'Tâches en attente', value: kpiData.taches_en_attente, delta: '-', color: '#EF4444', icon: Clock, trendDown: kpiData.taches_en_attente > 0 },
    ...kpis.slice(3) // keep the remaining mocked for visually filling the dashboard
  ] : kpis;

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
              {/* Mini Sparkline shape */}
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
                <h3>Activité documentaire</h3>
                <select className="dash-v2-select"><option>30 derniers jours</option></select>
              </div>
              
              <div className="dash-legend">
                <span><span className="legend-dot" style={{ background: '#FACC15' }}></span> Documents ajoutés</span>
                <span><span className="legend-dot" style={{ background: '#FF6B00' }}></span> Courriers entrants</span>
                <span><span className="legend-dot" style={{ background: '#EF4444' }}></span> Courriers sortants</span>
                <span><span className="legend-dot" style={{ background: '#27272A' }}></span> Documents archivés</span>
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
                    <Area type="monotone" dataKey="ajout" stroke="#FACC15" strokeWidth={2} fill="url(#colorAjout)" />
                    <Area type="monotone" dataKey="entrants" stroke="#FF6B00" strokeWidth={2} fill="none" />
                    <Area type="monotone" dataKey="sortants" stroke="#EF4444" strokeWidth={2} fill="none" />
                    <Area type="monotone" dataKey="archives" stroke="#27272A" strokeWidth={2} fill="none" />
                  </AreaChart>
                </ResponsiveContainer>

                {/* Hover stats tooltip mockup that appears inside the chart space */}
                <div className="dash-chart-hover-stats">
                  <strong>Aujourd'hui</strong>
                  <div><span style={{ color: '#FACC15' }}>●</span> Documents ajoutés <span>72</span></div>
                  <div><span style={{ color: '#FF6B00' }}>●</span> Courriers entrants <span>38</span></div>
                  <div><span style={{ color: '#EF4444' }}>●</span> Courriers sortants <span>28</span></div>
                  <div><span style={{ color: '#27272A' }}>●</span> Documents archivés <span>15</span></div>
                </div>
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
                    <button key={idx} className="dash-action-btn">
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
              <a href="#tout" className="dash-v2-link" onClick={() => onNavigate('documents')}>Voir tout</a>
            </div>
            
            <table className="dash-v2-table">
              <thead>
                <tr>
                  <th>Nom du document</th>
                  <th>Dossier</th>
                  <th>Catégorie</th>
                  <th>Ajouté par</th>
                  <th>Date</th>
                  <th>Taille</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentDocs.map(doc => {
                  const typeIcon = typeIcons[doc.type];
                  const catStyle = categoryStyles[doc.categorie];
                  return (
                    <tr key={doc.id} onClick={() => onOpenDocument(Number(doc.id))}>
                      <td>
                        <div className="dash-cell-nom">
                          <span className="dash-type-icon" style={{ background: typeIcon.bg, color: typeIcon.color }}>{typeIcon.label}</span>
                          <span className="dash-doc-name">{doc.nom}</span>
                        </div>
                      </td>
                      <td>{doc.dossier}</td>
                      <td>
                        <span className="dash-cat-badge" style={{ color: catStyle.color, borderColor: catStyle.border }}>
                          {doc.categorie}
                        </span>
                      </td>
                      <td>
                        <div className="dash-cell-user">
                          <img src={`https://ui-avatars.com/api/?name=${doc.ajoutPar.replace(' ', '+')}&background=random`} alt="" />
                          <span>{doc.ajoutPar}</span>
                        </div>
                      </td>
                      <td className="dash-txt-muted">{doc.date}</td>
                      <td className="dash-txt-muted">{doc.taille}</td>
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
          
          {/* Calendar Card */}
          <div className="dash-v2-card dash-calendar-card">
            <div className="dash-v2-card-header">
              <h3>Calendrier</h3>
              <div className="dash-cal-controls">
                <button><ChevronLeft size={16}/></button>
                <button><ChevronRight size={16}/></button>
              </div>
            </div>
            
            <div className="dash-cal-month-title">
              <button><ChevronLeft size={14}/></button>
              <strong>Mai 2024</strong>
              <button><ChevronRight size={14}/></button>
            </div>
            
            <div className="dash-cal-grid">
              <div className="dash-cal-days">
                <span>LUN</span><span>MAR</span><span>MER</span><span>JEU</span><span>VEN</span><span>SAM</span><span>DIM</span>
              </div>
              <div className="dash-cal-dates">
                <span className="muted">29</span><span className="muted">30</span>
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span>
                <span>13</span><span>14</span><span className="active">15</span><span>16</span><span>17</span><span>18</span><span>19</span>
                <span>20</span><span>21</span><span>22</span><span>23</span><span>24</span><span>25</span><span>26</span>
                <span>27</span><span className="has-event">28</span><span>29</span><span>30</span><span className="has-event">31</span><span className="muted">1</span><span className="muted">2</span>
              </div>
            </div>
            
            <div className="dash-cal-empty">
              <div className="dash-cal-empty-icon"><CalendarIcon size={24} /></div>
              <div className="dash-cal-empty-text">
                <strong>Aucun événement aujourd'hui</strong>
                <span>Profitez de votre journée !</span>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="dash-v2-card dash-activities-card">
            <div className="dash-v2-card-header">
              <h3>Activités récentes</h3>
              <a href="#tout" className="dash-v2-link">Voir tout</a>
            </div>
            
            <div className="dash-timeline">
              {activities.map((act, idx) => {
                const Icon = act.icon;
                return (
                  <div key={idx} className="dash-timeline-item">
                    <div className="dash-tl-icon-wrapper">
                      <div className="dash-tl-line" />
                      <div className="dash-tl-icon" style={{ background: `${act.color}20`, color: act.color }}>
                        <Icon size={14} />
                      </div>
                    </div>
                    <div className="dash-tl-content">
                      <div className="dash-tl-title">
                        <strong>{act.title}</strong>
                        <span>{act.time}</span>
                      </div>
                      <p>{act.desc}</p>
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