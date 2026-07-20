import { useState, useEffect, useMemo } from 'react';
import {
  Folder, FileText, Users, HardDrive, Archive, Upload, Share, Download, Trash2, Edit2, CheckCircle, Clock, Check, MoreVertical, Search, ChevronRight, ChevronDown, Plus, Filter, LayoutGrid, Eye, PlayCircle, MapPin, Star, Loader2
} from 'lucide-react';
import { useDossiers } from '../hooks/useDossiers';
import { useDashboard } from '../hooks/useDashboard';
import { formatDate } from '../utils/formatters';
import { documentsService } from '../services/documents';
import { dossiersService } from '../services/dossiers';

export function GestionDossiersPage() {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [selectedFolder, setSelectedFolder] = useState<any>(null);
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [contents, setContents] = useState<{ dossiers: any[]; documents: any[] }>({ dossiers: [], documents: [] });
  const [contentsLoading, setContentsLoading] = useState(false);

  // Creation modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDossierType, setNewDossierType] = useState('standard');
  const [newStatus, setNewStatus] = useState('actif');
  const [newParent, setNewParent] = useState<string>('');

  const { dossiers, loading: dossiersLoading, refetch } = useDossiers();
  const { kpis, loading: kpisLoading } = useDashboard();

  const handleCreateDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await dossiersService.createDossier({
        name: newName,
        description: newDesc,
        dossier_type: newDossierType,
        status: newStatus,
        parent: newParent ? parseInt(newParent, 10) : null
      });
      setIsModalOpen(false);
      setNewName('');
      setNewDesc('');
      setNewDossierType('standard');
      setNewStatus('actif');
      setNewParent('');
      refetch();
    } catch (err) {
      console.error("Error creating dossier:", err);
    }
  };

  useEffect(() => {
    if (dossiers && dossiers.length > 0 && !selectedFolder) {
      setSelectedFolder(dossiers[0]);
    }
  }, [dossiers, selectedFolder]);

  useEffect(() => {
    fetchRecentDocs();
  }, []);

  useEffect(() => {
    if (selectedFolder) {
      fetchFolderContent(selectedFolder.id);
    }
  }, [selectedFolder]);

  const fetchFolderContent = async (id: number) => {
    setContentsLoading(true);
    try {
      const res = await dossiersService.getDossierContent(id);
      setContents({
        dossiers: res.dossiers || [],
        documents: res.documents || []
      });
    } catch (e) {
      console.error("Error fetching dossier content", e);
    } finally {
      setContentsLoading(false);
    }
  };

  const fetchRecentDocs = async () => {
    setDocsLoading(true);
    try {
      const res = await documentsService.getDocuments({ ordering: '-created_at', limit: 5 });
      setRecentDocs(res.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setDocsLoading(false);
    }
  };

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Build tree
  const buildTree = (parentId: number | null = null): any[] => {
    // If the API returns them nested, great. Standard DRF returns flat inside `results` or just `dossiers`.
    return (dossiers || [])
      .filter((d: any) => d.parent === parentId || (parentId === null && !d.parent))
      .map((d: any) => ({
        ...d,
        children: buildTree(d.id)
      }));
  };

  const tree = useMemo(() => buildTree(null), [dossiers]);

  const renderTree = (nodes: any[], isChild = false) => {
    return nodes.map(node => (
      <FolderNode 
        key={node.id}
        label={node.name} 
        id={node.id.toString()} 
        count={node.documents_count || 0} 
        isOpen={!!expandedFolders[node.id]} 
        onToggle={() => toggleFolder(node.id)} 
        onClick={() => setSelectedFolder(node)}
        isChild={isChild} 
        active={selectedFolder?.id === node.id}
      >
        {node.children && node.children.length > 0 && renderTree(node.children, true)}
      </FolderNode>
    ));
  };

  return (
    <div className="flex flex-col gap-5 pb-20 font-poppins h-full">
      {/* Top Header */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold font-oswald text-gray-900 dark:text-[#FFFFFF] m-0 leading-none">Gestion des dossiers</h2>
          <p className="text-[13px] text-gray-500 m-0">Organisez, structurez et gérez tous vos dossiers et sous-dossiers.</p>
          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400 mt-1">
             <span>Accueil</span> <span>›</span> <span className="text-gray-900 dark:text-[#FFFFFF] font-semibold dark:text-[#FFFFFF]">Dossiers</span>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           <input type="text" placeholder="Rechercher un dossier, un document..." className="pl-9 pr-12 py-2 w-[380px] bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-xl text-[13px] outline-none shadow-sm focus:border-orange-500" />
           <div className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center text-[10px] text-gray-500 font-medium font-inter border border-gray-200 dark:border-[var(--dash-border)]">⌘K</div>
        </div>
      </div>

      {/* 6 Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
         <KpiCard icon={Folder} color="text-orange-500" bg="bg-orange-100" label="Dossiers" value={kpisLoading ? '...' : kpis?.dossiers_actifs || dossiers?.length || 0} trend="+1 ce mois" />
         <KpiCard icon={Folder} color="text-purple-500" bg="bg-purple-100" label="Dossiers Archivés" value={kpisLoading ? '...' : kpis?.documents_archives || 0} trend="0 ce mois" />
         <KpiCard icon={FileText} color="text-green-500" bg="bg-green-100" label="Documents" value={kpisLoading ? '...' : kpis?.total_documents || 0} trend="+5 ce mois" />
         <KpiCard icon={Archive} color="text-yellow-600" bg="bg-yellow-100" label="Corbeille" value={kpisLoading ? '...' : kpis?.dossiers_supprimes || 0} trend="0 ce mois" />
         <KpiCard icon={Users} color="text-blue-500" bg="bg-blue-100" label="Utilisateurs actifs" value={kpisLoading ? '...' : kpis?.utilisateurs_actifs || 0} trend="-" />
         <KpiCard icon={HardDrive} color="text-orange-600" bg="bg-orange-100" label="Taille totale" value="2.1 Go" trend="+0.1 Go ce mois" />
      </div>

      {/* Main 3 Column Layout */}
      <div className="flex flex-col xl:flex-row gap-5 items-start">
        
        {/* LEFT COL: Arborescence */}
        <div className="w-full xl:w-[280px] shrink-0 bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
           <h3 className="font-semibold text-sm text-gray-800 dark:text-[var(--dash-text)] font-poppins">Arborescence</h3>
           
           <div className="relative">
             <input type="text" placeholder="Filtrer..." className="w-full pl-3 pr-8 py-2 bg-gray-50 dark:bg-[var(--dash-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-xs outline-none focus:border-orange-500" />
             <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
           </div>
           
           <div className="flex flex-col gap-1 text-[13px] font-medium mt-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {dossiersLoading ? <Loader2 size={24} className="animate-spin text-orange-500 mx-auto" /> : renderTree(tree)}
              {!dossiersLoading && dossiers?.length === 0 && <span className="text-gray-400 text-xs text-center py-4">Aucun dossier</span>}
           </div>

           <button onClick={() => setIsModalOpen(true)} className="flex w-full mt-4 justify-center items-center gap-2 py-2.5 border border-orange-500 text-orange-500 rounded-xl text-xs font-semibold hover:bg-orange-50 transition-colors">
              <Plus size={16}/> Nouveau dossier
           </button>
        </div>

        {/* MIDDLE COL: Main Area */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">
           
           {/* Folder Content Table Area */}
           <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-6 shadow-sm overflow-x-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="font-semibold text-[15px] flex items-center gap-2 text-gray-900 dark:text-[#FFFFFF]">
                      Contenu de : {selectedFolder?.name || 'Veuillez sélectionner un dossier'} 
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{selectedFolder ? 'Dossier actuellement sélectionné' : '...'}</p>
                 </div>
                 <div className="flex gap-2">
                    <button className="p-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-gray-600 dark:text-[var(--dash-text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]"><Folder size={16}/></button>
                    <button className="p-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-gray-600 dark:text-[var(--dash-text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]"><Upload size={16}/></button>
                    <button className="p-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-gray-600 dark:text-[var(--dash-text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]"><Share size={16}/></button>
                    <button className="p-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-gray-600 dark:text-[var(--dash-text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)] bg-gray-50 dark:bg-[var(--dash-bg)]"><MoreVertical size={16}/></button>
                 </div>
              </div>

              {/* Table */}
              <table className="w-full text-[13px] text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-100 dark:border-[var(--dash-border)] font-medium">
                    <th className="pb-3 px-2 font-medium">Nom</th>
                    <th className="pb-3 px-2 font-medium">Type</th>
                    <th className="pb-3 px-2 font-medium">Statut</th>
                    <th className="pb-3 px-2 font-medium">Création</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800 dark:text-[var(--dash-text)]">
                   {contentsLoading ? (
                     <tr><td colSpan={4} className="text-center py-4"><Loader2 className="animate-spin text-orange-500 mx-auto" size={24} /></td></tr>
                   ) : contents.dossiers.length === 0 && contents.documents.length === 0 ? (
                     <tr><td colSpan={4} className="text-center py-4 text-gray-500">Ce dossier est vide.</td></tr>
                   ) : (
                     <>
                       {contents.dossiers.map((sub: any) => (
                         <TableRow 
                           key={`folder-${sub.id}`} 
                           name={sub.name} 
                           isFolder 
                           type="Dossier" 
                           date={formatDate(sub.created_at)} 
                           status="Actif"
                           onClick={() => setSelectedFolder(sub)}
                         />
                       ))}
                       {contents.documents.map((doc: any) => (
                         <TableRow 
                           key={`doc-${doc.id}`} 
                           name={doc.title} 
                           isFolder={false} 
                           type={doc.file_type || "Document"} 
                           date={formatDate(doc.created_at)} 
                           status={doc.status} 
                           icon="DOC" 
                           color="bg-blue-100 text-blue-600"
                         />
                       ))}
                     </>
                   )}
                 </tbody>
               </table>
            </div>

            {/* Metrics Row Below Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
               
               {/* Documents Récents */}
               <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-5 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-[13px]">Documents récents (Global)</h3></div>
                  <div className="flex flex-col gap-4 flex-1">
                     {docsLoading ? <Loader2 size={16} className="animate-spin text-orange-500" /> : recentDocs.map(doc => (
                        <RecentDoc key={doc.id} name={doc.title} by={`Catégorie: ${doc.category_name || '-'}`} tag={`ID #${doc.id}`} icon="DOC" color="bg-blue-100 text-blue-600" />
                     ))}
                  </div>
               </div>

               {/* Permissions */}
               <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-[13px]">Permissions du dossier</h3></div>
                  {!selectedFolder ? <span className="text-xs text-gray-400">Aucun dossier sélectionné</span> : (
                    <div className="flex flex-col gap-4">
                       <div className="flex justify-end gap-2 pr-2 text-gray-400">
                       <div title="Lecture"><Eye size={12} /></div>
                       <div title="Écriture"><Edit2 size={12} /></div>
                       <div title="Partage"><Share size={12} /></div>
                       <div title="Suppression"><Trash2 size={12} /></div>
                       </div>
                       <UserPerm name="Admin System" role="Propriétaire" perms={[1,1,1,1]} img="Admin" />
                       <button className="w-full mt-4 py-2 border border-orange-200 text-orange-500 rounded-lg text-xs font-semibold hover:bg-orange-50 transition-colors">+ Ajouter un utilisateur</button>
                    </div>
                  )}
               </div>
            </div>

         </div>

         {/* RIGHT COL: Informations du dossier */}
         <div className="w-full xl:w-[280px] shrink-0 flex flex-col gap-5">
            
            <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl flex flex-col shadow-sm overflow-hidden p-5 pb-6">
               <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-sm">Informations</h3>
                  <span className="px-2 py-0.5 rounded bg-green-50 text-green-600 text-[9px] font-bold border border-green-100">Actif</span>
               </div>
               
               <div className="flex flex-col gap-3 text-[11px] font-medium font-poppins mt-4">
                  <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-[var(--dash-border)] text-gray-800 dark:text-[var(--dash-text)]"><span className="text-gray-500">Nom</span><span className="flex items-center gap-1 font-semibold flex-1 justify-end">{selectedFolder?.name || '-'} <Edit2 size={12} className="text-gray-400 cursor-pointer"/></span></div>
                  <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-[var(--dash-border)] text-gray-800 dark:text-[var(--dash-text)]"><span className="text-gray-500">ID</span><span>{selectedFolder?.id || '-'}</span></div>
                  <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-[var(--dash-border)] text-gray-800 dark:text-[var(--dash-text)]"><span className="text-gray-500">Créé le</span><span>{selectedFolder ? formatDate(selectedFolder.created_at) : '-'}</span></div>
                  <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-[var(--dash-border)] text-gray-800 dark:text-[var(--dash-text)]"><span className="text-gray-500">OCR par défaut</span><span className={selectedFolder?.ocr_enabled ? 'text-green-600 font-bold' : 'text-gray-400 font-bold'}>{selectedFolder?.ocr_enabled ? 'Activé' : 'Désactivé'}</span></div>
               </div>
            </div>

         </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-100 dark:border-[var(--dash-border)] w-full max-w-md p-6 rounded-2xl shadow-xl flex flex-col gap-4 font-poppins">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Folder className="text-orange-500" size={20}/> Créer un nouveau dossier
            </h3>
            
            <form onSubmit={handleCreateDossier} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-gray-500">Nom du dossier</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  required
                  placeholder="Ex: Projet GIZ" 
                  className="border border-gray-200 dark:border-[var(--dash-border)] bg-gray-50 dark:bg-[var(--dash-bg)] rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 text-gray-800 dark:text-white font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-gray-500">Description</label>
                <textarea 
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)} 
                  placeholder="Description ou objectifs du dossier..." 
                  className="border border-gray-200 dark:border-[var(--dash-border)] bg-gray-50 dark:bg-[var(--dash-bg)] rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 h-20 resize-none text-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-gray-500">Type de dossier</label>
                  <select 
                    value={newDossierType} 
                    onChange={(e) => setNewDossierType(e.target.value)}
                    className="border border-gray-200 dark:border-[var(--dash-border)] bg-gray-50 dark:bg-[var(--dash-bg)] rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 text-gray-700 dark:text-white font-semibold"
                  >
                    <option value="standard">Standard</option>
                    <option value="projet">Projet</option>
                    <option value="archive">Archive</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-gray-500">Statut</label>
                  <select 
                    value={newStatus} 
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="border border-gray-200 dark:border-[var(--dash-border)] bg-gray-50 dark:bg-[var(--dash-bg)] rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 text-gray-700 dark:text-white font-semibold"
                  >
                    <option value="actif">Actif</option>
                    <option value="archive">Archivé</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-gray-500">Dossier parent</label>
                <select 
                  value={newParent} 
                  onChange={(e) => setNewParent(e.target.value)}
                  className="border border-gray-200 dark:border-[var(--dash-border)] bg-gray-50 dark:bg-[var(--dash-bg)] rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 text-gray-700 dark:text-white font-semibold"
                >
                  <option value="">Aucun (Dossier racine)</option>
                  {dossiers.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-[var(--dash-border)] text-gray-600 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-[var(--dash-border)]"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-semibold hover:bg-orange-600 shadow-sm shadow-orange-500/20"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

/* ─── SUB COMPONENTS ────────────────────────────────────────── */

function KpiCard({ icon: Icon, color, bg, label, value, trend }: any) {
  return (
    <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-4 shadow-sm flex items-start justify-between">
      <div className="flex flex-col h-full justify-between gap-1">
         <span className="text-[11px] font-semibold text-gray-500 font-poppins">{label}</span>
         <span className="text-2xl font-bold font-oswald text-gray-900 dark:text-[#FFFFFF]">{value}</span>
         <span className="text-[10px] font-bold text-green-600 font-poppins">{trend}</span>
      </div>
      <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center`}>
         <Icon size={20} />
      </div>
    </div>
  );
}

function FolderNode({ label, id, count, isOpen, onToggle, onClick, isChild, active, children }: any) {
  return (
    <div className="flex flex-col">
       <div className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer ${active ? 'bg-orange-50' : 'hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]'}`} onClick={() => { onToggle(); onClick(); }}>
         <button className="p-0.5 text-gray-400">
           {children ? <ChevronDown size={14} className={`transform transition-transform ${isOpen ? '' : '-rotate-90'}`} /> : <div className="w-3.5"/>}
         </button>
         <Folder size={16} className={active ? 'text-orange-500 fill-orange-200' : 'text-yellow-500 fill-yellow-200'} strokeWidth={1.5} />
         <span className={`flex-1 truncate ${active ? 'font-semibold text-orange-700' : 'text-gray-700 dark:text-[var(--dash-text-muted)]'}`}>{label}</span>
       </div>
       {isOpen && children && (
         <div className="ml-6 pl-2 border-l border-gray-200 dark:border-[var(--dash-border)] flex flex-col gap-0.5 mt-1">
           {children}
         </div>
       )}
    </div>
  );
}

function TableRow({ name, isFolder, type, date, status, icon, color, onClick }: any) {
  return (
    <tr onClick={onClick} className="border-b border-gray-50 hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]/80 cursor-pointer group">
      <td className="py-2.5 px-2 flex items-center gap-2">
         {isFolder ? (
           <Folder size={18} className="text-yellow-500 fill-yellow-200 shrink-0" />
         ) : (
           <div className={`w-6 h-6 rounded-md flex justify-center items-center text-[8px] font-bold shrink-0 ${color}`}>{icon}</div>
         )}
         <span className={`font-semibold ${isFolder ? 'text-gray-900 dark:text-[#FFFFFF]' : 'text-gray-700 dark:text-[var(--dash-text-muted)]'}`}>{name}</span>
      </td>
      <td className="py-2.5 px-2 text-gray-500 text-xs">{type}</td>
      <td className="py-2.5 px-2">
         <span className={`px-2 py-0.5 text-[10px] rounded flex items-center justify-center gap-1 w-max mx-auto border font-bold bg-green-50 text-green-600 py-0.5 border-green-200`}>
            {status}
         </span>
      </td>
      <td className="py-2.5 px-2">{date}</td>
    </tr>
  );
}

function RecentDoc({ name, by, tag, icon, color }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex justify-center items-center text-[9px] font-bold shrink-0 ${color}`}>{icon}</div>
      <div className="flex flex-col flex-1 truncate">
         <strong className="text-xs font-semibold text-gray-800 dark:text-[var(--dash-text)] truncate">{name}</strong>
         <span className="text-[10px] text-gray-500 truncate">{by}</span>
      </div>
      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 dark:text-[var(--dash-text-muted)] text-[9px] rounded font-bold shrink-0">{tag}</span>
    </div>
  );
}

function UserPerm({ name, role, perms, img }: any) {
  return (
    <div className="flex items-center justify-between">
       <div className="flex items-center gap-2 w-[120px]">
          <img src={`https://ui-avatars.com/api/?name=${img}`} className="w-6 h-6 rounded-full" />
          <div className="flex flex-col text-xs"><strong className="text-gray-800 dark:text-[var(--dash-text)]">{name}</strong><span className="text-[9px] text-gray-500 leading-tight">{role}</span></div>
       </div>
       <div className="flex justify-end gap-5 pr-2">
         {perms.map((p:any, i:any) => p ? <CheckCircle size={12} className="text-green-500" key={i}/> : <div className="w-3 h-0.5 bg-gray-300" key={i}/>)}
       </div>
    </div>
  );
}
