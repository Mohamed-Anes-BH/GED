import { Users, Search, Plus, Filter, Key, Shield, Smartphone, ArrowRight, UserCircle, Settings, Mail, Download, Edit2, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { useUsers } from '../hooks/useUsers';

export function UtilisateursPage() {
  const { users, roles, loading, createUser, updateUser, deleteUser } = useUsers();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: '',
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      role: '',
      is_active: true,
    });
  };

  const handleCreateUser = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) return;

    setSaving(true);
    try {
      await createUser({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        password: formData.password || undefined,
        role: formData.role ? Number(formData.role) : null,
        is_active: formData.is_active,
      });
      resetForm();
      setModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la création de l'utilisateur");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await deleteUser(id);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la suppression de l'utilisateur");
    }
  };

  return (
    <div className="flex gap-6 font-poppins pb-10 text-gray-800 dark:text-[var(--dash-text)] h-[calc(100vh-140px)]">
      
      {/* Main List */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
            <Users size={28} className="text-yellow-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold font-oswald text-gray-900 dark:text-[#FFFFFF]">Utilisateurs</h2>
            <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400 mt-0.5">
              <span>Accueil</span> <span>›</span> <span className="text-orange-500 font-semibold">Utilisateurs</span>
            </div>
            <p className="text-[13px] text-gray-500 mt-1">Gérez les utilisateurs de l'application GED.</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-4 shadow-sm flex flex-wrap gap-4 items-center">
          <div className="flex-1 flex items-center gap-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-3 py-2 bg-gray-50 dark:bg-[var(--dash-bg)]/50">
            <Search size={16} className="text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)} className="flex-1 outline-none text-xs bg-transparent text-gray-700 dark:text-[var(--dash-text-muted)]" placeholder="Rechercher un utilisateur..." />
          </div>
          <div className="flex items-center gap-2">
            <select className="border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 dark:text-[var(--dash-text-muted)] outline-none w-36 bg-gray-50 dark:bg-[var(--dash-bg)]/50">
               <option value="">Département</option>
               <option value="direction">Direction</option>
               <option value="rh">RH</option>
               <option value="finance">Finance</option>
               <option value="informatique">Informatique</option>
               <option value="juridique">Juridique</option>
               <option value="commercial">Commercial</option>
            </select>
            <select className="border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 dark:text-[var(--dash-text-muted)] outline-none w-36 bg-gray-50 dark:bg-[var(--dash-bg)]/50">
               <option value="">Rôle</option>
               <option value="administrateur">Administrateur</option>
               <option value="responsable">Responsable</option>
               <option value="employe">Employé</option>
            </select>
            <select className="border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 dark:text-[var(--dash-text-muted)] outline-none w-32 bg-gray-50 dark:bg-[var(--dash-bg)]/50">
               <option value="">Statut</option>
               <option value="actif">Actif</option>
               <option value="desactive">Désactivé</option>
            </select>
            <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 text-gray-900 dark:text-[#FFFFFF] font-bold text-xs rounded-xl shadow-sm hover:bg-yellow-500">
              <Plus size={15}/> Ajouter un utilisateur
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1 relative">
          <div className="overflow-x-auto flex-1 h-0">
            <table className="w-full text-left text-[12px] whitespace-nowrap">
              <thead className="sticky top-0 bg-white dark:bg-[var(--dash-card-bg)] z-10 shadow-sm border-b border-gray-100 dark:border-[var(--dash-border)]">
                <tr className="text-gray-700 dark:text-[var(--dash-text-muted)] font-bold text-[11px]">
                  <th className="py-4 px-6 w-10">Photo</th>
                  <th className="py-4 px-4">Nom</th>
                  <th className="py-4 px-4">Prénom</th>
                  <th className="py-4 px-4">Email</th>
                  <th className="py-4 px-4">Département</th>
                  <th className="py-4 px-4">Service</th>
                  <th className="py-4 px-4 text-center">Rôle</th>
                  <th className="py-4 px-4 text-center">Statut</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="text-center py-4 text-gray-500">Chargement...</td></tr>
                ) : users.filter(u => `${u.first_name || ''} ${u.last_name || ''} ${u.email || ''}`.toLowerCase().includes(search.toLowerCase())).map((u, i) => (
                  <tr key={u.id || i} className="border-b border-gray-50 hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]/50 transition-colors">
                    <td className="py-3 px-6">
                      <img src={`https://ui-avatars.com/api/?name=${u.first_name}+${u.last_name}&background=random`} className="w-9 h-9 rounded-full shadow-sm" alt="avatar" />
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-800 dark:text-[var(--dash-text)]">{u.last_name || '—'}</td>
                    <td className="py-3 px-4 font-semibold text-gray-600 dark:text-[var(--dash-text-muted)]">{u.first_name || '—'}</td>
                    <td className="py-3 px-4 text-blue-500 font-medium">{u.email}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-[var(--dash-text-muted)]">{u.departement_details?.name || '—'}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-[var(--dash-text-muted)]">{u.service_details?.name || '—'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border bg-blue-50 text-blue-600 border-blue-100`}>
                        {u.groups && u.groups.length > 0 ? 'Assigné' : 'Utilisateur'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`flex items-center justify-center gap-1.5 font-bold text-[11px] ${u.is_active ? 'text-green-500' : 'text-red-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        {u.is_active ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center justify-center gap-3">
                        <Toggle isOn={u.is_active} onChange={() => updateUser(u.id, { is_active: !u.is_active })} />

                        <button className="text-gray-400 hover:text-blue-500 transition-colors"><Key size={14}/></button>
                        <button onClick={() => handleDeleteUser(u.id)} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-gray-100 dark:border-[var(--dash-border)] bg-gray-50 dark:bg-[var(--dash-bg)]/50 flex justify-between items-center text-[11px] text-gray-500 shrink-0">
            <span>Affichage de 1 à 8 sur 8 utilisateurs</span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)] text-gray-400">&lt;</button>
              <button className="px-3.5 py-1.5 bg-yellow-100 text-yellow-700 font-bold rounded-lg border border-yellow-200">1</button>
              <button className="px-3 py-1.5 border border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)] text-gray-400">&gt;</button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar Form (Ajout Utilisateur) */}
      <div className={`w-[360px] shrink-0 bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] shadow-xl rounded-2xl flex flex-col h-full transform transition-transform duration-300 ${modalOpen ? 'translate-x-0' : 'translate-x-[400px] absolute right-0'}`}>
        <div className="p-5 border-b border-gray-100 dark:border-[var(--dash-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center border border-yellow-100">
              <UserCircle size={18}/>
            </div>
            <h3 className="font-bold text-[15px] font-oswald text-gray-800 dark:text-[var(--dash-text)]">Ajouter un utilisateur</h3>
          </div>
          <button className="text-gray-400 hover:text-gray-600 dark:text-[var(--dash-text-muted)]" onClick={()=>setModalOpen(false)}>×</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          <p className="text-[12px] text-gray-500 mb-2">Créez un nouvel utilisateur dans le système.</p>
          
          {/* Avatar Upload */}
          <div>
            <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)] mb-2 block">Photo de profil</label>
            <div className="flex gap-4">
              <div className="w-24 h-24 border-2 border-dashed border-gray-200 dark:border-[var(--dash-border)] rounded-2xl flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-[var(--dash-bg)] text-gray-400 hover:border-orange-400 hover:text-orange-500 cursor-pointer transition-colors">
                <Upload size={20}/>
                <div className="text-[9px] font-bold text-center">Télécharger<br/><span className="font-medium opacity-70">PNG, JPG (max. 2 Mo)</span></div>
              </div>
              <div className="flex-1 bg-yellow-50 rounded-2xl border border-yellow-100 flex items-end justify-center pt-2 relative overflow-hidden">
                <div className="absolute top-2 right-2 w-5 h-5 bg-yellow-400 rounded-md flex items-center justify-center shadow-sm text-gray-900 dark:text-[#FFFFFF]"><UserCircle size={12}/></div>
                {/* Fake illustration of a person */}
                <div className="w-16 h-20 bg-gray-800 rounded-t-2xl relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-12 bg-orange-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Nom <span className="text-red-500">*</span></label>
            <input value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} placeholder="Ex. : Hamidi" className="border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-3 py-2.5 text-xs text-gray-700 dark:text-[var(--dash-text-muted)] bg-white dark:bg-[var(--dash-card-bg)] focus:ring-1 focus:ring-yellow-400 outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Prénom <span className="text-red-500">*</span></label>
            <input value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} placeholder="Ex. : Sofiane" className="border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-3 py-2.5 text-xs text-gray-700 dark:text-[var(--dash-text-muted)] bg-white dark:bg-[var(--dash-card-bg)] focus:ring-1 focus:ring-yellow-400 outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Email <span className="text-red-500">*</span></label>
            <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Ex. : sofiane.hamidi@agrodiv.dz" className="border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-3 py-2.5 text-xs text-gray-700 dark:text-[var(--dash-text-muted)] bg-white dark:bg-[var(--dash-card-bg)] focus:ring-1 focus:ring-yellow-400 outline-none" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Mot de passe initial</label>
            <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Optionnel" className="border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-3 py-2.5 text-xs text-gray-700 dark:text-[var(--dash-text-muted)] bg-white dark:bg-[var(--dash-card-bg)] focus:ring-1 focus:ring-yellow-400 outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Rôle <span className="text-red-500">*</span></label>
            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-3 py-2.5 text-xs text-gray-500 bg-white dark:bg-[var(--dash-card-bg)] outline-none">
              <option value="">Aucun rôle</option>
              {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 mb-2">
            <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Statut <span className="text-red-500">*</span></label>
            <div onClick={() => setFormData({...formData, is_active: !formData.is_active})} className={`border rounded-xl px-3 py-2.5 text-xs font-semibold flex items-center justify-between cursor-pointer ${formData.is_active ? 'text-green-600 bg-green-50 border-green-100' : 'text-red-600 bg-red-50 border-red-100'}`}>
              <div className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${formData.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div> {formData.is_active ? 'Actif' : 'Désactivé'}</div>
              <span className="text-gray-400">▾</span>
            </div>
          </div>

        </div>
        <div className="p-5 border-t border-gray-100 dark:border-[var(--dash-border)] flex gap-3 bg-gray-50 dark:bg-[var(--dash-bg)]/50">
          <button onClick={handleCreateUser} disabled={saving} className="flex-1 flex justify-center items-center gap-2 py-3 bg-yellow-400 text-gray-900 dark:text-[#FFFFFF] font-bold text-[13px] rounded-xl shadow-sm hover:bg-yellow-500 disabled:opacity-60">
            <FolderPlusIcon/> {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button onClick={() => { resetForm(); setModalOpen(false); }} className="flex-1 flex justify-center items-center py-3 border border-gray-200 dark:border-[var(--dash-border)] text-gray-600 dark:text-[var(--dash-text-muted)] font-semibold text-[13px] rounded-xl bg-white dark:bg-[var(--dash-card-bg)] hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]">
            Annuler
          </button>
        </div>
      </div>

    </div>
  );
}

function Toggle({ isOn, onChange }: { isOn: boolean; onChange?: () => void }) {
  return (
    <div onClick={onChange} className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors cursor-pointer ${isOn ? 'bg-yellow-400' : 'bg-gray-200'}`}>
      <div className={`w-4 h-4 rounded-full bg-white dark:bg-[var(--dash-card-bg)] shadow-sm transition-transform ${isOn ? 'translate-x-4' : 'translate-x-0'}`}></div>
    </div>
  );
}

const FolderPlusIcon = ()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4.5l2 2h7.5a2 2 0 0 1 2 2v2"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>;
