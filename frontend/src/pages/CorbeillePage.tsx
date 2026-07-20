import { Trash2, RefreshCw, Trash, MoreVertical, Search, Eye, X, Shield } from 'lucide-react';
import { useTrash } from '../hooks/useTrash';
import { useState } from 'react';

export function CorbeillePage() {
  const { items, loading, stats, restoreItem, permanentDelete, emptyTrash } = useTrash();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [activeType, setActiveType] = useState('Tous');
  const [search, setSearch] = useState('');

  const filteredItems = items.filter((item) => {
    const matchesType =
      activeType === 'Tous' ||
      (activeType === 'Documents' && item._type === 'document') ||
      (activeType === 'Dossiers' && item._type === 'dossier') ||
      (activeType === 'Courriers' && item._type?.startsWith('courrier'));
    const text = `${item.name || ''} ${item.title || ''} ${item.objet || ''} ${item.created_by?.email || ''}`.toLowerCase();
    return matchesType && text.includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-5 font-poppins pb-10 text-gray-800 dark:text-[var(--dash-text)]">
      {/* Header */}
      <div className="flex flex-wrap gap-4 items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center shadow-sm">
            <Trash2 size={26} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold font-oswald text-gray-900 dark:text-[#FFFFFF]">Corbeille</h2>
            <div className="text-[11px] font-medium text-gray-400 mt-0.5 flex items-center gap-1">
              <span>Accueil</span> <span>›</span> <span className="text-orange-500 font-semibold">Corbeille</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => { if(selectedItem) restoreItem(selectedItem); }} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] rounded-xl text-[13px] font-semibold text-gray-700 dark:text-[var(--dash-text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)] shadow-sm"><RefreshCw size={14}/> Restaurer</button>
          <button onClick={() => { if(selectedItem) permanentDelete(selectedItem); }} className="flex items-center gap-2 px-4 py-2.5 border border-red-200 bg-red-50 text-red-600 rounded-xl text-[13px] font-semibold hover:bg-red-100"><Trash size={14}/> Supprimer définitivement</button>
          <button onClick={emptyTrash} className="flex items-center gap-2 px-4 py-2.5 bg-yellow-400 text-gray-900 dark:text-[#FFFFFF] rounded-xl text-[13px] font-bold hover:bg-yellow-500 shadow-sm"><Trash2 size={14}/> Vider la corbeille</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {[
          { label:'Total éléments', val: stats.total, sub:'éléments supprimés', icon:'🗑️', border:'border-gray-200 dark:border-[var(--dash-border)]' },
          { label:'Documents supprimés', val: stats.documents, sub:'fichiers', icon:'📄', border:'border-gray-200 dark:border-[var(--dash-border)]' },
          { label:'Dossiers supprimés', val: stats.dossiers, sub:'dossiers', icon:'📁', border:'border-gray-200 dark:border-[var(--dash-border)]' },
          { label:'Courriers supprimés', val: stats.courriers, sub:'courriers', icon:'✉️', border:'border-gray-200 dark:border-[var(--dash-border)]' },
          { label:'Taille totale', val:'—', sub:'espace occupé', icon:'💾', border:'border-gray-200 dark:border-[var(--dash-border)]' },
        ].map(k=>(
          <div key={k.label} className={`bg-white dark:bg-[var(--dash-card-bg)] border ${k.border} rounded-2xl p-4 shadow-sm flex items-center gap-3`}>
            <span className="text-3xl">{k.icon}</span>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-gray-500 leading-tight">{k.label}</span>
              <strong className="text-2xl font-bold font-oswald text-gray-900 dark:text-[#FFFFFF] leading-tight">{k.val}</strong>
              <span className="text-[10px] text-gray-400">{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex gap-5 items-start">
        {/* Table */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Tabs + search */}
          <div className="flex flex-wrap gap-2 items-center">
            {['Tous','Documents','Dossiers','Courriers'].map((t)=>(
              <button key={t} onClick={() => setActiveType(t)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors
                ${activeType===t?'bg-gray-900 text-white':'bg-gray-100 text-gray-600 dark:text-[var(--dash-text-muted)] hover:bg-gray-200'}`}>{t}</button>
            ))}
            <div className="flex-1 flex items-center gap-2 border border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] rounded-xl px-3 py-1.5 ml-2">
              <Search size={14} className="text-gray-400"/>
              <input value={search} onChange={e => setSearch(e.target.value)} className="flex-1 outline-none text-xs text-gray-700 dark:text-[var(--dash-text-muted)]" placeholder="Rechercher dans la corbeille..." />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[var(--dash-border)] text-gray-500 font-medium font-semibold bg-gray-50 dark:bg-[var(--dash-bg)]/50">
                    <th className="py-3 px-4 w-8"><input type="checkbox" className="rounded"/></th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Nom</th>
                    <th className="py-3 px-4">Auteur</th>
                    <th className="py-3 px-4">Date de suppression ↓</th>
                    <th className="py-3 px-4">Taille</th>
                    <th className="py-3 px-4">Temps restant</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? <tr><td colSpan={8} className="text-center py-4 text-gray-500">Chargement...</td></tr> : filteredItems.length === 0 ? <tr><td colSpan={8} className="text-center py-4 text-gray-500">Aucun élément trouvé</td></tr> : filteredItems.map((it) => (
                    <tr onClick={() => setSelectedItem(it)} key={it.id + '-' + it._type} className={`border-b border-gray-50 hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]/80 cursor-pointer group ${selectedItem?.id === it.id && selectedItem?._type === it._type ? 'bg-blue-50/30' : ''}`}>
                      <td className="py-3 px-4" onClick={e=>e.stopPropagation()}><input type="checkbox" className="rounded"/></td>
                      <td className="py-3 px-4">
                        {it._type === 'dossier'
                          ? <span className="text-lg">📁</span>
                          : <div className={`w-7 h-7 rounded flex items-center justify-center text-[9px] font-bold bg-blue-100 text-blue-600`}>{it._type === 'document' ? 'DOC' : 'CR'}</div>
                        }
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800 dark:text-[var(--dash-text)]">{it.name || it.title || it.objet}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-[var(--dash-text-muted)]">{it.created_by?.email || '-'}</td>
                      <td className="py-3 px-4 text-gray-500">{new Date(it.deleted_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-[var(--dash-text-muted)]">{it.file_size ? `${(it.file_size / 1024).toFixed(1)} KB` : '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700`}>{30 - Math.floor((new Date().getTime() - new Date(it.deleted_at).getTime()) / (1000 * 3600 * 24))} jours</span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="p-1 text-gray-400 hover:text-gray-700 dark:text-[var(--dash-text-muted)]"><MoreVertical size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notice */}
          <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-[11px] text-yellow-800">
            <Shield size={16} className="text-yellow-500 shrink-0"/>
            <span>Les éléments sont automatiquement supprimés définitivement après <strong>30 jours</strong> dans la corbeille.</span>
          </div>
        </div>

        {/* Preview sidebar */}
        <div className="w-[280px] shrink-0 bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 dark:border-[var(--dash-border)]">
            <h4 className="font-bold text-[13px] text-orange-500 uppercase tracking-wide">Aperçu de l'élément</h4>
            <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600 dark:text-[var(--dash-text-muted)]"><X size={15}/></button>
          </div>

          <div className="p-4 flex flex-col gap-4">
            {selectedItem ? (
              <>
                {/* Doc identity */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm">
                    {selectedItem._type === 'dossier' ? '📁' : selectedItem._type === 'document' ? 'DOC' : 'CR'}
                  </div>
                  <div>
                    <strong className="text-[13px] font-bold text-gray-900 dark:text-[#FFFFFF] truncate max-w-[150px] block">
                      {selectedItem.name || selectedItem.title || selectedItem.objet}
                    </strong>
                    <div className="text-[11px] text-gray-500 capitalize">{selectedItem._type.replace('_', ' ')}</div>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex flex-col gap-1.5 text-[10px]">
                  {[
                    ['Type', selectedItem._type],
                    ['Date de suppression', selectedItem.deleted_at ? new Date(selectedItem.deleted_at).toLocaleString() : '—'],
                    ['Auteur', selectedItem.created_by?.email || '—'],
                    ['Taille', selectedItem.file_size ? `${(selectedItem.file_size / 1024).toFixed(1)} KB` : '—'],
                  ].map(([l,v])=>(
                    <div key={l} className="flex justify-between border-b border-gray-100 dark:border-[var(--dash-border)] pb-1 last:border-0">
                      <span className="text-gray-500 w-[45%] shrink-0">{l}</span>
                      <span className={`font-semibold text-right w-[55%] truncate ${l==='Date de suppression'?'text-red-500':l==='Type'?'text-gray-600 dark:text-[var(--dash-text-muted)]':'text-gray-800 dark:text-[var(--dash-text)]'}`}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-[var(--dash-border)]">
                  <button onClick={() => restoreItem(selectedItem)} className="flex items-center justify-center gap-2 w-full py-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-xl text-xs font-semibold text-gray-700 dark:text-[var(--dash-text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]"><RefreshCw size={12}/> Restaurer</button>
                  <button onClick={() => permanentDelete(selectedItem)} className="flex items-center justify-center gap-2 w-full py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600"><Trash size={12}/> Supprimer définitivement</button>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400 py-10 text-xs">
                Sélectionnez un élément pour voir son aperçu.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
