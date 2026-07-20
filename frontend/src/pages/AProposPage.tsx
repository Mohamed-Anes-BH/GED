import { useState, useEffect } from 'react';
import { Info, ExternalLink, Loader2 } from 'lucide-react';
import { settingsService } from '../services/settings';

export function AProposPage() {
  const [aboutInfo, setAboutInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      setLoading(true);
      try {
        const data = await settingsService.getAbout();
        setAboutInfo(data);
      } catch (err) {
        console.error('Erreur chargement infos:', err);
        // Fallback to defaults if API fails
        setAboutInfo(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  const version = aboutInfo?.version || '1.0.0';
  const build = aboutInfo?.build || '2026.07';
  const description = aboutInfo?.description || "Plateforme de gestion électronique de documents performante et sécurisée. Développée pour répondre aux besoins de digitalisation, d'archivage et de traçabilité des processus de l'entreprise.";
  const developer = aboutInfo?.developer || 'Équipe IT AgrOdiv';
  const support = aboutInfo?.support_email || 'support@agrodiv.dz';
  const totalDocuments = aboutInfo?.total_documents;
  const totalUsers = aboutInfo?.total_users;
  const dbSize = aboutInfo?.database_size;

  return (
    <div className="flex flex-col gap-6 font-poppins pb-10 text-gray-800 dark:text-[var(--dash-text)]">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gray-100 border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <Info size={26} className="text-gray-600 dark:text-[var(--dash-text-muted)]" />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-oswald text-gray-900 dark:text-[#FFFFFF]">À Propos</h2>
          <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400 mt-0.5">
            <span>Accueil</span> <span>›</span> <span className="text-orange-500 font-semibold">À Propos</span>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-orange-500" size={48}/>
        </div>
      ) : (
        <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm p-8 flex flex-col items-center text-center max-w-2xl mx-auto mt-10">
          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
             <img src="/logo.svg" alt="AgrOdiv" className="w-16 h-16 object-contain" onError={(e) => (e.currentTarget.src = 'https://placehold.co/64x64/f97316/white?text=A')} />
          </div>
          <h1 className="text-2xl font-bold font-oswald mb-2">AgrOdiv GED</h1>
          <p className="text-gray-500 text-sm mb-6">Version {version} (Build {build})</p>
          <p className="text-gray-700 dark:text-[var(--dash-text-muted)] leading-relaxed mb-8">{description}</p>
          
          <div className="grid grid-cols-2 gap-4 w-full mb-8 text-left">
             <div className="bg-gray-50 dark:bg-[var(--dash-bg)] p-4 rounded-xl border border-gray-100 dark:border-[var(--dash-border)]">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Développé par</div>
                <div className="font-semibold text-gray-800 dark:text-[var(--dash-text)] mt-1">{developer}</div>
             </div>
             <div className="bg-gray-50 dark:bg-[var(--dash-bg)] p-4 rounded-xl border border-gray-100 dark:border-[var(--dash-border)]">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Support technique</div>
                <div className="font-semibold text-blue-500 mt-1 flex items-center gap-1">
                  <a href={`mailto:${support}`}>{support}</a> <ExternalLink size={12}/>
                </div>
             </div>
             {totalDocuments !== undefined && (
               <div className="bg-gray-50 dark:bg-[var(--dash-bg)] p-4 rounded-xl border border-gray-100 dark:border-[var(--dash-border)]">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Total Documents</div>
                  <div className="font-semibold text-gray-800 dark:text-[var(--dash-text)] mt-1">{totalDocuments}</div>
               </div>
             )}
             {totalUsers !== undefined && (
               <div className="bg-gray-50 dark:bg-[var(--dash-bg)] p-4 rounded-xl border border-gray-100 dark:border-[var(--dash-border)]">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Utilisateurs</div>
                  <div className="font-semibold text-gray-800 dark:text-[var(--dash-text)] mt-1">{totalUsers}</div>
               </div>
             )}
             {dbSize && (
               <div className="bg-gray-50 dark:bg-[var(--dash-bg)] p-4 rounded-xl border border-gray-100 dark:border-[var(--dash-border)] col-span-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Base de données</div>
                  <div className="font-semibold text-gray-800 dark:text-[var(--dash-text)] mt-1">{dbSize}</div>
               </div>
             )}
          </div>

          <div className="text-[11px] text-gray-400">© 2026 AgrOdiv. Tous droits réservés.</div>
        </div>
      )}
    </div>
  );
}
