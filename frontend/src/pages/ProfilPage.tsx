import { UserCircle, Mail, Phone, Calendar, MapPin, Globe, CheckCircle, Camera, Lock, Monitor, Laptop, Smartphone, FileText, Upload, Download, Eye, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../utils/api';

export function ProfilPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    country: 'Algérie',
    city: 'Sétif'
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await api.patch('/auth/me/', { first_name: formData.first_name, last_name: formData.last_name });
      alert('Profil mis à jour !');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la mise à jour');
    }
  };


  return (
    <div className="flex flex-col gap-6 font-poppins pb-10 text-gray-800 dark:text-[var(--dash-text)]">
      {/* Header area handled implicitly by layout, but title here */}
      <h2 className="text-3xl font-bold font-oswald text-gray-900 dark:text-[#FFFFFF] flex items-center gap-3">
        <div className="w-12 h-12 bg-yellow-50 text-yellow-500 rounded-xl flex items-center justify-center border border-yellow-200">
          <UserCircle size={28}/>
        </div>
        <div>
          Profil
          <div className="text-[11px] font-medium text-gray-400 font-sans mt-0.5 flex gap-1 items-center">
            <span>Accueil</span> <span>›</span> <span className="text-orange-500">Profil</span>
          </div>
        </div>
      </h2>
      <p className="text-[13px] text-blue-500 font-medium -mt-4 pl-[60px]">Consultez et mettez à jour vos informations personnelles.</p>
      
      {/* Top 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm p-6 flex flex-col items-center text-center gap-4">
          <div className="relative">
            <img src={`https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&size=120&background=random`} className="w-28 h-28 rounded-full border-4 border-white shadow-md" alt="Avatar"/>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-yellow-400 text-gray-900 dark:text-[#FFFFFF] rounded-full flex items-center justify-center shadow hover:bg-yellow-500 transition-colors">
              <Camera size={14}/>
            </button>
          </div>
          <div>
            <h3 className="text-xl font-bold font-oswald">{user?.first_name} {user?.last_name}</h3>
            <span className="text-[11px] font-bold text-yellow-500 uppercase tracking-wider">{(user?.role as any)?.name || 'Administrateur GED'}</span>
          </div>
          <div className="flex flex-col gap-2.5 w-full text-left text-[12px] mt-2">
            <div className="flex items-center gap-3"><Monitor size={14} className="text-gray-400"/><span className="text-gray-600 dark:text-[var(--dash-text-muted)]">Direction Informatique</span></div>
            <div className="flex items-center gap-3"><UserCircle size={14} className="text-gray-400"/><span className="text-gray-600 dark:text-[var(--dash-text-muted)]">Développement Web</span></div>
            <div className="flex items-center gap-3"><Mail size={14} className="text-gray-400"/><span className="text-blue-500 font-medium">{user?.email || 'email@agrodiv.dz'}</span></div>
            <div className="flex items-center gap-3"><Phone size={14} className="text-gray-400"/><span className="text-gray-600 dark:text-[var(--dash-text-muted)]">+213 555 12 34 56</span></div>
          </div>
          <div className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 font-semibold text-[11px] rounded-lg border border-green-100">
            <CheckCircle size={14}/> Compte vérifié
          </div>
          <button className="w-full py-2.5 border border-gray-200 dark:border-[var(--dash-border)] rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)] flex items-center justify-center gap-2">
            <EditIcon/> Changer la photo
          </button>
        </div>

        {/* Form: Infos perso */}
        <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm p-6 flex flex-col">
          <h3 className="font-bold text-[15px] mb-5">Informations personnelles</h3>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Nom <span className="text-red-500">*</span></label>
              <input value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="border border-gray-200 dark:border-[var(--dash-border)] rounded-lg px-3 py-2 text-xs font-medium text-gray-700 dark:text-[var(--dash-text-muted)] bg-white dark:bg-[var(--dash-card-bg)]"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Prénom <span className="text-red-500">*</span></label>
              <input value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="border border-gray-200 dark:border-[var(--dash-border)] rounded-lg px-3 py-2 text-xs font-medium text-gray-700 dark:text-[var(--dash-text-muted)] bg-white dark:bg-[var(--dash-card-bg)]"/>
            </div>
            <div className="flex flex-col gap-1.5 text-blue-500">
              <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Email (Non modifiable)</label>
              <input value={formData.email} readOnly className="border border-gray-200 dark:border-[var(--dash-border)] rounded-lg px-3 py-2 text-xs font-medium text-blue-500 bg-blue-50/30 cursor-not-allowed"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Téléphone</label>
              <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+213 555 12 34 56" className="border border-gray-200 dark:border-[var(--dash-border)] rounded-lg px-3 py-2 text-xs font-medium text-gray-700 dark:text-[var(--dash-text-muted)] bg-white dark:bg-[var(--dash-card-bg)]"/>
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Date de naissance</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-2.5 text-gray-400"/>
                <input type="text" placeholder="15 / 05 / 1998" className="border border-gray-200 dark:border-[var(--dash-border)] rounded-lg pl-9 pr-3 py-2 text-xs font-medium text-gray-700 dark:text-[var(--dash-text-muted)] bg-white dark:bg-[var(--dash-card-bg)] w-full"/>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Adresse</label>
              <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Cité 500 Logements..." className="border border-gray-200 dark:border-[var(--dash-border)] rounded-lg px-3 py-2 text-xs font-medium text-gray-700 dark:text-[var(--dash-text-muted)] bg-white dark:bg-[var(--dash-card-bg)] w-full"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Pays</label>
              <select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="border border-gray-200 dark:border-[var(--dash-border)] rounded-lg px-3 py-2 text-xs font-medium text-gray-700 dark:text-[var(--dash-text-muted)] bg-white dark:bg-[var(--dash-card-bg)] outline-none"><option>Algérie</option></select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Ville</label>
              <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="border border-gray-200 dark:border-[var(--dash-border)] rounded-lg px-3 py-2 text-xs font-medium text-gray-700 dark:text-[var(--dash-text-muted)] bg-white dark:bg-[var(--dash-card-bg)] w-full"/>
            </div>
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={handleSave} className="flex-1 bg-yellow-400 text-gray-900 dark:text-[#FFFFFF] rounded-xl py-2.5 font-bold text-xs shadow-sm hover:bg-yellow-500 flex justify-center items-center gap-2"><Lock size={14}/> Enregistrer</button>
            <button className="flex-1 border border-gray-200 dark:border-[var(--dash-border)] text-gray-600 dark:text-[var(--dash-text-muted)] rounded-xl py-2.5 font-semibold text-xs hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)] flex justify-center items-center">Annuler</button>
          </div>
        </div>

        {/* Infos Pro + Illustration */}
        <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm p-6 flex flex-col relative overflow-hidden">
          <h3 className="font-bold text-[15px] mb-5">Informations professionnelles</h3>
          <div className="flex flex-col gap-4 text-[12px] z-10 w-2/3">
            {[
              ['Direction', 'Direction Informatique'],
              ['Département', 'Développement'],
              ['Service', 'Développement Web'],
              ['Fonction', 'Administrateur Système'],
              ['Rôle', 'Administrateur'],
              ['Date d\'embauche', '12 / 03 / 2022'],
              ['Responsable', 'Youssef El Amrani'],
            ].map(([l,v])=>(
              <div key={l} className="flex"><span className="text-gray-500 w-32 shrink-0">{l}</span><span className="font-semibold text-gray-800 dark:text-[var(--dash-text)]">{v}</span></div>
            ))}
            <div className="flex items-center"><span className="text-gray-500 w-32 shrink-0">Statut</span><span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded text-[10px] font-bold">Actif</span></div>
          </div>
          {/* Fake Illustration in the bottom right corner */}
          <div className="absolute -bottom-4 right-0 w-48 h-48 opacity-90 pointer-events-none flex flex-col items-end justify-end p-4">
             {/* Simple flat styling placeholder for the illustration shown in mockup */}
             <div className="w-32 h-32 bg-yellow-100 rounded-tl-full relative">
                <div className="absolute top-4 right-8 w-16 h-20 bg-white dark:bg-[var(--dash-card-bg)] shadow-sm border border-gray-100 dark:border-[var(--dash-border)] rounded-md"></div>
                <div className="absolute bottom-4 left-4 w-20 h-16 bg-gray-700 rounded-t-xl"></div>
             </div>
          </div>
        </div>
      </div>

      {/* Security & Sessions row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Security list */}
        <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm p-6 md:col-span-1">
          <h3 className="font-bold text-[15px] mb-5">Sécurité du compte</h3>
          <div className="flex flex-col gap-3 text-[11px]">
            <div className="flex justify-between"><div className="flex items-center gap-2 text-gray-500"><UserCircle size={13}/> Nom d'utilisateur</div> <span className="text-blue-500 font-medium">sofiane.hamidi</span></div>
            <div className="flex justify-between"><div className="flex items-center gap-2 text-gray-500"><Lock size={13}/> Mot de passe</div> <span className="font-medium text-gray-700 dark:text-[var(--dash-text-muted)]">*************</span></div>
            <div className="flex justify-between"><div className="flex items-center gap-2 text-gray-500"><Calendar size={13}/> Dernière connexion</div> <span className="font-medium text-gray-700 dark:text-[var(--dash-text-muted)]">Aujourd'hui à 08:42</span></div>
            <div className="flex justify-between"><div className="flex items-center gap-2 text-gray-500"><MapPin size={13}/> Adresse IP</div> <span className="font-medium text-blue-500">192.168.1.45</span></div>
            <div className="flex justify-between"><div className="flex items-center gap-2 text-gray-500"><Globe size={13}/> Navigateur</div> <span className="font-medium text-gray-700 dark:text-[var(--dash-text-muted)]">Google Chrome 125.0</span></div>
            <div className="flex justify-between"><div className="flex items-center gap-2 text-gray-500"><Monitor size={13}/> Système</div> <span className="font-medium text-gray-700 dark:text-[var(--dash-text-muted)]">Windows 11</span></div>
          </div>
          <button className="w-full mt-6 py-2.5 bg-yellow-400 text-gray-900 dark:text-[#FFFFFF] rounded-xl font-bold text-xs shadow-sm hover:bg-yellow-500 flex justify-center items-center gap-2">
            <Lock size={13}/> Changer le mot de passe
          </button>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm p-6 md:col-span-1">
          <h3 className="font-bold text-[15px] mb-5">Préférences</h3>
          <div className="flex flex-col gap-5 text-[12px] font-semibold text-gray-600 dark:text-[var(--dash-text-muted)]">
            <div className="flex justify-between items-center text-gray-500">
              <span className="flex items-center gap-2"><MoonIcon/> Mode sombre</span>
              <Toggle isOn={false}/>
            </div>
            <div className="flex justify-between items-center text-gray-800 dark:text-[var(--dash-text)]">
              <span className="flex items-center gap-2"><Monitor size={14}/> Notifications Email</span>
              <Toggle isOn={true}/>
            </div>
            <div className="flex justify-between items-center text-gray-800 dark:text-[var(--dash-text)]">
              <span className="flex items-center gap-2"><BellIcon/> Notifications Desktop</span>
              <Toggle isOn={true}/>
            </div>
            <div className="flex justify-between items-center text-gray-800 dark:text-[var(--dash-text)] mt-2">
              <span className="flex items-center gap-2"><Globe size={14}/> Langue</span>
              <select className="border border-gray-200 dark:border-[var(--dash-border)] bg-gray-50 dark:bg-[var(--dash-bg)] rounded-lg px-2 py-1 text-[11px] outline-none"><option>Français</option></select>
            </div>
          </div>
        </div>

        {/* Active sessions */}
        <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm p-6 md:col-span-2 flex flex-col">
          <h3 className="font-bold text-[15px] mb-5">Sessions actives</h3>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[var(--dash-border)] text-gray-500 font-medium">
                  <th className="py-2 px-1">Appareil</th>
                  <th className="py-2 px-1">Navigateur</th>
                  <th className="py-2 px-1">IP</th>
                  <th className="py-2 px-1">Date</th>
                  <th className="py-2 px-1">Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50 text-gray-800 dark:text-[var(--dash-text)] font-medium">
                  <td className="py-3 px-1 flex items-center gap-2"><Monitor size={14}/> Windows 11</td>
                  <td className="py-3 px-1"><span className="flex items-center gap-1.5"><ChromeIcon/> Chrome</span></td>
                  <td className="py-3 px-1">192.168.1.45</td>
                  <td className="py-3 px-1">Aujourd'hui 08:42</td>
                  <td className="py-3 px-1"><span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded text-[10px] font-bold">Session actuelle</span></td>
                </tr>
                <tr className="border-b border-gray-50 text-gray-500">
                  <td className="py-3 px-1 flex items-center gap-2"><Smartphone size={14}/> Android 13</td>
                  <td className="py-3 px-1"><span className="flex items-center gap-1.5"><FirefoxIcon/> Firefox</span></td>
                  <td className="py-3 px-1">192.168.1.38</td>
                  <td className="py-3 px-1">Hier 18:21</td>
                  <td className="py-3 px-1"><span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold">Déconnectée</span></td>
                </tr>
                <tr className="border-b border-gray-50 text-gray-500">
                  <td className="py-3 px-1 flex items-center gap-2"><Laptop size={14}/> macOS Sonoma</td>
                  <td className="py-3 px-1"><span className="flex items-center gap-1.5"><SafariIcon/> Safari</span></td>
                  <td className="py-3 px-1">192.168.1.22</td>
                  <td className="py-3 px-1">10/05/2024 14:33</td>
                  <td className="py-3 px-1"><span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold">Déconnectée</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <button className="flex items-center justify-center gap-2 mt-4 px-4 py-2 border border-red-200 text-red-500 font-bold bg-red-50 rounded-xl text-xs hover:bg-red-100 w-fit">
            <span className="text-[14px]">⍈</span> Déconnecter les autres sessions
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm p-6 flex flex-col items-center">
        <h3 className="font-bold text-[15px] mb-5 w-full text-left">Activité récente</h3>
        <div className="flex gap-4 w-full relative z-10 px-8 py-2">
          {/* Connector line */}
          <div className="absolute top-1/2 left-10 right-10 h-px bg-gray-200 -z-10 -translate-y-1/2"></div>
          
          {[
            { a: 'Connexion', d: "Aujourd'hui 08:42", s: 'Connexion réussie', icon: Globe, c: 'text-green-500 bg-green-50 border-green-200' },
            { a: 'Modification profil', d: "Aujourd'hui 08:30", s: 'Informations mises à jour', icon: UserCircle, c: 'text-orange-500 bg-orange-50 border-orange-200' },
            { a: 'Téléchargement', d: "Aujourd'hui 08:10", s: 'Rapport_Activite_Q2.pdf', icon: Download, c: 'text-blue-500 bg-blue-50 border-blue-200' },
            { a: 'Consultation document', d: 'Hier 16:45', s: 'Contrat_Partenariat.pdf', icon: Eye, c: 'text-purple-500 bg-purple-50 border-purple-200' },
            { a: 'Modification mot de passe', d: '10/05/2024 11:22', s: 'Mot de passe modifié', icon: Lock, c: 'text-yellow-500 bg-yellow-50 border-yellow-200' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center flex-1 gap-3 relative">
              <div className={`w-12 h-12 rounded-full border-2 ${item.c} flex items-center justify-center bg-white dark:bg-[var(--dash-card-bg)] z-10`}>
                <item.icon size={20}/>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="font-bold text-[12px] text-gray-800 dark:text-[var(--dash-text)]">{item.a}</span>
                <span className="text-[10px] text-gray-500">{item.d}</span>
                <span className="text-[10px] font-medium text-gray-600 dark:text-[var(--dash-text-muted)] mt-1">{item.s}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-4 mt-10 w-full justify-center pb-6 border-b border-gray-100 dark:border-[var(--dash-border)]">
           <button className="px-10 py-3 bg-yellow-400 text-gray-900 dark:text-[#FFFFFF] rounded-xl font-bold text-sm shadow-sm hover:bg-yellow-500 flex justify-center items-center gap-2"><Lock size={15}/> Enregistrer</button>
           <button className="px-10 py-3 border-2 border-red-100 text-red-500 bg-red-50 rounded-xl font-bold text-sm hover:bg-red-100 flex justify-center items-center gap-2"><Lock size={15}/> Modifier le mot de passe</button>
        </div>
      </div>
    </div>
  );
}

// Subcomponents
function Toggle({ isOn }: { isOn: boolean }) {
  return (
    <div className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${isOn ? 'bg-yellow-400' : 'bg-gray-200'}`}>
      <div className={`w-4 h-4 rounded-full bg-white dark:bg-[var(--dash-card-bg)] shadow-sm transition-transform ${isOn ? 'translate-x-4' : 'translate-x-0'}`}></div>
    </div>
  );
}

const EditIcon = ()=> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>;
const MoonIcon = ()=> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
const BellIcon = ()=> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const ChromeIcon = ()=><span className="text-[12px]">🔵</span>;
const FirefoxIcon = ()=><span className="text-[12px]">🦊</span>;
const SafariIcon = ()=><span className="text-[12px]">🧭</span>;
