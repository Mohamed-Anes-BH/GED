import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Download, Eye, RotateCcw, Loader2, ArrowLeft } from 'lucide-react';
import { documentsService } from '../services/documents';

export function HistoriqueVersionsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentTitle, setDocumentTitle] = useState('Document');

  useEffect(() => {
    const fetchVersions = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [versionsData, docData] = await Promise.all([
          documentsService.getVersions(Number(id)),
          documentsService.getDocument(Number(id)).catch(() => null),
        ]);
        setVersions(Array.isArray(versionsData) ? versionsData : []);
        if (docData) setDocumentTitle(docData.title || `Document #${id}`);
      } catch (err) {
        console.error('Erreur chargement versions:', err);
        setVersions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVersions();
  }, [id]);

  const handleRestore = async (versionId: number) => {
    if (!id) return;
    try {
      await fetch(`/api/documents/${id}/versions/${versionId}/restore/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`,
          'Content-Type': 'application/json',
        },
      });
      // Refresh versions after restore
      const versionsData = await documentsService.getVersions(Number(id));
      setVersions(Array.isArray(versionsData) ? versionsData : []);
    } catch (err) {
      console.error('Erreur restauration version:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return `Aujourd'hui ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDays === 1) return `Hier ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="flex flex-col gap-6 font-poppins pb-10 text-gray-800 dark:text-[var(--dash-text)]">
      <div className="flex items-start gap-4">
        <button onClick={() => navigate(-1)} className="mt-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-gray-500"/>
        </button>
        <div className="w-14 h-14 bg-cyan-50 border border-cyan-100 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <Clock size={26} className="text-cyan-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-oswald text-gray-900 dark:text-[#FFFFFF]">Historique des versions</h2>
          <p className="text-[13px] text-gray-500 mt-0.5">{documentTitle}</p>
          <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400 mt-0.5">
            <span>Accueil</span> <span>›</span> <span>Document</span> <span>›</span> <span className="text-orange-500 font-semibold">Historique</span>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-cyan-500" size={48}/>
        </div>
      ) : versions.length === 0 ? (
        <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-gray-400">
          <Clock size={56} className="mb-4 text-gray-300"/>
          <p className="font-semibold text-lg mb-1">Aucune version</p>
          <p className="text-sm">Ce document n'a pas encore d'historique de versions.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm p-6 ml-6 relative">
          <div className="absolute top-8 bottom-8 left-10 w-0.5 bg-gray-100"></div>
          <div className="flex flex-col gap-8">
            {versions.map((ver, i) => {
              const isCurrent = i === 0;
              return (
                <div key={ver.id || ver.version_number || i} className="flex items-start gap-6 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isCurrent ? 'border-cyan-500 bg-cyan-50 text-cyan-600' : 'border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] text-gray-400'}`}>
                    {isCurrent ? <div className="w-2.5 h-2.5 rounded-full bg-cyan-500"></div> : <div className="w-2 h-2 rounded-full bg-gray-300"></div>}
                  </div>
                  <div className={`flex-1 p-5 rounded-2xl border ${isCurrent ? 'border-cyan-200 bg-cyan-50/20' : 'border-gray-100 dark:border-[var(--dash-border)] bg-gray-50 dark:bg-[var(--dash-bg)]/50'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-lg ${isCurrent ? 'text-cyan-700' : 'text-gray-700 dark:text-[var(--dash-text-muted)]'}`}>v{ver.version_number || i + 1}</span>
                        {isCurrent && <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded text-[10px] font-bold uppercase">Actuelle</span>}
                      </div>
                      <span className="text-[11px] text-gray-500 font-medium">{formatDate(ver.created_at)}</span>
                    </div>
                    <p className="text-gray-800 dark:text-[var(--dash-text)] font-medium text-[13px] mb-4">{ver.changelog || 'Mise à jour du document'}</p>
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2 text-gray-500 text-[11px]">
                        {ver.created_by_name && (
                          <>
                            <img src={`https://ui-avatars.com/api/?name=${(ver.created_by_name || '').replace(' ','+')}&background=random`} className="w-5 h-5 rounded-full" />
                            Modifié par <span className="font-bold text-gray-700 dark:text-[var(--dash-text-muted)]">{ver.created_by_name}</span>
                          </>
                        )}
                        {ver.file_size && <span>• {ver.file_size}</span>}
                      </div>
                      <div className="flex gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] text-gray-600 dark:text-[var(--dash-text-muted)] rounded-lg text-[11px] font-semibold hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)] shadow-sm"><Eye size={13}/> Aperçu</button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] text-gray-600 dark:text-[var(--dash-text-muted)] rounded-lg text-[11px] font-semibold hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)] shadow-sm"><Download size={13}/> Télécharger</button>
                        {!isCurrent && <button onClick={() => handleRestore(ver.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 text-white rounded-lg text-[11px] font-bold hover:bg-cyan-600 shadow-sm"><RotateCcw size={13}/> Restaurer</button>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
