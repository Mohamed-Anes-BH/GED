import { ClipboardList, Download, FileText, Plus, Edit2, Eye, Share, Archive, RefreshCw, Trash2, MoreVertical } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auditService } from '../services/audit';

export function HistoriquePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsData, statsData] = await Promise.all([
          auditService.getLogs().catch(() => ({ results: [] })),
          auditService.getStats().catch(() => null),
        ]);
        setLogs(logsData.results || logsData || []);
        setStats(statsData);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);


  return (
    <div className="flex flex-col gap-6 font-poppins pb-10 text-gray-800 dark:text-[var(--dash-text)]">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <ClipboardList size={26} className="text-orange-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-oswald text-gray-900 dark:text-[#FFFFFF]">Historique</h2>
          <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400 mt-0.5">
            <span>Accueil</span> <span>›</span> <span className="text-orange-500 font-semibold">Historique</span>
          </div>
          <p className="text-[13px] text-gray-500 mt-1">Journal d'audit de toutes les actions effectuées dans le système.</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-4 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
          <label className="text-[10px] font-bold text-gray-500">Type d'action</label>
          <div className="flex items-center gap-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-3 py-2 bg-white dark:bg-[var(--dash-card-bg)]">
            <TagIcon className="text-orange-500" />
            <select className="flex-1 outline-none text-xs font-medium text-gray-700 dark:text-[var(--dash-text-muted)] bg-transparent"><option>Toutes les actions</option></select>
          </div>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
          <label className="text-[10px] font-bold text-gray-500">Utilisateur</label>
          <div className="flex items-center gap-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-3 py-2 bg-white dark:bg-[var(--dash-card-bg)]">
            <UserIcon className="text-yellow-600" />
            <select className="flex-1 outline-none text-xs font-medium text-gray-700 dark:text-[var(--dash-text-muted)] bg-transparent"><option>Tous les utilisateurs</option></select>
          </div>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold text-gray-500">Période</label>
          <div className="flex items-center gap-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-3 py-2 bg-white dark:bg-[var(--dash-card-bg)]">
            <CalendarIcon className="text-orange-500" />
            <div className="flex-1 text-xs font-medium text-gray-700 dark:text-[var(--dash-text-muted)] flex justify-between items-center">
              <span>01/05/2026</span>
              <span className="text-gray-400">→</span>
              <span>31/05/2026</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] text-gray-700 dark:text-[var(--dash-text-muted)] font-semibold text-[13px] rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]"><FileText size={15}/> Export CSV</button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white font-bold text-[13px] rounded-xl shadow-sm hover:bg-orange-600"><FileText size={15}/> Export PDF</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[var(--dash-border)] text-gray-500 font-medium">
                <th className="py-4 px-6 w-48">Action</th>
                <th className="py-4 px-6 w-48">Utilisateur</th>
                <th className="py-4 px-6 w-32">Date</th>
                <th className="py-4 px-6 w-32">Heure</th>
                <th className="py-4 px-6">Détails</th>
                <th className="py-4 px-6 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-4 text-center text-gray-500">Chargement...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="py-4 text-center text-gray-500">Aucun historique trouvé</td></tr>
              ) : logs.map((act: any, i: number) => {
                let ActIcon = Edit2;
                let colorClass = 'text-gray-500';
                let bgClass = 'bg-gray-50 dark:bg-[var(--dash-bg)]';
                let borderClass = 'border-gray-100 dark:border-[var(--dash-border)]';

                if (act.action === 'create') { ActIcon = Plus; colorClass = 'text-green-500'; bgClass = 'bg-green-50'; borderClass = 'border-green-100'; }
                if (act.action === 'update') { ActIcon = Edit2; colorClass = 'text-orange-500'; bgClass = 'bg-orange-50'; borderClass = 'border-orange-100'; }
                if (act.action === 'delete') { ActIcon = Trash2; colorClass = 'text-red-500'; bgClass = 'bg-red-50'; borderClass = 'border-red-100'; }
                const dateObj = new Date(act.created_at || new Date());
                const details = typeof act.details === 'string' ? act.details : JSON.stringify(act.details || {});

                return (
                  <tr key={act.id || i} className="border-b border-gray-50 hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]/80 group">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${bgClass} ${colorClass} ${borderClass}`}>
                          <ActIcon size={15} />
                        </div>
                        <span className={`font-semibold ${colorClass}`}>{act.action || 'ACTION'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-gray-700 dark:text-[var(--dash-text-muted)] flex items-center gap-2 mt-1">
                      {act.user_details?.email && <img src={`https://ui-avatars.com/api/?name=${act.user_details.email}&background=random`} className="w-6 h-6 rounded-full" /> }
                      <span className="font-medium">{act.user_details?.email || act.user || 'Système'}</span>
                    </td>
                    <td className="py-3 px-6 text-gray-500">{dateObj.toLocaleDateString()}</td>
                    <td className="py-3 px-6 text-gray-500">{dateObj.toLocaleTimeString()}</td>
                    <td className="py-3 px-6 text-gray-600 dark:text-[var(--dash-text-muted)] truncate max-w-md" title={details}>{details || `${act.action} sur ${act.resource_type}`}</td>
                    <td className="py-3 px-6 text-right">
                      <button className="text-gray-400 hover:text-gray-600 dark:text-[var(--dash-text-muted)]"><MoreVertical size={14}/></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-[var(--dash-border)] bg-gray-50 dark:bg-[var(--dash-bg)]/50 flex justify-between items-center text-[11px] text-gray-500">
          <span>Affichage de 1 à 8 sur 1 248 éléments</span>
          <div className="flex items-center gap-2">
            <select className="border border-gray-200 dark:border-[var(--dash-border)] rounded px-2 py-1.5 bg-white dark:bg-[var(--dash-card-bg)] font-medium text-[11px]"><option>10 par page</option></select>
            <button className="px-2 py-1.5 border border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] rounded hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]">&lt;</button>
            <button className="px-3 py-1.5 border border-orange-500 bg-orange-50 text-orange-600 font-bold rounded">1</button>
            <button className="px-3 py-1.5 border border-transparent rounded hover:bg-gray-100">2</button>
            <button className="px-3 py-1.5 border border-transparent rounded hover:bg-gray-100">3</button>
            <span className="mx-1">...</span>
            <button className="px-3 py-1.5 border border-transparent rounded hover:bg-gray-100">125</button>
            <button className="px-2 py-1.5 border border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] rounded hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline fake icons for structural layout matching
const TagIcon = (p:any)=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>;
const UserIcon = (p:any)=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const CalendarIcon = (p:any)=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
