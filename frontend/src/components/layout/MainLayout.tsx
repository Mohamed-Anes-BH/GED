import { useState, useEffect, ReactNode, useRef } from 'react';
import { 
  Home, Folder, Inbox, Send, Archive, Box, Search, GitMerge, Bell, Star, 
  Trash2, Users, Shield, Settings, History, Sun, Moon, ChevronDown, 
  FileText, MessageSquare, UploadCloud, Printer, Sparkles, BarChart2, 
  Building2, Layers, Briefcase, FolderGit, FolderTree, Tag, Globe
} from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';
import { useAuth } from '../../context/AuthContext';

export function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return <span className="dash-badge" style={{ background: bg, color }}>{label}</span>;
}

export function SidebarNav({ current, onNavigate }: { current: string; onNavigate: (page: string) => void }) {
  const { user } = useAuth();
  const userName = user ? `${user.first_name} ${user.last_name}` : 'Sofiane Hamidi';
  const userRole = user?.role_details?.name || user?.role || 'Administrateur';
  const userAvatar = user?.avatar || 'https://i.pravatar.cc/150?u=a042581f4e29026704d';

  // State to toggle navigation groups if needed, here we list them cleanly with group headers
  return (
    <aside className="dash-sidebar flex flex-col h-full overflow-hidden select-none">
      {/* Brand space */}
      <div className="dash-sidebar-brand shrink-0">
        <img src="/images/agrodiv-logo-transparent.png" alt="AgrOdiv" />
        <div>
          <strong>AgrOdiv</strong>
          <span>GED</span>
        </div>
      </div>
      
      {/* Scrollable Nav items list */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1 flex flex-col gap-5 py-2">
        <div>
          <div className="dash-nav-section-title">ACCÈS ENTRÉE</div>
          <div className="dash-nav-group">
            <NavItem id="dashboard" icon={<Home size={17} />} label="Tableau de bord" current={current} onAct={onNavigate} />
            <NavItem id="upload" icon={<UploadCloud size={17} />} label="Nouveau Document" current={current} onAct={onNavigate} />
            <NavItem id="scanner" icon={<Printer size={17} />} label="Numériser (Scan)" current={current} onAct={onNavigate} />
            <NavItem id="ocr" icon={<Sparkles size={17} />} label="Traitement OCR" current={current} onAct={onNavigate} />
            <NavItem id="messagerie" icon={<MessageSquare size={17} />} label="Messagerie" current={current} onAct={onNavigate} />
            <NavItem id="statistiques" icon={<BarChart2 size={17} />} label="Statistiques" current={current} onAct={onNavigate} />
          </div>
        </div>

        <div>
          <div className="dash-nav-section-title">DOCUMENTS</div>
          <div className="dash-nav-group">
            <NavItem id="documents" icon={<Folder size={17} />} label="Tous les documents" current={current} onAct={onNavigate} />
            <NavItem id="folders" icon={<FolderGit size={17} />} label="Dossiers" current={current} onAct={onNavigate} />
            <NavItem id="favorites" icon={<Star size={17} />} label="Favoris" current={current} onAct={onNavigate} />
            <NavItem id="tags" icon={<Tag size={17} />} label="Mots-clés / Tags" current={current} onAct={onNavigate} />
            <NavItem id="trash" icon={<Trash2 size={17} />} label="Corbeille" current={current} onAct={onNavigate} />
          </div>
        </div>

        <div>
          <div className="dash-nav-section-title">COURRIER</div>
          <div className="dash-nav-group">
            <NavItem id="inbox" icon={<Inbox size={17} />} label="Courriers entrants" current={current} onAct={onNavigate} />
            <NavItem id="outbox" icon={<Send size={17} />} label="Courriers sortants" current={current} onAct={onNavigate} />
            <NavItem id="diffusion" icon={<Globe size={17} />} label="Diffusion / Dispatch" current={current} onAct={onNavigate} />
          </div>
        </div>

        <div>
          <div className="dash-nav-section-title">ARCHIVAGE</div>
          <div className="dash-nav-group">
            <NavItem id="archive" icon={<Archive size={17} />} label="Archives physiques" current={current} onAct={onNavigate} />
            <NavItem id="boxes" icon={<Box size={17} />} label="Boîtes & Emplacements" current={current} onAct={onNavigate} />
            <NavItem id="emplacements-physiques" icon={<Globe size={17} />} label="Emplacements Physiques" current={current} onAct={onNavigate} />
          </div>
        </div>

        <div>
          <div className="dash-nav-section-title">PROCESSUS</div>
          <div className="dash-nav-group">
            <NavItem id="workflow" icon={<GitMerge size={17} />} label="Workflow / Validation" current={current} onAct={onNavigate} />
          </div>
        </div>

        <div>
          <div className="dash-nav-section-title">ADMINISTRATION</div>
          <div className="dash-nav-group">
            <NavItem id="users" icon={<Users size={17} />} label="Utilisateurs" current={current} onAct={onNavigate} />
            <NavItem id="roles" icon={<Shield size={17} />} label="Rôles & Permissions" current={current} onAct={onNavigate} />
            <NavItem id="directions" icon={<Building2 size={17} />} label="Directions" current={current} onAct={onNavigate} />
            <NavItem id="departements" icon={<Layers size={17} />} label="Départements" current={current} onAct={onNavigate} />
            <NavItem id="services" icon={<Briefcase size={17} />} label="Services" current={current} onAct={onNavigate} />
            <NavItem id="categories" icon={<FolderTree size={17} />} label="Catégories" current={current} onAct={onNavigate} />
            <NavItem id="settings" icon={<Settings size={17} />} label="Paramètres" current={current} onAct={onNavigate} />
            <NavItem id="audit" icon={<History size={17} />} label="Audit & Historique" current={current} onAct={onNavigate} />
          </div>
        </div>
      </div>

      {/* User profile section fixed to the bottom */}
      <div className="dash-sidebar-footer shrink-0">
        <div 
          className="dash-user-profile cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors flex items-center justify-between"
          onClick={() => onNavigate('profil')}
        >
          <div className="flex items-center gap-3">
            <img src={userAvatar} alt="User avatar" className="w-[36px] h-[36px] rounded-full border border-gray-650 object-cover" />
            <div className="dash-user-info flex flex-col">
              <strong className="text-white text-xs truncate max-w-[120px] font-bold">{userName}</strong>
              <span className="text-[10px] text-gray-400 truncate max-w-[120px]">{userRole}</span>
            </div>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>
    </aside>
  );
}

function NavItem({ id, icon, label, current, onAct }: { id: string; icon: ReactNode; label: string; current: string; onAct: (id: string) => void }) {
  const isActive = current === id || (id === 'documents' && current === 'document'); // Support detail page highlighting
  return (
    <button className={`dash-nav-item ${isActive ? 'active' : ''}`} onClick={() => onAct(id)}>
      <span className="dash-nav-icon">{icon}</span>
      <span className="dash-nav-label text-[13px]">{label}</span>
    </button>
  );
}

export function AppChrome({ current, onNavigate, children }: { current: string; onNavigate: (page: string) => void; children: ReactNode }) {
  const { user } = useAuth();
  const userAvatar = user?.avatar || 'https://i.pravatar.cc/150?u=a042581f4e29026704d';
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark-theme');
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { results, search, loading } = useSearch();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        search(searchQuery);
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`dash-layout ${isDark ? 'dark-theme' : ''}`}>
      <SidebarNav current={current} onNavigate={onNavigate} />
      <div className="dash-main-area">
        {/* Top Header */}
        <header className="dash-top-header">
          <div className="dash-header-title">
            <h1 className="typing-header">Bonjour, {user?.first_name || 'Sofiane'} ! <span className="wave-emoji">👋</span></h1>
            <p>Voici un aperçu de votre activité documentaire aujourd'hui.</p>
          </div>
          
          <div className="dash-header-actions">
            <div className="dash-search-bar relative" ref={searchRef}>
              <Search size={16} />
              <input 
                 type="text" 
                 placeholder="Recherche incluant (OCR)..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onFocus={() => { if(searchQuery.length > 0) setShowDropdown(true); }}
              />
              <div className="dash-search-shortcut">⌘ K</div>
              
              {showDropdown && (
                <div className="absolute top-12 left-0 right-0 max-h-80 w-full overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl z-50 p-2 flex flex-col gap-1 text-[13px]">
                   {loading ? (
                      <div className="p-3 text-center text-gray-500 text-xs">Recherche en cours...</div>
                   ) : (
                      <>
                        {results?.documents?.map((d: any) => (
                           <div key={`d-${d.id}`} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                              <FileText size={14} className="text-orange-500" />
                              <span className="truncate text-gray-700 dark:text-gray-200 font-medium">{d.title}</span>
                              <span className="ml-auto text-[10px] bg-orange-100 text-orange-700 px-1.5 rounded">Doc</span>
                           </div>
                        ))}
                        {results?.courriers?.map((c: any) => (
                           <div key={`c-${c.id}`} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                              <Inbox size={14} className="text-blue-500" />
                              <span className="truncate text-gray-700 dark:text-gray-200 font-medium">{c.objet}</span>
                              <span className="ml-auto text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded">Cour</span>
                           </div>
                        ))}
                        {results?.dossiers?.map((d: any) => (
                           <div key={`f-${d.id}`} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                              <Folder size={14} className="text-yellow-500 fill-current" />
                              <span className="truncate text-gray-700 dark:text-gray-200 font-medium">{d.name}</span>
                              <span className="ml-auto text-[10px] bg-yellow-100 text-yellow-700 px-1.5 rounded">Dos</span>
                           </div>
                        ))}
                        {(!results?.documents?.length && !results?.courriers?.length && !results?.dossiers?.length) && (
                           <div className="p-3 text-center text-gray-500 text-xs">Aucun résultat trouvé</div>
                        )}
                        <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                           <button onClick={() => { setShowDropdown(false); onNavigate('search'); }} className="w-full py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-xs font-semibold text-orange-500">
                             Voir tous les résultats
                           </button>
                        </div>
                      </>
                   )}
                </div>
              )}
            </div>
            
            <button className="dash-icon-btn theme-toggle" onClick={() => setIsDark(!isDark)}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="dash-icon-btn-wrap">
              <button onClick={() => onNavigate('notifications')} className="dash-icon-btn"><Bell size={20} /></button>
              <span className="dash-header-badge">8</span>
            </div>
            <img 
              src={userAvatar} 
              alt="User" 
              className="dash-header-avatar cursor-pointer" 
              onClick={() => onNavigate('profil')}
            />
          </div>
        </header>

        {/* Content */}
        <main className="dash-content-wrapper">
          {children}
        </main>
      </div>
    </div>
  );
}

export function GlassPanel({ children, className = '', style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={`glass-panel ${className}`} style={{ ...style }}>{children}</div>;
}

export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="dash-section-title">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}