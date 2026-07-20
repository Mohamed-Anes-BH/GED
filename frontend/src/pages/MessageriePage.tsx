import { useState, useEffect } from 'react';
import { 
  Plus, Filter, Inbox, Send, Edit, Bell, Archive, Search, Phone, Video, 
  MoreVertical, FileText, GitBranch, Paperclip, File, Mail, AtSign, 
  Smile, Zap, Mic, Play, Settings, Bold, Italic, Underline, List, Link2, 
  CheckCircle, Clock, Check, Users, Shield, Link, UploadCloud, FileDown,
  Eye, RotateCcw, User, Scan, Trash2, Loader2
} from 'lucide-react';
import { messagerieService } from '../services/messagerie';
import { useAuth } from '../context/AuthContext';

export function MessageriePage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await messagerieService.getConversations();
      setConversations(res.results || res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conv: any) => {
    setActiveConv(conv);
    setLoadingMsgs(true);
    try {
      const msgs = await messagerieService.getMessages(conv.id);
      setMessages(msgs.results || msgs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConv) return;
    try {
      await messagerieService.sendMessage(activeConv.id, newMessage);
      setNewMessage('');
      // refresh msgs
      const msgs = await messagerieService.getMessages(activeConv.id);
      setMessages(msgs.results || msgs || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-poppins pb-24 text-gray-800 dark:text-[var(--dash-text)] h-[calc(100vh-80px)]">
      
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 shrink-0">
        <h2 className="text-[28px] font-bold font-oswald text-gray-900 dark:text-[#FFFFFF] leading-tight">Messagerie interne</h2>
        <div className="flex items-center justify-between">
           <p className="text-[13px] text-gray-500">Communiquez et collaborez avec vos collègues.</p>
           <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
             <span>Accueil</span> <span>›</span> <span className="text-gray-900 dark:text-[#FFFFFF] font-semibold dark:text-[#FFFFFF]">Messagerie interne</span>
           </div>
        </div>
      </div>

      {/* ─── Main Chat Layout ──────────────────────────────────── */}
      <div className="flex-1 flex gap-5 min-h-0">
         
         {/* LEFT COLUMN: Folders & Chat List */}
         <div className="w-[280px] shrink-0 bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl flex flex-col shadow-sm overflow-hidden h-full">
            <div className="p-4 border-b border-gray-100 dark:border-[var(--dash-border)] flex gap-2">
               <button className="flex-1 bg-orange-500 text-white font-semibold text-[13px] rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20 hover:bg-orange-600 h-10"><Plus size={16}/> Nouvelle conversation</button>
               <button className="w-10 h-10 border border-gray-200 dark:border-[var(--dash-border)] rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)] shrink-0"><Filter size={16}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
               {/* Folders */}
               <div className="p-3 flex flex-col gap-1 border-b border-gray-100 dark:border-[var(--dash-border)]">
                  <FolderItem icon={Inbox} label="Reçus" badge={conversations.length.toString()} active />
                  <FolderItem icon={Send} label="Envoyés" />
                  <FolderItem icon={Archive} label="Archivés" />
               </div>

               {/* All Chats */}
               <div className="p-3 flex flex-col gap-1 flex-1">
                  <div className="flex justify-between items-center px-2 py-1 mb-1">
                     <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Toutes les conversations</h4>
                     <button className="text-gray-400 hover:text-gray-600 dark:text-[var(--dash-text-muted)]"><Search size={14}/></button>
                  </div>
                  
                  {loading ? (
                    <div className="p-4 text-center text-gray-500 text-xs"><Loader2 className="animate-spin mx-auto" size={16} /></div>
                  ) : (
                    conversations.map((conv: any) => (
                      <div key={conv.id} onClick={() => selectConversation(conv)}>
                         <ChatListItem 
                            active={activeConv?.id === conv.id} 
                            name={conv.subject || `Conversation #${conv.id}`} 
                            msg="Cliquez pour voir les messages"
                            time={new Date(conv.updated_at).toLocaleTimeString().slice(0,5)}
                            avatar={conv.subject?.charAt(0) || 'C'}
                         />
                      </div>
                    ))
                  )}
               </div>
            </div>
         </div>

         {/* MIDDLE COLUMN: Chat Area */}
         <div className="flex-1 bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl flex flex-col shadow-sm h-full min-w-[400px]">
             {activeConv ? (
               <>
                 {/* Chat Header */}
                 <div className="p-4 border-b border-gray-100 dark:border-[var(--dash-border)] flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-2">
                         <h3 className="text-lg font-bold text-gray-900 dark:text-[#FFFFFF]">{activeConv.subject || 'Sujet sans titre'}</h3>
                         <span className="text-yellow-400">★</span>
                       </div>
                    </div>
                 </div>

                 {/* Messages Area */}
                 <div className="flex-1 overflow-y-auto p-5 pb-8 custom-scrollbar bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmFmYWZhIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMNCA0Wk00IDBMMCA0WiIgc3Ryb2tlPSIjZjVmNWY1IiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] bg-repeat">
                    {loadingMsgs ? (
                      <div className="flex justify-center my-4"><Loader2 className="animate-spin text-gray-400" /></div>
                    ) : (
                      messages.map((msg: any) => {
                        const isMe = msg.sender?.email === user?.email;
                        const time = new Date(msg.created_at).toLocaleTimeString().slice(0,5);
                        const senderName = msg.sender?.first_name ? `${msg.sender.first_name} ${msg.sender.last_name}` : msg.sender?.email || 'Utilisateur';

                        if (isMe) {
                          return (
                            <div key={msg.id} className="flex flex-col gap-1 mb-6 max-w-[85%] ml-auto items-end">
                               <div className="flex items-baseline gap-2 mr-10 mb-1">
                                  <strong className="text-[11px] text-gray-800 dark:text-[var(--dash-text)]">Moi</strong>
                                  <span className="text-[9px] text-gray-400 font-medium">{time}</span>
                               </div>
                               <div className="flex gap-2 items-end flex-row-reverse">
                                  <img src={`https://ui-avatars.com/api/?name=${user?.first_name||'M'}`} className="w-8 h-8 rounded-full shadow-sm mb-1" />
                                  <div className="bg-orange-50 text-[13px] text-gray-800 dark:text-[var(--dash-text)] p-3.5 rounded-2xl rounded-br-sm shadow-[0_1px_2px_rgba(249,115,22,0.15)] border border-orange-100 flex flex-col text-right">
                                     <span>{msg.content}</span>
                                     <span className="text-blue-500 self-end -mt-1"><Check size={12}/></span>
                                  </div>
                               </div>
                            </div>
                          )
                        } else {
                          return (
                            <div key={msg.id} className="flex flex-col gap-1 mb-6 max-w-[85%]">
                               <div className="flex items-baseline gap-2 ml-10 mb-1">
                                  <strong className="text-[11px] text-gray-800 dark:text-[var(--dash-text)]">{senderName}</strong>
                                  <span className="text-[9px] text-gray-400 font-medium">{time}</span>
                               </div>
                               <div className="flex gap-2 items-end">
                                  <img src={`https://ui-avatars.com/api/?name=${senderName.charAt(0)}`} className="w-8 h-8 rounded-full shadow-sm mb-1" />
                                  <div className="flex flex-col gap-1.5">
                                    <div className="bg-gray-100 text-[13px] text-gray-800 dark:text-[var(--dash-text)] p-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-200 dark:border-[var(--dash-border)]/50">
                                       {msg.content}
                                    </div>
                                  </div>
                               </div>
                            </div>
                          )
                        }
                      })
                    )}
                 </div>

                 {/* Input Area */}
                 <div className="p-4 pt-2 border-t border-gray-200 dark:border-[var(--dash-border)]">
                    <div className="border border-gray-300 rounded-xl bg-white dark:bg-[var(--dash-card-bg)] shadow-sm overflow-hidden flex flex-col relative focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all">
                       <textarea 
                          value={newMessage} 
                          onChange={e=>setNewMessage(e.target.value)} 
                          onKeyDown={e=>{if(e.key==='Enter' && !e.shiftKey){e.preventDefault();handleSend();}}}
                          placeholder="Écrire votre message..." 
                          className="w-full outline-none p-3 text-[13px] resize-none h-16 bg-transparent" 
                       />
                       
                       <div className="bg-gray-50 dark:bg-[var(--dash-bg)]/80 border-t border-gray-100 dark:border-[var(--dash-border)] p-2 flex justify-between items-center">
                         <div className="flex flex-1"></div>
                         <div className="flex items-center gap-2">
                            <button onClick={handleSend} disabled={!newMessage.trim()} className="w-8 h-8 rounded-full bg-orange-500 flex justify-center items-center text-white shadow-sm shadow-orange-500/30 hover:bg-orange-600 disabled:opacity-50">
                               <Play size={14} className="fill-current"/>
                            </button>
                         </div>
                       </div>
                    </div>
                 </div>
               </>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center p-5 text-center text-gray-400">
                  <Mail size={48} className="mb-4 text-gray-300" />
                  <h3 className="text-xl font-bold text-gray-700 dark:text-[var(--dash-text-muted)]">Aucune conversation sélectionnée</h3>
                  <p className="text-sm mt-2">Veuillez sélectionner une conversation dans le menu de gauche.</p>
               </div>
             )}
         </div>

         {/* RIGHT COLUMN: Sidebar stays static for now to preserve UI layout */}
         {activeConv && (
           <div className="w-[320px] shrink-0 flex flex-col gap-5 overflow-y-auto custom-scrollbar h-full pr-1">
              <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-5 shadow-sm">
                 <h4 className="font-semibold text-[13px] mb-4">Participants ({activeConv.participants?.length || 0})</h4>
                 <div className="flex flex-col gap-3">
                    {activeConv.participants?.map((p: any) => (
                      <div key={p.id} className="flex items-center gap-2 text-xs">
                         <img src={`https://ui-avatars.com/api/?name=${p.first_name || p.email.charAt(0)}`} className="w-6 h-6 rounded-full" />
                         <span className="font-semibold">{p.first_name ? `${p.first_name} ${p.last_name}` : p.email}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
         )}
      </div>
    </div>
  );
}

function FolderItem({ icon: Icon, label, badge, badgeColor, active }: any) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer ${active ? 'bg-orange-50/70 border border-orange-100' : 'hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)] border border-transparent'}`}>
       <div className={`flex items-center gap-2 ${active ? 'text-orange-700 font-semibold' : 'text-gray-700 dark:text-[var(--dash-text-muted)] font-medium'}`}>
         <Icon size={16} className={active ? 'text-orange-500' : 'text-gray-400'} /> <span className="text-xs">{label}</span>
       </div>
       {badge && (
         <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badgeColor || 'bg-orange-200 text-orange-900 border border-orange-200'}`}>{badge}</span>
       )}
    </div>
  );
}

