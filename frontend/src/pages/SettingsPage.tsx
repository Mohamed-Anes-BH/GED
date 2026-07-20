import { Settings, Save, Shield, Database, Bell, Layout, Globe, Mail, Link } from 'lucide-react';
import { useState, useEffect } from 'react';
import { settingsService } from '../services/settings';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<any>(null);
  const [about, setAbout] = useState<any>(null);
  const [storage, setStorage] = useState<any>(null);
  const [generalForm, setGeneralForm] = useState({
    organization_name: 'AgrOdiv',
    base_url: 'https://ged.agrodiv.dz',
    description: 'Système de gestion électronique des documents.',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, a, st] = await Promise.all([
          settingsService.getSettings().catch(() => null),
          settingsService.getAbout().catch(() => null),
          settingsService.getStorage().catch(() => null),
        ]);
        setSettings(Array.isArray(s) ? s[0] : s);
        setAbout(a);
        setStorage(st);
        if (s) {
          const current = Array.isArray(s) ? s[0] : s;
          setGeneralForm({
            organization_name: current.organization_name || current.app_name || 'AgrOdiv',
            base_url: current.base_url || 'https://ged.agrodiv.dz',
            description: current.description || 'Système de gestion électronique des documents.',
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleBackup = async () => {
    try {
      await settingsService.triggerBackup();
      alert('Backup lancé !');
    } catch (err) {
      alert('Erreur lors du lancement du backup');
    }
  };

  const handleSave = async () => {
    try {
      const saved = await settingsService.updateSettings({
        ...settings,
        app_name: generalForm.organization_name,
      });
      setSettings(saved);
      alert('Paramètres enregistrés');
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement");
    }
  };
  return (
    <div className="flex flex-col gap-6 font-poppins pb-10 text-gray-800 dark:text-[var(--dash-text)]">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gray-100 border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <Settings size={26} className="text-gray-600 dark:text-[var(--dash-text-muted)]" />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-oswald text-gray-900 dark:text-[#FFFFFF]">Paramètres système</h2>
          <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400 mt-0.5">
            <span>Accueil</span> <span>›</span> <span className="text-orange-500 font-semibold">Paramètres</span>
          </div>
          <p className="text-[13px] text-gray-500 mt-1">Configurez les paramètres globaux de la plateforme GED.</p>
        </div>
      </div>

      <div className="flex gap-6 items-start h-[calc(100vh-210px)] min-h-[600px]">
        {/* Sidebar */}
        <div className="w-[280px] shrink-0 flex flex-col gap-2 bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm p-3">
          {[
            { id:'general', label:'Général', icon:Layout },
            { id:'security', label:'Sécurité', icon:Shield },
            { id:'email', label:'Serveur Email (SMTP)', icon:Mail },
            { id:'storage', label:'Stockage', icon:Database },
            { id:'notifs', label:'Notifications', icon:Bell },
            { id:'integrations', label:'Intégrations', icon:Link },
            { id:'localization', label:'Localisation', icon:Globe }
          ].map(t => (
            <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] transition-colors font-semibold ${activeTab === t.id ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'text-gray-600 dark:text-[var(--dash-text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]'}`}>
              <t.icon size={16}/> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-[var(--dash-border)] flex items-center gap-3 bg-gray-50 dark:bg-[var(--dash-bg)]/50">
            <h3 className="font-bold text-[16px] text-gray-800 dark:text-[var(--dash-text)]">Paramètres - {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            {activeTab === 'general' && (
              <>
                <div className="grid grid-cols-2 gap-6">
                   <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
                     <label className="text-[12px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Nom de l'organisation</label>
                     <input value={generalForm.organization_name} onChange={e => setGeneralForm({...generalForm, organization_name: e.target.value})} className="border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 w-full" />
                   </div>
                   <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
                     <label className="text-[12px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">URL de base</label>
                     <input value={generalForm.base_url} onChange={e => setGeneralForm({...generalForm, base_url: e.target.value})} className="border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 w-full text-blue-500" />
                   </div>
                   <div className="flex flex-col gap-1.5 col-span-2">
                     <label className="text-[12px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">Description</label>
                     <textarea rows={3} value={generalForm.description} onChange={e => setGeneralForm({...generalForm, description: e.target.value})} className="border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 w-full"></textarea>
                   </div>
                   <div className="flex items-center justify-between col-span-2 p-4 border border-gray-100 dark:border-[var(--dash-border)] rounded-xl bg-gray-50 dark:bg-[var(--dash-bg)]/50">
                      <div>
                        <div className="font-bold text-[13px] text-gray-800 dark:text-[var(--dash-text)]">Mode Maintenance</div>
                        <div className="text-[11px] text-gray-500">Bloque l'accès aux utilisateurs non administrateurs.</div>
                      </div>
                      <div className="w-10 h-6 bg-gray-200 rounded-full"></div>
                   </div>
                </div>
              </>
            )}
            {activeTab === 'storage' && (
              <div className="flex flex-col gap-4">
                 <div className="flex justify-between items-center bg-gray-50 dark:bg-[var(--dash-bg)] p-4 rounded-xl border border-gray-200 dark:border-[var(--dash-border)]">
                    <div>
                        <h4 className="font-bold text-[14px]">Stockage Total</h4>
                        <p className="text-xs text-gray-500">{storage?.total_size || '0 MB'} utilisés</p>
                    </div>
                    <button onClick={handleBackup} className="px-4 py-2 bg-yellow-400 font-bold text-xs rounded-lg shadow hover:bg-yellow-500">
                        Lancer Backup
                    </button>
                 </div>
              </div>
            )}
            {activeTab === 'localization' && (
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
                  <label className="text-[12px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">🌍 Langue</label>
                  <select value={settings?.language || 'fr'} onChange={e => setSettings({...settings, language: e.target.value})} className="border border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 w-full">
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
                  <label className="text-[12px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">🎨 Thème</label>
                  <select value={settings?.theme || 'clair'} onChange={e => setSettings({...settings, theme: e.target.value})} className="border border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 w-full">
                    <option value="clair">Clair</option>
                    <option value="sombre">Sombre</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
                  <label className="text-[12px] font-bold text-gray-600 dark:text-[var(--dash-text-muted)]">📅 Format de date</label>
                  <select value={settings?.date_format || 'DD/MM/YYYY'} onChange={e => setSettings({...settings, date_format: e.target.value})} className="border border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 w-full">
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  </select>
                </div>
              </div>
            )}
            {activeTab !== 'general' && activeTab !== 'storage' && activeTab !== 'localization' && (
              <div className="flex flex-col items-center justify-center flex-1 opacity-50 pt-20">
                 <Settings size={48} className="text-gray-300 mb-4"/>
                 <h4 className="font-bold">Configuration en cours de développement</h4>
                 <p className="text-sm text-gray-500">Cette section sera bientôt disponible.</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-100 dark:border-[var(--dash-border)] bg-gray-50 dark:bg-[var(--dash-bg)]/50 flex justify-end gap-3">
             <button className="px-5 py-2.5 bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-xl font-semibold text-[13px] text-gray-600 dark:text-[var(--dash-text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]">Annuler</button>
             <button onClick={handleSave} className="px-5 py-2.5 bg-yellow-400 rounded-xl font-bold text-[13px] text-gray-900 dark:text-[#FFFFFF] shadow-sm flex gap-2 items-center hover:bg-yellow-500">
               <Save size={15}/> Enregistrer les modifications
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
