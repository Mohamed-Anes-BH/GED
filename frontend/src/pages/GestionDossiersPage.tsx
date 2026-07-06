import { useState } from 'react';
import {
  Folder, FileText, Users, HardDrive, Archive, Upload, Share, Download, Trash2, Edit2, CheckCircle, Clock, Check, MoreVertical, Search, ChevronRight, ChevronDown, Plus, Filter, LayoutGrid, Eye, PlayCircle, MapPin, Star
} from 'lucide-react';

export function GestionDosssiersPage() {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'admin': true,
    'dir_gen': true,
  });

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col gap-5 pb-20 font-poppins">
      {/* Top Header */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold font-oswald text-gray-900 dark:text-gray-100 m-0 leading-none">Gestion des dossiers</h2>
          <p className="text-[13px] text-gray-500 m-0">Organisez, structurez et gérez tous vos dossiers et sous-dossiers.</p>
          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400 mt-1">
             <span>Accueil</span> <span>›</span> <span className="text-gray-900 font-semibold dark:text-gray-100">Dossiers</span>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           <input type="text" placeholder="Rechercher un dossier, un document..." className="pl-9 pr-12 py-2 w-[380px] bg-white border border-gray-200 rounded-xl text-[13px] outline-none shadow-sm focus:border-orange-500" />
           <div className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center text-[10px] text-gray-500 font-medium font-inter border border-gray-200">⌘K</div>
        </div>
      </div>

      {/* 6 Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
         <KpiCard icon={Folder} color="text-orange-500" bg="bg-orange-100" label="Dossiers" value="48" trend="+12.5% ce mois" />
         <KpiCard icon={Folder} color="text-purple-500" bg="bg-purple-100" label="Sous-dossiers" value="132" trend="+8.3% ce mois" />
         <KpiCard icon={FileText} color="text-green-500" bg="bg-green-100" label="Documents" value="1,248" trend="+15.7% ce mois" />
         <KpiCard icon={Archive} color="text-yellow-600" bg="bg-yellow-100" label="Archives" value="356" trend="+6.1% ce mois" />
         <KpiCard icon={Users} color="text-blue-500" bg="bg-blue-100" label="Utilisateurs avec accès" value="86" trend="+9.4% ce mois" />
         <KpiCard icon={HardDrive} color="text-orange-600" bg="bg-orange-100" label="Taille totale" value="24.7 Go" trend="+2.4 Go ce mois" />
      </div>

      {/* Main 3 Column Layout */}
      <div className="flex flex-col xl:flex-row gap-5 items-start">
        
        {/* LEFT COL: Arborescence */}
        <div className="w-full xl:w-[280px] shrink-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
           <h3 className="font-semibold text-sm text-gray-800 font-poppins">Arborescence des dossiers</h3>
           
           <div className="relative">
             <input type="text" placeholder="Rechercher dans l'arborescence..." className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-orange-500" />
             <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
           </div>
           
           <div className="flex flex-col gap-1 text-[13px] font-medium mt-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {/* Folder Node: Administration */}
              <FolderNode label="Administration" id="admin" count={12} isOpen={expandedFolders['admin']} onToggle={() => toggleFolder('admin')}>
                 <FolderNode label="Direction Générale" id="dir_gen" count={24} isOpen={expandedFolders['dir_gen']} onToggle={() => toggleFolder('dir_gen')} isChild active>
                    <FileNode label="Rapports" count={8} />
                    <FileNode label="Contrats" count={6} />
                    <FileNode label="Courriers" count={10} />
                 </FolderNode>
                 <FolderNode label="Ressources Humaines" id="rh" count={18} isOpen={expandedFolders['rh']} onToggle={() => toggleFolder('rh')} isChild >
                    <FileNode label="Personnel" count={12} />
                    <FileNode label="Recrutement" count={6} />
                 </FolderNode>
                 <FolderNode label="Comptabilité" id="comp" count={15} isOpen={expandedFolders['comp']} onToggle={() => toggleFolder('comp')} isChild >
                    <FileNode label="Budgets" count={7} />
                    <FileNode label="Factures" count={8} />
                 </FolderNode>
              </FolderNode>

              <FolderNode label="Agriculture" id="agri" count={30} isOpen={expandedFolders['agri']} onToggle={() => toggleFolder('agri')}>
                 <FileNode label="Production" count={12} />
                 <FileNode label="Irrigation" count={8} />
                 <FileNode label="Export" count={10} />
              </FolderNode>

              <FolderNode label="Projets" id="proj" count={9} isOpen={expandedFolders['proj']} onToggle={() => toggleFolder('proj')} />
              <FolderNode label="Archives" id="arch" count={45} isOpen={expandedFolders['arch']} onToggle={() => toggleFolder('arch')} />
              <FolderNode label="Corbeille" id="corb" count={7} isOpen={expandedFolders['corb']} onToggle={() => toggleFolder('corb')} />
           </div>

           <button className="flex w-full mt-4 justify-center items-center gap-2 py-2.5 border border-orange-500 text-orange-500 rounded-xl text-xs font-semibold hover:bg-orange-50 transition-colors">
              <Plus size={16}/> Nouveau dossier
           </button>
        </div>

        {/* MIDDLE COL: Main Area */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">
           
           {/* Folder Content Table Area */}
           <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm overflow-x-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="font-semibold text-[15px] flex items-center gap-2 text-gray-900">
                      Contenu du dossier : Direction Générale <Star size={16} className="text-yellow-400 fill-current ml-1" />
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">24 documents • 3 sous-dossiers</p>
                 </div>
                 <div className="flex gap-2">
                    <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"><Folder size={16}/></button>
                    <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"><Upload size={16}/></button>
                    <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"><Share size={16}/></button>
                    <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"><Filter size={16}/></button>
                    <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 bg-gray-50"><MoreVertical size={16}/></button>
                 </div>
              </div>

              {/* Table */}
              <table className="w-full text-[13px] text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-100 font-medium">
                    <th className="pb-3 px-2 font-medium">Nom</th>
                    <th className="pb-3 px-2 font-medium">Type</th>
                    <th className="pb-3 px-2 font-medium">Auteur</th>
                    <th className="pb-3 px-2 font-medium">Date</th>
                    <th className="pb-3 px-2 font-medium">Version</th>
                    <th className="pb-3 px-2 font-medium text-center">OCR</th>
                    <th className="pb-3 px-2 font-medium">Workflow</th>
                    <th className="pb-3 px-2 font-medium text-right">Taille</th>
                    <th className="pb-3 px-2 font-medium text-center">Statut</th>
                    <th className="pb-3 px-2 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  <TableRow name="Rapports" isFolder type="Dossier" author="Sofiane H." date="15/05/2024" size="8.4 Go" status="Actif" />
                  <TableRow name="Contrats" isFolder type="Dossier" author="Nadia A." date="14/05/2024" size="6.2 Go" status="Actif" />
                  <TableRow name="Courriers" isFolder type="Dossier" author="Yacine M." date="13/05/2024" size="3.1 Go" status="Actif" />
                  <TableRow name="Rapport_Annuel_2024.pdf" icon="PDF" color="bg-red-100 text-red-600" type="PDF" author="Yacine M." date="15/05/2024" version="5.0" ocr={true} wf="Validation" size="2.4 Mo" status="Validé" />
                  <TableRow name="Plan_Strategique_2024.pdf" icon="PDF" color="bg-red-100 text-red-600" type="PDF" author="Sofiane H." date="14/05/2024" version="2.0" ocr={true} wf="Validation" size="1.8 Mo" status="Validé" />
                  <TableRow name="Compte_Rendu_Reunion.docx" icon="DOCX" color="bg-teal-100 text-teal-600" type="DOCX" author="Nadia A." date="13/05/2024" version="1.0" ocr={false} wf="Approbation" size="856 Ko" status="En cours" />
                  <TableRow name="Budget_Previsionnel_2024.xlsx" icon="XLSX" color="bg-green-100 text-green-600" type="PDF" author="Karim B." date="12/05/2024" version="3.0" ocr={true} wf="Validation" size="1.2 Mo" status="Validé" />
                  <TableRow name="Présentation_DG.pptx" icon="PPTX" color="bg-orange-100 text-orange-600" type="PDF" author="Yacine M." date="11/05/2024" version="1.0" ocr={false} wf="Diffusion" size="3.6 Mo" status="Diffusé" />
                  <TableRow name="Note_Interne_15_05_2024.pdf" icon="PDF" color="bg-red-100 text-red-600" type="PDF" author="Sofiane H." date="10/05/2024" version="1.0" ocr={true} wf="Validation" size="420 Ko" status="Validé" />
                </tbody>
              </table>
              <div className="flex justify-between items-center mt-5 text-[11px] text-gray-500">
                <span>Affichage de 1 à 10 sur 24 éléments</span>
                <div className="flex items-center gap-2">
                   <button className="px-2 py-1 border border-gray-200 rounded">&lt;</button>
                   <button className="px-2.5 py-1 border border-orange-500 bg-orange-50 text-orange-600 rounded font-semibold">1</button>
                   <button className="px-2.5 py-1 border border-transparent rounded hover:bg-gray-50">2</button>
                   <button className="px-2.5 py-1 border border-transparent rounded hover:bg-gray-50">3</button>
                   <button className="px-2 py-1 border border-gray-200 rounded">&gt;</button>
                   <select className="border border-gray-200 rounded py-1 px-2 outline-none ml-2"><option>10 / page</option></select>
                </div>
              </div>
           </div>

           {/* Metrics Row Below Table */}
           <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
              
              {/* Stats Dossier */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm lg:col-span-1">
                 <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-[13px]">Statistiques du dossier</h3><select className="text-[10px] border border-gray-200 rounded px-1 py-0.5"><option>Ce mois</option></select></div>
                 <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full border-8 border-gray-100 relative flex items-center justify-center">
                       <div className="absolute inset-0 rounded-full border-8 border-orange-500 border-r-transparent border-b-transparent transform rotate-45"></div>
                       <div className="absolute inset-0 rounded-full border-8 border-blue-500 border-l-transparent border-b-transparent transform rotate-12"></div>
                       <div className="absolute inset-0 rounded-full border-8 border-green-500 border-t-transparent border-b-transparent border-l-transparent transform rotate-90"></div>
                       <div className="flex flex-col items-center"><strong className="text-xl font-bold font-oswald text-gray-800 leading-none">21</strong><span className="text-[9px] text-gray-500">Documents</span></div>
                    </div>
                    <div className="flex flex-col gap-2 text-[10px] flex-1">
                       <LegendItem color="bg-orange-500" label="PDF" val="10 (47.6%)" />
                       <LegendItem color="bg-blue-500" label="DOCX" val="4 (19.0%)" />
                       <LegendItem color="bg-green-500" label="XLSX" val="3 (14.3%)" />
                       <LegendItem color="bg-yellow-500" label="PPTX" val="2 (9.5%)" />
                       <LegendItem color="bg-gray-400" label="Autres" val="2 (9.5%)" />
                    </div>
                 </div>
                 <div className="mt-5">
                    <div className="flex justify-between text-[10px] font-medium mb-1"><span className="text-gray-500">Occupation disque</span><span className="text-gray-800">17.7 Go / 50 Go</span></div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="w-[35%] h-full bg-green-500"></div></div>
                    <div className="text-right text-[9px] font-bold text-green-600 mt-1">35%</div>
                 </div>
              </div>

              {/* Documents Récents */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm lg:col-span-1 flex flex-col">
                 <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-[13px]">Documents récents</h3><a href="#" className="text-[10px] text-orange-500 hover:underline">Voir tout</a></div>
                 <div className="flex flex-col gap-4 flex-1">
                    <RecentDoc name="Rapport_Annuel_2024.pdf" by="Modifié par Yacine M." tag="v5.0" icon="PDF" color="bg-red-100 text-red-600" />
                    <RecentDoc name="Plan_Strategique_2024.pdf" by="Modifié par Sofiane H." tag="v2.0" icon="PDF" color="bg-red-100 text-red-600" />
                    <RecentDoc name="Compte_Rendu_Reunion.docx" by="Modifié par Nadia A." tag="v1.0" icon="DOCX" color="bg-blue-100 text-blue-600" />
                    <RecentDoc name="Budget_Previsionnel_2024.xlsx" by="Modifié par Karim B." tag="v3.0" icon="XLSX" color="bg-green-100 text-green-600" />
                    <RecentDoc name="Présentation_DG.pptx" by="Modifié par Yacine M." tag="v1.0" icon="PPTX" color="bg-orange-100 text-orange-600" />
                 </div>
              </div>

              {/* Permissions */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm lg:col-span-1">
                 <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-[13px]">Permissions</h3><a href="#" className="text-[10px] text-orange-500 hover:underline">Gérer les accès</a></div>
                 <div className="flex flex-col gap-4">
                    <div className="flex justify-end gap-2 pr-2 text-gray-400">
                    <div title="Lecture"><Eye size={12} /></div>
                    <div title="Écriture"><Edit2 size={12} /></div>
                    <div title="Partage"><Share size={12} /></div>
                    <div title="Suppression"><Trash2 size={12} /></div>
                    </div>
                    <UserPerm name="Yacine M." role="Propriétaire" perms={[1,1,1,1]} img="Yacine" />
                    <UserPerm name="Sofiane H." role="Administrateur" perms={[1,1,1,1]} img="Sofiane" />
                    <UserPerm name="Nadia A." role="Éditeur" perms={[1,1,1,0]} img="Nadia" />
                    <UserPerm name="Karim B." role="Lecteur" perms={[1,0,0,0]} img="Karim" />
                    <UserPerm name="Membre RH" role="Lecteur" perms={[1,0,0,0]} img="RH" />
                 </div>
                 <button className="w-full mt-4 py-2 border border-orange-200 text-orange-500 rounded-lg text-xs font-semibold hover:bg-orange-50 transition-colors">+ Ajouter un utilisateur</button>
              </div>

              {/* Activité récente */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm lg:col-span-1 flex flex-col">
                 <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-[13px]">Activité récente</h3><a href="#" className="text-[10px] text-orange-500 hover:underline">Voir tout</a></div>
                 <div className="flex flex-col gap-3 relative flex-1">
                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200"></div>
                    <TimelineItem date="15/05/2024 à 10:35" title="Document modifié" desc="Rapport_Annuel_2024.pdf par Yacine M." color="bg-green-500" />
                    <TimelineItem date="15/05/2024 à 09:40" title="Document ajouté" desc="Note_Interne_15_05_2024.pdf par Sofiane H." color="bg-green-500" />
                    <TimelineItem date="14/05/2024 à 16:20" title="Dossier créé" desc="Contrats par Nadia A." color="bg-orange-500" />
                    <TimelineItem date="14/05/2024 à 11:15" title="Document déplacé" desc="Plan_Strategique_2024.pdf déplacé" color="bg-blue-500" />
                    <TimelineItem date="13/05/2024 à 15:10" title="Document validé" desc="Compte_Rendu_Reunion.docx" color="bg-green-500" isLast />
                 </div>
              </div>
           </div>

        </div>

        {/* RIGHT COL: Informations du dossier */}
        <div className="w-full xl:w-[280px] shrink-0 flex flex-col gap-5">
           
           <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col shadow-sm overflow-hidden p-5 pb-6">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="font-semibold text-sm">Informations du dossier</h3>
                 <span className="px-2 py-0.5 rounded bg-green-50 text-green-600 text-[9px] font-bold border border-green-100">Actif</span>
              </div>
              
              <div className="h-32 bg-[#FDFDFD] relative flex items-center justify-center my-4">
                 {/* Folder Graphic Mockup */}
                 <div className="w-28 h-20 bg-orange-400 rounded-lg relative shadow-md flex items-end justify-center pb-2">
                    <div className="absolute top-[-10px] left-0 w-12 h-6 bg-orange-400 rounded-tl-lg rounded-tr-lg"></div>
                    <div className="absolute w-24 h-18 bg-white/90 rounded-md top-2 left-2 flex flex-col gap-1.5 p-2 shadow-sm border border-gray-100">
                      <div className="w-full h-1 bg-gray-200 rounded-full"></div>
                      <div className="w-3/4 h-1 bg-gray-200 rounded-full"></div>
                      <div className="w-full h-1 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="absolute inset-0 bg-yellow-400 rounded-lg transform shadow-sm origin-bottom rotate-[-5deg] flex items-center justify-center text-white/50 opacity-90"><Folder size={40}/></div>
                 </div>
              </div>
              
              <div className="flex flex-col gap-2 text-[11px] font-medium font-poppins">
                 <div className="flex justify-between pb-2 border-b border-gray-100 text-gray-800"><span className="text-gray-500">Nom</span><span className="flex items-center gap-1 font-semibold flex-1 justify-end">Direction Générale <Edit2 size={12} className="text-gray-400 cursor-pointer"/></span></div>
                 <div className="flex justify-between pb-2 border-b border-gray-100 text-gray-800"><span className="text-gray-500">Description</span><span className="text-right flex-1 ml-4 truncate">Dossiers relatifs à la direction générale</span></div>
                 <div className="flex justify-between pb-2 border-b border-gray-100 text-gray-800"><span className="text-gray-500">Responsable</span><span>Yacine M.</span></div>
                 <div className="flex justify-between pb-2 border-b border-gray-100 text-gray-800"><span className="text-gray-500">Département</span><span>Administration</span></div>
                 <div className="flex justify-between pb-2 border-b border-gray-100 text-gray-800"><span className="text-gray-500">Service</span><span>Direction Générale</span></div>
                 <div className="flex justify-between pb-2 border-b border-gray-100 text-gray-800"><span className="text-gray-500">Nombre de documents</span><span>21</span></div>
                 <div className="flex justify-between pb-2 border-b border-gray-100 text-gray-800"><span className="text-gray-500">Nombre de sous-dossiers</span><span>3</span></div>
                 <div className="flex justify-between pb-2 border-b border-gray-100 text-gray-800"><span className="text-gray-500">Taille</span><span>17.7 Go</span></div>
                 <div className="flex justify-between pb-2 border-b border-gray-100 text-gray-800"><span className="text-gray-500">Workflow par défaut</span><span>Validation rapport annuel</span></div>
                 <div className="flex justify-between pb-2 border-b border-gray-100 text-gray-800"><span className="text-gray-500">OCR par défaut</span><span className="text-green-600 font-bold">Activé</span></div>
                 <div className="flex justify-between text-gray-800"><span className="text-gray-500">Dernière modification</span><span>15/05/2024 à 10:35</span></div>
              </div>
           </div>

           {/* Emplacement physique */}
           <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
             <h3 className="font-semibold text-sm mb-4">Emplacement physique</h3>
             <div className="flex flex-col relative pl-4 border-l-2 border-orange-200 gap-3 text-[11px] font-medium">
                <div className="relative"><div className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-white"></div> Administration</div>
                <div className="relative"><div className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-white"></div> Bâtiment A</div>
                <div className="relative"><div className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-white"></div> Bureau Direction Générale</div>
                <div className="relative"><div className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-white"></div> Armoire 2</div>
                <div className="relative"><div className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-white"></div> Étagère 1</div>
                <div className="relative font-bold text-orange-600"><div className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-orange-600 border-2 border-white"></div> Boîte 07</div>
             </div>
           </div>

           {/* Favoris du dossier */}
           <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
             <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-sm">Favoris du dossier</h3><a href="#" className="text-[10px] text-orange-500 hover:underline">Voir tout</a></div>
             <div className="flex flex-col gap-2">
                <FavoriteDoc name="Rapport_Annuel_2024.pdf" />
                <FavoriteDoc name="Plan_Strategique_2024.pdf" />
                <FavoriteDoc name="Budget_Previsionnel_2024.xlsx" />
             </div>
           </div>

        </div>
      </div>

    </div>
  );
}

/* ─── SUB COMPONENTS ────────────────────────────────────────── */

function KpiCard({ icon: Icon, color, bg, label, value, trend }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm flex items-start justify-between">
      <div className="flex flex-col h-full justify-between gap-1">
         <span className="text-[11px] font-semibold text-gray-500 font-poppins">{label}</span>
         <span className="text-2xl font-bold font-oswald text-gray-900">{value}</span>
         <span className="text-[10px] font-bold text-green-600 font-poppins">{trend}</span>
      </div>
      <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center`}>
         <Icon size={20} />
      </div>
    </div>
  );
}

function FolderNode({ label, id, count, isOpen, onToggle, isChild, active, children }: any) {
  return (
    <div className="flex flex-col">
       <div className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer ${active ? 'bg-orange-50' : 'hover:bg-gray-50'}`} onClick={onToggle}>
         <button className="p-0.5 text-gray-400">
           {children ? <ChevronDown size={14} className={`transform transition-transform ${isOpen ? '' : '-rotate-90'}`} /> : <div className="w-3.5"/>}
         </button>
         <Folder size={16} className={active ? 'text-orange-500 fill-orange-200' : 'text-yellow-500 fill-yellow-200'} strokeWidth={1.5} />
         <span className={`flex-1 truncate ${active ? 'font-semibold text-orange-700' : 'text-gray-700'}`}>{label}</span>
         {count && <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-bold">{count}</span>}
       </div>
       {isOpen && children && (
         <div className="ml-6 pl-2 border-l border-gray-200 flex flex-col gap-0.5 mt-1">
           {children}
         </div>
       )}
    </div>
  );
}

function FileNode({ label, count }: any) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer hover:bg-gray-50 text-gray-600">
      <div className="w-3.5"/>
      <Folder size={16} className="text-yellow-500 fill-yellow-100" strokeWidth={1.5} />
      <span className="flex-1 truncate">{label}</span>
      {count && <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-bold">{count}</span>}
    </div>
  );
}

function TableRow({ name, isFolder, type, author, date, version, ocr, wf, size, status, icon, color }: any) {
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/80 cursor-pointer group">
      <td className="py-2.5 px-2 flex items-center gap-2">
         {isFolder ? (
           <Folder size={18} className="text-yellow-500 fill-yellow-200 shrink-0" />
         ) : (
           <div className={`w-6 h-6 rounded-md flex justify-center items-center text-[8px] font-bold shrink-0 ${color}`}>{icon}</div>
         )}
         <span className={`font-semibold ${isFolder ? 'text-gray-900' : 'text-gray-700'}`}>{name}</span>
      </td>
      <td className="py-2.5 px-2 text-gray-500 text-xs">{type}</td>
      <td className="py-2.5 px-2 flex items-center gap-1.5">
         <img src={`https://ui-avatars.com/api/?name=${author.replace(' ','+')}`} className="w-5 h-5 rounded-full" />
         <span>{author}</span>
      </td>
      <td className="py-2.5 px-2">{date}</td>
      <td className="py-2.5 px-2 text-gray-500">{version || '-'}</td>
      <td className="py-2.5 px-2 text-center text-green-500">
         {ocr ? <CheckCircle size={14} className="mx-auto" /> : <span className="text-gray-300">-</span>}
      </td>
      <td className="py-2.5 px-2 text-gray-500 text-xs">{wf || '-'}</td>
      <td className="py-2.5 px-2 text-right font-medium">{size}</td>
      <td className="py-2.5 px-2 text-center">
         <span className={`px-2 py-0.5 text-[10px] rounded flex items-center justify-center gap-1 w-max mx-auto border font-bold
           ${status==='Actif'?'bg-green-50 text-green-600 py-0.5 border-green-200':
             status==='Validé'?'bg-emerald-50 text-emerald-600 border-none':
             status==='En cours'?'bg-yellow-50 text-yellow-600 border-none':
             status==='Diffusé'?'bg-blue-50 text-blue-600 border-none':''}`}>
            {status}
         </span>
      </td>
      <td className="py-2.5 px-2">
         <div className="flex justify-center items-center gap-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
           <Eye size={14} className="hover:text-gray-800" />
           <Download size={14} className="hover:text-gray-800" />
           <MoreVertical size={14} className="hover:text-gray-800" />
         </div>
      </td>
    </tr>
  );
}

function LegendItem({ color, label, val }: any) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${color}`}></div><span className="text-gray-500">{label}</span></div>
      <span className="font-medium text-gray-700">{val}</span>
    </div>
  );
}

function RecentDoc({ name, by, tag, icon, color }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex justify-center items-center text-[9px] font-bold shrink-0 ${color}`}>{icon}</div>
      <div className="flex flex-col flex-1 truncate">
         <strong className="text-xs font-semibold text-gray-800 truncate">{name}</strong>
         <span className="text-[10px] text-gray-500 truncate">{by}</span>
      </div>
      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[9px] rounded font-bold shrink-0">{tag}</span>
    </div>
  );
}

