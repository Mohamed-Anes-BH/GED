import { useState, useEffect, ReactNode } from 'react';
import { Home, Folder, Inbox, Send, Archive, Box, Search, GitMerge, Bell, Star, Trash2, Users, Shield, Settings, History, Sun, Moon, ChevronDown } from 'lucide-react';
import { theme } from '../../styles/theme';

export function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return <span className="dash-badge" style={{ background: bg, color }}>{label}</span>;
}

export function SidebarNav({ current, onNavigate }: { current: string; onNavigate: (page: string) => void }) {
  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar-brand">
        <img src="/images/agrodiv-logo-transparent.png" alt="AgrOdiv" />
        <div>
          <strong>AgrOdiv</strong>
          <span>GED</span>
        </div>
      </div>
      
      <div className="dash-nav-group">
        <NavItem id="dashboard" icon={<Home size={18} />} label="Tableau de bord" current={current} onAct={onNavigate} />
        <NavItem id="documents" icon={<Folder size={18} />} label="Documents" current={current} onAct={onNavigate} />
        <NavItem id="inbox" icon={<Inbox size={18} />} label="Courriers entrants" current={current} onAct={onNavigate} />
        <NavItem id="outbox" icon={<Send size={18} />} label="Courriers sortants" current={current} onAct={onNavigate} />
        <NavItem id="folders" icon={<Folder size={18} />} label="Dossiers" current={current} onAct={onNavigate} />
        <NavItem id="archive" icon={<Archive size={18} />} label="Archives physiques" current={current} onAct={onNavigate} />
        <NavItem id="boxes" icon={<Box size={18} />} label="Boîtes & Emplacements" current={current} onAct={onNavigate} />
        <NavItem id="search" icon={<Search size={18} />} label="Recherche avancée" current={current} onAct={onNavigate} />
        <NavItem id="workflow" icon={<GitMerge size={18} />} label="Workflow" current={current} onAct={onNavigate} />
        
        <div className="nav-item-rel">
          <NavItem id="notifications" icon={<Bell size={18} />} label="Notifications" current={current} onAct={onNavigate} />
          <span className="nav-badge">8</span>
        </div>
        
        <NavItem id="favorites" icon={<Star size={18} />} label="Favoris" current={current} onAct={onNavigate} />
        <NavItem id="trash" icon={<Trash2 size={18} />} label="Corbeille" current={current} onAct={onNavigate} />
      </div>

      <div className="dash-nav-section-title">ADMINISTRATION</div>
      <div className="dash-nav-group">
        <NavItem id="users" icon={<Users size={18} />} label="Utilisateurs" current={current} onAct={onNavigate} />
        <NavItem id="roles" icon={<Shield size={18} />} label="Rôles & Permissions" current={current} onAct={onNavigate} />
        <NavItem id="settings" icon={<Settings size={18} />} label="Paramètres" current={current} onAct={onNavigate} />
        <NavItem id="audit" icon={<History size={18} />} label="Audit & Historique" current={current} onAct={onNavigate} />
      </div>

      <div className="dash-sidebar-footer">
        <div className="dash-user-profile">
          <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
          <div className="dash-user-info">
            <strong>Sofiane Hamidi</strong>
            <span>Administrateur</span>
          </div>
          <ChevronDown size={16} color="#8a8a8a" />
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
      <span className="dash-nav-label">{label}</span>
    </button>
  );
}

export function AppChrome({ current, onNavigate, children }: { current: string; onNavigate: (page: string) => void; children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark-theme'));

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }, [isDark]);

  return (
    <div className={`dash-layout ${isDark ? 'dark-theme' : ''}`}>
      <SidebarNav current={current} onNavigate={onNavigate} />
      <div className="dash-main-area">
        {/* Top Header */}
        <header className="dash-top-header">
          <div className="dash-header-title">
            <h1 className="typing-header">Bonjour, Sofiane ! <span className="wave-emoji">👋</span></h1>
            <p>Voici un aperçu de votre activité documentaire aujourd'hui.</p>
          </div>
          
          <div className="dash-header-actions">
            <div className="dash-search-bar">
              <Search size={16} />
              <input type="text" placeholder="Rechercher un document, un dossier, un courrier..." />
              <div className="dash-search-shortcut">⌘ K</div>
            </div>
            
            <button className="dash-icon-btn theme-toggle" onClick={() => setIsDark(!isDark)}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="dash-icon-btn-wrap">
              <button className="dash-icon-btn"><Bell size={20} /></button>
              <span className="dash-header-badge">8</span>
            </div>
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" className="dash-header-avatar" />
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
  // Add GlassPanel back (maybe someone is using it)
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