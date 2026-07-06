import { Clock, Download, Eye, RotateCcw } from 'lucide-react';

export function HistoriqueVersionsPage() {
  const versions = [
    { v: 'v2.1', date: 'Aujourd\'hui 14:30', user: 'Sofiane Hamidi', desc: 'Mise à jour des annexes financières', size: '2.4 Mo', current: true },
    { v: 'v2.0', date: 'Hier 09:15', user: 'Meryem Benali', desc: 'Validation par la direction', size: '2.3 Mo', current: false },
    { v: 'v1.1', date: '10/05/2026', user: 'Sofiane Hamidi', desc: 'Correction des coquilles', size: '2.2 Mo', current: false },
    { v: 'v1.0', date: '05/05/2026', user: 'Sofiane Hamidi', desc: 'Création initiale du document', size: '2.1 Mo', current: false },
  ];

  return (
    <div className="flex flex-col gap-6 font-poppins pb-10 text-gray-800">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-cyan-50 border border-cyan-100 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <Clock size={26} className="text-cyan-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-oswald text-gray-900">Historique des versions</h2>
          <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400 mt-0.5">
            <span>Accueil</span> <span>›</span> <span>Document</span> <span>›</span> <span className="text-orange-500 font-semibold">Historique</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 ml-6 relative">
        <div className="absolute top-8 bottom-8 left-10 w-0.5 bg-gray-100"></div>
        <div className="flex flex-col gap-8">
          {versions.map((ver, i) => (
             <div key={ver.v} className="flex items-start gap-6 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${ver.current ? 'border-cyan-500 bg-cyan-50 text-cyan-600' : 'border-gray-200 bg-white text-gray-400'}`}>
                  {ver.current ? <div className="w-2.5 h-2.5 rounded-full bg-cyan-500"></div> : <div className="w-2 h-2 rounded-full bg-gray-300"></div>}
                </div>
                <div className={`flex-1 p-5 rounded-2xl border ${ver.current ? 'border-cyan-200 bg-cyan-50/20' : 'border-gray-100 bg-gray-50/50'}`}>
                   <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center gap-3">
                       <span className={`font-bold text-lg ${ver.current ? 'text-cyan-700' : 'text-gray-700'}`}>{ver.v}</span>
                       {ver.current && <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded text-[10px] font-bold uppercase">Actuelle</span>}
                     </div>
                     <span className="text-[11px] text-gray-500 font-medium">{ver.date}</span>
                   </div>
                   <p className="text-gray-800 font-medium text-[13px] mb-4">{ver.desc}</p>
                   <div className="flex justify-between items-end">
                     <div className="flex items-center gap-2 text-gray-500 text-[11px]">
                       <img src={`https://ui-avatars.com/api/?name=${ver.user.replace(' ','+')}&background=random`} className="w-5 h-5 rounded-full" />
                       Modifié par <span className="font-bold text-gray-700">{ver.user}</span> • {ver.size}
                     </div>
                     <div className="flex gap-2">
                       <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white text-gray-600 rounded-lg text-[11px] font-semibold hover:bg-gray-50 shadow-sm"><Eye size={13}/> Aperçu</button>
                       <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white text-gray-600 rounded-lg text-[11px] font-semibold hover:bg-gray-50 shadow-sm"><Download size={13}/> Télécharger</button>
                       {!ver.current && <button className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 text-white rounded-lg text-[11px] font-bold hover:bg-cyan-600 shadow-sm"><RotateCcw size={13}/> Restaurer</button>}
                     </div>
                   </div>
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
