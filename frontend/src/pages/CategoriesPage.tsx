import { useState } from 'react';
import { BoxSelect, Search, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import { useOrganizationCrud } from '../hooks/useOrganization';
import { categoriesService } from '../services/organization';

export function CategoriesPage() {
  const { items: categories, loading, create, update, remove, searchQuery, setSearchQuery } = useOrganizationCrud(categoriesService);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [formData, setFormData] = useState({ name: '', code: '', description: '', color: '', icon: '', status: 'actif' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || '',
        code: item.code || '',
        description: item.description || '',
        color: item.color || '',
        icon: item.icon || '',
        status: item.status || 'actif',
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', code: '', description: '', color: '', icon: '', status: 'actif' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert('Le nom est obligatoire.');
    setIsSubmitting(true);
    let res;
    if (editingItem) {
      res = await update(editingItem.id, formData);
    } else {
      res = await create(formData);
    }
    setIsSubmitting(false);
    if (!res.success) {
      alert(res.error);
    } else {
      handleCloseModal();
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette catégorie ?")) {
      const res = await remove(id);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 font-poppins pb-10 text-gray-800 dark:text-[var(--dash-text)] h-[calc(100vh-140px)]">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <BoxSelect size={26} className="text-purple-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-oswald text-gray-900 dark:text-[#FFFFFF]">Catégories</h2>
          <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400 mt-0.5">
            <span>Accueil</span> <span>›</span> <span className="text-orange-500 font-semibold">Catégories</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="p-4 border-b border-gray-100 dark:border-[var(--dash-border)] flex gap-4">
           <div className="flex-1 flex items-center gap-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-3 py-2 bg-gray-50 dark:bg-[var(--dash-bg)] focus-within:bg-white dark:focus-within:bg-[var(--dash-card-bg)] dark:bg-[var(--dash-card-bg)] transition-colors">
              <Search size={16} className="text-gray-400"/>
              <input className="flex-1 outline-none text-xs bg-transparent" placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
           </div>
           <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 text-gray-900 dark:text-[#FFFFFF] font-bold text-xs rounded-xl hover:bg-yellow-500 transition-colors">
             <Plus size={15}/> Nouvelle catégorie
           </button>
        </div>
        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="w-full text-left text-[12px] whitespace-nowrap">
            <thead className="sticky top-0 bg-gray-50 dark:bg-[var(--dash-bg)] shadow-sm">
              <tr className="bg-gray-50 dark:bg-[var(--dash-bg)] border-b border-gray-100 dark:border-[var(--dash-border)] text-gray-500 font-bold">
                <th className="py-3 px-5">Code</th>
                <th className="py-3 px-5">Nom</th>
                <th className="py-3 px-5">Description</th>
                <th className="py-3 px-5">Couleur</th>
                <th className="py-3 px-5 text-center">Statut</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="py-4 text-center text-gray-500">Chargement...</td></tr> :
                categories.length === 0 ? <tr><td colSpan={6} className="py-8 text-center text-gray-500">Aucune catégorie trouvée.</td></tr> :
                categories.map(c=><tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]/50">
                  <td className="py-3 px-5 font-semibold text-purple-600">{c.code || '—'}</td>
                  <td className="py-3 px-5 font-bold text-gray-800 dark:text-[var(--dash-text)]">{c.name}</td>
                  <td className="py-3 px-5">{c.description || '—'}</td>
                  <td className="py-3 px-5">
                    {c.color ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: c.color }} />
                        <span>{c.color}</span>
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-3 px-5 text-center">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${c.status === 'actif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{c.status === 'actif' ? 'Actif' : 'Inactif'}</span>
                  </td>
                  <td className="py-3 px-5 text-right flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(c)} className="p-1 hover:text-orange-500 transition-colors"><Edit2 size={14}/></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[var(--dash-card-bg)] rounded-2xl shadow-lg w-full max-w-sm flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[var(--dash-border)]">
               <h3 className="font-bold text-gray-900 dark:text-[#FFFFFF]">{editingItem ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h3>
               <button onClick={handleCloseModal} className="p-1 text-gray-400 hover:text-gray-600 dark:text-[var(--dash-text-muted)] rounded-full hover:bg-gray-100 transition-colors"><X size={16}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
               <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Code</label>
                  <input value={formData.code} onChange={e=>setFormData({...formData, code: e.target.value})} type="text" className="px-3 py-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-sm bg-transparent outline-none focus:border-orange-500" placeholder="Automatique si vide" />
               </div>
               <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Nom de la catégorie</label>
                  <input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} type="text" className="px-3 py-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-sm bg-transparent outline-none focus:border-orange-500" placeholder="Ex: Finance" />
               </div>
               <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Description</label>
                  <textarea value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="px-3 py-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-sm bg-transparent outline-none focus:border-orange-500 h-16 resize-none" placeholder="Description de la catégorie..." />
               </div>
               <div className="flex gap-4">
                 <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Couleur (HEX)</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={formData.color || '#3b82f6'} onChange={e=>setFormData({...formData, color: e.target.value})} className="w-8 h-8 rounded cursor-pointer border-none p-0" />
                      <input type="text" value={formData.color} onChange={e=>setFormData({...formData, color: e.target.value})} className="flex-1 px-3 py-1.5 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-xs bg-transparent outline-none focus:border-orange-500" placeholder="#HEX" />
                    </div>
                 </div>
                 <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Icône (Nom)</label>
                    <input type="text" value={formData.icon} onChange={e=>setFormData({...formData, icon: e.target.value})} className="px-3 py-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-sm bg-transparent outline-none focus:border-orange-500" placeholder="Ex: FileText" />
                 </div>
               </div>
               <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Statut</label>
                  <select value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})} className="px-3 py-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-sm bg-transparent outline-none focus:border-orange-500">
                    <option value="actif" className="dark:bg-gray-800">Actif</option>
                    <option value="inactif" className="dark:bg-gray-800">Inactif</option>
                  </select>
               </div>
               <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-200 dark:border-[var(--dash-border)] text-gray-600 dark:text-[var(--dash-text-muted)] font-semibold text-xs rounded-xl hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)] transition-colors">Annuler</button>
                  <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-bold text-xs rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors">
                     {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <div className="w-3.5 h-3.5 border-2 border-white rounded-full border-t-transparent animate-spin inline-block mr-1" />} Enregistrer
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
