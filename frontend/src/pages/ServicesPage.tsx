import { useState, useEffect } from 'react';
import { Building2, Search, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import { useOrganizationCrud } from '../hooks/useOrganization';
import { servicesService, departementsService } from '../services/organization';

export function ServicesPage() {
  const { items: services, loading, create, update, remove, searchQuery, setSearchQuery } = useOrganizationCrud(servicesService);
  const [departements, setDepartements] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({ name: '', code: '', departement: '', status: 'actif' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    departementsService.getAll({ page_size: 1000 }).then(data => setDepartements(data.results || data)).catch(console.error);
  }, []);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, code: item.code || '', departement: item.departement || (item.departement_details?.id) || '', status: item.status || 'actif' });
    } else {
      setEditingItem(null);
      setFormData({ name: '', code: '', departement: '', status: 'actif' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.departement) return alert('Le nom et le département sont obligatoires.');
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
    if (window.confirm("Voulez-vous vraiment supprimer cet élément ?")) {
      const res = await remove(id);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 font-poppins pb-10 text-gray-800 dark:text-[var(--dash-text)] h-[calc(100vh-140px)]">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <Building2 size={26} className="text-indigo-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-oswald text-gray-900 dark:text-[#FFFFFF]">Services</h2>
          <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400 mt-0.5">
            <span>Accueil</span> <span>›</span> <span className="text-orange-500 font-semibold">Services</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="p-4 border-b border-gray-100 dark:border-[var(--dash-border)] flex gap-4">
           <div className="flex-1 flex items-center gap-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-3 py-2 bg-gray-50 dark:bg-[var(--dash-bg)] focus-within:bg-white dark:focus-within:bg-[var(--dash-card-bg)] dark:bg-[var(--dash-card-bg)] transition-colors">
              <Search size={16} className="text-gray-400"/>
              <input className="flex-1 outline-none text-xs bg-transparent" placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
           </div>
           <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 text-gray-900 dark:text-[#FFFFFF] font-bold text-xs rounded-xl hover:bg-yellow-500 transition-colors">
             <Plus size={15}/> Nouveau service
           </button>
        </div>
        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="w-full text-left text-[12px] whitespace-nowrap">
            <thead className="sticky top-0 bg-gray-50 dark:bg-[var(--dash-bg)] shadow-sm">
                <tr className="bg-gray-50 dark:bg-[var(--dash-bg)] border-b border-gray-100 dark:border-[var(--dash-border)] text-gray-500 font-bold">
                    <th className="py-3 px-5">Code</th>
                    <th className="py-3 px-5">Nom</th>
                    <th className="py-3 px-5">Département Parent</th>
                    <th className="py-3 px-5">Responsable</th>
                    <th className="py-3 px-5 text-center">Statut</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="py-4 text-center text-gray-500">Chargement...</td></tr> : 
                services.length === 0 ? <tr><td colSpan={6} className="py-8 text-center text-gray-500">Aucun service trouvé.</td></tr> :
                services.map(s=><tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]/50">
                    <td className="py-3 px-5 font-semibold text-blue-600">{s.code || '—'}</td>
                    <td className="py-3 px-5 font-bold text-gray-800 dark:text-[var(--dash-text)]">{s.name}</td>
                    <td className="py-3 px-5 text-gray-600 dark:text-[var(--dash-text-muted)]">
                        {s.departement_details ? `${s.departement_details.name} (${s.departement_details.direction_details?.code || ''})` : '—'}
                    </td>
                    <td className="py-3 px-5">{s.manager_details ? `${s.manager_details.first_name || ''} ${s.manager_details.last_name || ''}`.trim() : '—'}</td>
                    <td className="py-3 px-5 text-center">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${s.status === 'actif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{s.status === 'actif' ? 'Actif' : 'Inactif'}</span>
                    </td>
                    <td className="py-3 px-5 text-right flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(s)} className="p-1 hover:text-orange-500 transition-colors"><Edit2 size={14}/></button>
                        <button onClick={() => handleDelete(s.id)} className="p-1 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
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
               <h3 className="font-bold text-gray-900 dark:text-[#FFFFFF]">{editingItem ? 'Modifier le service' : 'Nouveau service'}</h3>
               <button onClick={handleCloseModal} className="p-1 text-gray-400 hover:text-gray-600 dark:text-[var(--dash-text-muted)] rounded-full hover:bg-gray-100 transition-colors"><X size={16}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
               <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Code</label>
                  <input value={formData.code} onChange={e=>setFormData({...formData, code: e.target.value})} type="text" className="px-3 py-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-sm bg-transparent outline-none focus:border-orange-500" placeholder="Automatique si vide" />
               </div>
               <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Nom du service</label>
                  <input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} type="text" className="px-3 py-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-sm bg-transparent outline-none focus:border-orange-500" placeholder="Ex: Recrutement" />
               </div>
               <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Département Parent</label>
                  <select required value={formData.departement} onChange={e=>setFormData({...formData, departement: e.target.value})} className="px-3 py-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-sm bg-transparent outline-none focus:border-orange-500">
                    <option value="" disabled className="dark:bg-gray-800">Sélectionner un département</option>
                    {departements.map(dept => (
                        <option key={dept.id} value={dept.id} className="dark:bg-gray-800">{dept.name} ({dept.code})</option>
                    ))}
                  </select>
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
                     {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14}/>} Enregistrer
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckCircle(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
}