function ChatListItem({ active, name, title, msg, time, badge, avatar, online, pinned, isGroup }: any) {
  return (
    <div className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${active ? 'bg-orange-50/50 border-orange-100/50 shadow-sm' : 'border-transparent hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]'}`}>
       <div className="relative shrink-0">
          <div className="w-10 h-10 border-2 border-gray-100 dark:border-[var(--dash-border)] rounded-full flex items-center justify-center bg-gray-100 text-gray-600 dark:text-[var(--dash-text-muted)] font-bold text-xs">{avatar}</div>
          {online !== undefined && (
             <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          )}
       </div>
       <div className="flex flex-col flex-1 min-w-0 justify-center">
          <div className="flex justify-between items-baseline mb-0.5">
             <strong className="text-xs font-semibold text-gray-900 dark:text-[#FFFFFF] truncate pr-2">{name}</strong>
             <span className="text-[9px] font-medium text-gray-500 shrink-0">{time}</span>
          </div>
          {title && <span className="text-[10px] font-bold text-gray-800 dark:text-[var(--dash-text)] truncate block leading-tight">{title}</span>}
          <div className="flex justify-between items-center mt-1">
             <span className="text-[10px] text-gray-500 truncate pr-2 block">{msg}</span>
             {badge && <span className="w-4 h-4 bg-orange-500 text-white rounded-full flex justify-center items-center text-[8px] font-bold shrink-0">{badge}</span>}
          </div>
       </div>
    </div>
  );
}
