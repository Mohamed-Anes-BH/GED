import { FileText, Download, Printer, ZoomIn, ZoomOut, ArrowLeft, ArrowRight, Share2, Expand } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function VisionneusePdfPage() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 font-poppins flex flex-col text-white">
      {/* Top Bar */}
      <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500/20 text-red-400 rounded flex items-center justify-center font-bold text-[10px]">PDF</div>
            <div>
              <h2 className="text-sm font-semibold text-gray-100">Rapport_Annuel_2024.pdf</h2>
              <p className="text-[10px] text-gray-400">Ajouté le 15/05/2026 par Sofiane H. • 2.4 Mo</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 bg-gray-900 rounded-lg px-2 border border-gray-700">
           <button className="p-2 hover:text-orange-400 text-gray-400"><ZoomOut size={16}/></button>
           <span className="text-xs font-medium w-12 text-center text-gray-300">100%</span>
           <button className="p-2 hover:text-orange-400 text-gray-400"><ZoomIn size={16}/></button>
           <div className="w-px h-4 bg-gray-700 mx-2"></div>
           <button className="p-2 hover:text-orange-400 text-gray-400"><Expand size={16}/></button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"><Share2 size={14}/> Partager</button>
           <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"><Printer size={14}/> Imprimer</button>
           <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"><Download size={14}/> Télécharger</button>
        </div>
      </div>

      {/* Main Content Viewer */}
      <div className="flex-1 bg-gray-900 overflow-auto relative flex justify-center py-6">
        {/* PDF Page Placeholder */}
        <div className="w-[800px] bg-white rounded shadow-2xl flex flex-col p-16 text-gray-800">
           {/* Mockup PDF content */}
           <div className="flex justify-between items-end border-b-2 border-gray-800 pb-6 mb-10">
             <div>
               <h1 className="text-4xl font-bold font-oswald text-gray-900 uppercase">Rapport Annuel</h1>
               <h2 className="text-xl text-gray-500 mt-2">Exercice 2024</h2>
             </div>
             <img src="/logo.svg" alt="AgrOdiv" className="w-16" onError={(e) => (e.currentTarget.style.display = 'none')} />
           </div>

           <div className="space-y-6">
             <div className="h-4 bg-gray-200 rounded w-full"></div>
             <div className="h-4 bg-gray-200 rounded w-full"></div>
             <div className="h-4 bg-gray-200 rounded w-11/12"></div>
             <div className="h-4 bg-gray-200 rounded w-full"></div>
             <div className="h-4 bg-gray-200 rounded w-4/5"></div>
           </div>
           
           <div className="mt-10 grid grid-cols-2 gap-6">
             <div className="h-32 bg-gray-100 rounded-xl border border-gray-200"></div>
             <div className="h-32 bg-gray-100 rounded-xl border border-gray-200"></div>
           </div>

           <div className="mt-10 space-y-6">
             <div className="h-4 bg-gray-200 rounded w-full"></div>
             <div className="h-4 bg-gray-200 rounded w-full"></div>
             <div className="h-4 bg-gray-200 rounded w-10/12"></div>
           </div>
        </div>

        {/* Floating Page Nav */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-800 border border-gray-700 px-4 py-2 rounded-full shadow-lg">
           <button className="text-gray-400 hover:text-white"><ArrowLeft size={16}/></button>
           <span className="text-xs font-semibold">1 / 45</span>
           <button className="text-gray-400 hover:text-white"><ArrowRight size={16}/></button>
        </div>
      </div>
    </div>
  );
}
