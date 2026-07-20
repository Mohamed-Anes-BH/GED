import { Users, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { useOrganizationCrud } from '../hooks/useOrganization';
import { correspondantsService } from '../services/organization';

export function CorrespondantsPage() {
  const { items: correspondants, loading, remove } = useOrganizationCrud(correspondantsService);

  return (
    <div className="flex flex-col gap-6 font-poppins pb-10 text-gray-800 dark:text-[var(--dash-text)] h-[calc(100vh-140px)]">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <Users size={26} className="text-teal-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-oswald text-gray-900 dark:text-[#FFFFFF]">Correspondants</h2>
          <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400 mt-0.5">
            <span>Accueil</span> <span>›</span> <span className="text-orange-500 font-semibold">Correspondants</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="p-4 border-b border-gray-100 dark:border-[var(--dash-border)] flex gap-4">
           <div className="flex-1 flex items-center gap-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-3 py-2 bg-gray-50 dark:bg-[var(--dash-bg)] focus-within:bg-white dark:focus-within:bg-[var(--dash-card-bg)] dark:bg-[var(--dash-card-bg)] transition-colors">
              <Search size={16} className="text-gray-400"/>
              <input className="flex-1 outline-none text-xs bg-transparent" placeholder="Rechercher..." />
           </div>
           <button className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 text-gray-900 dark:text-[#FFFFFF] font-bold text-xs rounded-xl hover:bg-yellow-500">
             <Plus size={15}/> Nouveau
           </button>
        </div>
        <table className="w-full text-left text-[12px] whitespace-nowrap">
          <thead><tr className="bg-gray-50 dark:bg-[var(--dash-bg)] border-b border-gray-100 dark:border-[var(--dash-border)] text-gray-500 font-bold"><th className="py-3 px-5">Code</th><th className="py-3 px-5">Nom</th><th className="py-3 px-5">Type</th><th className="py-3 px-5">Documents</th><th className="py-3 px-5 text-right">Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="py-4 text-center text-gray-500">Chargement...</td></tr> :
              correspondants.map(d=><tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]/50"><td className="py-3 px-5 font-semibold text-teal-600">{d.code || '—'}</td><td className="py-3 px-5 font-bold text-gray-800 dark:text-[var(--dash-text)]">{d.name || d.nom}</td><td className="py-3 px-5">{d.type || '—'}</td><td className="py-3 px-5">—</td><td className="py-3 px-5 text-right flex justify-end gap-2"><button className="p-1 hover:text-orange-500"><Edit2 size={14}/></button><button onClick={() => remove(d.id)} className="p-1 hover:text-red-500"><Trash2 size={14}/></button></td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
