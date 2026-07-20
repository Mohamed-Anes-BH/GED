import { useState, useEffect } from 'react';
import {
  FileText, Edit2, Download, Printer, Share2, Copy, Move, Star, Trash2,
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, RotateCcw, 
  Search, Maximize, GitBranch, Share, Archive, ScanText, CheckCircle,
  XCircle, FilePlus, Eye, Fingerprint, LayoutGrid, List, Mail, MapPin, FolderTree, Loader2
} from 'lucide-react';
import { documentsService } from '../services/documents';
import { Document } from '../types';
import api from '../utils/api';
import '../styles/document-detail.css';

export function DocumentDetailPage({ documentId, onBack }: { documentId?: number, onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState('Aperçu');
  const [doc, setDoc] = useState<Document | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [relations, setRelations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!documentId) return;
    fetchData();
  }, [documentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const docData = await documentsService.getDocument(documentId!);
      setDoc(docData);
      
      const vData = await documentsService.getVersions(documentId!);
      setVersions(vData);

      const rData = await documentsService.getRelations(documentId!);
      setRelations(rData);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!documentId) return;
    window.location.href = `/api/documents/${documentId}/download/`;
  };

  const toggleFavorite = async () => {
    if (!doc) return;
    try {
      const response = await api.post(`/documents/${doc.id}/toggle_favorite/`);
      setDoc(prev => prev ? { ...prev, is_favorite: response.data.is_favorite } : null);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  if (loading) {
     return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-orange-500" size={32} /></div>;
  }

  if (!doc) {
     return <div className="text-center p-10 text-gray-500">Document introuvable (ID: {documentId})</div>;
  }

  return (
    <div className="flex flex-col gap-5 pb-20 relative">
      {/* Top Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400 font-poppins">
           <span className="cursor-pointer hover:text-gray-600 dark:text-[var(--dash-text-muted)]" onClick={onBack}>Documents</span> <span>›</span> <span className="text-gray-900 dark:text-[#FFFFFF] font-semibold dark:text-[#FFFFFF]">{doc.title}</span>
        </div>
      </div>

      {/* Title & Actions Bar */}
      <div className="flex justify-between items-start bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-6 shadow-sm">
        <div className="flex gap-4">
          <div className="w-14 h-14 bg-red-100 text-red-500 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
            {doc.files && doc.files.length > 0 ? doc.files[0].mime_type.includes('pdf') ? 'PDF' : 'DOC' : 'DOC'}
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold font-oswald text-gray-900 dark:text-[#FFFFFF] flex items-center gap-2">
              {doc.title} 
              <Star 
                size={18} 
                onClick={toggleFavorite}
                className={`cursor-pointer ${doc.is_favorite ? "text-yellow-500 fill-current" : "text-gray-400"}`} 
              />
            </h2>
            <div className="flex items-center gap-4 text-xs font-poppins">
              <span className="text-gray-500">ID : {doc.id}</span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 border border-green-200 rounded-full font-semibold capitalize">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> {doc.status}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-600 border border-purple-200 rounded-full font-semibold capitalize">
                <Eye size={12}/> {doc.priority}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 hidden md:flex">
          <ActionButton label="Modifier" icon={Edit2} />
          <ActionButton label="Télécharger" icon={Download} onClick={handleDownload} />
          <ActionButton label="Partager" icon={Share2} />
          <ActionButton label="Favori" icon={Star} isStarred={doc.is_favorite} onClick={toggleFavorite} />
          <ActionButton label="Supprimer" icon={Trash2} isDanger />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex items-start gap-5 flex-col xl:flex-row">
        
        {/* Left Column (Viewer & Metadata) */}
        <div className="flex-1 flex flex-col gap-5 w-full">
          
          {/* PDF Viewer Block */}
          <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl flex h-[600px] overflow-hidden shadow-sm">
            <div className="flex-1 flex flex-col bg-[#f0f2f5] dark:bg-[var(--dash-bg)] border-x border-gray-200 dark:border-[var(--dash-border)] relative">
              <div className="h-12 bg-white dark:bg-[var(--dash-card-bg)] border-b border-gray-200 dark:border-[var(--dash-border)] flex items-center justify-between px-4 sticky top-0 z-10">
                <div className="flex items-center gap-4 text-xs font-medium text-gray-600 dark:text-[var(--dash-text-muted)]">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={16}/></button>
                    <span>Page Principale</span>
                    <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={16}/></button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" onClick={handleDownload}><Download size={16}/></button>
                  <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><Maximize size={16}/></button>
                </div>
              </div>

              {/* Document Page Canvas */}
              <div className="flex-1 p-0 flex justify-center w-full">
                 <iframe 
                   src={`/api/documents/${documentId}/preview/`} 
                   className="w-full h-full border-none bg-white dark:bg-[var(--dash-card-bg)]" 
                   title="Document Preview"
                 ></iframe>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex gap-6 border-b border-gray-200 dark:border-[var(--dash-border)] px-2 font-poppins text-sm overflow-x-auto">
            <TabItem label="Aperçu" active={activeTab === 'Aperçu'} onClick={() => setActiveTab('Aperçu')} />
            <TabItem label="Versions" badge={versions.length > 0 ? versions.length.toString() : undefined} active={activeTab === 'Versions'} onClick={() => setActiveTab('Versions')} />
            <TabItem label="Relations" badge={relations.length > 0 ? relations.length.toString() : undefined} active={activeTab === 'Relations'} onClick={() => setActiveTab('Relations')} />
            <TabItem label="Workflow" active={activeTab === 'Workflow'} onClick={() => setActiveTab('Workflow')} />
          </div>

          {/* Tab Content Grid */}
          <div className="flex flex-col gap-5">
             {activeTab === 'Aperçu' && (
               <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-5 shadow-sm">
                 <h3 className="flex items-center gap-2 font-poppins font-semibold text-sm mb-4"><FileText className="text-orange-500" size={16}/> Description</h3>
                 <p className="text-sm text-gray-600 dark:text-[var(--dash-text-muted)]">{doc.description || 'Aucune description disponible.'}</p>
               </div>
             )}

             {activeTab === 'Versions' && (
               <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                 <h3 className="flex items-center gap-2 font-poppins font-semibold text-sm mb-2"><GitBranch className="text-orange-500" size={16}/> Versions du document</h3>
                 {versions.length === 0 ? <span className="text-sm text-gray-500">Aucune version trouvée.</span> : (
                   versions.map((v: any, index) => (
                     <div key={v.id} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-[var(--dash-border)] last:border-0">
                       <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-800 dark:text-[var(--dash-text)]">Version {v.version_number}</span>
                          <span className="text-xs text-gray-500">Uploadée le {new Date(v.created_at).toLocaleString()}</span>
                          {v.changelog && <span className="text-xs text-gray-600 dark:text-[var(--dash-text-muted)] italic mt-1">{v.changelog}</span>}
                       </div>
                       {index === 0 && <span className="px-2 py-1 text-[10px] bg-green-100 text-green-700 font-bold rounded-full">Actuelle</span>}
                     </div>
                   ))
                 )}
               </div>
             )}

             {activeTab === 'Relations' && (
               <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                 <h3 className="flex items-center gap-2 font-poppins font-semibold text-sm mb-2"><Share2 className="text-orange-500" size={16}/> Relations</h3>
                 {relations.length === 0 ? <span className="text-sm text-gray-500">Aucune relation trouvée.</span> : (
                   relations.map((r: any) => (
                     <div key={r.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-[var(--dash-bg)] rounded-lg text-xs font-medium">
                       <div className="flex items-center gap-2 text-gray-700 dark:text-[var(--dash-text-muted)]"><FileText size={14} className="text-gray-500" /> Cible ID: {r.target}</div>
                       <span className="px-2 py-0.5 bg-gray-200 text-gray-700 dark:text-[var(--dash-text-muted)] rounded-md font-bold">{r.relation_type}</span>
                     </div>
                   ))
                 )}
               </div>
             )}

             {activeTab === 'Workflow' && (
               <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                 <h3 className="flex items-center gap-2 font-poppins font-semibold text-sm mb-2"><CheckCircle className="text-orange-500" size={16}/> Workflow</h3>
                 <span className="text-sm text-gray-500">Aucun workflow associé pour le moment.</span>
               </div>
             )}
          </div>
        </div>

        {/* Right Column (Side Panels) */}
        <div className="w-full xl:w-[320px] flex flex-col gap-5">
          
          {/* Résumé du document */}
          <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl flex flex-col overflow-hidden shadow-sm">
            <div className="p-5 pb-0">
               <h3 className="flex items-center gap-2 font-poppins font-semibold text-sm"><Fingerprint className="text-orange-500" size={16}/> Résumé du document</h3>
            </div>
            
            <div className="p-5 flex flex-col gap-3 text-[11px] font-poppins">
               <MetaRow label="Nom" value={doc.title} bold />
               <MetaRow label="Dossier" value={`Dossier #${doc.dossier}`} />
               <MetaRow label="Direction" value={(doc as any).direction ? `Direction #${(doc as any).direction}` : '-'} />
               <MetaRow label="Département" value={(doc as any).departement ? `Département #${(doc as any).departement}` : '-'} />
               <MetaRow label="Date de création" value={new Date(doc.created_at).toLocaleString()} />
               <MetaRow label="Taille" value={doc.files && doc.files.length > 0 ? `${(doc.files[0].size / 1024 / 1024).toFixed(2)} Mo` : 'Inconnue'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SUB-COMPONENTS ──────────────────────────────────── */

function ActionButton({ label, icon: Icon, isDanger = false, isStarred = false, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl border transition-colors 
      ${isDanger 
        ? 'border-red-100 bg-red-50 text-red-500 hover:bg-red-100' 
        : isStarred
          ? 'border-yellow-200 bg-yellow-50 text-yellow-600 dark:border-yellow-950 dark:bg-yellow-950/20 dark:text-yellow-400'
          : 'border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] text-gray-600 dark:text-[var(--dash-text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)] shadow-sm'
      }`}>
      <Icon size={18} strokeWidth={1.5} className={isStarred ? "fill-current text-yellow-500" : ""} />
      <span className="text-[9px] font-semibold font-poppins">{label}</span>
    </button>
  );
}

function TabItem({ label, active, badge, onClick }: any) {
  return (
    <div onClick={onClick} className={`py-4 flex items-center gap-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${active ? 'border-orange-500 text-orange-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-[var(--dash-text)]'}`}>
      {label}
      {badge && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-orange-100' : 'bg-gray-100 text-gray-600 dark:text-[var(--dash-text-muted)]'}`}>{badge}</span>}
    </div>
  );
}

function MetaRow({ label, value, bold=false }: any) {
  return (
    <div className="flex gap-2 items-center">
       <span className="w-24 text-gray-500 shrink-0 font-medium">{label}</span>
       <div className={`text-gray-900 dark:text-[#FFFFFF] ${bold ? 'font-bold' : ''}`}>{value}</div>
    </div>
  );
}