import { useState, useEffect } from 'react';
import { Star, Folder, LayoutGrid, List, Download, Share, Archive, Trash2, Eye, MoreVertical, Filter, Loader2 } from 'lucide-react';
import { documentsService } from '../services/documents';

export function FavorisPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tous');

  const tabs = ['Tous', 'Documents', 'Courriers', 'Dossiers'];

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const [data, statsData] = await Promise.all([
        documentsService.getFavorites(),
        documentsService.getFavoritesStats()
      ]);
      const items = Array.isArray(data) ? data : (data.results || []);
      setFavorites(items);
      setStats(statsData);
    } catch (err) {
      console.error('Erreur chargement favoris:', err);
      setFavorites([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFavorites(); }, []);

  const handleRemoveFavorite = async (id: number) => {
    try {
      await documentsService.removeFavorite(id);
      setFavorites(prev => prev.filter(f => f.id !== id));
      const statsData = await documentsService.getFavoritesStats();
      setStats(statsData);
    } catch (err) {
      console.error('Erreur suppression favori:', err);
    }
  };

  const filteredFavorites = activeTab === 'Tous' ? favorites : favorites.filter(f => {
    if (activeTab === 'Documents') return !!f.document;
    if (activeTab === 'Courriers') return !!(f.courrier_entrant || f.courrier_sortant);
    if (activeTab === 'Dossiers') return !!f.dossier;
    return true;
  });

  const getFavTitle = (fav: any) => {
    if (fav.document) return fav.document_title || fav.document?.title || `Document #${fav.document}`;
    if (fav.dossier) return fav.dossier?.name || `Dossier #${fav.dossier}`;
    if (fav.courrier_entrant) return fav.courrier_entrant?.objet || `Courrier Entrant #${fav.courrier_entrant}`;
    if (fav.courrier_sortant) return fav.courrier_sortant?.objet || `Courrier Sortant #${fav.courrier_sortant}`;
    return `Favori #${fav.id}`;
  };
  const getFavTypeLabel = (fav: any) => {
    if (fav.dossier) return 'Dossier';
    if (fav.courrier_entrant) return 'Courrier entrant';
    if (fav.courrier_sortant) return 'Courrier sortant';
    return 'Document';
  };
  const getFavIcon = (fav: any) => {
    if (fav.dossier) return { icon: '📁', cls: 'bg-yellow-100 text-yellow-700' };
    if (fav.courrier_entrant) return { icon: '📥', cls: 'bg-green-100 text-green-700' };
    if (fav.courrier_sortant) return { icon: '📤', cls: 'bg-purple-100 text-purple-700' };
    const mime = fav.document?.mime_type || '';
    if (mime.includes('pdf')) return { icon: 'PDF', cls: 'bg-red-100 text-red-600' };
    if (mime.includes('word')) return { icon: 'DOC', cls: 'bg-blue-100 text-blue-600' };
    return { icon: 'DOC', cls: 'bg-blue-100 text-blue-600' };
  };

  return (
    <div className="flex flex-col gap-5 font-poppins pb-20 text-gray-800 dark:text-[var(--dash-text)]">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-[28px] font-bold font-oswald text-gray-900 dark:text-[#FFFFFF] flex items-center gap-2"><Star size={24} className="text-yellow-400 fill-current"/> Favoris</h2>
        <p className="text-[13px] text-gray-500">Vos documents et éléments importants favoris.</p>
        <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400 mt-0.5">
          <span>Accueil</span> <span>›</span> <span className="text-orange-500 font-semibold">Favoris</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Total favoris', val: loading || !stats ? '...' : stats.total, icon:'⭐', bg:'bg-yellow-50', border:'border-yellow-200' },
          { label:'Documents', val: loading || !stats ? '...' : stats.documents, icon:'📄', bg:'bg-blue-50', border:'border-blue-200' },
          { label:'Courriers', val: loading || !stats ? '...' : stats.courriers, icon:'✉️', bg:'bg-purple-50', border:'border-purple-200' },
          { label:'Ajoutés cette semaine', val: loading || !stats ? '...' : stats.added_this_week, icon:'📅', bg:'bg-orange-50', border:'border-orange-200' },
        ].map(k => (
          <div key={k.label} className={`bg-white dark:bg-[var(--dash-card-bg)] border ${k.border} rounded-2xl p-4 shadow-sm flex flex-col gap-1 relative overflow-hidden`}>
            <span className="text-[11px] font-semibold text-gray-500 leading-tight">{k.label}</span>
            <strong className="text-2xl font-bold font-oswald text-gray-900 dark:text-[#FFFFFF]">{k.val}</strong>
            <span className="absolute right-3 bottom-2 text-2xl opacity-20 select-none">{k.icon}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={fetchFavorites} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] text-gray-700 dark:text-[var(--dash-text-muted)] font-semibold text-[12px] rounded-xl hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]">
          <Loader2 size={14} className={loading ? 'animate-spin' : ''}/> Actualiser
        </button>
        <div className="flex-1"></div>
        <button className="p-2 border border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]"><LayoutGrid size={15}/></button>
        <button className="p-2 border border-gray-200 dark:border-[var(--dash-border)] bg-gray-50 dark:bg-[var(--dash-bg)] rounded-lg text-gray-700 dark:text-[var(--dash-text-muted)]"><List size={15}/></button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
            ${activeTab === t ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 dark:text-[var(--dash-text-muted)] hover:bg-gray-200'}`}>{t}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-orange-500" size={40}/></div>
        ) : filteredFavorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Star size={48} className="mb-4 text-gray-300"/>
            <p className="font-semibold text-lg">Aucun favori</p>
            <p className="text-sm">Marquez des documents comme favoris pour les retrouver ici.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[var(--dash-border)] text-gray-500 font-medium">
                  <th className="py-3 px-3 w-8"><input type="checkbox" className="rounded"/></th>
                  <th className="py-3 px-3 font-medium">Nom</th>
                  <th className="py-3 px-3 font-medium">Type</th>
                  <th className="py-3 px-3 font-medium">Date ajouté</th>
                  <th className="py-3 px-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFavorites.map(fav => {
                  const favIcon = getFavIcon(fav);
                  return (
                   <tr key={fav.id} className="border-b border-gray-50 hover:bg-orange-50/30 cursor-pointer group text-[11px]">
                     <td className="py-2.5 px-3"><input type="checkbox" className="rounded"/></td>
                     <td className="py-2.5 px-3 flex items-center gap-2">
                       <Star size={12} className="text-yellow-400 fill-current shrink-0"/>
                       <div className={`w-6 h-6 rounded flex items-center justify-center text-[8px] font-bold shrink-0 ${favIcon.cls}`}>{favIcon.icon}</div>
                       <span className="font-semibold text-gray-800 dark:text-[var(--dash-text)] truncate max-w-[240px]">{getFavTitle(fav)}</span>
                     </td>
                     <td className="py-2.5 px-3 text-gray-600 dark:text-[var(--dash-text-muted)]">{getFavTypeLabel(fav)}</td>
                     <td className="py-2.5 px-3 text-gray-500">{fav.created_at ? new Date(fav.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                     <td className="py-2.5 px-3">
                       <div className="flex justify-center items-center gap-2">
                         <button className="text-gray-400 hover:text-blue-500"><Eye size={14}/></button>
                         <button className="text-gray-400 hover:text-green-500"><Download size={14}/></button>
                         <button onClick={() => handleRemoveFavorite(fav.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                       </div>
                     </td>
                   </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filteredFavorites.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-[var(--dash-border)] bg-gray-50 dark:bg-[var(--dash-bg)]/50 flex justify-between items-center text-[11px] text-gray-500">
            <span>{filteredFavorites.length} favori{filteredFavorites.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
}
