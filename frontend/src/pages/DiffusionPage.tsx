import { Send, Search, Users, FileText } from 'lucide-react';

export function DiffusionPage() {
  return (
    <div className="flex flex-col gap-6 font-poppins pb-10 text-gray-800">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <Send size={26} className="text-rose-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-oswald text-gray-900">Diffusion de documents</h2>
          <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400 mt-0.5">
            <span>Accueil</span> <span>›</span> <span className="text-orange-500 font-semibold">Diffusion</span>
          </div>
          <p className="text-[13px] text-gray-500 mt-1">Partagez rapidement des documents avec des listes de diffusion prédéfinies.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Document Selection */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col gap-5">
           <h3 className="font-bold text-[15px] flex items-center gap-2"><FileText className="text-rose-500"/> 1. Sélectionner le document</h3>
           <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus-within:bg-white transition-colors">
              <Search size={16} className="text-gray-400"/>
              <input className="flex-1 outline-none text-xs bg-transparent" placeholder="Rechercher un document à diffuser..." />
           </div>
           {/* Mock selected state */}
           <div className="p-4 border-2 border-rose-100 bg-rose-50/30 rounded-xl flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 text-red-500 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">PDF</div>
              <div className="flex-1">
                 <h4 className="font-bold text-gray-800 text-sm">Note_Interne_0324.pdf</h4>
                 <p className="text-xs text-gray-500 mt-0.5">Notes internes • 512 Ko</p>
              </div>
           </div>
        </div>

        {/* Recipients Selection */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col gap-5">
           <h3 className="font-bold text-[15px] flex items-center gap-2"><Users className="text-rose-500"/> 2. Destinataires</h3>
           
           <div className="flex flex-col gap-2">
             <label className="text-[11px] font-bold text-gray-500">Groupes de diffusion</label>
             <div className="flex flex-wrap gap-2">
               <button className="px-3 py-1.5 border-2 border-rose-500 bg-rose-50 text-rose-700 font-bold text-xs rounded-lg shadow-sm">Tous les employés (150)</button>
               <button className="px-3 py-1.5 border border-gray-200 text-gray-600 font-semibold text-xs rounded-lg hover:bg-gray-50">Direction (12)</button>
               <button className="px-3 py-1.5 border border-gray-200 text-gray-600 font-semibold text-xs rounded-lg hover:bg-gray-50">Chefs de service (45)</button>
             </div>
           </div>

           <div className="flex flex-col gap-2 mt-2">
             <label className="text-[11px] font-bold text-gray-500">Message personnalisé (Optionnel)</label>
             <textarea rows={3} className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-rose-400 bg-gray-50" placeholder="Ajoutez une note pour les destinataires..."></textarea>
           </div>

           <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-500 shadow-sm transition-colors text-[13px]">
             <Send size={15}/> Lancer la diffusion
           </button>
        </div>
      </div>
    </div>
  );
}
