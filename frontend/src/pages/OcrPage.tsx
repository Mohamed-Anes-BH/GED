import { useState } from 'react';
import {
  FileText, ZoomIn, ZoomOut, RotateCcw, Maximize2, Bold, Italic, Underline,
  List, AlignLeft, Search, Copy, Download, RefreshCw, CheckCircle, AlertTriangle,
  Clock, ChevronLeft, ChevronRight, LayoutGrid, MoreVertical, ArrowLeft, Lightbulb,
  Type, Image as ImageIcon, Pen
} from 'lucide-react';

export function OcrPage() {
  const [activeThumb, setActiveThumb] = useState(1);

  return (
    <div className="flex flex-col gap-5 font-poppins pb-20 text-gray-800">
      {/* Progress Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <FileText size={20} className="text-orange-500" />
            </div>
            <div>
              <strong className="text-sm font-bold">Rapport_Production_2024.pdf</strong>
              <div className="text-[10px] text-gray-500">12 pages</div>
            </div>
          </div>
          <div className="flex flex-col flex-1 min-w-[200px] gap-1">
            <div className="flex justify-between text-[11px] font-bold mb-0.5">
              <span className="text-gray-600">Progression OCR</span>
              <span className="text-orange-600">98%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="w-[98%] h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
            </div>
            <span className="text-[10px] text-gray-400 italic">Reconnaissance du texte en cours…</span>
          </div>
          <div className="flex gap-6 flex-wrap shrink-0 text-[10px]">
            {[['Langue détectée','Français'],['Qualité globale','98% ↑'],['Moteur OCR','Tesseract 5.3.2']].map(([l,v])=>(
              <div key={l} className="flex flex-col gap-0.5">
                <span className="font-bold text-gray-500">{l}</span>
                <span className="font-bold text-gray-800">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex gap-5 items-start">
        {/* Thumbnails */}
        <div className="w-[90px] shrink-0 flex flex-col gap-2">
          {[1,2,3,4].map(n=>(
            <button key={n} onClick={()=>setActiveThumb(n)} className="flex flex-col items-center gap-1">
              <div className={`w-[72px] h-[90px] border-2 rounded-lg bg-white shadow-sm flex flex-col gap-1 p-2 transition-all
                ${activeThumb===n?'border-orange-500':'border-gray-200 hover:border-gray-400'}`}>
                <div className="h-2 bg-gray-200 w-3/4 rounded"></div>
                <div className="h-1.5 bg-gray-300 w-full rounded mt-1"></div>
                <div className="flex-1 bg-gray-100 rounded mt-1"></div>
              </div>
              <span className={`text-[10px] font-bold ${activeThumb===n?'text-orange-600':'text-gray-400'}`}>{n}</span>
            </button>
          ))}
        </div>

        {/* Scanned Preview */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
            <span className="text-[11px] font-bold text-gray-700">Aperçu du document (image scannée)</span>
            <div className="flex gap-1 text-gray-500">
              <IconBtn icon={ZoomOut}/><span className="text-[11px] self-center px-1">100%</span>
              <IconBtn icon={ZoomIn}/><IconBtn icon={RotateCcw}/><IconBtn icon={RefreshCw}/><IconBtn icon={Maximize2}/>
            </div>
          </div>
          <div className="bg-gray-200 overflow-auto flex justify-center p-4 min-h-[460px]">
            <div className="bg-white w-[340px] shadow-lg rounded border border-gray-200 p-5 flex flex-col gap-3 text-[11px]">
              <div className="text-center text-gray-600 font-medium">Ministère de l'Agriculture<br/>et du Développement Rural</div>
              <div className="text-center font-bold text-base mt-2 font-oswald">Rapport<br/>Production Céréalière 2024</div>
              <div className="font-semibold text-[12px] mt-2">1. Résumé exécutif</div>
              <table className="w-full border border-gray-300 text-[10px]">
                <tbody>
                  {[['Campagne','2023/2024'],['Période','Septembre 2023 – Août 2024'],['Production totale','3 245 780 Tonnes'],['Variation vs 2023','+8,7 %']].map(([k,v])=>(
                    <tr key={k} className="border-b border-gray-200">
                      <td className="p-1.5 font-medium text-gray-700 border-r border-gray-200 bg-gray-50">{k}</td>
                      <td className="p-1.5">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="font-semibold text-[12px] mt-2">2. Production par culture</div>
              <table className="w-full border border-gray-300 text-[10px]">
                <thead><tr className="bg-gray-100"><th className="p-1.5 border-r border-gray-200 text-left">Culture</th><th className="p-1.5 border-r border-gray-200 text-left">Surface (ha)</th><th className="p-1.5 text-left">Production</th></tr></thead>
                <tbody>
                  {[['Blé dur','1 250 000','2 100 000'],['Blé tendre','850 000','1 250 000'],['Orge','600 000','720 000'],['Maïs','450 000','400 000']].map(([c,s,p])=>(
                    <tr key={c} className="border-b border-gray-200"><td className="p-1.5 border-r border-gray-200">{c}</td><td className="p-1.5 border-r border-gray-200">{s}</td><td className="p-1.5">{p}</td></tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[9px] text-gray-500 leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing alit. Integer nec odio.</p>
              <div className="text-[9px] text-gray-400 text-right">1</div>
            </div>
          </div>
        </div>

        {/* OCR Text Editor */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 p-3 border-b border-gray-100 bg-gray-50 flex-wrap">
            <span className="text-[11px] font-bold text-gray-700 mr-2">Texte reconnu (modifiable)</span>
            <select className="border border-gray-200 bg-white rounded text-[10px] py-1 px-2 outline-none font-medium"><option>Paragraphe</option></select>
            <RtfBtn icon={Bold}/><RtfBtn icon={Italic}/><RtfBtn icon={Underline}/><RtfBtn icon={List}/><RtfBtn icon={AlignLeft}/>
            <div className="flex-1 min-w-[120px] flex items-center border border-gray-200 rounded overflow-hidden ml-1">
              <input className="flex-1 text-[10px] px-2 py-1 outline-none" placeholder="Rechercher dans le texte..." defaultValue="Production" />
              <span className="text-[9px] text-gray-500 bg-gray-50 border-l border-gray-200 py-1 px-1">1/6</span>
              <button className="px-1 border-l border-gray-200 text-gray-400 hover:bg-gray-100"><ChevronLeft size={11}/></button>
              <button className="px-1 border-l border-gray-200 text-gray-400 hover:bg-gray-100"><ChevronRight size={11}/></button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-5 min-h-[420px] text-[11px] leading-relaxed text-gray-800">
            <div className="text-center font-medium text-gray-600">Ministère de l'Agriculture<br/>et du Développement Rural</div>
            <div className="text-center font-bold text-base mt-2 mb-3 font-oswald">Rapport<br/>Production Céréalière 2024</div>
            <div className="font-bold text-[12px] mt-3 mb-1">1. Résumé exécutif</div>
            <table className="w-full border border-gray-300 text-[10px] mb-3">
              <tbody>
                {[['Campagne','2023/2024'],['Période','Septembre 2023 – Août 2024'],['Production totale','3 245 780 Tonnes'],['Variation vs 2023','+8,7 %'],['Principales cultures','Blé dur, Blé tendre, Orge, Maïs']].map(([k,v])=>(
                  <tr key={k} className="border-b border-gray-200">
                    <td className="p-1.5 font-medium text-gray-700 border-r border-gray-200 bg-gray-50/80 w-1/2">{k}</td>
                    <td className="p-1.5">{k==='Principales cultures'?<><span className="bg-yellow-200 text-yellow-900 font-semibold px-0.5 rounded">Blé tendre</span>, Orge, Maïs</>:v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="font-bold text-[12px] mb-1">2. Production par culture</div>
            <table className="w-full border border-gray-300 text-[10px]">
              <thead><tr className="bg-gray-100 font-bold text-gray-600"><th className="p-1.5 border-r border-gray-200 text-left">Culture</th><th className="p-1.5 border-r border-gray-200 text-left">Surface (ha)</th><th className="p-1.5 border-r border-gray-200 text-left">Production (t)</th><th className="p-1.5 text-left">Rendement</th></tr></thead>
              <tbody>
                {[['Blé dur','1 250 000','2 100 000','16.8'],['Blé tendre','850 000','1 250 000','14.7'],['Orge','600 000','720 000','12.0'],['Maïs','450 000','400 000','8.9']].map(([c,s,p,r],i)=>(
                  <tr key={c} className={`border-b border-gray-200 ${i===3?'bg-yellow-50':''}`}>
                    <td className="p-1.5 border-r border-gray-200">{c}</td>
                    <td className="p-1.5 border-r border-gray-200 text-gray-600">{s}</td>
                    <td className="p-1.5 border-r border-gray-200 text-gray-600">{p}</td>
                    <td className="p-1.5 text-gray-600">{r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-[10px] text-gray-500">
            <span>3562 mots • 122 paragraphes • 8 tableaux • 4 images</span>
            <button className="flex items-center gap-1.5 px-3 py-1 border border-gray-200 bg-white rounded-lg font-semibold text-gray-700 hover:bg-gray-50"><Copy size={11}/> Copier le texte</button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[240px] shrink-0 flex flex-col gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="text-[11px] font-bold text-orange-500 mb-3 flex items-center gap-1"><Type size={13}/> Informations OCR</div>
            <div className="flex flex-col gap-2 text-[10px]">
              {[['Pages traitées','12 / 12'],['Temps de traitement','00:14 (sec)'],['Qualité moyenne','98%'],['Confiance du texte','● Élevée'],['OCR disponible','● Oui'],['Dernière mise à jour','15/05/2024 à 10:32']].map(([l,v])=>(
                <div key={l} className="flex justify-between border-b border-gray-100 pb-1 last:border-0">
                  <span className="text-gray-500">{l}</span>
                  <span className={`font-semibold ${v.startsWith('●') ? 'text-green-600' : 'text-gray-800'}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
            <div className="text-[11px] font-bold text-orange-500 mb-1 flex items-center gap-1"><RefreshCw size={13}/> Actions OCR</div>
            <button className="w-full py-1.5 border border-gray-200 rounded-lg text-[10px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1"><RefreshCw size={11}/> Relancer l'OCR</button>
            <button className="w-full py-1.5 border border-gray-200 rounded-lg text-[10px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1"><Copy size={11}/> Copier le texte</button>
            <button className="w-full py-1.5 border border-gray-200 rounded-lg text-[10px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1"><Download size={11}/> Télécharger le texte</button>
            <button className="w-full py-2 bg-orange-500 text-white rounded-xl text-[11px] font-bold shadow-sm hover:bg-orange-600 flex items-center justify-center gap-1"><Download size={12}/> Télécharger PDF OCR</button>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="text-[11px] font-bold text-orange-500 mb-3 flex items-center gap-1"><LayoutGrid size={13}/> Zones reconnues</div>
            <div className="grid grid-cols-3 gap-2">
              {[['Type','24','bg-blue-50 text-blue-700 border-blue-200'],['Paragraphe','122','bg-green-50 text-green-700 border-green-200'],['Tableau','8','bg-purple-50 text-purple-700 border-purple-200'],['Signature','1','bg-orange-50 text-orange-700 border-orange-200'],['Cachet','1','bg-yellow-50 text-yellow-700 border-yellow-200'],['Image','4','bg-red-50 text-red-700 border-red-200']].map(([l,c,cls])=>(
                <div key={l} className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border ${cls} text-center`}>
                  <strong className="text-[14px] font-bold font-oswald leading-none">{c}</strong>
                  <span className="text-[8px] font-semibold leading-tight">{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-yellow-600 font-semibold text-[11px] mb-2"><Lightbulb size={13} className="fill-current"/> Conseils</div>
            <p className="text-[10px] text-yellow-800 leading-relaxed">Le texte a été reconnu avec une excellente qualité (98%). Vérifiez les mots surlignés et corrigez si nécessaire avant de valider le document.</p>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-orange-500 mb-3 flex items-center gap-1"><LayoutGrid size={13}/> Statistiques OCR</div>
          <div className="grid grid-cols-2 gap-3">
            {[['12','Pages OCR','bg-blue-50 text-blue-500'],['00:14','Temps total','bg-orange-50 text-orange-500'],['98%','Confiance','bg-green-50 text-green-500'],['3562','Mots détectés','bg-purple-50 text-purple-500'],['5','Erreurs','bg-red-50 text-red-400']].map(([v,l,cls])=>(
              <div key={l} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] ${cls}`}>{v}</div>
                <span className="text-[10px] text-gray-500">{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-orange-500 mb-3 flex items-center gap-1"><Clock size={13}/> Historique OCR</div>
          <div className="flex flex-col gap-2 pl-3 border-l-2 border-gray-100 relative">
            {[['bg-gray-400','Scan terminé','15/05/2024 à 10:18'],['bg-orange-400','OCR lancé','15/05/2024 à 10:18'],['bg-green-500','OCR terminé','15/05/2024 à 10:32',true],['bg-green-500','Texte corrigé','15/05/2024 à 10:33'],['bg-teal-500','PDF OCR enregistré','15/05/2024 à 10:34']].map(([dot,t,d,p]:any,i)=>(
              <div key={i} className="relative">
                <div className={`absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2 border-white ${dot} z-10 ${p?'animate-pulse':''}`}></div>
                <strong className="text-[10px] font-semibold text-gray-800 block">{t}</strong>
                <span className="text-[9px] text-gray-500">{d}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-orange-500 mb-3 flex items-center gap-1"><Type size={13}/> Aperçu du texte</div>
          <div className="flex flex-col gap-1.5 text-[10px]">
            {[['Mots','3562'],['Paragraphes','122'],['Tableaux','8'],['Images','4'],['Signatures','1'],['Langue','Français'],['Direction','Gauche à droite']].map(([k,v])=>(
              <div key={k} className="flex justify-between border-b border-gray-100 pb-1 last:border-0">
                <span className="text-gray-500">{k}</span><span className="font-semibold text-gray-800">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <div className="text-[11px] font-bold text-orange-500 flex items-center gap-1"><CheckCircle size={13}/> Workflow</div>
          <SelectF label="Circuit d'approbation" val="Validation standard" />
          <SelectF label="Responsable" val="Yacine M." />
          <SelectF label="Diffusion" val="Direction & Service" />
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 lg:left-[250px] right-0 bg-white border-t border-gray-200 p-4 px-6 flex justify-between items-center z-50">
        <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold text-[13px] rounded-xl hover:bg-gray-50">Annuler</button>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2 border border-orange-200 bg-orange-50 text-orange-600 font-semibold text-[13px] rounded-xl hover:bg-orange-100">
            <ArrowLeft size={14}/> Retour Scanner
          </button>
          <button className="px-5 py-2 border border-orange-400 bg-white text-orange-600 font-semibold text-[13px] rounded-xl hover:bg-orange-50">Enregistrer</button>
          <button className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white font-bold text-[13px] rounded-xl shadow-sm hover:bg-orange-600">
            <CheckCircle size={14}/> Valider OCR
          </button>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ icon: Icon }: any) {
  return <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500"><Icon size={13}/></button>;
}

function RtfBtn({ icon: Icon }: any) {
  return <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><Icon size={12}/></button>;
}

function SelectF({ label, val }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] font-bold text-gray-500">{label}</label>
      <select className="w-full p-1.5 border border-gray-200 rounded-lg text-[10px] font-semibold text-gray-800 outline-none bg-white"><option>{val}</option></select>
    </div>
  );
}
