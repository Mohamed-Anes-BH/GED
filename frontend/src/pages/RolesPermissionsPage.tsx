import { ShieldCheck, Plus, RefreshCw, Undo, Save, Trash2, Edit2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usersService } from '../services/users';

const MODULE_MAPPING: Record<string, { label: string; icon: string }> = {
  documents: { label: 'Documents', icon: '📄' },
  dossiers: { label: 'Dossiers', icon: '📁' },
  users: { label: 'Utilisateurs', icon: '👤' },
  departments: { label: 'Départements', icon: '🏢' },
  categories: { label: 'Catégories', icon: '🏷️' },
  workflows: { label: 'Workflows', icon: '🔄' },
  audit: { label: "Journal d'audit", icon: '📋' },
};

const RESOURCES = Object.keys(MODULE_MAPPING);

export function RolesPermissionsPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await usersService.getRoles();
      const rolesList = data.results || data || [];
      setRoles(rolesList);
      if (rolesList.length > 0 && selectedRoleId === null) {
        setSelectedRoleId(rolesList[0].id);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des rôles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchPermissions = async (roleId: number) => {
    try {
      const data = await usersService.getRolePermissions(roleId);
      // Ensure all RESOURCES have an entry. If not, create a mock default
      const fullPerms = RESOURCES.map(res => {
        const existing = data.find((p: any) => p.resource === res);
        return existing || {
          resource: res,
          can_create: false,
          can_read: false,
          can_update: false,
          can_delete: false,
          can_download: false,
          can_share: false,
          can_approve: false,
        };
      });
      setPermissions(fullPerms);
    } catch (err) {
      console.error('Erreur chargement permissions:', err);
    }
  };

  useEffect(() => {
    if (selectedRoleId !== null) {
      fetchPermissions(selectedRoleId);
    }
  }, [selectedRoleId]);

  const handleToggle = (resource: string, field: string) => {
    setPermissions(prev =>
      prev.map(p => {
        if (p.resource === resource) {
          return { ...p, [field]: !p[field] };
        }
        return p;
      })
    );
  };

  const handleSave = async () => {
    if (selectedRoleId === null) return;
    setSaving(true);
    try {
      await usersService.updateRolePermissions(selectedRoleId, permissions);
      alert('Permissions mises à jour avec succès !');
      fetchPermissions(selectedRoleId);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async () => {
    const name = window.prompt('Nom du nouveau rôle :');
    if (!name) return;
    try {
      const newRole = await usersService.createRole({ name });
      setSelectedRoleId(newRole.id);
      fetchRoles();
    } catch (err) {
      console.error(err);
      alert('Erreur de création de rôle');
    }
  };

  const handleDeleteRole = async (e: React.MouseEvent, role: any) => {
    e.stopPropagation();
    if (role.is_system) {
      alert("Impossible de supprimer un rôle système.");
      return;
    }
    if (!window.confirm(`Voulez-vous vraiment supprimer le rôle "${role.name}" ?`)) {
      return;
    }
    try {
      await usersService.deleteRole(role.id);
      if (selectedRoleId === role.id) {
        setSelectedRoleId(null);
      }
      fetchRoles();
    } catch (err) {
      console.error(err);
      alert('Erreur de suppression de rôle');
    }
  };

  const activeRole = roles.find(r => r.id === selectedRoleId);

  return (
    <div className="flex flex-col gap-6 font-poppins pb-10 text-gray-800 dark:text-[var(--dash-text)] h-full">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <ShieldCheck size={28} className="text-yellow-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-oswald text-gray-900 dark:text-[#FFFFFF]">Rôles & Permissions</h2>
          <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400 mt-0.5">
            <span>Accueil</span> <span>›</span> <span className="text-orange-500 font-semibold">Rôles & Permissions</span>
          </div>
          <p className="text-[13px] text-gray-500 mt-1">Gerez les rôles et définissez les permissions d'accès pour chaque ressource.</p>
        </div>
      </div>

      <div className="flex gap-6 items-start h-[calc(100vh-210px)] min-h-[600px]">
        {/* Left Sidebar: Roles List */}
        <div className="w-[280px] shrink-0 flex flex-col gap-5 h-full">
          <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm flex flex-col overflow-hidden h-full">
            <div className="p-4 border-b border-gray-100 dark:border-[var(--dash-border)] flex items-center gap-2">
              <UsersIcon className="text-gray-500"/> <h3 className="font-bold text-[14px]">Rôles</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto flex flex-col py-2">
              {loading ? (
                <div className="p-4 text-xs text-gray-500">Chargement...</div>
              ) : roles.map(role => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                    selectedRoleId === role.id ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-white dark:bg-[var(--dash-card-bg)] border-l-4 border-transparent hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{role.is_system ? '👑' : '👤'}</span>
                    <span className={`font-semibold text-[13px] ${selectedRoleId === role.id ? 'text-gray-900 dark:text-[#FFFFFF]' : 'text-gray-700 dark:text-[var(--dash-text-muted)]'}`}>
                      {role.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedRoleId === role.id ? 'bg-yellow-105 text-yellow-800' : 'bg-gray-150 text-gray-500'}`}>
                      {role.is_system ? 'Système' : 'Perso'}
                    </span>
                    {!role.is_system && (
                      <button onClick={(e) => handleDeleteRole(e, role)} className="p-1 hover:text-red-500 text-gray-400">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-100 dark:border-[var(--dash-border)] flex flex-col gap-2">
              <button onClick={handleCreateRole} className="w-full py-2.5 bg-yellow-400 text-gray-900 dark:text-[#FFFFFF] rounded-xl font-bold text-xs shadow-sm flex justify-center items-center gap-2 hover:bg-yellow-500">
                <Plus size={15}/> Nouveau rôle
              </button>
            </div>
          </div>
        </div>

        {/* Right Content: Permissions Matrix */}
        <div className="flex-1 bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
          {/* Matrix Header */}
          <div className="p-5 border-b border-gray-100 dark:border-[var(--dash-border)] flex items-center justify-between bg-gray-50 dark:bg-[var(--dash-bg)]/50">
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-gray-500" />
              <h3 className="font-bold text-[15px]">Permissions du rôle</h3>
              <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[11px] font-bold">
                {activeRole?.name || 'Aucun sélectionné'}
              </span>
            </div>
            <button
              onClick={() => selectedRoleId && fetchPermissions(selectedRoleId)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] rounded-lg text-xs font-semibold text-gray-600 dark:text-[var(--dash-text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)] shadow-sm"
            >
              <RefreshCw size={13}/> Réinitialiser
            </button>
          </div>

          {/* Matrix scrollable content */}
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full text-left bg-white dark:bg-[var(--dash-card-bg)] text-[12px]">
              <thead className="sticky top-0 bg-white dark:bg-[var(--dash-card-bg)] z-10 shadow-sm border-b border-gray-100 dark:border-[var(--dash-border)]">
                <tr>
                  <th className="py-4 px-6 text-gray-700 dark:text-[var(--dash-text-muted)] font-bold w-1/4 min-w-[150px]"><div className="flex items-center gap-2">Ressource</div></th>
                  <th className="py-2 px-3 text-center min-w-[80px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center border border-green-100"><Plus size={15}/></div>
                      <span className="text-[10px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Créer</span>
                    </div>
                  </th>
                  <th className="py-2 px-3 text-center min-w-[80px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100"><EyeIcon/></div>
                      <span className="text-[10px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Lire</span>
                    </div>
                  </th>
                  <th className="py-2 px-3 text-center min-w-[80px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100"><PencilIcon/></div>
                      <span className="text-[10px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Modifier</span>
                    </div>
                  </th>
                  <th className="py-2 px-3 text-center min-w-[80px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-100"><Trash2Icon/></div>
                      <span className="text-[10px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Supprimer</span>
                    </div>
                  </th>
                  <th className="py-2 px-3 text-center min-w-[80px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center border border-purple-100"><DownloadIcon/></div>
                      <span className="text-[10px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Télécharger</span>
                    </div>
                  </th>
                  <th className="py-2 px-3 text-center min-w-[80px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center border border-teal-100"><ShareIcon/></div>
                      <span className="text-[10px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Partager</span>
                    </div>
                  </th>
                  <th className="py-2 px-3 text-center min-w-[80px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100"><CheckCircleIcon/></div>
                      <span className="text-[10px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Approuver</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm) => {
                  const info = MODULE_MAPPING[perm.resource] || { label: perm.resource, icon: '⚙️' };
                  return (
                    <tr key={perm.resource} className="border-b border-gray-50 hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]/50">
                      <td className="py-4 px-6 font-semibold text-gray-700 dark:text-[var(--dash-text-muted)] flex items-center gap-3">
                        <span className="text-gray-400">{info.icon}</span> {info.label}
                      </td>
                      <td className="py-4 px-3 text-center">
                        <Toggle2 isOn={perm.can_create} onClick={() => handleToggle(perm.resource, 'can_create')} />
                      </td>
                      <td className="py-4 px-3 text-center">
                        <Toggle2 isOn={perm.can_read} onClick={() => handleToggle(perm.resource, 'can_read')} />
                      </td>
                      <td className="py-4 px-3 text-center">
                        <Toggle2 isOn={perm.can_update} onClick={() => handleToggle(perm.resource, 'can_update')} />
                      </td>
                      <td className="py-4 px-3 text-center">
                        <Toggle2 isOn={perm.can_delete} onClick={() => handleToggle(perm.resource, 'can_delete')} />
                      </td>
                      <td className="py-4 px-3 text-center">
                        <Toggle2 isOn={perm.can_download} onClick={() => handleToggle(perm.resource, 'can_download')} />
                      </td>
                      <td className="py-4 px-3 text-center">
                        <Toggle2 isOn={perm.can_share} onClick={() => handleToggle(perm.resource, 'can_share')} />
                      </td>
                      <td className="py-4 px-3 text-center">
                        <Toggle2 isOn={perm.can_approve} onClick={() => handleToggle(perm.resource, 'can_approve')} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Matrix Footer / Actions */}
          <div className="p-4 border-t border-gray-100 dark:border-[var(--dash-border)] flex items-center justify-between bg-gray-50 dark:bg-[var(--dash-bg)]">
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <InfoIcon/> <span>Sauvegardez pour appliquer les permissions aux utilisateurs.</span>
            </div>
            <div className="flex gap-2">
              <button
                disabled={saving}
                onClick={handleSave}
                className="flex justify-center items-center gap-2 px-5 py-2.5 bg-yellow-400 text-gray-900 dark:text-[#FFFFFF] font-bold text-xs rounded-xl shadow-sm hover:bg-yellow-500 disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : '✓ Enregistrer les modifications'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle2({ isOn, onClick }: { isOn: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`w-10 h-6 mx-auto rounded-full flex items-center px-0.5 transition-colors cursor-pointer ${
        isOn ? 'bg-yellow-400' : 'bg-gray-200'
      }`}
    >
      <div className={`w-5 h-5 rounded-full bg-white dark:bg-[var(--dash-card-bg)] shadow-sm transition-transform ${isOn ? 'translate-x-4' : 'translate-x-0'}`}></div>
    </div>
  );
}

const UsersIcon = (p:any)=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const EyeIcon = ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const PencilIcon = ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>;
const Trash2Icon = ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const DownloadIcon = ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const ShareIcon = ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>;
const CheckCircleIcon = ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const InfoIcon = ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
