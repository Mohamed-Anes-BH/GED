import { Trash2, RefreshCw, Trash, MoreVertical, Search, Eye, X, Shield } from 'lucide-react';

export function CorbeillePage() {
  const items = [
    { icon:'W', bg:'bg-blue-100 text-blue-600', name:'Rapport_Annuel_2024.docx', author:'Sophie Martin', dept:'Finance', date:'24/05/2026 14:32', by:'Admin AgrOdiv', size:'2,45 MB', days:28 },
    { icon:'PDF', bg:'bg-red-100 text-red-600', name:'Facture_2026_001.pdf', author:'Julien Moreau', dept:'Comptabilité', date:'24/05/2026 11:15', by:'Admin AgrOdiv', size:'1,12 MB', days:28 },
    { isFolder:true, name:'Dossier_Contrats_2024', author:'Claire Dubois', dept:'Juridique', date:'23/05/2026 16:45', by:'Claire Dubois', size:'—', days:27 },
    { icon:'XLS', bg:'bg-green-100 text-green-600', name:'Budget_Previsionnel.xlsx', author:'Marc Lefevre', dept:'Finance', date:'23/05/2026 10:22', by:'Marc Lefevre', size:'890 KB', days:27 },
    { icon:'EML', bg:'bg-orange-100 text-orange-500', name:'Courrier_Client_ACME.eml', author:'Nathalie Bernard', dept:'Commercial', date:'22/05/2026 09:12', by:'Nathalie Bernard', size:'320 KB', days:26 },
    { icon:'PDF', bg:'bg-red-100 text-red-600', name:'Plan_Projet_Agrodiv.pdf', author:'Thomas Petit', dept:'Technique', date:'21/05/2026 17:33', by:'Thomas Petit', size:'4,75 MB', days:25 },
    { isFolder:true, name:'Archives_2019', author:'Admin AgrOdiv', dept:'Archives', date:'21/05/2026 13:40', by:'Admin AgrOdiv', size:'—', days:25 },
    { icon:'W', bg:'bg-blue-100 text-blue-600', name:'Note_Interne_0526.docx', author:'Isabelle Roger', dept:'RH', date:'20/05/2026 08:55', by:'Isabelle Roger', size:'512 KB', days:24 },
  ];

  return (
    <div className="flex flex-col gap-5 font-poppins pb-10 text-gray-800">
      {/* Header */}
      <div className="flex flex-wrap gap-4 items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center shadow-sm">
            <Trash2 size={26} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold font-oswald text-gray-900 dark:text-gray-100">Corbeille</h2>
            <div className="text-[11px] font-medium text-gray-400 mt-0.5 flex items-center gap-1">
              <span>Accueil</span> <span>›</span> <span className="text-orange-500 font-semibold">Corbeille</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-[13px] font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"><RefreshCw size={14}/> Restaurer</button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-[13px] font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"><RefreshCw size={14}/> Restaurer tout</button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-red-200 bg-red-50 text-red-600 rounded-xl text-[13px] font-semibold hover:bg-red-100"><Trash size={14}/> Supprimer définitivement</button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-yellow-400 text-gray-900 rounded-xl text-[13px] font-bold hover:bg-yellow-500 shadow-sm"><Trash2 size={14}/> Vider la corbeille</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {[
          { label:'Total éléments', val:'1 248', sub:'éléments supprimés', icon:'🗑️', border:'border-gray-200' },
          { label:'Documents supprimés', val:'896', sub:'fichiers', icon:'📄', border:'border-gray-200' },
          { label:'Dossiers supprimés', val:'156', sub:'dossiers', icon:'📁', border:'border-gray-200' },
          { label:'Courriers supprimés', val:'196', sub:'courriers', icon:'✉️', border:'border-gray-200' },
          { label:'Taille totale', val:'12,48 GB', sub:'espace occupé', icon:'💾', border:'border-gray-200' },
        ].map(k=>(
          <div key={k.label} className={`bg-white border ${k.border} rounded-2xl p-4 shadow-sm flex items-center gap-3`}>
            <span className="text-3xl">{k.icon}</span>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-gray-500 leading-tight">{k.label}</span>
              <strong className="text-2xl font-bold font-oswald text-gray-900 leading-tight">{k.val}</strong>
              <span className="text-[10px] text-gray-400">{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex gap-5 items-start">
        {/* Table */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Tabs + search */}
          <div className="flex flex-wrap gap-2 items-center">
            {['Tous','Documents','Dossiers','Courriers',"Aujourd'hui",'Cette semaine','Ce mois'].map((t,i)=>(
              <button key={t} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors
                ${i===0?'bg-gray-900 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t}</button>
            ))}
            <div className="flex-1 flex items-center gap-2 border border-gray-200 bg-white rounded-xl px-3 py-1.5 ml-2">
              <Search size={14} className="text-gray-400"/>
              <input className="flex-1 outline-none text-xs text-gray-700" placeholder="Rechercher dans la corbeille..." />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 font-medium">
                    <th className="py-3 px-4 w-8"><input type="checkbox" className="rounded"/></th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Nom</th>
                    <th className="py-3 px-4">Auteur</th>
                    <th className="py-3 px-4">Département</th>
                    <th className="py-3 px-4">Date de suppression ↓</th>
                    <th className="py-3 px-4">Supprimé par</th>
                    <th className="py-3 px-4">Taille</th>
                    <th className="py-3 px-4">Temps restant</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i} className={`border-b border-gray-50 hover:bg-gray-50/80 cursor-pointer group ${i===0?'bg-blue-50/30':''}`}>
                      <td className="py-3 px-4"><input type="checkbox" className="rounded"/></td>
                      <td className="py-3 px-4">
                        {it.isFolder
                          ? <span className="text-lg">📁</span>
                          : <div className={`w-7 h-7 rounded flex items-center justify-center text-[9px] font-bold ${it.bg}`}>{it.icon}</div>
                        }
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800">{it.name}</td>
                      <td className="py-3 px-4 text-gray-600">{it.author}</td>
                      <td className="py-3 px-4 text-gray-600">{it.dept}</td>
                      <td className="py-3 px-4 text-gray-500">{it.date}</td>
                      <td className="py-3 px-4 text-gray-600">{it.by}</td>
                      <td className="py-3 px-4 text-gray-600">{it.size}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${it.days>=27?'bg-orange-100 text-orange-600':'bg-yellow-100 text-yellow-600'}`}>{it.days} jours</span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="p-1 text-gray-400 hover:text-gray-700"><MoreVertical size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center text-[11px] text-gray-500">
              <span>Affichage de 1 à 8 sur 1 248 éléments</span>
              <div className="flex items-center gap-2">
                <select className="border border-gray-200 rounded px-2 py-1 bg-white font-medium text-[11px]"><option>10 par page</option></select>
                <button className="px-2 py-1 border border-gray-200 bg-white rounded">&lt;</button>
                <button className="px-3 py-1 border border-orange-500 bg-orange-50 text-orange-600 font-bold rounded">1</button>
                <button className="px-3 py-1 border transparent rounded hover:bg-gray-100">2</button>
                <button className="px-3 py-1 border transparent rounded hover:bg-gray-100">3</button>
                <span>...</span>
                <button className="px-3 py-1 border transparent rounded hover:bg-gray-100">125</button>
                <button className="px-2 py-1 border border-gray-200 bg-white rounded">&gt;</button>
              </div>
            </div>
          </div>

          {/* Notice */}
          <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-[11px] text-yellow-800">
            <Shield size={16} className="text-yellow-500 shrink-0"/>
            <span>Les éléments sont automatiquement supprimés définitivement après <strong>30 jours</strong> dans la corbeille.</span>
          </div>
        </div>

        {/* Preview sidebar */}
        <div className="w-[280px] shrink-0 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
            <h4 className="font-bold text-[13px] text-orange-500 uppercase tracking-wide">Aperçu de l'élément</h4>
            <button className="text-gray-400 hover:text-gray-600"><X size={15}/></button>
          </div>

          <div className="p-4 flex flex-col gap-4">
            {/* Doc identity */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm">W</div>
              <div>
                <strong className="text-[13px] font-bold text-gray-900">Rapport_Annuel_2024.docx</strong>
                <div className="text-[11px] text-gray-500">Document Word</div>
              </div>
            </div>

            {/* Preview image */}
            <div className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 overflow-hidden relative">
              <div className="font-bold text-sm text-gray-700 font-oswald">RAPPORT ANNUEL 2024</div>
              <div className="w-2/3 h-12 bg-green-100 rounded mt-1 flex items-center justify-center">
                <div className="w-full h-full opacity-40 bg-gradient-to-b from-green-300 to-green-500 rounded"></div>
              </div>
              <div className="absolute bottom-1.5 right-2 text-[8px] font-bold text-gray-400">AgrOdiv</div>
            </div>

            {/* Meta */}
            <div className="flex flex-col gap-1.5 text-[10px]">
              {[
                ['Type','Document Word'],
                ['Date de création','10/01/2026  09:15'],
                ['Date de suppression','24/05/2026  14:32'],
                ['Auteur','Sophie Martin'],
                ["Emplacement d'origine",'/Dossiers/Finance/2024/'],
                ['Taille','2,45 MB'],
                ['Dernière modification','10/01/2026  09:15'],
              ].map(([l,v])=>(
                <div key={l} className="flex justify-between border-b border-gray-100 pb-1 last:border-0">
                  <span className="text-gray-500 w-[45%] shrink-0">{l}</span>
                  <span className={`font-semibold text-right w-[55%] ${l==='Date de suppression'?'text-red-500':l==='Type'?'text-gray-600':'text-gray-800'}`}>{v}</span>
                </div>
              ))}
            </div>

            {/* History */}
            <div>
              <h5 className="text-[11px] font-bold text-red-500 uppercase mb-2">Historique</h5>
              <table className="w-full text-[10px]">
                <thead><tr className="font-semibold text-gray-500 border-b border-gray-100"><th className="py-1 text-left">Date</th><th className="py-1 text-left">Utilisateur</th><th className="py-1 text-left">Action</th></tr></thead>
                <tbody>
                  <tr className="border-b border-gray-50"><td className="py-1.5 text-gray-600">24/05/2026 14:32</td><td className="py-1.5 text-gray-600">Admin AgrOdiv</td><td className="py-1.5 text-red-500 font-semibold">Supprimé</td></tr>
                  <tr><td className="py-1.5 text-gray-600">10/01/2026 09:15</td><td className="py-1.5 text-gray-600">Sophie Martin</td><td className="py-1.5 text-green-500 font-semibold">Créé</td></tr>
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <button className="flex items-center justify-center gap-2 w-full py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"><RefreshCw size={12}/> Restaurer</button>
              <button className="flex items-center justify-center gap-2 w-full py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600"><Trash size={12}/> Supprimer définitivement</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
