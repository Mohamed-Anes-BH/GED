import { useState, useEffect, useCallback } from 'react';
import { BarChart2, RefreshCw, Download, FileText, Send, Folder, Users, Archive, Loader2 } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { dashboardService } from '../services/dashboard';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const PIE_COLORS = ['#fbbf24', '#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#14b8a6', '#f97316', '#6366f1'];

export function StatistiquesPage() {
  const { kpis, chartData, loading } = useDashboard();
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [courrierStats, setCourrierStats] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [localChartData, setLocalChartData] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [period, setPeriod] = useState<number>(30);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [catData, courData, userData, evoData] = await Promise.all([
        dashboardService.getCategoryStats().catch(() => []),
        dashboardService.getCourrierStats().catch(() => null),
        dashboardService.getUserStats().catch(() => null),
        dashboardService.getChartData({ days: period }).catch(() => null),
      ]);
      setCategoryStats(Array.isArray(catData) ? catData : []);
      setCourrierStats(courData);
      setUserStats(userData);
      
      if (evoData) {
        const dateMap: Record<string, any> = {};
        const processArray = (arr: any[] | undefined, key: string) => {
          if (!arr) return;
          arr.forEach((item: any) => {
            const d = new Date(item.day);
            const dateStr = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
            if (!dateMap[dateStr]) dateMap[dateStr] = { name: dateStr, timestamp: d.getTime() };
            dateMap[dateStr][key] = item.count || 0;
          });
        };
        
        processArray(evoData.documents, 'documents');
        processArray(evoData.courriers_entrants, 'entrants');
        processArray(evoData.courriers_sortants, 'sortants');
        processArray(evoData.logins, 'connexions');
        processArray(evoData.views, 'consultations');
        
        const mergedArray = Object.values(dateMap).sort((a, b) => a.timestamp - b.timestamp);
        setLocalChartData(mergedArray);
      }
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Build pieData from real category stats
  const pieData = categoryStats.length > 0 
    ? categoryStats.map(c => ({ name: c.category__name || c.category || c.name || 'Autre', value: c.count || c.total || 1 }))
    : [];

  // Build barData from real courrier stats if available, else from localChartData
  const activeChartData = localChartData.length > 0 ? localChartData : chartData;
  const barData = activeChartData.map(d => ({
    name: d.name,
    entrants: d.entrants || 0,
    sortants: d.sortants || 0,
  }));

  const activityData = activeChartData.map(d => ({
    name: d.name,
    connexions: d.connexions || 0,
    consultations: d.consultations || 0,
    telechargements: d.downloads || d.telechargements || 0,
  }));

  const handleExportPdf = async () => {
    try {
      const blob = await dashboardService.exportStatsPdf();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'statistiques_agrodiv.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur export PDF:', err);
    }
  };

  const isLoading = loading || statsLoading;

  return (
    <div className="flex flex-col gap-6 font-poppins pb-10 text-gray-800 dark:text-[var(--dash-text)]">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <BarChart2 size={26} className="text-yellow-500" />
        </div>
        <div className="flex flex-col flex-1">
          <h2 className="text-3xl font-bold font-oswald text-gray-900 dark:text-[#FFFFFF]">Statistiques</h2>
          <div className="text-[11px] font-medium text-gray-400 mt-0.5 flex items-center gap-1">
            <span>Accueil</span> <span>›</span> <span className="text-orange-500 font-semibold">Statistiques</span>
          </div>
          <p className="text-[13px] text-blue-500 font-medium mt-1">Visualisez les indicateurs de performance de votre plateforme GED.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-4 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <label className="text-[10px] font-bold text-gray-500">Période</label>
          <div className="flex items-center gap-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-3 py-2 bg-white dark:bg-[var(--dash-card-bg)]">
            <span className="text-gray-400">📅</span>
            <select 
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="flex-1 outline-none text-xs font-medium text-gray-700 dark:text-[var(--dash-text-muted)] bg-transparent">
              <option value={7}>7 derniers jours</option>
              <option value={30}>30 derniers jours</option>
              <option value={365}>Cette année</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <label className="text-[10px] font-bold text-gray-500">Département</label>
          <div className="flex items-center gap-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-3 py-2 bg-white dark:bg-[var(--dash-card-bg)]">
            <span className="text-gray-400">🏢</span>
            <select className="flex-1 outline-none text-xs font-medium text-gray-700 dark:text-[var(--dash-text-muted)] bg-transparent"><option>Tous les départements</option></select>
          </div>
        </div>
        <button onClick={fetchStats} className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 text-gray-900 dark:text-[#FFFFFF] font-bold text-[13px] rounded-xl shadow-sm hover:bg-yellow-500 shrink-0">
          <RefreshCw size={15}/> Actualiser
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Documents', val: loading ? '...' : kpis?.total_documents || 0, icon: FileText, bg: 'bg-orange-50 text-orange-400' },
          { label: 'Courriers entrants', val: loading ? '...' : kpis?.courriers_entrants || 0, icon: Download, bg: 'bg-green-50 text-green-400' },
          { label: 'Courriers sortants', val: loading ? '...' : kpis?.courriers_sortants || 0, icon: Send, bg: 'bg-blue-50 text-blue-400' },
          { label: 'Dossiers', val: loading ? '...' : kpis?.dossiers_actifs || 0, icon: Folder, bg: 'bg-purple-50 text-purple-400' },
          { label: 'Tâches en attente', val: loading ? '...' : kpis?.taches_en_attente || 0, icon: Users, bg: 'bg-red-50 text-red-400' },
          { label: 'Documents archivés', val: loading ? '...' : kpis?.documents_archives || 0, icon: Archive, bg: 'bg-teal-50 text-teal-400' },
        ].map(k => (
          <div key={k.label} className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-4 shadow-sm flex flex-col gap-2 relative overflow-hidden">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${k.bg}`}><k.icon size={17}/></div>
            <strong className="text-2xl font-bold font-oswald text-gray-900 dark:text-[#FFFFFF] leading-tight">{k.val}</strong>
            <span className="text-[11px] font-medium text-gray-500">{k.label}</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      {isLoading ? <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-orange-500" size={48}/></div> : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Line chart: Évolution */}
            <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-[15px] text-gray-800 dark:text-[var(--dash-text)]">Évolution des documents</h3>
              </div>
              <div className="h-64">
                {activeChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activeChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="documents" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <div className="flex items-center justify-center h-full text-gray-400 text-sm">Aucune donnée d'évolution</div>}
              </div>
            </div>

            {/* Donut chart: par catégorie (DYNAMIC) */}
            <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h3 className="font-semibold text-[15px] text-gray-800 dark:text-[var(--dash-text)]">Documents par catégorie</h3>
              <div className="flex items-center h-64">
                {pieData.length > 0 ? (
                  <>
                    <div className="w-1/2 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                            {pieData.map((_entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-1/2 flex flex-col gap-3">
                      {pieData.map((entry, i) => (
                        <div key={entry.name} className="flex justify-between items-center text-[11px]">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{backgroundColor: PIE_COLORS[i % PIE_COLORS.length]}}></div>
                            <span className="font-medium text-gray-700 dark:text-[var(--dash-text-muted)]">{entry.name}</span>
                          </div>
                          <span className="font-semibold text-gray-600 dark:text-[var(--dash-text-muted)]">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">Aucune donnée par catégorie</div>}
              </div>
            </div>
          </div>

          {/* Second row charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Bar chart: Courriers (DYNAMIC) */}
            <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-[15px] mb-4">Courriers</h3>
              <div className="h-64">
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="entrants" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="sortants" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="flex items-center justify-center h-full text-gray-400 text-sm">Aucune donnée courrier</div>}
              </div>
            </div>

            {/* Line chart: Activité utilisateurs (DYNAMIC) */}
            <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-[15px] mb-4">Activité utilisateurs</h3>
              <div className="h-64">
                {activityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Line type="monotone" dataKey="connexions" stroke="#fbbf24" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="consultations" stroke="#22c55e" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="telechargements" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <div className="flex items-center justify-center h-full text-gray-400 text-sm">Aucune donnée d'activité</div>}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Summary table */}
      <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-5 shadow-sm mt-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-[15px]">Résumé général</h3>
          <div className="flex gap-2">
            <button onClick={handleExportPdf} className="flex items-center gap-1.5 px-4 py-2 border border-orange-200 bg-orange-50 text-orange-600 rounded-xl text-[12px] font-semibold hover:bg-orange-100"><FileText size={13}/> Exporter PDF</button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label:'Documents', val: loading ? '...' : kpis?.total_documents || 0, icon:FileText, color:'text-orange-500 bg-orange-50' },
            { label:'Courriers entrants', val: loading ? '...' : kpis?.courriers_entrants || 0, icon:Download, color:'text-green-500 bg-green-50' },
            { label:'Courriers sortants', val: loading ? '...' : kpis?.courriers_sortants || 0, icon:Send, color:'text-blue-500 bg-blue-50' },
            { label:'Dossiers', val: loading ? '...' : kpis?.dossiers_actifs || 0, icon:Folder, color:'text-purple-500 bg-purple-50' },
            { label:'Tâches', val: loading ? '...' : kpis?.taches_en_attente || 0, icon:Users, color:'text-red-500 bg-red-50' },
            { label:'Archivés', val: loading ? '...' : kpis?.documents_archives || 0, icon:Archive, color:'text-teal-500 bg-teal-50' },
          ].map(k=>(
            <div key={k.label} className="flex flex-col items-center gap-2 p-3 border border-gray-100 dark:border-[var(--dash-border)] rounded-xl bg-gray-50 dark:bg-[var(--dash-bg)]/50">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${k.color}`}><k.icon size={16}/></div>
              <strong className="text-xl font-bold font-oswald">{k.val}</strong>
              <span className="text-[10px] font-medium text-gray-500 text-center">{k.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
