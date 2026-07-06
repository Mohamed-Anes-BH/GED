import { useState } from 'react';
import {
  FileText, Edit2, Download, Printer, Share2, Copy, Move, Star, Trash2,
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, RotateCcw, 
  Search, Maximize, GitBranch, Share, Archive, ScanText, CheckCircle,
  XCircle, FilePlus, Eye, Fingerprint, LayoutGrid, List, Mail, MapPin, FolderTree
} from 'lucide-react';
import '../styles/document-detail.css'; // Minimal custom styles if needed, mostly we use Tailwind

/* ─── MOCK DATA ──────────────────────────────────────────── */
const thumbnails = [1, 2, 3, 4];

export function DocumentDetailPage({ documentId, onBack }: { documentId?: number, onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState('Aperçu');

  return (
    <div className="flex flex-col gap-5 pb-20 relative">
      {/* Top Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400 font-poppins">
          <span>Documents</span> <span>›</span> <span className="text-gray-900 font-semibold dark:text-gray-100">Rapport_Production_2024.pdf</span>
        </div>
      </div>

      {/* Title & Actions Bar */}
      <div className="flex justify-between items-start bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
        <div className="flex gap-4">
          <div className="w-14 h-14 bg-red-100 text-red-500 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
            PDF
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold font-oswald text-gray-900 dark:text-gray-100 flex items-center gap-2">
              Rapport Production 2024 
              <Star size={18} className="text-yellow-400 cursor-pointer" />
            </h2>
            <div className="flex items-center gap-4 text-xs font-poppins">
              <span className="text-gray-500">Code : DOC-2024-000241</span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 border border-green-200 rounded-full font-semibold">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Actif
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-full font-semibold">
                <CheckCircle size={12}/> Version finale
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-600 border border-purple-200 rounded-full font-semibold">
                <Eye size={12}/> Confidentiel
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <ActionButton label="Modifier" icon={Edit2} />
          <ActionButton label="Télécharger" icon={Download} />
          <ActionButton label="Imprimer" icon={Printer} />
          <ActionButton label="Partager" icon={Share2} />
          <ActionButton label="Dupliquer" icon={Copy} />
          <ActionButton label="Déplacer" icon={Move} />
          <ActionButton label="Favori" icon={Star} />
          <ActionButton label="Supprimer" icon={Trash2} isDanger />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex items-start gap-5 flex-col xl:flex-row">
        
        {/* Left Column (Viewer & Metadata) */}
        <div className="flex-1 flex flex-col gap-5 w-full">
          
          {/* PDF Viewer Block */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl flex h-[600px] overflow-hidden shadow-sm">
            {/* Thumbnails Sidebar */}
            <div className="w-24 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col p-3 gap-3 overflow-y-auto">
              {thumbnails.map((pageNum) => (
                <div key={pageNum} className="flex flex-col items-center gap-1 cursor-pointer group">
                  <div className={`w-full aspect-[1/1.4] bg-white border ${pageNum === 1 ? 'border-orange-500 ring-2 ring-orange-100' : 'border-gray-200 group-hover:border-orange-300'} rounded p-1 shadow-sm`}>
                    <div className="w-full h-full bg-gray-100 rounded-[2px] flex flex-col gap-1 px-1 py-1.5">
                      <div className="w-full h-0.5 bg-gray-300 rounded-full"></div>
                      <div className="w-3/4 h-0.5 bg-gray-300 rounded-full"></div>
                      <div className="w-full h-0.5 bg-gray-200 rounded-full mt-1"></div>
                      <div className="w-full h-0.5 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">{pageNum}</span>
                </div>
              ))}
              {/* Toggles */}
              <div className="mt-auto flex justify-center gap-2">
                <button className="p-1.5 bg-orange-500 text-white rounded-md"><LayoutGrid size={14}/></button>
                <button className="p-1.5 border border-gray-200 rounded-md text-gray-500 hover:bg-gray-100"><List size={14}/></button>
              </div>
            </div>

            {/* Viewer Main Area */}
            <div className="flex-1 flex flex-col bg-[#f0f2f5] dark:bg-gray-900 border-x border-gray-200 dark:border-gray-700 relative">
              {/* Viewer Toolbar */}
              <div className="h-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sticky top-0 z-10">
                <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={16}/></button>
                    <input type="text" defaultValue="1" className="w-8 text-center border border-gray-200 rounded p-1 text-xs" />
                    <span>/ 24</span>
                    <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={16}/></button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><ZoomOut size={16}/></button>
                  <span className="text-xs font-medium text-gray-600 w-12 text-center">100%</span>
                  <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><ZoomIn size={16}/></button>
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><RotateCcw size={16}/></button>
                  <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><RotateCw size={16}/></button>
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><Download size={16}/></button>
                  <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><Printer size={16}/></button>
                  <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><Search size={16}/></button>
                  <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><Maximize size={16}/></button>
                </div>
              </div>

              {/* Document Page Canvas */}
              <div className="flex-1 overflow-auto p-8 flex justify-center">
                <div className="w-[85%] max-w-[600px] bg-white shadow-md rounded border border-gray-200 p-10 flex flex-col gap-6 transform transition-transform">
                  <h1 className="text-center text-xl font-bold font-oswald mb-4">Rapport<br/>Production Céréalière 2024</h1>
                  <table className="w-full text-xs font-poppins border-collapse border border-gray-300">
                    <tbody>
                      <tr className="bg-gray-50"><td className="border border-gray-300 p-2 font-semibold" colSpan={2}>Résumé exécutif</td></tr>
                      <tr><td className="border border-gray-300 p-2 font-medium w-1/2">Campagne</td><td className="border border-gray-300 p-2">2023/2024</td></tr>
                      <tr><td className="border border-gray-300 p-2 font-medium">Période</td><td className="border border-gray-300 p-2">Septembre 2023 – Août 2024</td></tr>
                      <tr><td className="border border-gray-300 p-2 font-medium">Production totale</td><td className="border border-gray-300 p-2">3 245 780 Tonnes</td></tr>
                      <tr><td className="border border-gray-300 p-2 font-medium">Rendement (qx/ha)</td><td className="border border-gray-300 p-2 text-green-600 font-bold">+8.7%</td></tr>
                    </tbody>
                  </table>
                  <div className="text-xs text-justify flex flex-col gap-2">
                    <strong className="text-sm">1. Introduction</strong>
                    <p className="text-gray-600 leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex gap-6 border-b border-gray-200 px-2 font-poppins text-sm">
            <TabItem label="Aperçu" active={activeTab === 'Aperçu'} onClick={() => setActiveTab('Aperçu')} />
            <TabItem label="Métadonnées" active={activeTab === 'Métadonnées'} onClick={() => setActiveTab('Métadonnées')} />
            <TabItem label="Versions" badge="3" active={activeTab === 'Versions'} onClick={() => setActiveTab('Versions')} />
            <TabItem label="Historique" active={activeTab === 'Historique'} onClick={() => setActiveTab('Historique')} />
            <TabItem label="Diffusion" badge="5" active={activeTab === 'Diffusion'} onClick={() => setActiveTab('Diffusion')} />
            <TabItem label="Commentaires" badge="2" active={activeTab === 'Commentaires'} onClick={() => setActiveTab('Commentaires')} />
          </div>

          {/* Tab Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Métadonnées clés */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
              <h3 className="flex items-center gap-2 font-poppins font-semibold text-sm mb-4"><FileText className="text-orange-500" size={16}/> Métadonnées clés</h3>
              <div className="flex flex-col gap-3 text-xs">
                <MetaRow label="Direction" value="Direction de la Production Agricole" />
                <MetaRow label="Département" value="Statistiques & Analyses" />
                <MetaRow label="Service" value="Service des Grandes Cultures" />
                <MetaRow label="Dossier" value="Rapports annuels" />
                <MetaRow label="Sous-dossier" value="2024" />
                <div className="flex gap-2 items-center mt-2">
                  <span className="w-24 text-gray-500 font-medium shrink-0">Mots-clés</span>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2.5 py-0.5 bg-orange-50 text-orange-700 rounded-full border border-orange-100">rapport</span>
                    <span className="px-2.5 py-0.5 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-100">céréalière</span>
                    <span className="px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-100">annuel</span>
                  </div>
                </div>
              </div>
            </div>

            {/* OCR */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
              <h3 className="flex items-center gap-2 font-poppins font-semibold text-sm mb-4"><ScanText className="text-orange-500" size={16}/> OCR</h3>
              <div className="flex flex-col items-center justify-center gap-4 h-[180px] bg-gray-50 border border-dashed border-gray-300 rounded-xl">
                <div className="flex items-center gap-3">
                  <ScanText size={24} className="text-gray-400" />
                   <span className="font-poppins font-medium text-sm text-gray-700">Document OCRisé</span>
                   <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">Qualité : 98%</span>
                </div>
                <div className="flex gap-2 text-xs font-semibold font-poppins">
                  <button className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50 text-gray-700">Voir le texte</button>
                  <button className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50 text-gray-700">Copier le texte</button>
                </div>
                <button className="text-xs font-medium text-orange-600 flex items-center gap-2 mt-2"><Download size={14}/> Télécharger PDF OCR</button>
              </div>
            </div>

            {/* Relations */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
              <h3 className="flex items-center gap-2 font-poppins font-semibold text-sm mb-4"><Share2 className="text-orange-500" size={16}/> Relations</h3>
              <div className="flex flex-col gap-3">
                <RelationRow icon={FileText} label="Documents liés" badge="4" />
                <RelationRow icon={Mail} label="Courriers liés" badge="3" />
                <RelationRow icon={GitBranch} label="Versions liées" badge="3" />
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg text-xs font-medium">
                  <div className="flex items-center gap-2 text-gray-700"><Archive size={14} className="text-gray-500" /> Boîte physique</div>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-md font-bold">B-025</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Detailed Diffusion Grid shown at the bottom of the column */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
               <h3 className="flex items-center gap-2 font-poppins font-semibold text-sm"><Share className="text-orange-500" size={16}/> Diffusion <span className="font-normal text-gray-500">(5 destinataires)</span></h3>
               <a href="#" className="text-xs font-medium text-orange-500 hover:underline">Voir tout</a>
            </div>
            <table className="w-full text-xs font-poppins text-left border-collapse">
              <thead>
                <tr className="text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Destinataire</th>
                  <th className="pb-2 font-medium">Département</th>
                  <th className="pb-2 font-medium">Date d'envoi</th>
                  <th className="pb-2 font-medium">Statut</th>
                  <th className="pb-2 font-medium">Consultation</th>
                </tr>
              </thead>
              <tbody className="text-gray-800 font-medium">
                <tr className="border-b border-gray-50">
                  <td className="py-2.5 flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden"><img src="https://ui-avatars.com/api/?name=Yacine+M" /></div> Yacine M.</td>
                  <td className="py-2.5">Bureau Juridique</td><td className="py-2.5">15/05/2024 10:50</td><td className="py-2.5"><span className="text-green-600 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1 w-max"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Lu</span></td><td className="py-2.5">15/05/2024 14:22</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-2.5 flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden"><img src="https://ui-avatars.com/api/?name=Imane+B" /></div> Imane B.</td>
                  <td className="py-2.5">Statistiques</td><td className="py-2.5">15/05/2024 10:50</td><td className="py-2.5"><span className="text-green-600 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1 w-max"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Lu</span></td><td className="py-2.5">15/05/2024 13:10</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-2.5 flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden"><img src="https://ui-avatars.com/api/?name=Sofiane+H" /></div> Sofiane H.</td>
                  <td className="py-2.5">Direction Générale</td><td className="py-2.5">15/05/2024 10:50</td><td className="py-2.5"><span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded flex items-center gap-1 w-max"><span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span> Non lu</span></td><td className="py-2.5 text-gray-400">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (Side Panels) */}
        <div className="w-full xl:w-[320px] flex flex-col gap-5">
          
          {/* Résumé du document */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col overflow-hidden shadow-sm">
            <div className="p-5 pb-0">
               <h3 className="flex items-center gap-2 font-poppins font-semibold text-sm"><Fingerprint className="text-orange-500" size={16}/> Résumé du document</h3>
            </div>
            
            {/* Hero Asset Mockup inside the card */}
            <div className="h-40 mx-5 mt-4 bg-orange-50/50 rounded-xl relative flex justify-center items-center">
              <div className="absolute w-24 h-32 bg-orange-200 rounded-lg transform -rotate-6"></div>
              <div className="absolute w-24 h-32 bg-white border border-gray-200 shadow-md rounded-lg flex flex-col gap-2 p-3 transform rotate-3">
                 <div className="bg-orange-500 text-white text-[9px] font-bold py-0.5 px-2 rounded w-fit self-end">PDF</div>
                 <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2"></div>
                 <div className="w-3/4 h-1.5 bg-gray-200 rounded-full"></div>
                 <div className="w-full h-1.5 bg-gray-200 rounded-full"></div>
              </div>
            </div>

            <div className="p-5 flex flex-col gap-3 text-[11px] font-poppins">
               <MetaRow label="Nom" value="Rapport_Production_2024.pdf" bold />
               <MetaRow label="Catégorie" value="Rapports" />
               <MetaRow label="Type" value="Rapport annuel" />
               <MetaRow label="Auteur" value={<div className="flex gap-2 items-center"><img src="https://ui-avatars.com/api/?name=Sofiane+Hamidi&size=16" className="rounded-full w-4 h-4" /> Sofiane Hamidi</div>} />
               <MetaRow label="Responsable" value={<div className="flex gap-2 items-center"><img src="https://ui-avatars.com/api/?name=Yacine+M&size=16" className="rounded-full w-4 h-4" /> Yacine M.</div>} />
               <MetaRow label="Version" value="1.0 (Finale)" />
               <MetaRow label="Date du document" value="15/05/2024" />
               <MetaRow label="Date de création" value="15/05/2024 à 10:45" />
               <MetaRow label="Taille" value="2.4 Mo" />
               <MetaRow label="Statut" value={<span className="text-green-600 flex gap-1.5 items-center font-semibold"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Actif</span>} />
               <MetaRow label="Confidentialité" value={<span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full font-medium">Interne</span>} />
            </div>
          </div>

          {/* Emplacement physique */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
             <h3 className="flex items-center gap-2 font-poppins font-semibold text-sm">
               <MapPin size={16} className="text-orange-500" /> Emplacement physique <span className="font-normal text-gray-500">(Original papier)</span>
             </h3>
             <div className="flex flex-col relative pl-4 border-l-2 border-orange-200 gap-4 text-xs font-medium font-poppins">
                <div className="relative"><div className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-white"></div> Administration centrale</div>
                <div className="relative"><div className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-white"></div> Bâtiment A</div>
                <div className="relative"><div className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-white"></div> Bureau Juridique</div>
                <div className="relative"><div className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-white"></div> Rayon 2</div>
                <div className="relative"><div className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-white"></div> Étagère 1</div>
                <div className="relative text-orange-600 font-bold"><div className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-orange-600 border-2 border-white"></div> Boîte B-025</div>
                <div className="relative text-orange-600 font-bold"><div className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-orange-600 border-2 border-white"></div> Document N°18</div>
             </div>
             <button className="w-full flex justify-center items-center gap-2 py-2 border border-orange-500 text-orange-500 rounded-lg text-xs font-semibold hover:bg-orange-50"><FolderTree size={14}/> Voir dans l'arbre</button>
          </div>

          {/* Workflow */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
             <h3 className="flex items-center gap-2 font-poppins font-semibold text-sm">
               <GitBranch size={16} className="text-orange-500" /> Workflow
             </h3>
             <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Étape actuelle</span>
                <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full font-semibold border border-yellow-200">Validation finale</span>
             </div>
             <div className="flex justify-between items-center text-xs pt-2">
                <span className="text-gray-500">Responsable actuel</span>
                <div className="flex items-center gap-2">
                  <img src="https://ui-avatars.com/api/?name=Yacine+M" className="w-8 h-8 rounded-full" />
                  <div className="flex flex-col"><strong className="text-gray-800 font-medium">Yacine M.</strong><span className="text-[10px] text-gray-500">Chef de bureau</span></div>
                </div>
             </div>
             
             <div className="flex flex-col gap-1 mt-2">
                <div className="flex justify-between text-xs font-medium"><span className="text-gray-500">Progression</span><span className="text-orange-600 font-bold">80%</span></div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                   <div className="w-[80%] h-full bg-orange-500 rounded-full"></div>
                </div>
             </div>
             
             <div className="flex flex-col gap-2 mt-2">
                <span className="text-xs text-gray-500 font-medium">Actions</span>
                <div className="flex gap-2">
                   <button className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 shadow-sm"><CheckCircle size={14}/> Valider</button>
                   <button className="flex-1 flex justify-center items-center gap-1.5 py-2 border border-red-500 text-red-500 text-xs font-bold rounded-lg hover:bg-red-50"><XCircle size={14}/> Rejeter</button>
                </div>
             </div>
             
             <div className="border-t border-gray-100 mt-2 pt-3 flex flex-col gap-2">
                <div className="flex justify-between items-center"><span className="text-xs font-semibold font-poppins">Commentaire (1)</span> <a href="#" className="text-[10px] text-orange-500 font-semibold hover:underline">Voir tout</a></div>
                <div className="flex gap-2">
                   <img src="https://ui-avatars.com/api/?name=Imane+B" className="w-6 h-6 rounded-full" />
                   <div className="flex flex-col bg-gray-50 p-2 rounded-lg text-[11px]"><strong className="font-semibold text-gray-800">Imane B. <span className="text-gray-400 font-normal ml-1">14/05/2024 16:20</span></strong><p className="text-gray-600 mt-1">Merci de vérifier la section 3.2</p></div>
                </div>
             </div>
          </div>
          
        </div>
      </div>
      
      {/* Footer Fingerprint Row (Fixed at bottom practically, but here part of layout flow matching design) */}
      <div className="flex flex-wrap gap-8 justify-between items-center pt-8 border-t border-gray-200 mt-8 mb-4">
        
        <FooterInfoRow img="S" name="Créé par" user="Sofiane Hamidi" date="15/05/2024 à 10:45" />
        <FooterInfoRow img="S" name="Dernière modification" user="Sofiane Hamidi" date="15/05/2024 à 10:45" />
        <FooterInfoRow img="Y" name="Dernière consultation" user="Yacine M." date="15/05/2024 à 14:22" />
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center"><Fingerprint size={20}/></div>
          <div className="flex flex-col text-xs font-poppins">
             <span className="text-gray-500">Identifiant interne</span>
             <strong className="text-gray-900 font-semibold">DOC-2024-000241</strong>
          </div>
        </div>
      </div>
      
    </div>
  );
}

/* ─── SUB-COMPONENTS ──────────────────────────────────── */

function ActionButton({ label, icon: Icon, isDanger = false }: { label: string, icon: any, isDanger?: boolean }) {
  return (
    <button className={`flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl border transition-colors 
      ${isDanger ? 'border-red-100 bg-red-50 text-red-500 hover:bg-red-100' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 shadow-sm'}`}>
      <Icon size={18} strokeWidth={1.5} />
      <span className="text-[9px] font-semibold font-poppins">{label}</span>
    </button>
  );
}

function TabItem({ label, active, badge, onClick }: { label: string, active: boolean, badge?: string, onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`py-4 flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${active ? 'border-orange-500 text-orange-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
      {label}
      {badge && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-orange-100' : 'bg-gray-100 text-gray-600'}`}>{badge}</span>}
    </div>
  );
}

function MetaRow({ label, value, bold=false }: { label: string, value: React.ReactNode, bold?: boolean }) {
  return (
    <div className="flex gap-2 items-center">
       <span className="w-24 text-gray-500 shrink-0 font-medium">{label}</span>
       <div className={`text-gray-900 ${bold ? 'font-bold' : ''}`}>{value}</div>
    </div>
  );
}

function RelationRow({ icon: Icon, label, badge }: { icon: any, label: string, badge: string }) {
  return (
    <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-100">
      <div className="flex items-center gap-2 text-gray-700"><Icon size={14} className="text-gray-500" /> {label}</div>
      <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-md font-bold">{badge}</span>
    </div>
  );
}

function FooterInfoRow({ img, name, user, date }: { img: string, name: string, user: string, date: string }) {
  return (
    <div className="flex items-center gap-3">
       <img src={`https://ui-avatars.com/api/?name=${user.replace(' ', '+')}&background=random`} className="w-10 h-10 rounded-full" />
       <div className="flex flex-col text-[11px] font-poppins">
          <span className="text-gray-500">{name}</span>
          <strong className="text-gray-900 font-semibold">{user}</strong>
          <span className="text-gray-500 text-[10px]">{date}</span>
       </div>
    </div>
  );
}