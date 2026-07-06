import { BarChart2, RefreshCw, Download, FileText, Send, Folder, Users, Archive } from 'lucide-react';

const months = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'];

export function StatistiquesPage() {
  return (
    <div className="flex flex-col gap-6 font-poppins pb-10 text-gray-800">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <BarChart2 size={26} className="text-yellow-500" />
        </div>
        <div className="flex flex-col flex-1">
          <h2 className="text-3xl font-bold font-oswald text-gray-900">Statistiques</h2>
          <div className="text-[11px] font-medium text-gray-400 mt-0.5 flex items-center gap-1">
            <span>Accueil</span> <span>›</span> <span className="text-orange-500 font-semibold">Statistiques</span>
          </div>
          <p className="text-[13px] text-blue-500 font-medium mt-1">Visualisez les indicateurs de performance de votre plateforme GED.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <label className="text-[10px] font-bold text-gray-500">Période</label>
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white">
            <span className="text-gray-400">📅</span>
            <select className="flex-1 outline-none text-xs font-medium text-gray-700 bg-transparent"><option>30 derniers jours</option></select>
          </div>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <label className="text-[10px] font-bold text-gray-500">Département</label>
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white">
            <span className="text-gray-400">🏢</span>
            <select className="flex-1 outline-none text-xs font-medium text-gray-700 bg-transparent"><option>Tous les départements</option></select>
          </div>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <label className="text-[10px] font-bold text-gray-500">Utilisateur</label>
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white">
            <span className="text-gray-400">👤</span>
            <select className="flex-1 outline-none text-xs font-medium text-gray-700 bg-transparent"><option>Tous les utilisateurs</option></select>
          </div>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 text-gray-900 font-bold text-[13px] rounded-xl shadow-sm hover:bg-yellow-500 shrink-0">
          <RefreshCw size={15}/> Actualiser
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Documents', val: '12 458', icon: FileText, bg: 'bg-orange-50 text-orange-400', line: '🟠' },
          { label: 'Courriers entrants', val: '2 185', icon: Download, bg: 'bg-green-50 text-green-400', line: '🟢' },
          { label: 'Courriers sortants', val: '1 943', icon: Send, bg: 'bg-blue-50 text-blue-400', line: '🔵' },
          { label: 'Dossiers', val: '684', icon: Folder, bg: 'bg-purple-50 text-purple-400', line: '🟣' },
          { label: 'Utilisateurs', val: '56', icon: Users, bg: 'bg-red-50 text-red-400', line: '🔴' },
          { label: 'Stockage utilisé', val: '128 Go', icon: Archive, bg: 'bg-teal-50 text-teal-400', line: '🩵' },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col gap-2 relative overflow-hidden">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${k.bg}`}><k.icon size={17}/></div>
            <strong className="text-2xl font-bold font-oswald text-gray-900 leading-tight">{k.val}</strong>
            <span className="text-[11px] font-medium text-gray-500">{k.label}</span>
            {/* Fake sparkline */}
            <svg className="w-full h-6 mt-1" viewBox="0 0 80 20">
              <polyline points="0,15 10,12 20,14 30,8 40,10 50,6 60,9 70,5 80,7" fill="none" stroke="currentColor" strokeWidth="1.5" className={k.bg.includes('orange')?'text-orange-400':k.bg.includes('green')?'text-green-400':k.bg.includes('blue')?'text-blue-400':k.bg.includes('purple')?'text-purple-400':k.bg.includes('red')?'text-red-400':'text-teal-400'}/>
            </svg>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Line chart: Évolution */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[15px] text-gray-800">Évolution des documents</h3>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">↑ +18%</span>
              <span className="text-[11px] text-gray-400">vs période précédente</span>
            </div>
          </div>
          {/* SVG chart */}
          <svg viewBox="0 0 520 120" className="w-full" style={{height:160}}>
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.25"/>
                <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
              </linearGradient>
            </defs>
            {/* Y labels */}
            {[0,1000,2000,3000,4000].map((v,i)=>(
              <text key={v} x="0" y={110-i*25} fontSize="8" fill="#9ca3af">{v>0?`${v/1000}K`:0}</text>
            ))}
            {/* Grid */}
            {[0,1,2,3,4].map(i=>(
              <line key={i} x1="30" y1={110-i*25} x2="520" y2={110-i*25} stroke="#f3f4f6" strokeWidth="1"/>
            ))}
            {/* Data */}
            <path d="M30,90 L73,75 L116,80 L159,60 L202,65 L245,50 L288,60 L331,45 L374,55 L417,40 L460,50 L503,35" stroke="#f97316" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M30,90 L73,75 L116,80 L159,60 L202,65 L245,50 L288,60 L331,45 L374,55 L417,40 L460,50 L503,35 V110 H30 Z" fill="url(#lineGrad)"/>
            {/* X Labels */}
            {months.map((m,i)=>(
              <text key={m} x={30+i*43} y={120} fontSize="8" fill="#9ca3af" textAnchor="middle">{m}</text>
            ))}
          </svg>
        </div>

        {/* Donut chart: par catégorie */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-[15px] text-gray-800">Documents par catégorie</h3>
          </div>
          <div className="flex items-center gap-6">
            <svg viewBox="0 0 120 120" className="w-32 h-32 shrink-0">
              <circle cx="60" cy="60" r="45" fill="none" stroke="#fbbf24" strokeWidth="20" strokeDasharray="99 245" strokeDashoffset="0"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#22c55e" strokeWidth="20" strokeDasharray="70 245" strokeDashoffset="-99"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="56 245" strokeDashoffset="-169"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#a855f7" strokeWidth="20" strokeDasharray="34 245" strokeDashoffset="-225"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#ef4444" strokeWidth="20" strokeDasharray="22 245" strokeDashoffset="-259"/>
            </svg>
            <div className="flex flex-col gap-2.5 flex-1">
              {[['bg-yellow-400','Rapports','35% (4 360)'],['bg-green-500','Factures','25% (3 115)'],['bg-blue-500','Contrats','20% (2 491)'],['bg-purple-500','Courriers','12% (1 496)'],['bg-red-500','Archives','8% (996)']].map(([c,l,v])=>(
                <div key={l} className="flex justify-between items-center text-[11px]">
                  <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-sm ${c}`}></div><span className="font-medium text-gray-700">{l}</span></div>
                  <span className="font-semibold text-gray-600">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Second row charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Bar chart: Courriers */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[15px]">Courriers</h3>
            <div className="flex gap-4 text-[11px]">
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> Entrants</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-500 rounded-sm"></div> Sortants</span>
            </div>
          </div>
          <svg viewBox="0 0 520 120" className="w-full" style={{height:140}}>
            {[0,250,500,750,1000].map((v,i)=>(
              <text key={v} x="0" y={110-i*22} fontSize="8" fill="#9ca3af">{v>0?`${v/1000}K`:0}</text>
            ))}
            {[0,1,2,3,4].map(i=><line key={i} x1="30" y1={110-i*22} x2="520" y2={110-i*22} stroke="#f3f4f6" strokeWidth="1"/>)}
            {months.map((m,i)=>{
              const inH = [40,55,50,65,60,70,55,68,72,65,80,75][i];
              const outH = [20,30,25,35,30,40,30,40,38,42,45,50][i];
              return (
                <g key={m}>
                  <rect x={30+i*41} y={110-inH} width="12" height={inH} fill="#22c55e" rx="2"/>
                  <rect x={44+i*41} y={110-outH} width="12" height={outH} fill="#f97316" rx="2"/>
                  <text x={41+i*41} y={122} fontSize="8" fill="#9ca3af" textAnchor="middle">{m}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Line chart: Activité utilisateurs */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[15px]">Activité utilisateurs</h3>
            <div className="flex gap-4 text-[11px]">
              <span className="flex items-center gap-1.5"><div className="w-3 h-1 bg-yellow-400 rounded-full"></div> Connexions</span>
              <span className="flex items-center gap-1.5"><div className="w-3 h-1 bg-green-500 rounded-full"></div> Consultations</span>
              <span className="flex items-center gap-1.5"><div className="w-3 h-1 bg-blue-500 rounded-full"></div> Téléchargements</span>
            </div>
          </div>
          <svg viewBox="0 0 520 120" className="w-full" style={{height:140}}>
            {[0,500,1000,1500,2000].map((v,i)=>(
              <text key={v} x="0" y={110-i*22} fontSize="8" fill="#9ca3af">{v>0?`${v/1000}K`:0}</text>
            ))}
            {[0,1,2,3,4].map(i=><line key={i} x1="30" y1={110-i*22} x2="520" y2={110-i*22} stroke="#f3f4f6" strokeWidth="1"/>)}
            <polyline points="30,65 73,55 116,60 159,45 202,50 245,40 288,48 331,35 374,42 417,30 460,38 503,25" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
            <polyline points="30,80 73,72 116,78 159,65 202,70 245,60 288,68 331,55 374,62 417,50 460,58 503,45" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
            <polyline points="30,95 73,90 116,92 159,82 202,88 245,78 288,85 331,72 374,80 417,68 460,75 503,62" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
            {months.map((m,i)=>(
              <text key={m} x={30+i*43} y={122} fontSize="8" fill="#9ca3af" textAnchor="middle">{m}</text>
            ))}
          </svg>
        </div>
      </div>

      {/* Summary table */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-[15px]">Résumé général</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2 border border-orange-200 bg-orange-50 text-orange-600 rounded-xl text-[12px] font-semibold hover:bg-orange-100"><FileText size={13}/> Exporter PDF</button>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-yellow-400 text-gray-900 rounded-xl text-[12px] font-semibold hover:bg-yellow-500"><Download size={13}/> Exporter Excel</button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label:'Documents', val:'12 458', icon:FileText, color:'text-orange-500 bg-orange-50' },
            { label:'Courriers entrants', val:'2 185', icon:Download, color:'text-green-500 bg-green-50' },
            { label:'Courriers sortants', val:'1 943', icon:Send, color:'text-blue-500 bg-blue-50' },
            { label:'Dossiers', val:'684', icon:Folder, color:'text-purple-500 bg-purple-50' },
            { label:'Utilisateurs', val:'56', icon:Users, color:'text-red-500 bg-red-50' },
            { label:'Stockage utilisé', val:'128 Go', icon:Archive, color:'text-teal-500 bg-teal-50' },
          ].map(k=>(
            <div key={k.label} className="flex flex-col items-center gap-2 p-3 border border-gray-100 rounded-xl bg-gray-50/50">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${k.color}`}><k.icon size={16}/></div>
              <strong className="text-xl font-bold font-oswald">{k.val}</strong>
              <span className="text-[10px] font-medium text-gray-500 text-center">{k.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
