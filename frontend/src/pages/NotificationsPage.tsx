import { Bell, FileText, Mail, Eye, MessageSquare, Send, Archive, GitBranch, CheckCircle, ChevronRight, LayoutGrid } from 'lucide-react';

export function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6 font-poppins pb-10 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center shadow-sm">
          <Bell size={26} className="text-orange-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-oswald text-gray-900 dark:text-gray-100">Notifications</h2>
          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400 mt-0.5">
            <span>Accueil</span> <span>›</span> <span className="text-orange-500 font-semibold">Notifications</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs + Actions */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 flex-wrap flex-1">
          {[
            { label: 'Tous', icon: LayoutGrid, active: true },
            { label: 'Documents', icon: FileText },
            { label: 'Courriers', icon: Mail },
            { label: 'Diffusion', icon: Send },
            { label: 'OCR', icon: Eye },
            { label: 'Commentaires', icon: MessageSquare },
          ].map(({ label, icon: Icon, active }) => (
            <button key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
              ${active ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <Icon size={13}/> {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-1.5"><CheckCircle size={13}/> Marquer comme lu</button>
          <button className="px-3 py-1.5 bg-yellow-400 text-gray-900 rounded-lg text-xs font-bold hover:bg-yellow-500 flex items-center gap-1.5"><CheckCircle size={13}/> Tout marquer comme lu</button>
        </div>
      </div>

      {/* Notification Groups */}
      <div className="flex flex-col gap-6">
        <NotifGroup label="AUJOURD'HUI" >
          <NotifItem icon={FileText} iconBg="bg-blue-100" iconColor="text-blue-500" title="Nouveau document ajouté" desc='Le document "Rapport_Annuel_2024.pdf" a été ajouté par Sophie Martin.' time="il y a 10 min" unread />
          <NotifItem icon={Mail} iconBg="bg-orange-100" iconColor="text-orange-500" title="Nouveau courrier reçu" desc="Courrier entrant CE-2024-0587 de Ministère de l'Agriculture." time="il y a 25 min" unread />
          <NotifItem icon={Eye} iconBg="bg-green-100" iconColor="text-green-500" title="OCR terminé" desc='Le traitement OCR du document "Facture_2026_001.pdf" est terminé.' time="il y a 1 h" unread />
          <NotifItem icon={MessageSquare} iconBg="bg-purple-100" iconColor="text-purple-500" title="Commentaire ajouté" desc='Julien Moreau a commenté le document "Dossier_Contrats_2024".' time="il y a 2 h" unread />
        </NotifGroup>

        <NotifGroup label="HIER">
          <NotifItem icon={Send} iconBg="bg-teal-100" iconColor="text-teal-500" title="Diffusion effectuée" desc='Le document "Plan_Projet_Agrodiv.pdf" a été diffusé à 5 utilisateurs.' time="Hier, 16:45" />
          <NotifItem icon={FileText} iconBg="bg-blue-100" iconColor="text-blue-500" title="Document modifié" desc='Le document "Budget_Previsionnel.xlsx" a été modifié par Marc Lefevre.' time="Hier, 11:20" />
        </NotifGroup>

        <NotifGroup label="CETTE SEMAINE">
          <NotifItem icon={GitBranch} iconBg="bg-green-100" iconColor="text-green-500" title="Nouvelle version créée" desc='Une nouvelle version (v2) du document "Note_Interne_0526.docx" a été créée.' time="Mar 20/05, 14:30" />
          <NotifItem icon={Mail} iconBg="bg-orange-100" iconColor="text-orange-500" title="Courrier validé" desc="Le courrier CE-2024-0583 a été validé par Yacine M." time="Mar 20/05, 09:15" />
          <NotifItem icon={Archive} iconBg="bg-gray-100" iconColor="text-gray-500" title="Document archivé" desc='Le document "Archives_2019.pdf" a été archivé.' time="Lun 19/05, 17:40" />
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
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col divide-y divide-gray-100">
        {children}
      </div>
    </div>
  );
}

function NotifItem({ icon: Icon, iconBg, iconColor, title, desc, time, unread }: any) {
  return (
    <div className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50/80 transition-colors cursor-pointer group ${unread ? 'bg-orange-50/30' : ''}`}>
      <div className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
        <Icon size={17}/>
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <strong className={`text-[13px] leading-snug ${unread ? 'text-gray-900 font-bold' : 'text-gray-700 font-semibold'}`}>{title}</strong>
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
