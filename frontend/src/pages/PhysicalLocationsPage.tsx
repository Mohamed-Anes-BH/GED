import { useState } from 'react';
import { MapPin, Search, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import { useOrganizationCrud } from '../hooks/useOrganization';
import { physicalLocationsService } from '../services/organization';

export function PhysicalLocationsPage() {
  const {
    items: locations,
    loading,
    create,
    update,
    remove,
    searchQuery,
    setSearchQuery
  } = useOrganizationCrud(physicalLocationsService);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [formData, setFormData] = useState({
    site: 'Siège',
    building: 'A',
    office: 'Archives',
    treasury: 'Trésorerie principale',
    shelf: 'Étagère A',
    box_number: '',
    document_number: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        site: item.site || 'Siège',
        building: item.building || 'A',
        office: item.office || 'Archives',
        treasury: item.treasury || 'Trésorerie principale',
        shelf: item.shelf || 'Étagère A',
        box_number: item.box_number || '',
        document_number: item.document_number || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        site: 'Siège',
        building: 'A',
        office: 'Archives',
        treasury: 'Trésorerie principale',
        shelf: 'Étagère A',
        box_number: '',
        document_number: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    if (window.confirm("Voulez-vous vraiment supprimer cet emplacement physique ?")) {
      const res = await remove(id);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 font-poppins pb-10 text-gray-800 dark:text-[var(--dash-text)] h-[calc(100vh-140px)]">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <MapPin size={26} className="text-orange-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-oswald text-gray-900 dark:text-[#FFFFFF]">Emplacements Physiques</h2>
          <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400 mt-0.5">
            <span>Accueil</span> <span>›</span> <span className="text-orange-500 font-semibold">Emplacements Physiques</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="p-4 border-b border-gray-100 dark:border-[var(--dash-border)] flex gap-4">
          <div className="flex-1 flex items-center gap-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-3 py-2 bg-gray-50 dark:bg-[var(--dash-bg)] focus-within:bg-white dark:focus-within:bg-[var(--dash-card-bg)] dark:bg-[var(--dash-card-bg)] transition-colors">
            <Search size={16} className="text-gray-400" />
            <input
              className="flex-1 outline-none text-xs bg-transparent"
              placeholder="Rechercher par box ou document..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 text-gray-900 dark:text-[#FFFFFF] font-bold text-xs rounded-xl hover:bg-yellow-500 transition-colors"
          >
            <Plus size={15} /> Nouvel Emplacement
          </button>
        </div>

        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="w-full text-left text-[12px] whitespace-nowrap">
            <thead className="sticky top-0 bg-gray-50 dark:bg-[var(--dash-bg)] shadow-sm">
              <tr className="bg-gray-50 dark:bg-[var(--dash-bg)] border-b border-gray-100 dark:border-[var(--dash-border)] text-gray-500 font-bold">
                <th className="py-3 px-5">Site</th>
                <th className="py-3 px-5">Bâtiment</th>
                <th className="py-3 px-5">Bureau</th>
                <th className="py-3 px-5">Trésorerie</th>
                <th className="py-3 px-5">Étagère</th>
                <th className="py-3 px-5">N° Boîte</th>
                <th className="py-3 px-5">N° Document</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-gray-500">Chargement...</td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">Aucun emplacement physique trouvé.</td>
                </tr>
              ) : (
                locations.map(loc => (
                  <tr key={loc.id} className="border-b border-gray-50 hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]/50">
                    <td className="py-3 px-5 font-bold text-gray-800 dark:text-[var(--dash-text)]">{loc.site}</td>
                    <td className="py-3 px-5">{loc.building || '—'}</td>
                    <td className="py-3 px-5">{loc.office || '—'}</td>
                    <td className="py-3 px-5">{loc.treasury || '—'}</td>
                    <td className="py-3 px-5">{loc.shelf || '—'}</td>
                    <td className="py-3 px-5 font-semibold text-orange-600">{loc.box_number || '—'}</td>
                    <td className="py-3 px-5 font-semibold text-blue-600">{loc.document_number || '—'}</td>
                    <td className="py-3 px-5 text-right flex justify-end gap-2">
                      <button onClick={() => handleOpenModal(loc)} className="p-1 hover:text-orange-500 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(loc.id)} className="p-1 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[var(--dash-card-bg)] rounded-2xl shadow-lg w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[var(--dash-border)]">
              <h3 className="font-bold text-gray-900 dark:text-[#FFFFFF]">
                {editingItem ? "Modifier l'emplacement" : "Nouvel emplacement physique"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 text-gray-400 hover:text-gray-600 dark:text-[var(--dash-text-muted)] rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.55">
                  <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Site</label>
                  <select
                    value={formData.site}
                    onChange={e => setFormData({ ...formData, site: e.target.value })}
                    className="px-3 py-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-sm bg-transparent outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-gray-800"
                  >
                    <option value="Siège">Siège</option>
                    <option value="Annexe">Annexe</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Bâtiment</label>
                  <select
                    value={formData.building}
                    onChange={e => setFormData({ ...formData, building: e.target.value })}
                    className="px-3 py-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-sm bg-transparent outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-gray-800"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Bureau</label>
                  <select
                    value={formData.office}
                    onChange={e => setFormData({ ...formData, office: e.target.value })}
                    className="px-3 py-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-sm bg-transparent outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-gray-800"
                  >
                    <option value="Archives">Archives</option>
                    <option value="101">101</option>
                    <option value="102">102</option>
                    <option value="201">201</option>
                    <option value="202">202</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Étagère</label>
                  <select
                    value={formData.shelf}
                    onChange={e => setFormData({ ...formData, shelf: e.target.value })}
                    className="px-3 py-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-sm bg-transparent outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-gray-800"
                  >
                    <option value="Étagère A">Étagère A</option>
                    <option value="Étagère B">Étagère B</option>
                    <option value="Étagère C">Étagère C</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Trésorerie</label>
                <select
                  value={formData.treasury}
                  onChange={e => setFormData({ ...formData, treasury: e.target.value })}
                  className="px-3 py-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-sm bg-transparent outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-gray-800"
                >
                  <option value="Trésorerie principale">Trésorerie principale</option>
                  <option value="Trésorerie secondaire">Trésorerie secondaire</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">N° Boîte (optionnel)</label>
                  <input
                    value={formData.box_number}
                    onChange={e => setFormData({ ...formData, box_number: e.target.value })}
                    type="text"
                    className="px-3 py-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-sm bg-transparent outline-none focus:border-orange-500"
                    placeholder="Auto si vide"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">N° Document (optionnel)</label>
                  <input
                    value={formData.document_number}
                    onChange={e => setFormData({ ...formData, document_number: e.target.value })}
                    type="text"
                    className="px-3 py-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-sm bg-transparent outline-none focus:border-orange-500"
                    placeholder="Auto si vide"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-200 dark:border-[var(--dash-border)] text-gray-600 dark:text-[var(--dash-text-muted)] font-semibold text-xs rounded-xl hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)] transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-bold text-xs rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Enregistrer
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
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
