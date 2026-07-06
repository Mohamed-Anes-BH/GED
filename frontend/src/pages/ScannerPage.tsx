import { useState } from 'react';
import { 
  Printer, Scan, RefreshCw, ZoomIn, ZoomOut, Crop, Trash2, RotateCcw, 
  RotateCw, Plus, CheckCircle, FileText, Clock, Settings, ChevronDown, 
  MapPin, Lightbulb, Image as ImageIcon
} from 'lucide-react';

export function ScannerPage() {
  return (
    <div className="flex flex-col gap-6 font-poppins pb-24 text-gray-800">
      
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 inline-block">
        <h2 className="text-[28px] font-bold font-oswald text-gray-900 dark:text-gray-100">Scanner de documents</h2>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
           <FileText size={14}/> <span>Documents</span> <span>›</span> <span className="text-gray-900 font-semibold dark:text-gray-100">Scanner de documents</span>
        </div>
      </div>

      {/* ─── Main Grid Layout ───────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        
        {/* LEFT COLUMN (1) */}
        <div className="w-full xl:w-[280px] shrink-0 flex flex-col h-full">
           <SectionPanel num={1} title="Panneau scanner">
              
              <div className="flex flex-col gap-2 mb-6">
                 <span className="text-[11px] font-bold text-gray-500">Scanner détecté</span>
                 <div className="flex items-center justify-between border border-gray-200 rounded-lg py-2 px-3 bg-gray-50">
                    <span className="flex items-center gap-2 text-xs font-semibold"><Printer size={16}/> Canon DR-C240</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-600"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Connecté</span>
                 </div>
                 <button className="mt-2 w-full py-3 bg-orange-500 text-white font-bold text-sm rounded-xl shadow-sm shadow-orange-500/20 hover:bg-orange-600 flex items-center justify-center gap-2">
                    <Scan size={18}/> Scanner maintenant
                 </button>
              </div>

              <div className="flex flex-col gap-4">
                 <span className="text-[13px] font-bold text-gray-700">Réglages du scan</span>
                 
                 <SegmentControl title="Résolution" options={['150 dpi', '300 dpi', '600 dpi']} active="300 dpi" />
                 <SegmentControl title="Couleur" options={['Couleur', 'N&B', 'Niveaux de gris']} active="Couleur" />
                 <SegmentControl title="Format" options={['A4', 'A5', 'Legal', 'Letter']} active="A4" />
                 <SegmentControl title="Côtés" options={['Recto', 'Recto / Verso']} active="Recto" />
                 
                 <div className="flex justify-between items-center text-xs text-gray-600 font-medium py-2 mt-2 border-t border-gray-100">
                    <span className="flex items-center gap-2"><Settings size={14}/> Paramètres avancés</span>
                    <ChevronDown size={14}/>
                 </div>
              </div>

           </SectionPanel>
        </div>

        {/* MIDDLE COLUMN (2) */}
        <div className="flex-1 flex flex-col h-full min-w-[500px]">
           <SectionPanel num={2} title="Aperçu du document" noPadding>
              
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-center gap-6 p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                 <ToolBtn icon={RotateCcw} label="Rotation gauche" />
                 <ToolBtn icon={RotateCw} label="Rotation droite" />
                 <ToolBtn icon={ZoomOut} label="Zoom -" />
                 <ToolBtn icon={ZoomIn} label="Zoom +" />
                 <ToolBtn icon={Crop} label="Recadrer" />
                 <ToolBtn icon={Trash2} label="Supprimer" />
                 <ToolBtn icon={RefreshCw} label="Réinitialiser" />
              </div>

              {/* Canvas Area */}
              <div className="p-6 bg-gray-100 flex justify-center items-center h-[500px] overflow-hidden shadow-inner relative">
                 <div className="bg-white w-[300px] h-[420px] shadow-sm rounded flex flex-col p-4 border border-gray-200">
                    {/* Mock Scanned Doc Content */}
                    <div className="text-center text-[10px] text-gray-600 font-medium leading-tight">Ministère de l'Agriculture<br/>et du Développement Rural</div>
                    <div className="text-center font-bold text-sm mt-3 mb-2 font-oswald leading-tight">Rapport<br/>Production Céréalière 2024</div>
                    <div className="h-60 w-full border border-gray-300 mt-2 bg-gray-50 flex flex-col items-center justify-center text-gray-400 text-[10px]">
                       [Tableau de données]
                    </div>
                 </div>
              </div>

              {/* Thumbnails */}
              <div className="p-4 border-t border-gray-100 flex items-center justify-center gap-3 overflow-x-auto bg-gray-50">
                 <Thumbnail active num="1" />
                 <Thumbnail num="2" />
                 <Thumbnail num="3" />
                 <Thumbnail num="4" />
                 <Thumbnail num="5" />
                 <button className="w-16 h-20 border-2 border-dashed border-gray-300 bg-white rounded flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50">
                    <Plus size={16}/> <span className="text-[9px] font-bold mt-1">Ajouter<br/>une page</span>
                 </button>
              </div>

              {/* Status Bar */}
              <div className="px-4 py-2 bg-gray-100 text-[10px] text-gray-500 font-bold flex justify-between items-center rounded-b-2xl">
                 <div className="flex gap-4">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500 shadow-sm border border-white"></div> Scanner connecté</span>
                    <span className="flex items-center gap-1.5"><FileText size={12}/> 5 pages détectées</span>
                 </div>
                 <div className="flex gap-4 items-center">
                    <span className="flex items-center gap-1.5"><Clock size={12}/> Dernier scan : 10:25</span>
                    <span className="flex items-center gap-1.5 bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200"><Settings size={10}/> OCR disponible</span>
                 </div>
              </div>
           </SectionPanel>
        </div>

        {/* RIGHT COLUMN (3, 4, 5) */}
        <div className="w-full xl:w-[350px] shrink-0 flex flex-col gap-6 h-full">
           
           <SectionPanel num={3} title="Informations du scan">
              <div className="flex items-center select-none gap-4 relative justify-between">
                 {/* fake scanner graphic */}
                 <div className="absolute right-0 -top-6 -bottom-6 w-3/5 opacity-[0.15] bg-[url('https://ui-avatars.com/api/?name=Scanner&background=random')] bg-contain bg-right bg-no-repeat z-0 pointer-events-none grayscale"></div>
                 
                 <div className="flex flex-col gap-2.5 text-[11px] font-medium w-full z-10">
                    <InfoRow label="Scanner" val="Canon DR-C240" />
                    <InfoRow label="Résolution" val="300 dpi" />
                    <InfoRow label="Couleur" val="Couleur" />
                    <InfoRow label="Pages" val="5" />
                    <InfoRow label="Taille estimée" val="4.2 MB" />
                    <InfoRow label="OCR" val="Disponible" color="text-green-600 font-bold" />
                    <InfoRow label="État" val="Prêt" color="text-green-600 font-bold" />
                 </div>
              </div>
           </SectionPanel>

           <SectionPanel num={4} title="Classement rapide">
              <div className="flex flex-col gap-3">
                 <SelectField label="Catégorie" val="Rapports" />
                 <SelectField label="Direction" val="Direction Générale" />
                 <SelectField label="Département" val="Statistiques & Analyses" />
                 <SelectField label="Service" val="Service des Grandes Cultures" />
                 <SelectField label="Dossier" val="Rapports annuels" />
                 <SelectField label="Sous-dossier" val="2024" />
                 <div className="flex flex-col gap-1.5 mt-1">
                    <label className="text-[10px] font-bold text-gray-500">Tags</label>
                    <div className="flex flex-wrap gap-1.5">
                       <Tag label="production" /> <Tag label="céréalière" /> <Tag label="annuel" /> <Tag label="2024" />
                       <button className="px-2 py-1 bg-orange-50 text-orange-600 font-semibold text-[10px] rounded-lg border border-orange-200 ml-auto flex items-center gap-1">+ Pré-remplir</button>
                    </div>
                 </div>
              </div>
           </SectionPanel>

           <SectionPanel num={5} title="Emplacement physique" subtitle="(Original papier)">
              <div className="flex flex-col gap-3">
                 <div className="grid grid-cols-2 gap-3">
                    <SelectField label="Site" val="Administration centrale" />
                    <SelectField label="Bâtiment" val="Bâtiment A" />
                 </div>
                 <SelectField label="Bureau" val="Bureau Juridique" />
                 <div className="grid grid-cols-2 gap-3">
                    <SelectField label="Rayon" val="Rayon 2" />
                    <SelectField label="Étagère" val="Étagère 1" />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <SelectField label="Boîte" val="Boîte B-025" />
                 </div>
                 <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-500">Numéro dans la boîte</label>
                    <input type="text" className="w-1/2 p-1.5 border border-gray-200 rounded-lg text-xs outline-none" defaultValue="18" />
                 </div>
              </div>
           </SectionPanel>
           
        </div>
      </div>

      {/* ─── Bottom Area (6, 7, 8, 9) ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
         
         <SectionPanel num={6} title="OCR">
           <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 cursor-pointer">
                 <input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500" defaultChecked />
                 Lancer automatiquement l'OCR
              </label>
              <SelectField label="Langue" val="Français" />
              <div className="flex justify-between items-center text-xs mt-1">
                 <span className="font-bold text-gray-500">Qualité attendue</span>
                 <span className="px-2 py-0.5 bg-green-100 text-green-700 font-bold rounded-lg border border-green-200">98% ↑</span>
              </div>
           </div>
         </SectionPanel>
         
         <SectionPanel num={7} title="Workflow">
           <div className="flex flex-col gap-3">
              <SelectField label="Circuit d'approbation" val="Validation standard" />
              <SelectField label="Responsable de validation" val="Yacine M." />
              <SelectField label="Diffusion" val="Direction & Service" />
           </div>
         </SectionPanel>

         <SectionPanel num={8} title="Options de fichier">
           <div className="flex flex-col gap-3">
              <SelectField label="Format de sortie" val="PDF" />
              <div className="flex flex-col gap-1.5">
                 <label className="text-[10px] font-bold text-gray-500">Nom du fichier</label>
                 <input type="text" className="w-full p-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 outline-none" defaultValue="Rapport_Production_2024" />
              </div>
              <label className="flex items-center gap-2 text-[11px] font-semibold text-gray-600 mt-1 cursor-pointer">
                 <input type="checkbox" className="rounded" defaultChecked />
                 Ouvrir le document après l'enregistrement
              </label>
           </div>
         </SectionPanel>

         <SectionPanel num={9} title="Aperçu du nom et chemin">
           <div className="flex flex-col gap-3 relative pb-4">
              <InfoRow label="Nom" val="Rapport_Production_2024.pdf" bold />
              <InfoRow label="Chemin" val="/documents/rapports/2024/Rapport_Production_2024.pdf" small />
              <InfoRow label="Taille estimée" val="4.2 MB" />
              
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex gap-3 text-[10px]">
                 <Lightbulb size={16} className="text-yellow-600 fill-current shrink-0" />
                 <div className="flex flex-col">
                    <strong className="text-yellow-800">Conseils</strong>
                    <span className="text-yellow-700 leading-tight block mt-1">Assurez-vous que le document est bien placé et que les paramètres sont optimisés pour un meilleur résultat.</span>
                 </div>
              </div>
           </div>
         </SectionPanel>

      </div>

      {/* ─── Sticky Bottom Actions ────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 lg:left-[250px] right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 px-6 flex justify-between items-center z-50">
         <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold text-[13px] rounded-xl hover:bg-gray-50 shadow-sm">Annuler</button>
         
         <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 border border-orange-200 bg-orange-50 text-orange-600 font-semibold text-[13px] rounded-xl hover:bg-orange-100 transition-colors">
               <span className="font-bold flex items-center justify-center w-4 h-4 border-2 border-orange-600 rounded-sm leading-none pt-0.5">_</span> Enregistrer le scan
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 border border-orange-200 bg-white text-orange-600 font-semibold text-[13px] rounded-xl hover:bg-orange-50 shadow-sm transition-colors">
               <Plus size={16} /> Scanner une autre page
            </button>
            <button className="flex items-center gap-1.5 px-6 py-2.5 bg-orange-500 text-white font-bold text-[13px] rounded-xl hover:bg-orange-600 shadow-sm shadow-orange-500/20 transition-colors">
               <CheckCircle size={16}/> Terminer
            </button>
         </div>
      </div>

    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────── */

function SectionPanel({ num, title, subtitle, children, noPadding }: any) {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-full ${noPadding ? '' : 'p-5'}`}>
       <div className={`flex items-center gap-2 mb-4 ${noPadding ? 'p-5 pb-0' : ''}`}>
          <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">{num}</div>
          <h3 className="font-semibold text-sm text-gray-800">{title}</h3>
          {subtitle && <span className="text-[11px] text-gray-500">{subtitle}</span>}
       </div>
       <div className={`${noPadding ? '' : ''} flex-1`}>
          {children}
       </div>
    </div>
  );
}

function SegmentControl({ title, options, active }: any) {
  return (
    <div className="flex flex-col gap-1.5">
       <span className="text-[10px] font-bold text-gray-500">{title}</span>
       <div className="flex border border-gray-200 rounded-lg bg-gray-100 p-1 w-full gap-1">
         {options.map((opt:string) => (
           <button key={opt} className={`flex-1 py-1 rounded-md text-[11px] font-semibold transition-colors 
              ${active === opt ? 'bg-white text-orange-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-800'}`}>
              {opt}
           </button>
         ))}
       </div>
    </div>
  );
}

function ToolBtn({ icon: Icon, label }: any) {
  return (
    <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
       <div className="w-8 h-8 flex items-center justify-center rounded-lg group-hover:bg-gray-200 text-gray-600 transition-colors">
         <Icon size={16} />
       </div>
       <span className="text-[9px] font-bold text-gray-500 group-hover:text-gray-800 text-center leading-tight">
          {label.split(' ').map((w:string,i:number)=><span key={i} className="block">{w}</span>)}
       </span>
    </div>
  );
}

function Thumbnail({ active, num }: any) {
  return (
    <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
       <div className={`w-16 h-20 bg-white rounded border-2 p-1 flex justify-center items-center overflow-hidden transition-colors ${active ? 'border-orange-500' : 'border-gray-200 group-hover:border-gray-300'}`}>
         {/* Fake tiny doc representing a page */}
         <div className="w-full h-full border border-gray-100 bg-gray-50 flex flex-col gap-0.5 p-1">
            <div className="w-full h-[20%] bg-gray-200"></div>
            <div className="w-full flex-1 bg-gray-300"></div>
         </div>
       </div>
       <span className={`text-[10px] font-bold ${active ? 'text-orange-600' : 'text-gray-500'}`}>{num}</span>
    </div>
  );
}

function InfoRow({ label, val, color, bold, small }: any) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-1.5 last:border-0 last:pb-0">
       <span className="text-gray-500 w-[40%] flex-shrink-0">{label}</span>
       <span className={`text-right ${small ? 'text-[9.5px]' : ''} ${color || 'text-gray-800'} ${bold ? 'font-bold' : ''}`}>{val}</span>
    </div>
  );
}

function SelectField({ label, val }: any) {
  return (
    <div className="flex flex-col gap-1">
       <label className="text-[10px] font-bold text-gray-500">{label}</label>
       <select className="w-full p-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 outline-none bg-white">
          <option>{val}</option>
       </select>
    </div>
  );
}

function Tag({ label }: any) {
  return (
    <div className="px-2 py-1 bg-orange-50 border border-orange-100 text-orange-700 text-[10px] font-semibold rounded-lg flex items-center gap-1 cursor-pointer">
       {label} <span className="text-orange-400 hover:text-orange-600">×</span>
    </div>
  );
}
