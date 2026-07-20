import { Bell, FileText, Mail, Eye, MessageSquare, Send, Archive, GitBranch, CheckCircle, ChevronRight, LayoutGrid } from 'lucide-react';
import { useState, useEffect } from 'react';
import { notificationsService } from '../services/notifications';

export function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('Tous');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notifs, unread] = await Promise.all([
          notificationsService.getAll().catch(() => ({ results: [] })),
          notificationsService.getUnreadCount().catch(() => ({ count: 0 })),
        ]);
        setNotifications(notifs.results || notifs || []);
        setUnreadCount(unread.count || 0);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleMarkRead = async (id: number) => {
    await notificationsService.markRead(id).catch(console.error);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(count => Math.max(0, count - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationsService.markAllRead().catch(console.error);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleClear = async () => {
    await notificationsService.clear().catch(console.error);
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div className="flex flex-col gap-6 font-poppins pb-10 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center shadow-sm">
          <Bell size={26} className="text-orange-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-oswald text-gray-900 dark:text-[#FFFFFF]">Notifications</h2>
          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400 mt-0.5">
            <span>Accueil</span> <span>›</span> <span className="text-orange-500 font-semibold">Notifications</span>
            {unreadCount > 0 && <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-orange-600">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>}
          </div>
        </div>
      </div>

      {/* Filter Tabs + Actions */}
      <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 flex-wrap flex-1">
          {[
            { label: 'Tous', icon: LayoutGrid },
            { label: 'Documents', icon: FileText },
            { label: 'Courriers', icon: Mail },
            { label: 'Diffusion', icon: Send },
            { label: 'OCR', icon: Eye },
            { label: 'Commentaires', icon: MessageSquare },
          ].map(({ label, icon: Icon }) => (
            <button 
              key={label} 
              onClick={() => setActiveTab(label)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
              ${activeTab === label ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 dark:text-[var(--dash-text-muted)] hover:bg-gray-200'}`}>
              <Icon size={13}/> {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 shrink-0">
          <select className="border border-gray-200 dark:border-[var(--dash-border)] rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-[var(--dash-text-muted)] outline-none bg-gray-50 dark:bg-[var(--dash-bg)]">
            <option value="">État</option>
            <option value="non_lue">Non lue</option>
            <option value="lue">Lue</option>
          </select>
          <button onClick={handleMarkAllRead} className="px-3 py-1.5 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-xs font-semibold text-gray-600 dark:text-[var(--dash-text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)] flex items-center gap-1.5"><CheckCircle size={13}/> Tout marquer comme lu</button>
          <button onClick={handleClear} className="px-3 py-1.5 bg-yellow-400 text-gray-900 dark:text-[#FFFFFF] rounded-lg text-xs font-bold hover:bg-yellow-500 flex items-center gap-1.5"><CheckCircle size={13}/> Tout effacer</button>
        </div>
      </div>

      {/* Notification Groups */}
      <div className="flex flex-col gap-6">
        <NotifGroup label="RÉCENTES">
          {loading ? (
             <div className="p-4 text-center text-xs text-gray-500">Chargement...</div>
          ) : (() => {
            const filtered = notifications.filter(n => {
              const type = (n.type || '').toLowerCase();
              if (activeTab === 'Tous') return true;
              if (activeTab === 'Documents') return type === 'document';
              if (activeTab === 'Courriers') return type === 'courrier';
              if (activeTab === 'Diffusion') return type === 'diffusion';
              if (activeTab === 'OCR') return type === 'ocr';
              if (activeTab === 'Commentaires') return type === 'comment' || type === 'commentaire';
              return true;
            });
            if (filtered.length === 0) {
              return <div className="p-4 text-center text-xs text-gray-500">Aucune notification</div>;
            }
            return filtered.map((n: any) => (
              <NotifItem 
                key={n.id}
                onClick={() => handleMarkRead(n.id)}
                icon={n.type === 'document' ? FileText : n.type === 'courrier' ? Mail : Bell} 
                iconBg="bg-blue-100 dark:bg-blue-900/30" 
                iconColor="text-blue-500 dark:text-blue-400" 
                title={n.title || n.message} 
                desc={n.message} 
                time={new Date(n.created_at).toLocaleString()} 
                unread={!n.is_read} 
              />
            ));
          })()}
        </NotifGroup>
      </div>
    </div>
  );
}

function NotifGroup({ label, children }: any) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3 px-1 mb-1">
        <div className="w-2 h-2 rounded-full bg-yellow-400 shrink-0"></div>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm overflow-hidden flex flex-col divide-y divide-gray-100">
        {children}
      </div>
    </div>
  );
}

function NotifItem({ icon: Icon, iconBg, iconColor, title, desc, time, unread, onClick }: any) {
  return (
    <div onClick={onClick} className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]/80 transition-colors cursor-pointer group ${unread ? 'bg-orange-50/30' : ''}`}>
      <div className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
        <Icon size={17}/>
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <strong className={`text-[13px] leading-snug ${unread ? 'text-gray-900 dark:text-[#FFFFFF] font-bold' : 'text-gray-700 dark:text-[var(--dash-text-muted)] font-semibold'}`}>{title}</strong>
        <span className="text-[11px] text-gray-500 truncate mt-0.5">{desc}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">{time}</span>
        {unread && <div className="w-2 h-2 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50"></div>}
        {!unread && <CheckCircle size={14} className="text-gray-300" />}
        <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
      </div>
    </div>
  );
}
