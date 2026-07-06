import { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, Search, FileText } from 'lucide-react';

const TAGS_DATA = [
  { name: 'Contrat', color: '#3B82F6', hex: '#3B82F6', docs: 124 },
  { name: 'RH', color: '#10B981', hex: '#10B981', docs: 52 },
  { name: 'Finance', color: '#F59E0B', hex: '#F59E0B', docs: 89 },
  { name: 'Urgent', color: '#EF4444', hex: '#EF4444', docs: 31 },
  { name: 'Archive', color: '#8B5CF6', hex: '#8B5CF6', docs: 215 },
  { name: 'Projet', color: '#06B6D4', hex: '#06B6D4', docs: 67 },
  { name: 'Juridique', color: '#A16207', hex: '#A16207', docs: 28 },
  { name: 'Marketing', color: '#EC4899', hex: '#EC4899', docs: 19 },
];

const COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4','#A16207','#EC4899'];

export function TagsPage() {
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [tagName, setTagName] = useState('');

  return (
    <div className="flex flex-col gap-6 font-poppins pb-10 text-gray-800">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <Tag size={26} className="text-yellow-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-oswald text-gray-900 dark:text-gray-100">Tags</h2>
          <div className="text-[11px] font-medium text-gray-400 mt-0.5 flex items-center gap-1">
            <span>Accueil</span> <span>›</span> <span className="text-orange-500 font-semibold">Tags</span>
          </div>
          <p className="text-[13px] text-gray-500 mt-1">Gérez les étiquettes colorées utilisées pour classer et retrouver vos documents.</p>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex gap-6 items-start">
        {/* Tags table */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-yellow-100 rounded-lg flex items-center justify-center"><Tag size={14} className="text-yellow-600"/></div>
              <h3 className="font-semibold text-[15px] text-gray-800">Liste des tags</h3>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-yellow-400 text-gray-900 font-bold text-xs rounded-xl shadow-sm hover:bg-yellow-500">
              <Plus size={14}/> Nouveau tag
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 font-medium text-[12px]">
                  <th className="py-3 px-6">Nom du tag</th>
                  <th className="py-3 px-6">Couleur</th>
                  <th className="py-3 px-6">Documents associés</th>
                  <th className="py-3 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {TAGS_DATA.map(tag => (
                  <tr key={tag.name} className="border-b border-gray-50 hover:bg-gray-50/80 cursor-pointer group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full shadow-sm" style={{backgroundColor: tag.color}}></div>
                        <span className="font-semibold text-gray-800">{tag.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 rounded-md text-[11px] font-bold font-mono text-gray-700" style={{backgroundColor: tag.color + '22'}}>
                        #{tag.hex.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-700">{tag.docs}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-gray-400 hover:text-orange-500"><Edit2 size={14}/></button>
                        <button className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 text-[11px] text-gray-500">
            Affichage de 1 à 8 sur 8 éléments
          </div>
        </div>

        {/* Right sidebar: Create/Edit + Demo */}
        <div className="w-[340px] shrink-0 flex flex-col gap-5">
          {/* Create/Modify form */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-yellow-100 rounded-lg flex items-center justify-center"><Tag size={14} className="text-yellow-600"/></div>
              <h3 className="font-semibold text-[15px] text-gray-800">Créer / Modifier un tag</h3>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500">Nom du tag <span className="text-red-500">*</span></label>
              <input
                value={tagName}
                onChange={e => setTagName(e.target.value)}
                placeholder="Ex. : Contrat, RH, Finance..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-gray-500">Couleur <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setSelectedColor(c)}
                    className={`w-8 h-8 rounded-full transition-all border-2 ${selectedColor === c ? 'border-gray-600 scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{backgroundColor: c}}
                  />
                ))}
                <button className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400">
                  <Plus size={14}/>
                </button>
              </div>
            </div>

            {/* Preview */}
            {tagName && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[11px] text-gray-500 font-medium">Aperçu :</span>
                <span className="px-2.5 py-1 rounded-lg text-[12px] font-semibold text-white shadow-sm" style={{backgroundColor: selectedColor}}>
                  {tagName}
                </span>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-500 text-[13px] shadow-sm">
                <FileText size={14}/> Enregistrer
              </button>
              <button className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 text-[13px]">Annuler</button>
            </div>
          </div>

          {/* Usage example */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-yellow-100 rounded-lg flex items-center justify-center"><Tag size={14} className="text-yellow-600"/></div>
              <h3 className="font-semibold text-[15px] text-gray-800">Exemple d'utilisation dans un document</h3>
            </div>
            <p className="text-[12px] text-gray-500">Ajoutez rapidement des tags à vos documents pour les retrouver facilement.</p>

            {/* Fake tag input */}
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-400">
              <Plus size={13}/> <span className="text-[12px]">Ajouter un tag...</span>
              <div className="ml-auto"><Search size={13}/></div>
            </div>

            {/* Active tags */}
            <div className="flex flex-wrap gap-2">
              {[['Contrat','#3B82F6'],['Urgent','#EF4444'],['Finance','#F59E0B']].map(([t,c])=>(
                <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white" style={{backgroundColor:c}}>
                  {t} <button className="ml-0.5 hover:opacity-70">×</button>
                </span>
              ))}
            </div>
            <p className="text-[11px] text-gray-400">Les tags sont affichés sous forme de chips colorées.</p>

            {/* Real document demo */}
            <div className="border border-gray-200 rounded-xl p-3 flex flex-col gap-2 bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0">PDF</div>
                <strong className="text-[12px] font-semibold text-gray-800">Contrat_Service_2024.pdf</strong>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[['Contrat','#3B82F6'],['Urgent','#EF4444'],['Finance','#F59E0B']].map(([t,c])=>(
                  <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-white" style={{backgroundColor:c}}>
                    {t} <span className="opacity-70">×</span>
                  </span>
                ))}
                <span className="text-[10px] text-gray-400 self-center">...</span>
              </div>
              <div className="h-1.5 bg-gray-200 w-full rounded-full"></div>
              <div className="h-1.5 bg-gray-200 w-2/3 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
