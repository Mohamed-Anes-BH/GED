import { useState } from 'react';
import { 
  Search, Filter, RotateCcw, Save, LayoutGrid, List, LayoutList, Download, 
  FileText, Folder, CheckCircle, Clock, Eye, Star, MoreVertical, 
  MapPin, X, ChevronRight, Bookmark, ArrowDown
} from 'lucide-react';

export function SearchPage() {
  const [viewMode, setViewMode] = useState<'tableau' | 'liste' | 'grille'>('tableau');

  // Helper for highlighting text
  const Highlight = ({ children }: { children: React.ReactNode }) => (
    <span className="bg-yellow-200 text-yellow-900 font-semibold px-0.5 rounded">{children}</span>
  );

  return (
    <div className="flex flex-col gap-6 font-poppins pb-24">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <h2 className="text-[28px] font-bold font-oswald text-gray-900 dark:text-gray-100">Recherche avancée</h2>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
           <FileText size={14}/> <span>Documents</span> <span>›</span> <span className="text-gray-900 font-semibold dark:text-gray-100">Recherche avancée</span>
        </div>
      </div>

      {/* ─── Main Layout ───────────────────────────────────────── */}
      <div className="flex items-start gap-6 flex-col xl:flex-row">
        
        {/* LEFT COLUMN: FILTERS (Fixed Width) */}
        <div className="w-full xl:w-[300px] shrink-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col shadow-sm sticky top-6">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
            <h3 className="font-semibold text-[15px] flex items-center gap-2 text-gray-800"><Filter size={16}/> Filtres avancés</h3>
            <button className="text-xs text-orange-500 font-medium flex items-center gap-1 hover:underline"><RotateCcw size={12}/> Réinitialiser</button>
          </div>
          
          <div className="p-5 flex flex-col gap-4 max-h-[600px] overflow-y-auto custom-scrollbar">
             {/* Filter Inputs */}
             <FilterField label="Nom du document" placeholder="Ex: Rapport, Statistiques..." />
             <FilterField label="Code document" placeholder="Ex: DOC-2024-001" />
             <FilterSelect label="Type" options={["Tous les types"]} />
             <FilterSelect label="Catégorie" options={["Toutes les catégories"]} />
             <FilterSelect label="Tags" options={["Sélectionner des tags"]} />
             <FilterSelect label="Auteur" options={["Tous les auteurs"]} />
             <FilterSelect label="Responsable" options={["Tous les responsables"]} />
             
             <div className="grid grid-cols-2 gap-2">
               <div className="flex flex-col gap-1.5"><label className="text-[11px] font-medium text-gray-600">Date création (Du)</label><input type="date" className="border border-gray-200 rounded-lg p-2 text-xs outline-none focus:border-orange-500" /></div>
               <div className="flex flex-col gap-1.5"><label className="text-[11px] font-medium text-gray-600">(Au)</label><input type="date" className="border border-gray-200 rounded-lg p-2 text-xs outline-none focus:border-orange-500" /></div>
             </div>

             <FilterSelect label="Direction" options={["Toutes les directions"]} />
             <FilterSelect label="Département" options={["Tous les départements"]} />
             
             {/* Segmented Controls */}
             <FilterSegment label="Statut document" options={['Actif', 'Archivé', 'Mort']} active="Actif" />
             <FilterSegment label="OCR" options={['Oui', 'Non', 'Indifférent']} active="Oui" />
             <FilterSegment label="Signature" options={['Signé', 'Non signé', 'Indifférent']} active="Signé" />
          </div>

          <div className="p-4 border-t border-gray-100 flex flex-col gap-2 bg-white rounded-b-2xl">
             <button className="w-full py-2.5 bg-orange-500 text-white font-semibold text-[13px] rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20 hover:bg-orange-600"><Search size={16}/> Rechercher</button>
             <button className="w-full py-2.5 border border-gray-200 text-gray-700 font-semibold text-[13px] rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50"><Save size={16}/> Enregistrer la recherche</button>
          </div>
        </div>

        {/* MIDDLE COLUMN: RESULTS */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">
          
          {/* Top Info Bar */}
          <div className="flex flex-wrap lg:flex-nowrap justify-between items-center gap-4">
             {/* Stats */}
             <div className="flex gap-4 flex-1">
                <StatBox label="Documents trouvés" value="324" icon={FileText} color="text-gray-800" />
                <StatBox label="Temps de recherche" value={<>0.23 <span className="text-sm font-poppins text-gray-500 font-normal">sec</span></>} icon={Clock} color="text-yellow-600" />
                <StatBox label="Documents OCR" value="280" icon={Search} color="text-green-500" />
             </div>
             
             {/* View Toggles */}
             <div className="flex flex-col gap-2 shrink-0">
                <div className="flex bg-gray-100 rounded-lg p-1 w-max self-end border border-gray-200">
                  <ViewBtn active={viewMode==='tableau'} onClick={()=>setViewMode('tableau')} icon={LayoutList} label="Tableau" />
                  <ViewBtn active={viewMode==='liste'} onClick={()=>setViewMode('liste')} icon={List} label="Liste" />
                  <ViewBtn active={viewMode==='grille'} onClick={()=>setViewMode('grille')} icon={LayoutGrid} label="Grille" />
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium self-end">
                   <span className="text-gray-500">Trier par :</span>
                   <select className="border border-gray-200 bg-white rounded-lg px-2 py-1 outline-none text-gray-700 font-semibold"><option>Pertinence</option></select>
                   <button className="p-1 border border-gray-200 bg-white rounded flex items-center justify-center"><ArrowDown size={14}/></button>
                </div>
             </div>
          </div>

          {/* Results Table */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden flex flex-col">
             <div className="overflow-x-auto">
               <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500 font-medium">
                      <th className="py-3 px-4 w-10"><input type="checkbox" className="rounded" /></th>
                      <th className="py-3 px-4 font-medium">Nom du document</th>
                      <th className="py-3 px-4 font-medium">Code</th>
                      <th className="py-3 px-4 font-medium">Catégorie</th>
                      <th className="py-3 px-4 font-medium">Auteur</th>
                      <th className="py-3 px-4 font-medium">Version</th>
                      <th className="py-3 px-4 font-medium">Statut</th>
                      <th className="py-3 px-4 font-medium text-center">OCR</th>
                      <th className="py-3 px-4 font-medium">Date</th>
                      <th className="py-3 px-4 font-medium">Taille</th>
                      <th className="py-3 px-4 font-medium w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800">
                    
                    <ResultRow icon="PDF" color="bg-red-100 text-red-600" 
                               name={<>Rapport <Highlight>Production</Highlight> <Highlight>Céréalière</Highlight> 2024.pdf</>} 
                               code="RAP-2024-001" cat="Rapports" author="Yacine M." ver="3.0" status="Actif" date="15/05/2024" size="4.2 MB" ocr />
                               
                    <ResultRow icon="W" color="bg-blue-100 text-blue-600" 
                               name={<>Statistiques <Highlight>Production</Highlight> Blé Tendre 2024.docx</>} 
                               code="STAT-2024-015" cat="Statistiques" author="Nadia A." ver="1.2" status="Actif" date="14/05/2024" size="2.1 MB" ocr />
                               
                    <ResultRow icon="PDF" color="bg-red-100 text-red-600" 
                               name={<>Courrier Direction Générale <Highlight>Production</Highlight> et Rendement.pdf</>} 
                               code="COUR-2024-223" cat="Courriers" author="Sofiane H." ver="2.0" status="Actif" date="13/05/2024" size="1.8 MB" ocr />
                               
                    <ResultRow icon="X" color="bg-green-100 text-green-600" 
                               name={<>Tableau <Highlight>Production</Highlight> par Région 2023-2024.xlsx</>} 
                               code="TAB-2024-063" cat="Tableaux" author="Yacine M." ver="1.0" status="Actif" date="12/05/2024" size="1.2 MB" ocr />
                               
                    <ResultRow icon="Folder" color="text-yellow-500 fill-yellow-200" 
                               name={<>Dossier <Highlight>Production</Highlight> 2023</>} 
                               code="DOS-2023-011" cat="Dossiers" author="—" ver="—" status="Actif" date="10/05/2024" size="—" noOcr isFolder />
                               
                    <ResultRow icon="PDF" color="bg-red-100 text-red-600" 
                               name={<>Plan Stratégique <Highlight>Production</Highlight> Agricole 2025.pdf</>} 
                               code="PLAN-2024-002" cat="Plans" author="Yacine M." ver="1.0" status="Validé" date="08/05/2024" size="5.1 MB" ocr />
                               
                  </tbody>
               </table>
             </div>
             
             {/* Pagination */}
             <div className="flex justify-between items-center p-4 border-t border-gray-100 text-[11px] text-gray-500 bg-gray-50/50">
                <span>Affichage de 1 à 10 sur 324 résultats</span>
                <div className="flex items-center gap-2">
                   <button className="px-2 py-1.5 border border-gray-200 bg-white rounded hover:bg-gray-50">&lt;</button>
                   <button className="px-3 py-1.5 border border-orange-500 bg-orange-50 text-orange-600 font-semibold rounded">1</button>
                   <button className="px-3 py-1.5 border border-transparent hover:bg-gray-100 rounded text-gray-700">2</button>
                   <button className="px-3 py-1.5 border border-transparent hover:bg-gray-100 rounded text-gray-700">3</button>
                   <span className="px-1 text-gray-400">...</span>
                   <button className="px-3 py-1.5 border border-transparent hover:bg-gray-100 rounded text-gray-700">33</button>
                   <button className="px-2 py-1.5 border border-gray-200 bg-white rounded hover:bg-gray-50">&gt;</button>
                   <select className="ml-4 border border-gray-200 bg-white rounded px-3 py-1.5 outline-none font-medium text-gray-700"><option>10 / page</option></select>
                </div>
             </div>
          </div>

          {/* Bottom Row Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
             <BottomPanel title="Recherches enregistrées" btnLabel="Nouvelle recherche">
                <SearchItem icon={Bookmark} text="Rapports 2024" active />
                <SearchItem icon={Bookmark} text="Courriers entrants" />
                <SearchItem icon={Bookmark} text="Documents actifs" />
             </BottomPanel>
             <BottomPanel title="Recherches récentes" btnLabel="Voir tout l'historique">
                <SearchItem icon={Clock} text="production" sub="Il y a 2 min" />
                <SearchItem icon={Clock} text="rapport" sub="Il y a 15 min" />
                <SearchItem icon={Clock} text="contrat" sub="Il y a 1 heure" />
             </BottomPanel>
             <BottomPanel title="Suggestions" noBtn>
                <div className="flex flex-wrap gap-2 pt-2">
                   <SuggestionTag text="Rapport 2023" />
                   <SuggestionTag text="Production Blé" />
                   <SuggestionTag text="Statistiques 2024" />
                   <SuggestionTag text="Rendement maïs" />
                </div>
             </BottomPanel>
          </div>

        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="w-full xl:w-[280px] shrink-0 flex flex-col gap-4">
           {/* document preview panel */}
           <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm sticky top-6">
              <h3 className="font-semibold text-sm mb-4">Aperçu du document</h3>
              
              <div className="bg-gray-100 w-full aspect-[1/1.3] rounded-xl border border-gray-200 shadow-inner flex items-center justify-center p-4">
                 {/* fake document page preview */}
                 <div className="bg-white w-full h-full shadow-sm rounded flex flex-col gap-2 p-2">
                    <div className="h-2 w-1/2 mx-auto bg-gray-200 rounded-full mt-2"></div>
                    <div className="h-4 w-3/4 mx-auto bg-gray-800 rounded mt-1"></div>
                    <div className="flex gap-2 mt-4">
                       <div className="w-8 h-8 rounded-full bg-blue-500 m-2"></div>
                       <div className="flex-1 flex items-end gap-1"><div className="w-2 h-4 bg-green-500"></div><div className="w-2 h-6 bg-green-500"></div><div className="w-2 h-8 bg-green-500"></div></div>
                    </div>
                    <div className="h-1 w-full bg-gray-200 rounded-full mt-2"></div>
                    <div className="h-1 w-full bg-gray-200 rounded-full mt-1"></div>
                 </div>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                 <div className="flex justify-between items-start">
                    <strong className="text-[13px] font-bold leading-tight w-2/3">Rapport Production Céréalière 2024.pdf</strong>
                    <div className="flex gap-1"><span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">PDF</span><span className="bg-green-100 text-green-600 border border-green-200 text-[9px] font-bold px-1.5 py-0.5 rounded">Actif</span></div>
                 </div>
                 
                 <div className="flex flex-col gap-1.5 text-[11px] mt-2 mb-2">
                    <div className="flex"><span className="w-20 text-gray-500">Version</span><span className="font-medium">3.0</span></div>
                    <div className="flex"><span className="w-20 text-gray-500">Auteur</span><span className="font-medium">Yacine M.</span></div>
                    <div className="flex"><span className="w-20 text-gray-500">Département</span><span className="font-medium">Statistiques & Analyses</span></div>
                    <div className="flex"><span className="w-20 text-gray-500">Catégorie</span><span className="font-medium">Rapports</span></div>
                    <div className="flex items-center"><span className="w-20 text-gray-500">OCR</span><span className="font-semibold text-green-600 flex items-center gap-1"><CheckCircle size={10}/> Disponible (98%)</span></div>
                 </div>

                 <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
                    <strong className="text-[11px] font-semibold text-gray-800">Emplacement physique</strong>
                    <div className="text-[10px] text-gray-500 leading-relaxed font-medium">
                       Administration centrale › Bâtiment A ›<br/>
                       Bureau Juridique › Rayon 2 › Étagère 1 ›<br/>
                       Boîte B-025 › <span className="text-gray-900 font-bold">Document 18</span>
                    </div>
                 </div>

                 <button className="w-full mt-2 py-2 border border-orange-500 text-orange-500 rounded-lg text-xs font-semibold hover:bg-orange-50 transition-colors">Voir le détail complet</button>
              </div>
           </div>
        </div>
      </div>
      
      {/* ─── Bottom Actions Bar ────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 lg:left-[250px] right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 px-6 flex justify-between items-center z-50">
         <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold text-[13px]"><RotateCcw size={16} /> Réinitialiser les filtres</button>
         <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold text-[13px] rounded-xl shadow-sm hover:bg-gray-50"><Download size={16}/> Exporter les résultats</button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold text-[13px] rounded-xl shadow-sm hover:bg-gray-50"><Folder size={16}/> Ouvrir le document</button>
            <button className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white font-semibold text-[13px] rounded-xl shadow-sm shadow-red-500/20 hover:bg-red-600"><X size={16}/> Fermer</button>
         </div>
      </div>

    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────── */

function FilterField({ label, placeholder }: any) {
  return (
    <div className="flex flex-col gap-1.5">
       <label className="text-[11px] font-medium text-gray-600">{label}</label>
       <input type="text" placeholder={placeholder} className="w-full border border-gray-200 rounded-lg p-2 text-xs outline-none focus:border-orange-500" />
    </div>
  );
}

function FilterSelect({ label, options }: any) {
  return (
    <div className="flex flex-col gap-1.5">
       <label className="text-[11px] font-medium text-gray-600">{label}</label>
       <select className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs outline-none font-medium text-gray-700">
           {options.map((opt:string)=><option key={opt}>{opt}</option>)}
       </select>
    </div>
  );
}

function FilterSegment({ label, options, active }: any) {
  return (
    <div className="flex flex-col gap-1.5">
       <label className="text-[11px] font-medium text-gray-600">{label}</label>
       <div className="flex bg-gray-100 rounded-lg p-1 w-full border border-gray-200">
          {options.map((opt:string) => (
             <button key={opt} className={`flex-1 text-[11px] font-semibold py-1 rounded-md text-center transition-colors 
                ${active === opt ? 'bg-white text-orange-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                {opt}
             </button>
          ))}
       </div>
    </div>
  );
}

function StatBox({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col gap-2 flex-1 relative overflow-hidden">
       <span className="text-[11px] font-medium text-gray-500">{label}</span>
       <strong className={`text-3xl font-bold font-oswald ${color}`}>{value}</strong>
       <Icon size={40} className="absolute -right-2 -bottom-2 text-gray-100/50 transform -rotate-12" />
    </div>
  );
}

function ViewBtn({ active, icon: Icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all
       ${active ? 'bg-white text-orange-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-800'}`}>
       <Icon size={14} /> {label}
    </button>
  );
}

function ResultRow({ icon, color, name, code, cat, author, ver, status, date, size, ocr, noOcr, isFolder }: any) {
  return (
    <tr className="border-b border-gray-50 hover:bg-orange-50/40 transition-colors group cursor-pointer">
       <td className="py-2.5 px-4"><input type="checkbox" className="rounded" /></td>
       <td className="py-2.5 px-4 flex items-center gap-3">
          {isFolder ? (
             <Folder size={20} className={color} strokeWidth={1.5} />
          ) : (
             <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold ${color}`}>{icon}</div>
          )}
          <strong className="font-semibold text-gray-800 text-[12.5px] max-w-[200px] truncate">{name}</strong>
       </td>
       <td className="py-2.5 px-4 text-gray-500 font-medium">{code}</td>
       <td className="py-2.5 px-4 text-gray-600">{cat}</td>
       <td className="py-2.5 px-4 text-gray-600">{author}</td>
       <td className="py-2.5 px-4 text-gray-500">{ver}</td>
       <td className="py-2.5 px-4 text-center">
         <span className={`px-2 py-0.5 text-[10px] rounded flex items-center justify-center gap-1 w-max border font-bold
           ${status==='Actif'?'bg-green-50 text-green-600 border-green-200':
             status==='Validé'?'bg-emerald-50 text-emerald-600 border-emerald-200':
             status==='Archivé'?'bg-gray-100 text-gray-600 border-gray-200':
             status==='En attente'?'bg-yellow-50 text-yellow-600 border-yellow-200':''}`}>
            {status}
         </span>
       </td>
       <td className="py-2.5 px-4 text-center text-green-500">
          {!noOcr ? (ocr ? <CheckCircle size={14} className="mx-auto" /> : <div className="text-gray-300">-</div>) : <div className="text-gray-300">-</div>}
       </td>
       <td className="py-2.5 px-4 text-gray-500 font-medium">{date}</td>
       <td className="py-2.5 px-4 text-gray-700 font-semibold">{size}</td>
       <td className="py-2.5 px-4">
          <div className="flex items-center gap-2.5 text-gray-400">
             {!isFolder && <Eye size={15} className="hover:text-orange-500" />}
             {!isFolder && <Download size={15} className="hover:text-orange-500" />}
             {!isFolder && <Star size={15} className="hover:text-orange-500" />}
             {isFolder && <Folder size={15} className="hover:text-orange-500" />}
             <MoreVertical size={15} className="hover:text-orange-500 ml-1" />
          </div>
       </td>
    </tr>
  );
}

function BottomPanel({ title, btnLabel, noBtn, children }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col">
       <h4 className="font-semibold text-[13px] text-gray-800 mb-3">{title}</h4>
       <div className="flex flex-col gap-1.5 flex-1 line-clamp-4">
          {children}
       </div>
       {!noBtn && (
          <button className="mt-4 w-fit px-3 py-1.5 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 rounded-lg hover:bg-orange-100 transition-colors">
            {btnLabel === 'Nouvelle recherche' ? '+ Nouvelle recherche' : btnLabel}
          </button>
       )}
    </div>
  );
}

function SearchItem({ icon: Icon, text, sub, active }: any) {
  return (
    <div className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer ${active ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
       <div className="flex items-center gap-2">
          <Icon size={14} className={active ? 'text-orange-500' : 'text-gray-400'} />
          <span className={`text-[11px] font-medium ${active ? 'text-orange-700' : 'text-gray-700'}`}>{text}</span>
       </div>
       {sub && <span className="text-[9px] text-gray-400">{sub}</span>}
    </div>
  );
}

function SuggestionTag({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-[10px] font-medium text-gray-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 cursor-pointer transition-colors">
       <Search size={10} /> {text}
    </div>
  );
}