function UserPerm({ name, role, perms, img }: any) {
  // perms is array of 4 booleans: read, write, share, delete
  return (
    <div className="flex items-center justify-between">
       <div className="flex items-center gap-2 w-[120px]">
          <img src={`https://ui-avatars.com/api/?name=${img}`} className="w-6 h-6 rounded-full" />
          <div className="flex flex-col text-xs"><strong className="text-gray-800">{name}</strong><span className="text-[9px] text-gray-500 leading-tight">{role}</span></div>
       </div>
       <div className="flex justify-end gap-5 pr-2">
         {perms.map((p:any, i:any) => p ? <CheckCircle size={12} className="text-green-500" key={i}/> : <div className="w-3 h-0.5 bg-gray-300" key={i}/>)}
       </div>
    </div>
  );
}

function TimelineItem({ date, title, desc, color, isLast }: any) {
  return (
    <div className="relative pl-6">
      <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-white ${color} z-10 shadow-sm`}></div>
      <div className={`flex flex-col ${!isLast ? 'mb-4' : ''}`}>
         <span className="text-[9px] font-semibold text-gray-400">{date}</span>
         <strong className="text-[11px] font-semibold text-gray-800">{title}</strong>
         <span className="text-[10px] text-gray-500">{desc}</span>
      </div>
    </div>
  );
}

function FavoriteDoc({ name }: any) {
  return (
    <div className="flex items-center gap-2 group">
      <Star size={14} className="text-yellow-400 fill-current shrink-0" />
      <span className="text-xs font-medium text-gray-700 flex-1 truncate group-hover:text-orange-500 cursor-pointer">{name}</span>
      <MoreVertical size={14} className="text-gray-400 cursor-pointer opacity-0 group-hover:opacity-100" />
    </div>
  );
}
