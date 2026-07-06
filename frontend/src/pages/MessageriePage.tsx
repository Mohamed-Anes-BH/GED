import { useState } from 'react';
import { 
  Plus, Filter, Inbox, Send, Edit, Bell, Archive, Search, Phone, Video, 
  MoreVertical, FileText, GitBranch, Paperclip, File, Mail, AtSign, 
  Smile, Zap, Mic, Play, Settings, Bold, Italic, Underline, List, Link2, 
  CheckCircle, Clock, Check, Users, Shield, Link, UploadCloud, FileDown,
  Eye, RotateCcw, User, Scan, Trash2
} from 'lucide-react';

export function MessageriePage() {
  return (
    <div className="flex flex-col gap-6 font-poppins pb-24 text-gray-800 h-[calc(100vh-80px)]">
      
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 shrink-0">
        <h2 className="text-[28px] font-bold font-oswald text-gray-900 dark:text-gray-100 leading-tight">Messagerie interne</h2>
        <div className="flex items-center justify-between">
           <p className="text-[13px] text-gray-500">Communiquez et collaborez avec vos collègues.</p>
           <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
             <span>Accueil</span> <span>›</span> <span className="text-gray-900 font-semibold dark:text-gray-100">Messagerie interne</span>
           </div>
        </div>
      </div>

      {/* ─── Main Chat Layout ──────────────────────────────────── */}
      <div className="flex-1 flex gap-5 min-h-0">
         
         {/* LEFT COLUMN: Folders & Chat List */}
         <div className="w-[280px] shrink-0 bg-white border border-gray-200 rounded-2xl flex flex-col shadow-sm overflow-hidden h-full">
            <div className="p-4 border-b border-gray-100 flex gap-2">
               <button className="flex-1 bg-orange-500 text-white font-semibold text-[13px] rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20 hover:bg-orange-600 h-10"><Plus size={16}/> Nouvelle conversation</button>
               <button className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50 shrink-0"><Filter size={16}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
               {/* Folders */}
               <div className="p-3 flex flex-col gap-1 border-b border-gray-100">
                  <FolderItem icon={Inbox} label="Reçus" badge="6" active />
                  <FolderItem icon={Send} label="Envoyés" />
                  <FolderItem icon={Edit} label="Brouillons" badge="2" />
                  <FolderItem icon={Bell} label="Notifications" badge="8" badgeColor="bg-red-500 text-white" />
                  <FolderItem icon={Archive} label="Archivés" />
               </div>

               {/* Pinned Chats */}
               <div className="p-3 border-b border-gray-100 flex flex-col gap-1">
                  <div className="flex justify-between items-center px-2 py-1 mb-1">
                     <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Conversations épinglées</h4>
                     <button className="text-gray-400 hover:text-gray-600"><Plus size={14}/></button>
                  </div>
                  <ChatListItem name="Équipe Production" msg="OK merci, je m'en occupe" time="10:15" badge="2" pinned avatar="EP" isGroup />
               </div>

               {/* All Chats */}
               <div className="p-3 flex flex-col gap-1 flex-1">
                  <div className="flex justify-between items-center px-2 py-1 mb-1">
                     <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Toutes les conversations</h4>
                     <button className="text-gray-400 hover:text-gray-600"><Search size={14}/></button>
                  </div>
                  
                  <ChatListItem active name="Yacine M." title="Validation Rapport Production 2024" msg="Bonjour, le rapport est prêt pour validation." time="10:35" badge="2" avatar="Yacine" online />
                  <ChatListItem name="Sofiane H." title="RE: Budget prévisionnel" msg="Merci pour les informations." time="09:42" badge="1" avatar="Sofiane" online />
                  <ChatListItem name="Nadia A." title="Statistiques agricoles T1" msg="Les données ont été mises à jour." time="Hier" avatar="Nadia" online={false} />
                  <ChatListItem name="Bureau Statistiques" title="Diffusion - Rapport annuel" msg="Le rapport a été diffusé à 5 services." time="Hier" avatar="BS" isGroup />
                  <ChatListItem name="K. Belkacem" title="Proposition de partenariat" msg="Pouvez-vous vérifier ce document ?" time="12/05" avatar="Karim" online />
                  <ChatListItem name="Direction des Finances" title="Planification réunion" msg="Réunion prévue demain à 10h." time="12/05" avatar="DF" isGroup />
                  <ChatListItem name="Support GED" title="Nouveau connecteur OCR" msg="Le connecteur OCR a été mis à jour." time="10/05" avatar="SG" isGroup online />
               </div>
            </div>
         </div>

         {/* MIDDLE COLUMN: Chat Area */}
         <div className="flex-1 bg-white border border-gray-200 rounded-2xl flex flex-col shadow-sm h-full min-w-[400px]">
             {/* Chat Header */}
             <div className="p-4 border-b border-gray-100 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-2">
                     <h3 className="text-lg font-bold text-gray-900">Validation Rapport Production 2024</h3>
                     <span className="text-yellow-400">★</span>
                   </div>
                   <div className="flex gap-2 text-gray-500">
                     <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"><Phone size={14}/></button>
                     <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"><Video size={14}/></button>
                     <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"><MoreVertical size={14}/></button>
                   </div>
                </div>
                <span className="text-[11px] text-gray-500 font-medium">Conversation liée au document</span>
                
                {/* Meta Cards row */}
                <div className="flex gap-3 mt-1">
                   {/* Meta Card 1 */}
                   <div className="border border-gray-200 rounded-lg p-2.5 flex-1 flex flex-col gap-1.5 bg-gray-50/50">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Document lié</span>
                      <div className="flex items-center gap-1.5"><div className="bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded">PDF</div><span className="text-xs font-semibold truncate text-gray-800">Rapport_Production_2024.pdf</span></div>
                   </div>
                   {/* Meta Card 2 */}
                   <div className="border border-gray-200 rounded-lg p-2.5 flex-1 flex flex-col gap-1.5 bg-gray-50/50">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Workflow</span>
                      <div className="flex items-center gap-1.5"><GitBranch size={12} className="text-orange-500"/><span className="text-xs font-semibold truncate text-gray-800">Validation rapport annuel</span></div>
                   </div>
                   {/* Meta Card 3 */}
                   <div className="border border-gray-200 rounded-lg p-2.5 flex-[1.2] flex flex-col justify-between bg-gray-50/50">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Participants</span>
                      <div className="flex justify-between items-center">
                         <div className="flex -space-x-1.5">
                            <img src="https://ui-avatars.com/api/?name=S" className="w-6 h-6 rounded-full border border-white" />
                            <img src="https://ui-avatars.com/api/?name=Y" className="w-6 h-6 rounded-full border border-white" />
                            <img src="https://ui-avatars.com/api/?name=N" className="w-6 h-6 rounded-full border border-white" />
                            <div className="w-6 h-6 rounded-full border border-white bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-600">+3</div>
                         </div>
                         <button className="text-[10px] font-bold bg-white border border-gray-200 rounded px-2 py-0.5 hover:bg-gray-50">Détails</button>
                      </div>
                   </div>
                </div>
             </div>

             {/* Messages Area */}
             <div className="flex-1 overflow-y-auto p-5 pb-8 custom-scrollbar bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmFmYWZhIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMNCA0Wk00IDBMMCA0WiIgc3Ryb2tlPSIjZjVmNWY1IiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] bg-repeat">
                <div className="flex justify-center mb-6"><span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-100 px-3 py-1 rounded-full">Aujourd'hui</span></div>
                
                {/* Msg left */}
                <div className="flex flex-col gap-1 mb-6 max-w-[85%]">
                   <div className="flex items-baseline gap-2 ml-10 mb-1">
                      <strong className="text-[11px] text-gray-800">Yacine M.</strong>
                      <span className="text-[9px] text-gray-400 font-medium">10:15</span>
                   </div>
                   <div className="flex gap-2 items-end">
                      <img src="https://ui-avatars.com/api/?name=Y" className="w-8 h-8 rounded-full shadow-sm mb-1" />
                      <div className="flex flex-col gap-1.5">
                         <div className="bg-gray-100 text-[13px] text-gray-800 p-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-200/50">
                            Bonjour, le rapport annuel sur la production céréalière 2024 est prêt pour validation.
                         </div>
                         <div className="bg-gray-100 p-2.5 rounded-xl border border-gray-200/50 flex items-center gap-3 shadow-sm w-fit">
                            <div className="bg-red-500 text-white font-bold text-[9px] px-1.5 py-1 rounded">PDF</div>
                            <div className="flex flex-col gap-0.5">
                               <strong className="text-[11px] font-semibold text-gray-800">Rapport_Production_2024.pdf</strong>
                               <span className="text-[9px] text-gray-500">2.4 Mo</span>
                            </div>
                            <button className="ml-2 w-7 h-7 rounded border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-gray-900"><Eye size={12}/></button>
                         </div>
                         <div className="flex gap-1 mt-0.5">
                            <span className="bg-white border border-gray-200 shadow-sm rounded-full px-2 py-0.5 text-[10px] flex items-center gap-1 cursor-pointer hover:bg-gray-50">👍 2</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Msg Right */}
                <div className="flex flex-col gap-1 mb-6 max-w-[85%] ml-auto items-end">
                   <div className="flex items-baseline gap-2 mr-10 mb-1">
                      <strong className="text-[11px] text-gray-800">Sofiane Hamidi</strong>
                      <span className="text-[9px] text-gray-400 font-medium">10:18</span>
                   </div>
                   <div className="flex gap-2 items-end flex-row-reverse">
                      <img src="https://ui-avatars.com/api/?name=S" className="w-8 h-8 rounded-full shadow-sm mb-1" />
                      <div className="bg-orange-50 text-[13px] text-gray-800 p-3.5 rounded-2xl rounded-br-sm shadow-[0_1px_2px_rgba(249,115,22,0.15)] border border-orange-100 flex flex-col">
                         <span>Merci Yacine, je vais le vérifier et revenir vers toi.</span>
                         <span className="text-blue-500 self-end -mt-1"><Check size={12}/></span>
                      </div>
                   </div>
                </div>

                {/* Msg left */}
                <div className="flex flex-col gap-1 mb-6 max-w-[85%]">
                   <div className="flex items-baseline gap-2 ml-10 mb-1">
                      <strong className="text-[11px] text-gray-800">Yacine M.</strong>
                      <span className="text-[9px] text-gray-400 font-medium">10:20</span>
                   </div>
                   <div className="flex gap-2 items-end">
                      <img src="https://ui-avatars.com/api/?name=Y" className="w-8 h-8 rounded-full shadow-sm mb-1" />
                      <div className="bg-gray-100 text-[13px] text-gray-800 p-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-200/50">
                         N'hésite pas à ajouter tes commentaires directement dans le document.
                      </div>
                   </div>
                </div>

                {/* Msg Right */}
                <div className="flex flex-col gap-1 mb-6 max-w-[85%] ml-auto items-end">
                   <div className="flex items-baseline gap-2 mr-10 mb-1">
                      <strong className="text-[11px] text-gray-800">Sofiane Hamidi</strong>
                      <span className="text-[9px] text-gray-400 font-medium">10:25</span>
                   </div>
                   <div className="flex gap-2 items-end flex-row-reverse">
                      <img src="https://ui-avatars.com/api/?name=S" className="w-8 h-8 rounded-full shadow-sm mb-1" />
                      <div className="bg-orange-50 text-[13px] text-gray-800 p-3.5 rounded-2xl rounded-br-sm shadow-[0_1px_2px_rgba(249,115,22,0.15)] border border-orange-100 flex flex-col text-right">
                         <span>J'ai ajouté quelques remarques.<br/>Peux-tu vérifier les chapitres 3 et 5 ?</span>
                         <span className="text-blue-500 self-end mt-0.5"><Check size={12}/></span>
                      </div>
                   </div>
                </div>

                {/* Msg left (typing logic) */}
                <div className="flex flex-col gap-1 mb-2 max-w-[85%]">
                   <div className="flex items-baseline gap-2 ml-10 mb-1">
                      <strong className="text-[11px] text-gray-800">Yacine M.</strong>
                      <span className="text-[9px] text-gray-400 font-medium">10:26</span>
                   </div>
                   <div className="flex gap-2 items-end">
                      <img src="https://ui-avatars.com/api/?name=Y" className="w-8 h-8 rounded-full shadow-sm mb-1" />
                      <div className="flex flex-col gap-1.5">
                        <div className="bg-gray-100 text-[13px] text-gray-800 p-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-200/50">
                           C'est noté, je m'en occupe.
                        </div>
                        <div className="flex gap-1 mt-0.5">
                           <span className="bg-white border border-gray-200 shadow-sm rounded-full px-2 py-0.5 text-[10px] flex items-center gap-1 cursor-pointer hover:bg-gray-50">👍 1</span>
                        </div>
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-2 mt-4 ml-2">
                   <div className="w-6 h-6 rounded-full relative"><img src="https://ui-avatars.com/api/?name=Y" className="w-full h-full rounded-full"/><div className="absolute right-0 bottom-0 w-2 h-2 bg-green-500 border border-white rounded-full"></div></div>
                   <span className="text-[10px] font-medium text-gray-500 italic flex items-center gap-1">Yacine M. est en train d'écrire<span className="typing-dots">...</span></span>
                </div>
             </div>

             {/* Input Area */}
             <div className="p-4 pt-2 border-t border-gray-200">
                
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3 mb-3 text-[11px] font-medium text-gray-600">
                   <Btn icon={Paperclip} label="Pièce jointe" />
                   <Btn icon={FileText} label="Document GED" />
                   <Btn icon={Mail} label="Courrier GED" />
                   <Btn icon={AtSign} label="Mention @" />
                   <Btn icon={Smile} label="Emoji" />
                   <Btn icon={Zap} label="Réponse rapide" />
                   <button className="p-1 hover:bg-gray-100 rounded text-gray-400"><MoreVertical size={14}/></button>
                </div>

                {/* Textbox container */}
                <div className="border border-gray-300 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col relative focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all">
                   <textarea placeholder="Écrire votre message..." className="w-full outline-none p-3 text-[13px] resize-none h-16 bg-transparent" />
                   
                   {/* Rich text bottom bar + Send */}
                   <div className="bg-gray-50/80 border-t border-gray-100 p-2 flex justify-between items-center">
                     <div className="flex items-center gap-1 text-gray-500">
                        <RtfBtn icon={Bold} />
                        <RtfBtn icon={Italic} />
                        <RtfBtn icon={Underline} />
                        <span className="w-px h-4 bg-gray-300 mx-1"></span>
                        <RtfBtn icon={List} />
                        <RtfBtn icon={List} />
                        <span className="w-px h-4 bg-gray-300 mx-1"></span>
                        <RtfBtn icon={Link2} />
                     </div>
                     <div className="flex items-center gap-2">
                        <button className="w-8 h-8 rounded-full border border-gray-200 bg-white shadow-sm flex justify-center items-center text-gray-600 hover:text-gray-900"><Mic size={14}/></button>
                        <button className="w-8 h-8 rounded-full bg-orange-500 flex justify-center items-center text-white shadow-sm shadow-orange-500/30 hover:bg-orange-600 pl-1"><Play size={14} className="fill-current"/></button>
                     </div>
                   </div>
                </div>
             </div>
         </div>

         {/* RIGHT COLUMN: Info Sidebar */}
         <div className="w-[320px] shrink-0 flex flex-col gap-5 overflow-y-auto custom-scrollbar h-full pr-1">
            
            {/* Info Doc */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
               <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-sm">Informations du document</h4>
                  <span className="bg-green-50 border border-green-200 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded">Actif</span>
               </div>
               
               {/* document illustration */}
               <div className="w-full h-32 bg-orange-50/50 rounded-xl mb-4 relative overflow-hidden flex justify-center items-end pb-2">
                 <div className="w-3/4 h-24 relative flex items-center justify-center">
                   <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-16 bg-yellow-600 rounded-lg transform -skew-x-12 opacity-80 z-10 shadow-lg"></div>
                   <div className="absolute w-24 h-28 bg-white border border-gray-200 rounded shadow-md z-20 flex flex-col p-2 gap-1 top-2 rotate-[-5deg]">
                     <div className="h-1 bg-gray-200 w-1/2 rounded"></div>
                     <div className="h-2 bg-gray-300 w-3/4 rounded mt-1"></div>
                     <div className="flex-1"></div>
                     <div className="text-[7px] text-red-500 font-bold border-2 border-red-500 rotate-[-15deg] w-fit p-0.5 mx-auto opacity-70 rounded-sm">IMPORTANT</div>
                   </div>
                   <div className="absolute bottom-2 right-4 w-8 h-12 bg-black rounded shadow-2xl z-30 flex flex-col items-center pt-1"><div className="w-6 h-6 rounded-full bg-gray-800 border-b-2 border-black"></div><div className="w-1 h-3 bg-gray-600 mt-1"></div><div className="w-8 h-2 bg-gray-900 rounded-b mt-auto"></div></div>
                 </div>
               </div>

               <div className="flex flex-col gap-2 text-[10px] font-medium mt-2">
                 <InfoRow icon={FileText} label="Nom" val="Rapport_Production_2024.pdf" />
                 <InfoRow icon={Mail} label="Type" val="Courrier entrant" />
                 <InfoRow icon={RotateCcw} label="Version" val="1.0" />
                 <InfoRow icon={User} label="Auteur" val="Yacine M." />
                 <InfoRow icon={Clock} label="Date réception" val="15/05/2024 à 10:35" />
                 <InfoRow icon={Zap} label="Priorité" val={<span className="text-red-500 bg-red-50 border border-red-100 px-1 py-0.5 rounded font-bold">+ Haute</span>} />
                 <InfoRow icon={Scan} label="Statut OCR" val={<span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle size={10}/> Terminé</span>} />
                 <InfoRow icon={GitBranch} label="Workflow" val="En cours (Validation)" />
               </div>
            </div>

            {/* Participants */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
               <h4 className="font-semibold text-[13px] mb-4">Participants (6)</h4>
               <div className="flex flex-col gap-3">
                  <Participant name="Sofiane Hamidi" role="Administrateur" status="En ligne" icon="S" />
                  <Participant name="Yacine M." role="Chef de service" status="En ligne" icon="Y" />
                  <Participant name="Nadia A." role="Statisticienne" status="Absent" icon="N" />
                  <Participant name="Karim Belkacem" role="Analyste" status="En ligne" icon="K" />
               </div>
               <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <span className="text-[10px] text-gray-500 font-medium">+2 participants</span>
                  <a href="#" className="text-[10px] text-orange-500 font-bold hover:underline">Voir tous</a>
               </div>
            </div>

            {/* Activités */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
               <h4 className="font-semibold text-[13px] mb-4">Activités récentes</h4>
               <div className="flex flex-col gap-4 relative pl-4 border-l-2 border-gray-100">
                  <HistItem type="yellow" icon={<Mail size={10} className="text-yellow-600"/>} title="Courrier reçu" date="15/05/2024 à 10:10" user="Par Yacine M." />
                  <HistItem type="green" icon={<Plus size={10} className="text-green-600"/>} title="Ajouté à GED" date="15/05/2024 à 10:15" user="Par Yacine M." />
                  <HistItem type="green" icon={<Scan size={10} className="text-green-600"/>} title="OCR terminé" date="15/05/2024 à 10:20" user="Système OCR" />
                  <HistItem type="blue" icon={<User size={10} className="text-blue-600"/>} title="Assigné à Sofiane H." date="15/05/2024 à 10:25" />
                  <HistItem type="gray" icon={<MoreVertical size={10} className="text-gray-600"/>} title="Commentaire ajouté" date="15/05/2024 à 10:25" user="Par Sofiane H." last />
               </div>
               <div className="text-center mt-2.5">
                  <a href="#" className="text-[10px] text-orange-500 font-bold hover:underline">Voir tout l'historique</a>
               </div>
            </div>
            
            {/* Notifications */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
               <h4 className="font-semibold text-[13px] mb-4">Notifications récentes</h4>
               <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                     <img src="https://ui-avatars.com/api/?name=N" className="w-6 h-6 rounded-full" />
                     <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-medium leading-tight">Nadia A. vous a mentionné dans un commentaire</span>
                        <span className="text-[8px] text-gray-400">il y a 15 minutes</span>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-transparent mt-1.5 shrink-0"></div>
                     <img src="https://ui-avatars.com/api/?name=Y" className="w-6 h-6 rounded-full" />
                     <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-medium leading-tight">Yacine M. a partagé un document avec vous</span>
                        <span className="text-[8px] text-gray-400">il y a 30 minutes</span>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-transparent mt-1.5 shrink-0"></div>
                     <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 shrink-0"><GitBranch size={10}/></div>
                     <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-medium leading-tight">Workflow "Validation rapport annuel" mis à jour</span>
                        <span className="text-[8px] text-gray-400">il y a 1 heure</span>
                     </div>
                  </div>
               </div>
               <div className="mt-3 pt-3 border-t border-gray-100">
                  <a href="#" className="text-[10px] text-orange-500 font-bold hover:underline">Voir toutes les notifications</a>
               </div>
            </div>

            {/* Shared docs */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-4">
               <h4 className="font-semibold text-[13px] mb-4">Documents partagés (3)</h4>
               <div className="flex flex-col gap-2">
                 <SharedDoc icon="X" bg="bg-green-500" name="Données_Production_2024.xlsx" size="1.1 Mo" />
                 <SharedDoc icon="PDF" bg="bg-red-500" name="Tableau_Synthese_2024.pdf" size="980 Ko" />
                 <SharedDoc icon="PP" bg="bg-orange-500" name="Presentation_Production.pptx" size="1.4 Mo" />
               </div>
               <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                  <a href="#" className="text-[10px] text-orange-500 font-bold hover:underline">Voir tous les documents</a>
               </div>
            </div>
         </div>
      </div>
      
      {/* ─── Fixed Bottom Tool Bar ────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 lg:left-[250px] right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 px-6 flex justify-between items-center z-50">
         <div className="flex gap-2">
            <BtmBtn icon={Link} label="Joindre un document" />
            <div className="w-px h-5 bg-gray-200 mx-2 self-center"></div>
            <BtmBtn icon={CheckCircle} label="Créer une tâche" />
            <BtmBtn icon={GitBranch} label="Lancer workflow" />
         </div>
         
         <div className="flex gap-2 items-center">
            <BtmBtn icon={Mail} label="Marquer comme non lu" />
            <BtmBtn icon={Plus} label="Épingler" />
            <div className="w-px h-5 bg-gray-200 mx-2 self-center"></div>
            <BtmBtn icon={Archive} label="Archiver" />
            <button className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white font-bold text-[11px] rounded-lg shadow-sm hover:bg-red-600 transition-colors">
               <Trash2 size={14}/> Supprimer
            </button>
         </div>
      </div>

    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────── */

function FolderItem({ icon: Icon, label, badge, badgeColor, active }: any) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer ${active ? 'bg-orange-50/70 border border-orange-100' : 'hover:bg-gray-50 border border-transparent'}`}>
       <div className={`flex items-center gap-2 ${active ? 'text-orange-700 font-semibold' : 'text-gray-700 font-medium'}`}>
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
    <div className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${active ? 'bg-orange-50/50 border-orange-100/50 shadow-sm' : 'border-transparent hover:bg-gray-50'}`}>
       <div className="relative shrink-0">
          {isGroup ? (
             <div className="w-10 h-10 border-2 border-gray-100 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 font-bold text-xs">{avatar}</div>
          ) : (
             <img src={`https://ui-avatars.com/api/?name=${avatar}`} className="w-10 h-10 rounded-full" />
          )}
          {online !== undefined && (
             <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          )}
       </div>
       <div className="flex flex-col flex-1 min-w-0 justify-center">
          <div className="flex justify-between items-baseline mb-0.5">
             <strong className="text-xs font-semibold text-gray-900 truncate pr-2">{name}</strong>
             <span className="text-[9px] font-medium text-gray-500 shrink-0">{time}</span>
          </div>
          {title && <span className="text-[10px] font-bold text-gray-800 truncate block leading-tight">{title}</span>}
          <div className="flex justify-between items-center mt-1">
             <span className="text-[10px] text-gray-500 truncate pr-2 block">{msg}</span>
             {badge && <span className="w-4 h-4 bg-orange-500 text-white rounded-full flex justify-center items-center text-[8px] font-bold shrink-0">{badge}</span>}
          </div>
       </div>
    </div>
  );
}

function Btn({ icon: Icon, label }: any) {
  return (
    <div className="flex items-center gap-1.5 cursor-pointer hover:text-orange-500 transition-colors">
      <Icon size={12}/> <span>{label}</span>
    </div>
  );
}

function RtfBtn({ icon: Icon }: any) {
  return <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><Icon size={12}/></button>;
}

function InfoRow({ icon: Icon, label, val }: any) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <Icon size={12} className="text-gray-400 shrink-0" />
      <span className="text-gray-500 w-24 shrink-0">{label}</span>
      <span className="font-semibold text-gray-800 flex-1 truncate">{val}</span>
    </div>
  );
}

function Participant({ name, role, status, icon }: any) {
  return (
    <div className="flex justify-between items-center text-[11px]">
      <div className="flex items-center gap-2">
         <img src={`https://ui-avatars.com/api/?name=${icon}`} className="w-6 h-6 rounded-full" />
         <div className="flex flex-col">
            <strong className="text-gray-800 leading-tight">{name}</strong>
            <span className="text-[9px] text-gray-500 leading-tight block">{role}</span>
         </div>
      </div>
      <strong className={status === 'En ligne' ? 'text-green-500' : 'text-gray-400'}>{status}</strong>
    </div>
  );
}

function HistItem({ icon, title, date, user, type, last }: any) {
  const tColor = type==='yellow'?'bg-yellow-100 border-yellow-200':type==='green'?'bg-green-100 border-green-200':type==='blue'?'bg-blue-100 border-blue-200':'bg-gray-100 border-gray-200';
  return (
    <div className="relative">
      <div className={`absolute -left-[23px] top-0 w-4 h-4 rounded-full border border-white flex items-center justify-center shadow-sm z-10 ${tColor}`}>
         {icon}
      </div>
      <div className={`flex flex-col gap-0.5 ${!last ? 'mb-2 pb-1' : ''}`}>
        <strong className="text-[11px] font-semibold text-gray-800">{title}</strong>
        <span className="text-[9px] font-medium text-gray-500">{date}</span>
        {user && <span className="text-[9px] text-gray-400">{user}</span>}
      </div>
    </div>
  );
}

function SharedDoc({ icon, bg, name, size }: any) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 rounded-md flex justify-center items-center text-white text-[9px] font-bold shrink-0 ${bg}`}>{icon}</div>
      <div className="flex flex-col min-w-0">
        <strong className="text-[10px] font-semibold text-gray-800 truncate">{name}</strong>
        <span className="text-[9px] text-gray-500">{size}</span>
      </div>
    </div>
  );
}

function BtmBtn({ icon: Icon, label }: any) {
  return (
    <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-lg text-gray-600 font-semibold text-[11px] transition-colors shrink-0">
      <Icon size={14}/> {label}
    </button>
  );
}
