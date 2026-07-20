import { Send, Search, Users, FileText, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { diffusionsService } from '../services/courriers';
import api from '../utils/api';

export function DiffusionPage() {
  const [diffusions, setDiffusions] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [note, setNote] = useState('');
  const [destinataires, setDestinataires] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [usersInfo, setUsersInfo] = useState<any[]>([]);
  const [searchDoc, setSearchDoc] = useState('');

  useEffect(() => {
    api.get('/courriers/entrants/').then(res => {
      setDocuments(res.data.results || res.data || []);
    });
    api.get('/users/').then(res => {
      setUsersInfo(res.data.results || res.data || []);
    });
    diffusionsService.getDiffusions().then(res => {
      setDiffusions(res.results || res || []);
    });
  }, []);

  const handleSubmit = async () => {
    if (!selectedDoc) return alert('Sélectionnez un document');
    setLoading(true);
    try {
      await diffusionsService.createDiffusion({
        courrier_type: 'CourrierEntrant',
        courrier_id: selectedDoc.id,
        note,
        destinataires,
      });
      alert('Diffusion lancée avec succès !');
      setNote('');
      setSelectedDoc(null);
      setDestinataires([]);
      const res = await diffusionsService.getDiffusions();
      setDiffusions(res.results || res || []);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la diffusion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-poppins pb-10 text-gray-800 dark:text-[var(--dash-text)]">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <Send size={26} className="text-rose-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-oswald text-gray-900 dark:text-[#FFFFFF]">Diffusion de documents</h2>
          <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400 mt-0.5">
            <span>Accueil</span> <span>›</span> <span className="text-orange-500 font-semibold">Diffusion</span>
          </div>
          <p className="text-[13px] text-gray-500 mt-1">Partagez rapidement des documents avec des listes de diffusion prédéfinies.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Document Selection */}
        <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm p-6 flex flex-col gap-5">
           <h3 className="font-bold text-[15px] flex items-center gap-2"><FileText className="text-rose-500"/> 1. Sélectionner le document</h3>
           <div className="flex items-center gap-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-3 py-2 bg-gray-50 dark:bg-[var(--dash-bg)] focus-within:bg-white dark:focus-within:bg-[var(--dash-card-bg)] dark:bg-[var(--dash-card-bg)] transition-colors relative">
              <Search size={16} className="text-gray-400"/>
              <input value={searchDoc} onChange={e => setSearchDoc(e.target.value)} className="flex-1 outline-none text-xs bg-transparent" placeholder="Rechercher un courrier à diffuser..." />
              {searchDoc && (
                <div className="absolute top-10 left-0 right-0 bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] shadow-lg rounded-xl z-10 max-h-48 overflow-y-auto">
                  {documents.filter(d => (d.objet || '').toLowerCase().includes(searchDoc.toLowerCase())).map(doc => (
                    <div key={doc.id} onClick={() => { setSelectedDoc(doc); setSearchDoc(''); }} className="p-2 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)] text-xs">
                      {doc.objet || `Courrier #${doc.id}`}
                    </div>
                  ))}
                </div>
              )}
           </div>

           {selectedDoc ? (
             <div className="p-4 border-2 border-rose-100 bg-rose-50/30 rounded-xl flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 text-red-500 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">DOC</div>
                <div className="flex-1 shrink-0 min-w-0">
                   <h4 className="font-bold text-gray-800 dark:text-[var(--dash-text)] text-sm truncate">{selectedDoc.objet || `Courrier #${selectedDoc.id}`}</h4>
                   <p className="text-xs text-gray-500 mt-0.5 truncate">{selectedDoc.reference}</p>
                </div>
                <button onClick={() => setSelectedDoc(null)} className="text-red-500 font-bold text-xs">X</button>
             </div>
           ) : (
             <div className="p-4 border-2 border-dashed border-gray-200 dark:border-[var(--dash-border)] text-gray-400 text-center text-xs font-semibold rounded-xl">
               Aucun courrier sélectionné
             </div>
           )}
        </div>

        {/* Recipients Selection */}
        <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm p-6 flex flex-col gap-5">
           <h3 className="font-bold text-[15px] flex items-center gap-2"><Users className="text-rose-500"/> 2. Destinataires</h3>
           
           <div className="flex flex-col gap-2">
             <label className="text-[11px] font-bold text-gray-500">Sélection manuelle</label>
             <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
               {usersInfo.map(u => (
                 <button 
                   key={u.id}
                   onClick={() => setDestinataires(prev => prev.includes(u.id) ? prev.filter(x => x !== u.id) : [...prev, u.id])}
                   className={`px-3 flex items-center justify-center gap-1 py-1.5 border-2 ${destinataires.includes(u.id) ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-200 dark:border-[var(--dash-border)] text-gray-600 dark:text-[var(--dash-text-muted)] bg-white dark:bg-[var(--dash-card-bg)]'} font-semibold text-xs rounded-lg shadow-sm`}
                 >
                   {destinataires.includes(u.id) && <Check size={12}/>}
                   {u.email}
                 </button>
               ))}
               {usersInfo.length === 0 && <span className="text-xs text-gray-400">Aucun utilisateur trouvé</span>}
             </div>
           </div>

           <div className="flex flex-col gap-2 mt-2">
             <label className="text-[11px] font-bold text-gray-500">Message personnalisé (Optionnel)</label>
             <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className="border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm outline-none focus:border-rose-400 bg-gray-50 dark:bg-[var(--dash-bg)]" placeholder="Ajoutez une note pour les destinataires..."></textarea>
           </div>

           <button disabled={loading} onClick={handleSubmit} className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-yellow-400 text-gray-900 dark:text-[#FFFFFF] font-bold rounded-xl hover:bg-yellow-500 disabled:opacity-50 shadow-sm transition-colors text-[13px]">
             <Send size={15}/> {loading ? 'Diffusion en cours...' : 'Lancer la diffusion'}
           </button>
        </div>
      </div>
    </div>
  );
}
