import { Star, Folder, LayoutGrid, List, Download, Share, Archive, Edit2, Trash2, Eye, MoreVertical, CheckCircle, Filter, Plus, RotateCcw } from 'lucide-react';

export function FavorisPage() {
  const tabs = ['Tous','Documents','Dossiers','Courriers entrants','Courriers sortants','Workflows','Archives','Conversations','Recherches'];

  return (
    <div className="flex flex-col gap-5 font-poppins pb-20 text-gray-800">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-[28px] font-bold font-oswald text-gray-900 flex items-center gap-2"><Star size={24} className="text-yellow-400 fill-current"/> Favoris</h2>
        <p className="text-[13px] text-gray-500">Vos documents, dossiers et éléments importants favoris.</p>
        <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400 mt-0.5">
          <span>Accueil</span> <span>›</span> <span className="text-orange-500 font-semibold">Favoris</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label:'Favoris', val:'156', trend:'↑ 12.5% ce mois', icon:'⭐', bg:'bg-yellow-50', border:'border-yellow-200' },
          { label:'Documents favoris', val:'98', trend:'↑ 9.3% ce mois', icon:'📄', bg:'bg-blue-50', border:'border-blue-200' },
          { label:'Dossiers favoris', val:'28', trend:'↑ 8.1% ce mois', icon:'📁', bg:'bg-green-50', border:'border-green-200' },
          { label:'Courriers favoris', val:'16', trend:'↑ 6.4% ce mois', icon:'✈️', bg:'bg-purple-50', border:'border-purple-200' },
          { label:'Workflows favoris', val:'9', trend:'↑ 6.4% ce mois', icon:'🔄', bg:'bg-orange-50', border:'border-orange-200' },
          { label:'Ajouts cette semaine', val:'12', trend:'↑ 5.2% ce mois', icon:'📅', bg:'bg-red-50', border:'border-red-200' },
        ].map(k => (
          <div key={k.label} className={`bg-white border ${k.border} rounded-2xl p-4 shadow-sm flex flex-col gap-1 relative overflow-hidden`}>
            <span className="text-[11px] font-semibold text-gray-500 leading-tight">{k.label}</span>
            <strong className="text-2xl font-bold font-oswald text-gray-900">{k.val}</strong>
            <span className="text-[10px] font-bold text-green-600">{k.trend}</span>
            <span className="absolute right-3 bottom-2 text-2xl opacity-20 select-none">{k.icon}</span>
          </div>
        ))}
      </div>

      {/* Main layout */}
      <div className="flex gap-5 items-start">
        {/* Table area */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 items-center">
            <button className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white font-semibold text-[13px] rounded-xl shadow-sm shadow-orange-500/20 hover:bg-orange-600"><Plus size={15}/> Ajouter aux favoris</button>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-white text-gray-700 font-semibold text-[12px] rounded-xl hover:bg-gray-50"><Folder size={14}/> Ouvrir</button>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-white text-gray-700 font-semibold text-[12px] rounded-xl hover:bg-gray-50"><Share size={14}/> Partager</button>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-white text-gray-700 font-semibold text-[12px] rounded-xl hover:bg-gray-50"><Archive size={14}/> Organiser</button>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-white text-gray-700 font-semibold text-[12px] rounded-xl hover:bg-gray-50"><Download size={14}/> Exporter</button>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-red-200 bg-red-50 text-red-600 font-semibold text-[12px] rounded-xl hover:bg-red-100"><Trash2 size={14}/> Retirer des favoris</button>
            <div className="flex-1"></div>
            <button className="p-2 border border-gray-200 bg-white rounded-lg text-gray-500 hover:bg-gray-50"><LayoutGrid size={15}/></button>
            <button className="p-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-700"><List size={15}/></button>
            <button className="flex items-center gap-1 px-3 py-2 border border-gray-200 bg-white rounded-lg text-gray-600 text-xs font-semibold hover:bg-gray-50"><Filter size={13}/> Filtres 2</button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 flex-wrap">
            {tabs.map((t,i) => (
              <button key={t} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                ${i===0 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t}</button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-end text-xs">
            <FilterSel label="Département" />
            <FilterSel label="Auteur" />
            <FilterSel label="Date" placeholder="Toutes dates" />
            <FilterSel label="Type" />
            <FilterSel label="Tags" />
            <FilterSel label="Service" />
            <button className="mt-5 text-orange-500 font-semibold text-[11px] hover:underline">Réinitialiser</button>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px] whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 font-medium">
                    <th className="py-3 px-3 w-8"><input type="checkbox" className="rounded"/></th>
                    <th className="py-3 px-3 font-medium">Nom</th>
                    <th className="py-3 px-3 font-medium">Type</th>
                    <th className="py-3 px-3 font-medium">Catégorie</th>
                    <th className="py-3 px-3 font-medium">Département</th>
                    <th className="py-3 px-3 font-medium">Auteur</th>
                    <th className="py-3 px-3 font-medium">Dernière ouverture</th>
                    <th className="py-3 px-3 font-medium">Version</th>
                    <th className="py-3 px-3 font-medium">Taille</th>
                    <th className="py-3 px-3 font-medium">Workflow</th>
                    <th className="py-3 px-3 font-medium text-center">Statut</th>
                    <th className="py-3 px-3 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <FavRow icon="PDF" bg="bg-red-100 text-red-600" name="Rapport annuel 2024.pdf" type="Document" cat="Rapport" dep="Direction Générale" author="Yacine M." lastOpen="16/05/2024 14:20" ver="5.0" size="2.4 Mo" wf="Validation" stat="Actif" />
                  <FavRow icon="XLS" bg="bg-green-100 text-green-600" name="Budget prévisionnel.xlsx" type="Document" cat="Budget" dep="Finances" author="Karim B." lastOpen="16/05/2024 09:30" ver="3.0" size="1.2 Mo" wf="Validation" stat="Actif" />
                  <FavRow icon="PDF" bg="bg-red-100 text-red-600" name="Contrat fournisseur.pdf" type="Document" cat="Contrat" dep="Achats" author="Nadia A." lastOpen="15/05/2024 11:15" ver="2.1" size="856 Ko" wf="Signature" stat="Actif" />
                  <FavRow icon="W" bg="bg-blue-100 text-blue-600" name="Plan stratégique 2024.docx" type="Document" cat="Plan" dep="Direction Générale" author="Sofiane H." lastOpen="16/05/2024 13:50" ver="2.0" size="1.8 Mo" wf="Approbation" stat="Actif" />
                  <FavRow isFolder name="Production" type="Dossier" cat="Dossier" dep="Production" author="Yacine M." lastOpen="15/05/2024 10:05" size="—" stat="Actif" />
                  <FavRow isFolder name="Ressources Humaines" type="Dossier" cat="Dossier" dep="Ressources Humaines" author="Sofiane H." lastOpen="14/05/2024 15:40" size="—" stat="Actif" />
                  <FavRow icon="W" bg="bg-blue-100 text-blue-600" name="Courrier Ministère Agriculture" type="Courrier entrant" cat="Courrier" dep="Direction Générale" author="Yacine M." lastOpen="15/05/2024 08:55" ver="—" size="320 Ko" wf="Validation" stat="Actif" />
                  <FavRow icon="PDF" bg="bg-red-100 text-red-600" name="Rapport OCR Scan.pdf" type="Document" cat="Rapport" dep="Qualité" author="Nadia A." lastOpen="13/05/2024 14:10" ver="1.0" size="3.2 Mo" wf="Diffusion" stat="Actif" />
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center text-[11px] text-gray-500">
              <span>Affichage de 1 à 8 sur 156 favoris</span>
              <div className="flex items-center gap-2">
                <button className="px-2 py-1 border border-gray-200 bg-white rounded">&lt;</button>
                <button className="px-3 py-1 border border-orange-500 bg-orange-50 text-orange-600 font-bold rounded">1</button>
                <button className="px-3 py-1 border transparent rounded hover:bg-gray-100">2</button>
                <button className="px-3 py-1 border transparent rounded hover:bg-gray-100">3</button>
                <span className="text-gray-400">...</span>
                <button className="px-3 py-1 border transparent rounded hover:bg-gray-100">20</button>
                <button className="px-2 py-1 border border-gray-200 bg-white rounded">&gt;</button>
                <select className="ml-2 border border-gray-200 rounded px-2 py-1 bg-white font-medium"><option>10 / page</option></select>
              </div>
            </div>
          </div>

          {/* Bottom panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3"><h4 className="text-xs font-bold text-gray-700">Récemment ajoutés aux favoris</h4><a href="#" className="text-[10px] text-orange-500 font-bold">Voir tout</a></div>
              {[['PDF','Rapport mensuel Mai 2024.pdf','15/05/2024 10:35'],['W','Demande de financement.docx','15/05/2024 09:15'],['W','Courrier Direction Générale.eml','14/05/2024 16:20'],['PDF','Contrat annuel 2024.pdf','14/05/2024 11:30'],['XLS','Tableau de bord Q2.xlsx','13/05/2024 15:40']].map(([t,n,d])=>(
                <div key={n} className="flex items-center gap-2 py-1.5 text-[10px]">
                  <div className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[7px] shrink-0 ${t==='PDF'?'bg-red-100 text-red-600':t==='W'?'bg-blue-100 text-blue-600':'bg-green-100 text-green-600'}`}>{t}</div>
                  <span className="flex-1 font-medium text-gray-700 truncate">{n}</span>
                  <span className="text-gray-400 shrink-0">{d}</span>
                </div>
              ))}
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3"><h4 className="text-xs font-bold text-gray-700">Activité récente</h4><a href="#" className="text-[10px] text-orange-500 font-bold">Voir tout</a></div>
              {[['green','Rapport annuel 2024.pdf ajouté aux favoris'],['blue','Budget prévisionnel.xlsx ouvert'],['orange','Production dossier modifié'],['teal','Courrier Ministère partagé'],['purple','Contrat fournisseur.pdf téléchargé']].map(([c,t])=>(
                <div key={t} className="flex items-start gap-2 py-1.5 text-[10px]">
                  <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${c==='green'?'bg-green-500':c==='blue'?'bg-blue-500':c==='orange'?'bg-orange-500':c==='teal'?'bg-teal-500':'bg-purple-500'}`}></div>
                  <span className="text-gray-600">{t}</span>
                </div>
              ))}
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2">
              <div className="flex justify-between items-center w-full mb-3"><h4 className="text-xs font-bold text-gray-700">Favoris par catégorie</h4><a href="#" className="text-[10px] text-orange-500 font-bold">Voir tout</a></div>
              <div className="w-28 h-28 rounded-full border-8 border-orange-500 relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-8 border-green-500 border-r-transparent border-b-transparent transform rotate-45"></div>
                <div className="flex flex-col items-center"><strong className="text-2xl font-bold font-oswald text-gray-800">156</strong><span className="text-[9px] text-gray-500">Total</span></div>
              </div>
              <div className="flex flex-col gap-1 w-full text-[10px]">
                {[['bg-orange-500','Documents','98 (62.8%)'],['bg-green-500','Dossiers','28 (17.9%)'],['bg-blue-500','Courriers','16 (10.3%)'],['bg-purple-500','Workflows','9 (5.8%)'],['bg-gray-400','Archives','3 (1.9%)']].map(([c,l,v])=>(
                  <div key={l} className="flex justify-between"><div className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${c}`}></div><span className="text-gray-600">{l}</span></div><span className="font-semibold text-gray-700">{v}</span></div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3"><h4 className="text-xs font-bold text-gray-700">Dossiers favoris</h4><a href="#" className="text-[10px] text-orange-500 font-bold">Voir tout</a></div>
              {[['Production','12 éléments'],['Ressources Humaines','8 éléments'],['Comptabilité','7 éléments'],['Courriers','5 éléments'],['Rapports','4 éléments']].map(([n,c])=>(
                <div key={n} className="flex items-center justify-between py-1.5 text-[10px]">
                  <div className="flex items-center gap-2"><div className="w-5 h-5 bg-yellow-100 rounded flex items-center justify-center text-yellow-600">📁</div><span className="font-medium text-gray-700">{n}</span></div>
                  <span className="text-gray-500">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar: preview */}
        <div className="w-[280px] shrink-0 flex flex-col gap-4 sticky top-6">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <h4 className="font-semibold text-sm">Aperçu du favori</h4>
              <span className="bg-green-50 border border-green-200 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded">Actif</span>
            </div>
            {/* Preview image area */}
            <div className="w-full h-40 bg-orange-50 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-orange-50"></div>
              <div className="relative z-10 w-24 h-28 bg-white shadow-md rounded border border-gray-200 flex flex-col p-2 gap-1">
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                <div className="h-5 bg-gray-300 rounded w-full mt-1 font-bold text-[7px] flex items-center justify-center text-gray-600">RAPPORT ANNUEL 2024</div>
                <div className="w-full h-10 bg-orange-100 rounded mt-1 flex items-center justify-center text-[8px] text-orange-600 font-medium">Ministère de l'Agriculture</div>
                <div className="h-1.5 bg-gray-200 w-full rounded mt-auto"></div>
              </div>
              <div className="absolute bottom-2 right-2"><div className="bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded">PDF</div></div>
            </div>
            <div className="flex p-1 border-b border-gray-100 bg-gray-50">
              {['⟨','1 / 45','—','100%','+','↓','⛶'].map(c => <button key={c} className="flex-1 py-1 text-[11px] text-gray-500 hover:bg-gray-200 rounded text-center">{c}</button>)}
            </div>
            {/* Meta */}
            <div className="p-4 flex flex-col gap-1.5 text-[10px]">
              <strong className="text-[13px] font-bold text-gray-900 mb-1">Rapport annuel 2024.pdf</strong>
              {[['Type','Document PDF'],['Auteur','Yacine M.'],['Version','5.0'],['Département','Direction Générale'],['Workflow','Validation'],['OCR','Activé'],['Signature','Signé'],['Confidentialité','Interne'],['Emplacement physique','Bâtiment A · Armoire 2 · Étagère 1'],['Dernière consultation','15/05/2024 à 10:35'],['Ajouté aux favoris','10/05/2024 à 09:20'],['Nombre de favoris','12 utilisateurs']].map(([l,v])=>(
                <div key={l} className="flex justify-between border-b border-gray-100 pb-1 last:border-0">
                  <span className="text-gray-500 w-1/2">{l}</span>
                  <span className="font-semibold text-gray-800 text-right w-1/2 truncate">{v}</span>
                </div>
              ))}
              <button className="w-full mt-3 py-2 bg-orange-500 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-orange-600 flex items-center justify-center gap-1.5"><Eye size={13}/> Ouvrir le document</button>
            </div>
          </div>

          {/* Top docs */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3"><h4 className="text-xs font-bold text-gray-700">Top documents consultés</h4><a href="#" className="text-[10px] text-orange-500 font-bold">Voir tout</a></div>
            {[['Rapport production 2024.pdf','25 ouvertures'],['Budget prévisionnel.xlsx','18 ouvertures'],['Contrat fournisseur.pdf','15 ouvertures'],["Plan stratégique 2024.docx",'12 ouvertures'],['Rapport annuel 2023.pdf','9 ouvertures']].map(([n,c],i)=>(
              <div key={n} className="flex items-center gap-2 py-1.5 text-[10px]">
                <span className="text-orange-500 font-bold w-4 shrink-0">{i+1}</span>
                <span className="flex-1 font-medium text-gray-700 truncate">{n}</span>
                <span className="text-gray-400 shrink-0">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 lg:left-[250px] right-0 bg-white border-t border-gray-200 p-4 px-6 flex justify-between items-center z-50">
        <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white rounded-xl text-gray-700 font-semibold text-[13px] hover:bg-gray-50"><Folder size={15}/> Ouvrir</button>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white rounded-xl text-gray-700 font-semibold text-[12px] hover:bg-gray-50"><Edit2 size={14}/> Modifier</button>
          <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white rounded-xl text-gray-700 font-semibold text-[12px] hover:bg-gray-50"><Download size={14}/> Télécharger</button>
          <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white rounded-xl text-gray-700 font-semibold text-[12px] hover:bg-gray-50"><Share size={14}/> Partager</button>
          <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white rounded-xl text-gray-700 font-semibold text-[12px] hover:bg-gray-50"><Archive size={14}/> Imprimer</button>
          <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white rounded-xl text-gray-700 font-semibold text-[12px] hover:bg-gray-50"><RotateCcw size={14}/> Déplacer</button>
          <button className="flex items-center gap-1.5 px-4 py-2 border border-orange-200 bg-orange-50 text-orange-600 rounded-xl font-semibold text-[12px] hover:bg-orange-100"><Star size={14}/> Retirer des favoris</button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-xl font-bold text-[12px] hover:bg-red-600 ml-2"><Trash2 size={14}/> Supprimer</button>
        </div>
      </div>
    </div>
  );
}

function FilterSel({ label, placeholder }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-gray-500">{label}</label>
      <select className="border border-gray-200 bg-white rounded-lg px-2 py-1.5 text-xs font-medium text-gray-700 outline-none"><option>{placeholder || 'Tous'}</option></select>
    </div>
  );
}

function FavRow({ icon, bg, name, type, cat, dep, author, lastOpen, ver, size, wf, stat, isFolder }: any) {
  return (
    <tr className="border-b border-gray-50 hover:bg-orange-50/30 cursor-pointer group text-[11px]">
      <td className="py-2.5 px-3"><input type="checkbox" className="rounded"/></td>
      <td className="py-2.5 px-3 flex items-center gap-2">
        <Star size={12} className="text-yellow-400 fill-current shrink-0"/>
        {isFolder ? (
          <span className="text-yellow-500 text-lg">📁</span>
        ) : (
          <div className={`w-6 h-6 rounded flex items-center justify-center text-[8px] font-bold shrink-0 ${bg}`}>{icon}</div>
        )}
        <span className="font-semibold text-gray-800 truncate max-w-[160px]">{name}</span>
      </td>
      <td className="py-2.5 px-3 text-gray-600">{type}</td>
      <td className="py-2.5 px-3 text-gray-600">{cat}</td>
      <td className="py-2.5 px-3 text-gray-600">{dep}</td>
      <td className="py-2.5 px-3 flex items-center gap-1.5">
        <img src={`https://ui-avatars.com/api/?name=${author.replace(' ','+')}`} className="w-4 h-4 rounded-full"/>
        {author}
      </td>
      <td className="py-2.5 px-3 text-gray-500">{lastOpen || '—'}</td>
      <td className="py-2.5 px-3 text-gray-500">{ver || '—'}</td>
      <td className="py-2.5 px-3 font-medium text-gray-700">{size}</td>
      <td className="py-2.5 px-3">
        {wf && <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${wf==='Validation'?'bg-blue-50 text-blue-600 border-blue-100':wf==='Signature'?'bg-orange-50 text-orange-600 border-orange-100':'bg-green-50 text-green-600 border-green-100'}`}>{wf}</span>}
      </td>
      <td className="py-2.5 px-3 text-center">
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold border border-green-200 bg-green-50 text-green-600">{stat}</span>
      </td>
      <td className="py-2.5 px-3">
        <div className="flex justify-center items-center gap-2 text-gray-400 opacity-0 group-hover:opacity-100">
          <Eye size={13}/><Download size={13}/><MoreVertical size={13}/>
        </div>
      </td>
    </tr>
  );
}
