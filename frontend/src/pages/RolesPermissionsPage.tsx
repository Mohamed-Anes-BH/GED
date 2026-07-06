import { ShieldCheck, Plus, RefreshCw, Undo } from 'lucide-react';
import { useState } from 'react';

const MODULES = [
  'Documents',
  'Dossiers',
  'Utilisateurs',
  'Départements',
  'Catégories',
  'Workflows',
  'Journal d\'audit'
];

export function RolesPermissionsPage() {
  const [activeRole, setActiveRole] = useState('Admin');

  const defaultRoleStates: any = {
    Admin: { c: true, r: true, u: true, d: true, dl: true, sh: true, ap: true },
    Manager: { c: true, r: true, u: true, d: true, dl: false, sh: false, ap: true },
    Employé: { c: false, r: true, u: false, d: false, dl: false, sh: false, ap: false },
    Invité: { c: false, r: true, u: false, d: false, dl: false, sh: false, ap: false },
    Archiviste: { c: true, r: true, u: true, d: true, dl: true, sh: false, ap: false },
    Validateur: { c: false, r: true, u: true, d: false, dl: true, sh: true, ap: true },
    'Lecteur avancé': { c: false, r: true, u: false, d: false, dl: true, sh: false, ap: false },
    Comptable: { c: true, r: true, u: true, d: false, dl: true, sh: false, ap: false }
  };

  const currentRoleState = defaultRoleStates[activeRole] || defaultRoleStates['Admin'];

  return (
    <div className="flex flex-col gap-6 font-poppins pb-10 text-gray-800">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <ShieldCheck size={28} className="text-yellow-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-oswald text-gray-900 dark:text-gray-100">Rôles & Permissions</h2>
          <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400 mt-0.5">
            <span>Accueil</span> <span>›</span> <span className="text-orange-500 font-semibold">Rôles & Permissions</span>
          </div>
          <p className="text-[13px] text-gray-500 mt-1">Gérez les rôles et définissez les permissions d'accès pour chaque ressource.</p>
        </div>
      </div>

      <div className="flex gap-6 items-start h-[calc(100vh-210px)] min-h-[600px]">
        {/* Left Sidebar: Roles List */}
        <div className="w-[280px] shrink-0 flex flex-col gap-5 h-full">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden h-full">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <UsersIcon className="text-gray-500"/> <h3 className="font-bold text-[14px]">Rôles</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto flex flex-col py-2">
              {/* System Roles */}
              <div className="flex flex-col">
                <RoleItem name="Admin" icon="👑" type="Système" active={activeRole === 'Admin'} onClick={() => setActiveRole('Admin')} />
                <RoleItem name="Manager" icon="👤" type="Système" active={activeRole === 'Manager'} onClick={() => setActiveRole('Manager')} />
                <RoleItem name="Employé" icon="👤" type="Système" active={activeRole === 'Employé'} onClick={() => setActiveRole('Employé')} />
                <RoleItem name="Invité" icon="👤" type="Système" active={activeRole === 'Invité'} onClick={() => setActiveRole('Invité')} />
              </div>
              
              <div className="px-4 py-2 mt-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Rôles personnalisés</span>
              </div>
              
              {/* Custom Roles */}
              <div className="flex flex-col">
                <RoleItem name="Archiviste" icon="🗂️" custom active={activeRole === 'Archiviste'} onClick={() => setActiveRole('Archiviste')} />
                <RoleItem name="Validateur" icon="✅" custom active={activeRole === 'Validateur'} onClick={() => setActiveRole('Validateur')} />
                <RoleItem name="Lecteur avancé" icon="👁️" custom active={activeRole === 'Lecteur avancé'} onClick={() => setActiveRole('Lecteur avancé')} />
                <RoleItem name="Comptable" icon="📈" custom active={activeRole === 'Comptable'} onClick={() => setActiveRole('Comptable')} />
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 flex flex-col gap-2">
              <button className="w-full py-2.5 bg-yellow-400 text-gray-900 rounded-xl font-bold text-xs shadow-sm flex justify-center items-center gap-2 hover:bg-yellow-500">
                <Plus size={15}/> Nouveau rôle
              </button>
              <button className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-xs flex justify-center items-center gap-2 hover:bg-gray-50">
                <CopyIcon/> Copier depuis...
              </button>
            </div>
          </div>
        </div>

        {/* Right Content: Permissions Matrix */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
          {/* Matrix Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-gray-500" />
              <h3 className="font-bold text-[15px]">Permissions du rôle</h3>
              <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[11px] font-bold">{activeRole}</span>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 shadow-sm">
              <RefreshCw size={13}/> Réinitialiser
            </button>
          </div>

          {/* Matrix scrollable content */}
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full text-left bg-white text-[12px]">
              <thead className="sticky top-0 bg-white z-10 shadow-sm border-b border-gray-100">
                <tr>
                  <th className="py-4 px-6 text-gray-700 font-bold w-1/4 min-w-[150px]"><div className="flex items-center gap-2">Ressource</div></th>
                  <th className="py-2 px-3 text-center min-w-[80px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center border border-green-100"><Plus size={15}/></div>
                      <span className="text-[10px] font-bold text-gray-600">Créer</span>
                    </div>
                  </th>
                  <th className="py-2 px-3 text-center min-w-[80px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100"><EyeIcon/></div>
                      <span className="text-[10px] font-bold text-gray-600">Lire</span>
                    </div>
                  </th>
                  <th className="py-2 px-3 text-center min-w-[80px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100"><PencilIcon/></div>
                      <span className="text-[10px] font-bold text-gray-600">Modifier</span>
                    </div>
                  </th>
                  <th className="py-2 px-3 text-center min-w-[80px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-100"><Trash2Icon/></div>
                      <span className="text-[10px] font-bold text-gray-600">Supprimer</span>
                    </div>
                  </th>
                  <th className="py-2 px-3 text-center min-w-[80px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center border border-purple-100"><DownloadIcon/></div>
                      <span className="text-[10px] font-bold text-gray-600">Télécharger</span>
                    </div>
                  </th>
                  <th className="py-2 px-3 text-center min-w-[80px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center border border-teal-100"><ShareIcon/></div>
                      <span className="text-[10px] font-bold text-gray-600">Partager</span>
                    </div>
                  </th>
                  <th className="py-2 px-3 text-center min-w-[80px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100"><CheckCircleIcon/></div>
                      <span className="text-[10px] font-bold text-gray-600">Approuver</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {MODULES.map((mod, i) => {
                   const icon = i===0 ? '📄' : i===1 ? '📁' : i===2 ? '👤' : i===3 ? '🏢' : i===4 ? '🏷️' : i===5 ? '🔄' : '📋';
                   return (
                     <tr key={mod} className="border-b border-gray-50 hover:bg-gray-50/50">
                       <td className="py-4 px-6 font-semibold text-gray-700 flex items-center gap-3">
                         <span className="text-gray-400">{icon}</span> {mod}
                       </td>
                       <td className="py-4 px-3 text-center"><Toggle2 isOn={currentRoleState.c} /></td>
                       <td className="py-4 px-3 text-center"><Toggle2 isOn={currentRoleState.r} /></td>
                       <td className="py-4 px-3 text-center"><Toggle2 isOn={currentRoleState.u} /></td>
                       <td className="py-4 px-3 text-center"><Toggle2 isOn={currentRoleState.d} /></td>
                       <td className="py-4 px-3 text-center"><Toggle2 isOn={currentRoleState.dl} /></td>
                       <td className="py-4 px-3 text-center"><Toggle2 isOn={currentRoleState.sh} /></td>
                       <td className="py-4 px-3 text-center"><Toggle2 isOn={currentRoleState.ap} /></td>
                     </tr>
                   );
                })}
              </tbody>
            </table>
          </div>

          {/* Matrix Footer / Actions */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <InfoIcon/> <span>Les changements ne sont pas encore sauvegardés.</span>
            </div>
            <div className="flex gap-2">
              <button className="flex justify-center items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 bg-white font-semibold text-xs rounded-xl shadow-sm hover:bg-gray-50">
                <Undo size={14}/> Annuler les modifications
              </button>
              <button className="flex justify-center items-center gap-2 px-5 py-2.5 bg-yellow-400 text-gray-900 font-bold text-xs rounded-xl shadow-sm hover:bg-yellow-500">
                ✓ Appliquer les modifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleItem({ name, icon, type, active, custom, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${active ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-white border-l-4 border-transparent hover:bg-gray-50'}`}>
      <div className="flex items-center gap-3">
        {custom ? (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${active?'bg-white':'bg-blue-50'} shadow-sm`}>{icon}</div>
        ) : (
          <div className="text-lg">{icon}</div>
        )}
        <span className={`font-semibold text-[13px] ${active ? 'text-gray-900' : 'text-gray-700'}`}>{name}</span>
      </div>
      {type && (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${active ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{type}</span>
      )}
      {custom && (
        <span className="text-gray-400">•••</span>
      )}
    </button>
  );
}

function Toggle2({ isOn }: { isOn: boolean }) {
  return (
    <div className={`w-10 h-6 mx-auto rounded-full flex items-center px-0.5 transition-colors cursor-pointer ${isOn ? 'bg-yellow-400' : 'bg-gray-200'}`}>
      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${isOn ? 'translate-x-4' : 'translate-x-0'}`}></div>
    </div>
  );
}

// Inline svg icons for compact files
const UsersIcon = (p:any)=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const CopyIcon = ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
const EyeIcon = ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const PencilIcon = ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>;
const Trash2Icon = ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const DownloadIcon = ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const ShareIcon = ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>;
const CheckCircleIcon = ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const InfoIcon = ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
