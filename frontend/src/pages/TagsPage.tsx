import { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, Search, FileText, Archive, Check } from 'lucide-react';
import { useOrganizationCrud } from '../hooks/useOrganization';
import { tagsService } from '../services/organization';

const COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4','#A16207','#EC4899'];

export function TagsPage() {
  const { items: tags, loading, create, update, remove } = useOrganizationCrud(tagsService);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [tagName, setTagName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [errorMessage, setErrorMessage] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleEdit = (tag: any) => {
    setEditingId(tag.id);
    setTagName(tag.name);
    setSelectedColor(tag.color || COLORS[0]);
    setDescription(tag.description || '');
    setStatus(tag.status || 'active');
    setErrorMessage('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setTagName('');
    setSelectedColor(COLORS[0]);
    setDescription('');
    setStatus('active');
    setErrorMessage('');
  };

  const handleSave = async () => {
    if (!tagName.trim()) {
      setErrorMessage('Le nom du tag est obligatoire.');
      return;
    }
    
    // Front-end check for duplicates (case insensitive)
    const isDuplicate = tags.some((t: any) => 
      t.name.toLowerCase() === tagName.trim().toLowerCase() && t.id !== editingId
    );
    if (isDuplicate) {
      setErrorMessage('Un tag avec ce nom existe déjà.');
      return;
    }

    const payload = {
      name: tagName.trim(),
      color: selectedColor,
      description: description.trim() || null,
      status: status
    };

    let result;
    if (editingId) {
      result = await update(editingId, payload);
    } else {
      result = await create(payload);
    }

    if (result.success) {
      handleCancel();
    } else {
      setErrorMessage(result.error || "Une erreur est survenue lors de l'enregistrement.");
    }
  };

  const toggleArchive = async (tag: any) => {
    const newStatus = tag.status === 'archived' ? 'active' : 'archived';
    await update(tag.id, {
      name: tag.name,
      color: tag.color,
      description: tag.description,
      status: newStatus
    });
  };

  return (
    <div className="flex flex-col gap-6 font-poppins pb-10 text-gray-800 dark:text-[var(--dash-text)]">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <Tag size={26} className="text-yellow-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-oswald text-gray-900 dark:text-[#FFFFFF]">Tags</h2>
          <div className="text-[11px] font-medium text-gray-400 mt-0.5 flex items-center gap-1">
            <span>Accueil</span> <span>›</span> <span className="text-orange-500 font-semibold">Tags</span>
          </div>
          <p className="text-[13px] text-gray-500 mt-1">Gerez les etiquettes colorees utilisees pour classer et retrouver vos documents.</p>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex gap-6 items-start">
        {/* Tags table */}
        <div className="flex-1 bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 pb-4 border-b border-gray-100 dark:border-[var(--dash-border)]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-yellow-100 rounded-lg flex items-center justify-center"><Tag size={14} className="text-yellow-600"/></div>
              <h3 className="font-semibold text-[15px] text-gray-800 dark:text-[var(--dash-text)]">Liste des tags</h3>
            </div>
            {!editingId && (
              <button onClick={handleCancel} className="flex items-center gap-1.5 px-4 py-2 bg-yellow-400 text-gray-900 font-bold transition-all text-xs rounded-xl shadow-sm hover:bg-yellow-500">
                <Plus size={14}/> Nouveau tag
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[var(--dash-border)] text-gray-500 font-medium text-[12px]">
                  <th className="py-3 px-6">Nom du tag</th>
                  <th className="py-3 px-6">Couleur</th>
                  <th className="py-3 px-6">Statut</th>
                  <th className="py-3 px-6">Description</th>
                  <th className="py-3 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="py-4 text-center text-gray-500">Chargement...</td></tr>
                ) : tags.length === 0 ? (
                  <tr><td colSpan={5} className="py-4 text-center text-gray-500">Aucun tag cree</td></tr>
                ) : tags.map(tag => (
                  <tr key={tag.id} className="border-b border-gray-50 hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]/80 cursor-pointer group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full shadow-sm border border-black/10" style={{backgroundColor: tag.color || '#3B82F6'}}></div>
                        <span className="font-semibold text-gray-800 dark:text-[var(--dash-text)]">{tag.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 rounded-md text-[11px] font-bold font-mono text-gray-700 dark:text-[var(--dash-text-muted)]" style={{backgroundColor: (tag.color || '#3B82F6') + '22'}}>
                        {tag.color || '#3B82F6'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tag.status === 'archived' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'}`}>
                        {tag.status === 'archived' ? 'Archive' : 'Actif'}
                      </span>
                    </td>
                    <td className="py-4 px-6 max-w-[200px] truncate text-gray-500 dark:text-gray-400 italic">
                      {tag.description || '—'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(tag)} className="text-gray-400 hover:text-orange-500" title="Modifier"><Edit2 size={14}/></button>
                        <button onClick={() => toggleArchive(tag)} className="text-gray-400 hover:text-blue-500" title={tag.status === 'archived' ? "Activer" : "Archiver"}>
                          <Archive size={14} className={tag.status === 'archived' ? "text-yellow-600" : ""} />
                        </button>
                        <button onClick={() => remove(tag.id)} className="text-gray-400 hover:text-red-500" title="Supprimer"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 border-t border-gray-100 dark:border-[var(--dash-border)] bg-gray-50 dark:bg-[var(--dash-bg)]/50 text-[11px] text-gray-500">
            Total : {tags.length} tag(s) disponible(s)
          </div>
        </div>

        {/* Right sidebar: Create/Edit + Demo */}
        <div className="w-[340px] shrink-0 flex flex-col gap-5">
          {/* Create/Modify form */}
          <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-yellow-100 rounded-lg flex items-center justify-center"><Tag size={14} className="text-yellow-600"/></div>
              <h3 className="font-semibold text-[15px] text-gray-800 dark:text-[var(--dash-text)]">
                {editingId ? "Modifier le tag" : "Creer un tag"}
              </h3>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500">Nom du tag <span className="text-red-500">*</span></label>
              <input
                value={tagName}
                onChange={e => setTagName(e.target.value)}
                placeholder="Ex. : Contrat, RH, Finance..."
                className="w-full border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-3 py-2.5 text-sm text-gray-700 dark:text-[var(--dash-text-muted)] outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all bg-transparent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Description facultative du tag..."
                className="w-full border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-3 py-2.5 text-sm text-gray-700 dark:text-[var(--dash-text-muted)] outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all bg-transparent h-20 resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500">Statut</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full border border-gray-200 dark:border-[var(--dash-border)] rounded-xl px-3 py-2.5 text-sm text-gray-700 dark:text-[var(--dash-text-muted)] outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 bg-transparent"
              >
                <option value="active" className="text-black">Actif</option>
                <option value="archived" className="text-black">Archive</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-gray-500">Couleur <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setSelectedColor(c)}
                    className={`w-8 h-8 rounded-full transition-all border-2 flex items-center justify-center ${selectedColor === c ? 'border-gray-600 scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{backgroundColor: c}}
                  >
                    {selectedColor === c && <Check size={12} className="text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {tagName && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-[var(--dash-bg)] rounded-xl border border-gray-100 dark:border-[var(--dash-border)]">
                <span className="text-[11px] text-gray-500 font-medium">Apercu :</span>
                <span className="px-2.5 py-1 rounded-lg text-[12px] font-semibold text-white shadow-sm" style={{backgroundColor: selectedColor}}>
                  {tagName}
                </span>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-500 text-[13px] shadow-sm">
                <FileText size={14}/> Enregistrer
              </button>
              <button onClick={handleCancel} className="flex-1 py-2.5 border border-gray-200 dark:border-[var(--dash-border)] text-gray-600 dark:text-[var(--dash-text-muted)] font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)] text-[13px]">Annuler</button>
            </div>
          </div>

          {/* Usage example (interactive based on tags) */}
          <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-yellow-100 rounded-lg flex items-center justify-center"><Tag size={14} className="text-yellow-600"/></div>
              <h3 className="font-semibold text-[15px] text-gray-800 dark:text-[var(--dash-text)]">Exemple d'utilisation</h3>
            </div>
            <p className="text-[12px] text-gray-500">Apercu en temps reel des tags actifs associes a une fiche document.</p>

            {/* Active tags (dynamic first 3 tags) */}
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 3).map((t: any) => (
                <span key={t.id} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white shadow-sm" style={{backgroundColor: t.color || '#3B82F6'}}>
                  {t.name} <button className="ml-0.5 hover:opacity-70">×</button>
                </span>
              ))}
              {tags.length === 0 && (
                <span className="text-xs text-gray-400 italic">Aucun tag cree pour l'apercu</span>
              )}
            </div>

            {/* Real document demo */}
            <div className="border border-gray-200 dark:border-[var(--dash-border)] rounded-xl p-3 flex flex-col gap-2 bg-gray-50 dark:bg-[var(--dash-bg)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0">PDF</div>
                <strong className="text-[12px] font-semibold text-gray-800 dark:text-[var(--dash-text)] truncate">Fiche_Demo_AgrOdiv.pdf</strong>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.slice(0, 3).map((t: any) => (
                  <span key={t.id} className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-white shadow-sm" style={{backgroundColor: t.color || '#3B82F6'}}>
                    {t.name}
                  </span>
                ))}
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-[var(--dash-border)] w-full rounded-full"></div>
              <div className="h-1.5 bg-gray-200 dark:bg-[var(--dash-border)] w-2/3 rounded-full"></div>
            </div>
          </div>
        </div>
    </div>
  );
}
