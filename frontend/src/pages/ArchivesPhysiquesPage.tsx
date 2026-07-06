import { Archive, Search, Plus, Edit2, Trash2 } from 'lucide-react';

export function ArchivesPhysiquesPage() {
  const items = [
    { code: 'BAT-A', nom: 'Bâtiment Principal', type: 'Bâtiment', capacite: '500 Armoires', utilise: '85%' },
    { code: 'BAT-B', nom: 'Annexe Stockage', type: 'Bâtiment', capacite: '300 Armoires', utilise: '45%' },
  ];

  return (
    <div className="flex flex-col gap-6 font-poppins pb-10 text-gray-800 h-[calc(100vh-140px)]">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gray-100 border border-gray-200 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <Archive size={26} className="text-gray-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-oswald text-gray-900">Archives physiques</h2>
          <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400 mt-0.5">
            <span>Accueil</span> <span>›</span> <span className="text-orange-500 font-semibold">Archives physiques</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="p-4 border-b border-gray-100 flex gap-4">
           <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus-within:bg-white transition-colors">
              <Search size={16} className="text-gray-400"/>
              <input className="flex-1 outline-none text-xs bg-transparent" placeholder="Rechercher..." />
           </div>
           <button className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 text-gray-900 font-bold text-xs rounded-xl hover:bg-yellow-500">
             <Plus size={15}/> Nouveau
           </button>
        </div>
        <table className="w-full text-left text-[12px] whitespace-nowrap">
          <thead><tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold"><th className="py-3 px-5">Code</th><th className="py-3 px-5">Nom</th><th className="py-3 px-5">Type</th><th className="py-3 px-5">Capacité</th><th className="py-3 px-5">Utilisé</th><th className="py-3 px-5 text-right">Actions</th></tr></thead>
          <tbody>{items.map(d=><tr key={d.code} className="border-b border-gray-50 hover:bg-gray-50/50"><td className="py-3 px-5 font-semibold text-gray-600">{d.code}</td><td className="py-3 px-5 font-bold text-gray-800">{d.nom}</td><td className="py-3 px-5">{d.type}</td><td className="py-3 px-5">{d.capacite}</td><td className="py-3 px-5">{d.utilise}</td><td className="py-3 px-5 text-right flex justify-end gap-2"><button className="p-1 hover:text-orange-500"><Edit2 size={14}/></button><button className="p-1 hover:text-red-500"><Trash2 size={14}/></button></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
