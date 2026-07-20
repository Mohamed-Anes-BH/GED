import { useState } from 'react';
import { 
  GitBranch, FileText, Clock, CheckCircle, XCircle, Search, Filter, Plus, 
  MoreVertical, Edit2, Archive, Play, Link, User, ArrowRight, Save, Copy, 
  Trash2, Mail, Bell, Settings, Download, Move, ChevronDown, Star, Share, Eye, ChevronRight
} from 'lucide-react';
import { useWorkflows } from '../hooks/useWorkflows';
import { formatDate } from '../utils/formatters';

export function WorkflowPage() {
  const { workflows, kpis, loading } = useWorkflows();
  return (
    <div className="flex flex-col gap-6 font-poppins pb-24">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <h2 className="text-[28px] font-bold font-oswald text-gray-900 dark:text-[#FFFFFF] leading-tight">Workflow (Circuit de validation)</h2>
          <p className="text-[13px] text-gray-500">Créez, gérez et suivez les circuits de validation des documents et courriers.</p>
          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400 mt-1">
             <span>Accueil</span> <span>›</span> <span className="text-gray-900 dark:text-[#FFFFFF] font-semibold dark:text-[#FFFFFF]">Workflow</span>
          </div>
        </div>
      </div>

      {/* ─── 6 KPIs Top Row ────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
         <KpiBox icon={GitBranch} color="text-orange-500" bg="bg-orange-100" label="Workflows actifs" value={loading ? '...' : (kpis?.actifs || 24)} trend="↑ 14.3% ce mois" trendColor="text-green-500" />
         <KpiBox icon={FileText} color="text-yellow-600" bg="bg-yellow-100" label="Docs en validation" value={loading ? '...' : (kpis?.docs_validation || 186)} trend="↑ 11.7% ce mois" trendColor="text-green-500" />
         <KpiBox icon={Clock} color="text-purple-500" bg="bg-purple-100" label="Étapes en attente" value={loading ? '...' : (kpis?.etapes_attente || 47)} trend="↓ -5.2% ce mois" trendColor="text-red-500" />
         <KpiBox icon={CheckCircle} color="text-green-500" bg="bg-green-100" label="Validés aujourd'hui" value={loading ? '...' : (kpis?.valides_today || 58)} trend="↑ 20.8% ce jour" trendColor="text-green-500" />
         <KpiBox icon={XCircle} color="text-red-500" bg="bg-red-100" label="Rejetés aujourd'hui" value={loading ? '...' : (kpis?.rejetes_today || 8)} trend="↓ -11.1% ce jour" trendColor="text-red-500" />
         <KpiBox icon={Clock} color="text-blue-500" bg="bg-blue-100" label="Temps moyen validation" value="2.4 j" trend="↓ -0.6 j ce mois" trendColor="text-green-500" />
      </div>

      {/* ─── Main Content Split ────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row gap-5 items-start">
         
         {/* Left Area (Table + Visual Editor) */}
         <div className="flex-1 flex flex-col gap-6 min-w-0 w-full">
            
            {/* Workflows Table */}
            <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-5 shadow-sm overflow-hidden flex flex-col">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-sm">Liste des workflows</h3>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg text-xs font-semibold hover:bg-orange-100">
                    <Plus size={14}/> Nouveau workflow
                  </button>
               </div>
               
               <div className="flex justify-between items-center mb-4">
                 <div className="relative">
                   <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                   <input type="text" placeholder="Rechercher un workflow..." className="pl-8 pr-4 py-1.5 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-xs w-64 outline-none" />
                 </div>
                 <button className="p-1.5 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]"><Filter size={14}/></button>
               </div>

               <div className="overflow-x-auto custom-scrollbar">
                 <table className="w-full text-left text-xs whitespace-nowrap">
                   <thead>
                     <tr className="border-b border-gray-100 dark:border-[var(--dash-border)] text-gray-500 font-medium">
                       <th className="py-2.5 px-2 font-medium">Nom du workflow</th>
                       <th className="py-2.5 px-2 font-medium">Type de document</th>
                       <th className="py-2.5 px-2 font-medium">Département</th>
                       <th className="py-2.5 px-2 font-medium text-center">Étapes</th>
                       <th className="py-2.5 px-2 font-medium">Responsable</th>
                       <th className="py-2.5 px-2 font-medium text-center">Docs concernés</th>
                       <th className="py-2.5 px-2 font-medium text-center">Statut</th>
                       <th className="py-2.5 px-2 font-medium">Dernière modif.</th>
                       <th className="py-2.5 px-2 font-medium text-center">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="text-gray-800 dark:text-[var(--dash-text)]">
                     {loading ? (
                         <tr><td colSpan={9} className="text-center py-4 text-gray-500">Chargement...</td></tr>
                     ) : (
                         workflows.map((wf) => (
                             <WfRow key={wf.id} name={wf.name} type={wf.document_type || 'Générique'} dep="-" steps={wf.steps_count || 1} resp="-" docs={0} stat={wf.status || 'Actif'} date={formatDate(wf.created_at)} />
                         ))
                     )}
                     {!loading && workflows.length === 0 && (
                         <tr><td colSpan={9} className="text-center py-8 text-gray-400">Aucun workflow. Cliquez sur "Nouveau workflow" pour créer votre premier circuit.</td></tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </div>

            {/* Complex Bottom Module */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-6 shadow-sm relative">
               
               {/* Left Column in the Module: Editor and Config */}
               <div className="flex flex-col lg:flex-row gap-6 lg:col-span-1">
                  
                  {/* Visual Editor (Sidebar style) */}
                  <div className="w-full lg:w-56 flex flex-col gap-3">
                     <h4 className="font-semibold text-[13px] flex items-center gap-1">Éditeur visuel du workflow</h4>
                     
                     <div className="flex flex-col items-center gap-2 relative">
                        <div className="absolute left-[20px] top-4 bottom-4 w-0.5 bg-gray-200 z-0"></div>
                        
                        <WfNode title="Création" sub="Service Initiateur" user="Yacine M." delay="1 jour" color="bg-green-50" border="border-green-200" zIndex="z-10" />
                        <ArrowDown />
                        <WfNode title="Validation Chef de service" sub="Chef de service" user="Nadia A." delay="2 jours" color="bg-blue-50" border="border-blue-200" zIndex="z-10" />
                        <ArrowDown />
                        <WfNode active title="Validation Directeur" sub="Directeur" user="Sofiane H." delay="3 jours" color="bg-yellow-50" border="border-yellow-400" shadow="shadow-md shadow-yellow-500/20" zIndex="z-10" />
                        <ArrowDown />
                        <WfNode title="Archivage" sub="Archiviste" user="Karim B." delay="1 jour" color="bg-purple-50" border="border-purple-200" zIndex="z-10" />
                        <ArrowDown />
                        <WfNode title="Diffusion" sub="Tous les membres" user="Bureau Statistiques" delay="0 jour" color="bg-gray-50 dark:bg-[var(--dash-bg)]" border="border-gray-200 dark:border-[var(--dash-border)]" zIndex="z-10" />
                     </div>
                  </div>

                  {/* Config Form (Main style) */}
                  <div className="flex-1 flex flex-col gap-4">
                     <h4 className="font-semibold text-[13px]">Configuration de l'étape sélectionnée</h4>
                     <form className="flex flex-col gap-3 bg-gray-50 dark:bg-[var(--dash-bg)] p-4 rounded-xl border border-gray-100 dark:border-[var(--dash-border)]">
                        <Field label="Nom de l'étape" val="Validation Directeur" />
                        
                        <div className="flex flex-col gap-1.5">
                           <label className="text-[10px] font-medium text-gray-500">Responsable</label>
                           <div className="flex items-center gap-2 border border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] rounded-lg p-1.5 px-3">
                              <img src="https://ui-avatars.com/api/?name=Sofiane+H" className="w-5 h-5 rounded-full" />
                              <span className="text-xs font-semibold text-gray-800 dark:text-[var(--dash-text)] flex-1">Sofiane Hamidi</span>
                              <ChevronDown size={14} className="text-gray-400" />
                           </div>
                        </div>

                        <Field label="Rôle" val="Directeur" isSelect />
                        <Field label="Département" val="Statistiques & Analyses" isSelect />
                        <Field label="Service" val="Direction Générale" isSelect />

                        <div className="flex gap-4">
                           <div className="flex-1"><Field label="Délai (jours)" val="3" /></div>
                           <div className="flex-1"><Field label="Ordre" val="3" /></div>
                        </div>

                        <div className="flex flex-col gap-2 mt-2">
                           <ToggleRow label="Validation obligatoire" on />
                           <ToggleRow label="Signature électronique" on />
                           <ToggleRow label="Notification email" on />
                           <ToggleRow label="Notification interne" on />
                        </div>
                        
                        <Field label="Condition de passage" val="Toutes les validations précédentes" isSelect />
                        
                        <div className="flex gap-3 mt-2">
                           <button className="flex-1 py-1.5 border border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] rounded-lg text-[10px] font-semibold text-gray-600 dark:text-[var(--dash-text-muted)] flex justify-center items-center gap-1 shadow-sm"><Copy size={12}/> Dupliquer étape</button>
                           <button className="flex-1 py-1.5 border border-red-200 bg-red-50 text-red-600 rounded-lg text-[10px] font-semibold flex justify-center items-center gap-1"><Trash2 size={12}/> Supprimer étape</button>
                        </div>
                     </form>
                  </div>
               </div>
               
               {/* Right Column in the Module: Document Tracking */}
               <div className="flex flex-col gap-6 lg:col-span-1">
                  
                  {/* Suivi du document */}
                  <div className="flex flex-col gap-4">
                     <h4 className="font-semibold text-[13px]">Suivi d'un document en cours</h4>
                     
                     <div className="flex flex-col gap-4 bg-gray-50 dark:bg-[var(--dash-bg)] border border-gray-100 dark:border-[var(--dash-border)] p-4 rounded-xl">
                        {/* Progress Stepper */}
                        <div className="flex items-center justify-between relative px-2">
                           <div className="absolute top-3 left-4 right-4 h-0.5 bg-gray-200 z-0"></div>
                           <div className="absolute top-3 left-4 right-1/2 h-0.5 bg-green-500 z-0"></div>
                           
                           <ProgressStep status="done" icon={CheckCircle} label="Réception" sub="15/05/24 10:10" user="Yacine M." />
                           <ProgressStep status="done" icon={CheckCircle} label="Validation Service" sub="15/05/24 11:15" user="Nadia A." />
                           <ProgressStep status="active" icon={Clock} label="Validation Directeur" sub="En attente" user="Sofiane H." />
                           <ProgressStep status="pending" icon={Archive} label="Archivage" sub="-" user="-" />
                           <ProgressStep status="pending" icon={Share} label="Diffusion" sub="-" user="-" />
                        </div>

                        {/* Doc Details */}
                        <div className="flex justify-between items-center border-t border-gray-200 dark:border-[var(--dash-border)] pt-3 mt-2">
                           <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-medium text-gray-500">Document</span>
                              <div className="flex items-center gap-2">
                                 <div className="bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded">PDF</div>
                                 <div className="flex flex-col">
                                    <strong className="text-[11px] font-semibold">Rapport_Annuel_2024.pdf</strong>
                                    <span className="text-[9px] text-gray-500">2.4 Mo</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-medium text-gray-500">Priorité</span>
                              <span className="px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded font-bold text-[9px] w-fit">Haute</span>
                           </div>
                           <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-medium text-gray-500">Date de réception</span>
                              <strong className="text-[11px]">15/05/2024</strong>
                           </div>
                           <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-medium text-gray-500">Statut actuel</span>
                              <span className="px-2 py-0.5 bg-yellow-50 text-yellow-600 border border-yellow-200 rounded font-bold text-[10px] w-fit">En attente de validation</span>
                           </div>
                        </div>
                     </div>

                     {/* Commentaires */}
                     <div className="flex flex-col gap-2">
                        <span className="text-[11px] font-semibold text-gray-800 dark:text-[var(--dash-text)]">Commentaires</span>
                        <div className="bg-green-50 border border-green-100 p-3 rounded-xl flex gap-3 text-xs">
                           <img src="https://ui-avatars.com/api/?name=Nadia+A" className="w-6 h-6 rounded-full" />
                           <div className="flex flex-col gap-1 text-[11px]">
                              <strong className="text-gray-800 dark:text-[var(--dash-text)]">Nadia A. - Chef de service</strong>
                              <span className="text-gray-500">15/05/2024 à 11:15</span>
                              <p className="text-gray-700 dark:text-[var(--dash-text-muted)] mt-1">Le rapport est complet, je valide cette étape.</p>
                           </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-[var(--dash-bg)] border border-gray-100 dark:border-[var(--dash-border)] p-3 rounded-xl flex gap-3 text-xs">
                           <img src="https://ui-avatars.com/api/?name=Yacine+M" className="w-6 h-6 rounded-full" />
                           <div className="flex flex-col gap-1 text-[11px]">
                              <strong className="text-gray-800 dark:text-[var(--dash-text)]">Yacine M. - Initiateur</strong>
                              <span className="text-gray-500">15/05/2024 à 10:10</span>
                              <p className="text-gray-700 dark:text-[var(--dash-text-muted)] mt-1">Document créé et envoyé pour validation.</p>
                           </div>
                        </div>
                     </div>
                     <button className="w-full py-2 border border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] rounded-lg text-xs font-semibold text-gray-600 dark:text-[var(--dash-text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]">Voir le document</button>
                  </div>
               </div>
            </div>

            {/* Bottom Row inside Left Area: Stats & Notifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-5 shadow-sm">
                  <h4 className="font-semibold text-xs mb-4">Notifications automatiques</h4>
                  <div className="flex flex-col gap-2.5">
                     <NotifRow icon={Mail} label="Emails envoyés" count={128} />
                     <NotifRow icon={Bell} label="Notifications internes" count={342} />
                     <NotifRow icon={Clock} label="Rappels envoyés" count={54} />
                     <NotifRow icon={CheckCircle} label="Validations expirées" count={3} alert />
                     <NotifRow icon={MoreVertical} label="Escalades déclenchées" count={2} />
                  </div>
               </div>
               
               <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-5 shadow-sm">
                  <h4 className="font-semibold text-xs mb-4">Statistiques du workflow</h4>
                  <div className="flex items-end gap-6 h-32 pl-4 border-l border-b border-gray-200 dark:border-[var(--dash-border)] pb-2 relative text-[9px] text-gray-400">
                     {/* fake bar chart */}
                     <div className="flex items-end gap-4 h-full pt-10">
                        <div className="w-6 h-10 bg-yellow-400 rounded-t-sm"></div>
                        <div className="w-6 h-16 bg-blue-500 rounded-t-sm"></div>
                        <div className="w-6 h-[90%] bg-green-500 rounded-t-sm"></div>
                        <div className="w-6 h-12 bg-purple-500 rounded-t-sm"></div>
                        <div className="w-6 h-8 bg-orange-500 rounded-t-sm"></div>
                     </div>
                  </div>
               </div>
            </div>

         </div>

         {/* Right Sidebar Area */}
         <div className="w-full xl:w-[320px] shrink-0 flex flex-col gap-6">
            
            {/* Résumé du workflow */}
            <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
               <div className="flex justify-between items-center">
                 <h4 className="font-semibold text-sm">Résumé du workflow</h4>
                 <span className="bg-green-50 text-green-600 border border-green-200 text-[9px] font-bold px-2 py-0.5 rounded">Actif</span>
               </div>
               
               {/* Hero Graphic */}
               <div className="bg-orange-50/50 rounded-xl p-4 flex justify-center h-32 relative">
                  {/* Fake nodes diagram */}
                  <div className="flex gap-4 items-center">
                     <div className="w-10 h-10 border-2 border-dashed border-orange-300 rounded-xl bg-white dark:bg-[var(--dash-card-bg)] relative z-10 flex items-center justify-center">
                       <img src="https://ui-avatars.com/api/?name=Y" className="w-6 h-6 rounded-full" />
                     </div>
                     <div className="h-0.5 w-8 bg-orange-300"></div>
                     <div className="w-12 h-12 border-2 border-orange-400 rounded-xl bg-white dark:bg-[var(--dash-card-bg)] relative z-10 flex items-center justify-center shadow-md">
                       <CheckCircle className="text-green-500" size={24} />
                     </div>
                     <div className="h-0.5 w-8 bg-gray-300"></div>
                     <div className="w-10 h-10 border-2 border-dashed border-gray-300 rounded-xl bg-white dark:bg-[var(--dash-card-bg)] relative z-10 flex items-center justify-center">
                       <img src="https://ui-avatars.com/api/?name=S" className="w-6 h-6 rounded-full" />
                     </div>
                  </div>
               </div>

               <div className="flex flex-col gap-2 text-[10px] font-medium font-poppins">
                 <MetaRow label="Nom" val="Validation rapport annuel" />
                 <MetaRow label="Description" val="Circuit de validation pour tous les rapports annuels" />
                 <MetaRow label="Type" val="Rapport" />
                 <MetaRow label="Département" val="Statistiques & Analyses" />
                 <MetaRow label="Nombre d'étapes" val="5" />
                 <MetaRow label="Responsable" val="Sofiane Hamidi" />
                 <MetaRow label="Créé le" val="10/04/2024 à 11:20" />
                 <MetaRow label="Dernière modification" val="15/05/2024 à 09:15" />
               </div>
               <button className="w-full py-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-xs font-semibold text-gray-600 dark:text-[var(--dash-text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)] flex justify-center items-center gap-1.5"><Eye size={14}/> Voir le détail complet</button>
            </div>

            {/* Historique du workflow */}
            <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-5 shadow-sm">
               <h4 className="font-semibold text-sm mb-4">Historique du workflow</h4>
               <div className="flex flex-col gap-4 relative pl-4 border-l-2 border-gray-100 dark:border-[var(--dash-border)]">
                  <HistItem icon={CheckCircle} color="text-green-500" bg="bg-green-100" dot="bg-green-500" title="Workflow créé" sub="10/04/2024 à 11:20 par Sofiane H." />
                  <HistItem icon={CheckCircle} color="text-green-500" bg="bg-green-100" dot="bg-green-500" title="Étape 1 - Création" sub="Validée par Yacine M. 15/05/2024 à 10:10" />
                  <HistItem icon={CheckCircle} color="text-green-500" bg="bg-green-100" dot="bg-green-500" title="Étape 2 - Chef de service" sub="Validée par Nadia A. 15/05/2024 à 11:15" />
                  <HistItem icon={Clock} color="text-yellow-500" bg="bg-yellow-100" dot="bg-yellow-400" title="Étape 3 - Directeur" sub="En attente de validation depuis 15/05/2024 à 11:15" pulse />
                  <HistItem icon={Archive} color="text-gray-400" bg="bg-gray-100" dot="bg-gray-300" title="Étape 4 - Archivage" sub="En attente" />
                  <HistItem icon={Share} color="text-gray-400" bg="bg-gray-100" dot="bg-gray-300" title="Étape 5 - Diffusion" sub="En attente" last />
               </div>
            </div>

            {/* Documents utilisant ce workflow */}
            <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-5 shadow-sm">
               <h4 className="font-semibold text-sm mb-4">Documents utilisant ce workflow</h4>
               <div className="flex flex-col gap-3">
                  <UsedDoc icon="PDF" bg="bg-red-500" name="Rapport_Annuel_2024.pdf" stat="En attente" statColor="text-yellow-600" />
                  <UsedDoc icon={<CheckCircle size={12}/>} bg="bg-green-500" name="Rapport_T1_2024.pdf" stat="Validé" statColor="text-green-600" />
                  <UsedDoc icon={<CheckCircle size={12}/>} bg="bg-green-500" name="Rapport_Activites_2023.pdf" stat="Validé" statColor="text-green-600" />
                  <UsedDoc icon={<XCircle size={12}/>} bg="bg-red-500" name="Rapport_Budget_2024.pdf" stat="Rejeté" statColor="text-red-600" />
                  <UsedDoc icon={<XCircle size={12}/>} bg="bg-gray-50 dark:bg-[var(--dash-bg)]0" name="Rapport_Previsions_2024.pdf" stat="En attente" statColor="text-gray-500" />
               </div>
               <button className="w-full mt-4 text-[10px] font-semibold text-orange-600">Voir tous les documents</button>
            </div>

            {/* Paramètres & Dernière Exé */}
            <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
               <div>
                 <h4 className="font-semibold text-xs mb-3">Paramètres du workflow</h4>
                 <div className="flex flex-col gap-2 text-[10px]">
                    <div className="flex justify-between">
                       <span className="text-gray-500">Statut</span>
                       <span className="flex items-center gap-1"><ToggleRow on /> Actif</span>
                    </div>
                    <div className="flex justify-between"><span className="text-gray-500">Version</span><span className="font-bold">1.0</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Créé par</span><span className="font-bold">Sofiane Hamidi</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Visibilité</span><span className="font-bold">Département</span></div>
                 </div>
               </div>
            </div>

         </div>

      </div>

      {/* ─── Bottom Actions Bar ────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 lg:left-[250px] right-0 bg-white dark:bg-[var(--dash-card-bg)] border-t border-gray-200 dark:border-[var(--dash-border)] p-4 px-6 flex justify-between items-center z-50">
         <button className="px-6 py-2 bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] text-gray-700 dark:text-[var(--dash-text-muted)] font-semibold text-[13px] rounded-xl hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]">Annuler</button>
         
         <div className="flex items-center gap-2">
            <button className="px-6 py-2 bg-orange-500 text-white font-semibold text-[13px] rounded-xl shadow-sm shadow-orange-500/20 hover:bg-orange-600">Enregistrer</button>
            <div className="w-px h-6 bg-gray-200 mx-2"></div>
            <button className="flex items-center gap-1.5 px-4 py-2 border border-blue-200 bg-blue-50 text-blue-600 font-semibold text-[12px] rounded-xl hover:bg-blue-100"><Play size={14}/> Tester le workflow</button>
            <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] text-gray-700 dark:text-[var(--dash-text-muted)] font-semibold text-[12px] rounded-xl hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]"><Copy size={14}/> Dupliquer</button>
            <button className="flex items-center gap-1.5 px-4 py-2 border border-green-200 bg-green-50 text-green-600 font-semibold text-[12px] rounded-xl hover:bg-green-100"><CheckCircle size={14}/> Activer</button>
            <button className="flex items-center gap-1.5 px-4 py-2 border border-red-200 bg-red-50 text-red-600 font-semibold text-[12px] rounded-xl hover:bg-red-100"><XCircle size={14}/> Désactiver</button>
            <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] text-gray-700 dark:text-[var(--dash-text-muted)] font-semibold text-[12px] rounded-xl hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)]"><Download size={14}/> Exporter</button>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white font-semibold text-[12px] rounded-xl hover:bg-red-600 ml-2"><Trash2 size={14}/> Supprimer</button>
         </div>
      </div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────── */

function KpiBox({ icon: Icon, color, bg, label, value, trend, trendColor }: any) {
  return (
    <div className="bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl p-4 shadow-sm flex gap-3">
       <div className={`w-10 h-10 rounded-full ${bg} ${color} flex items-center justify-center shrink-0`}>
         <Icon size={20} />
       </div>
       <div className="flex flex-col">
         <strong className="text-xl font-bold font-oswald leading-none">{value}</strong>
         <span className="text-[10px] font-medium text-gray-500 mt-1 mb-1 leading-tight">{label}</span>
         <span className={`text-[9px] font-bold ${trendColor}`}>{trend}</span>
       </div>
    </div>
  );
}

function WfRow({ name, starred, type, dep, steps, resp, docs, stat, date }: any) {
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)] cursor-pointer text-[11px] font-medium transition-colors">
       <td className="py-2.5 px-2 flex items-center gap-2">
         <Star size={14} className={starred ? "text-yellow-400 fill-current" : "text-gray-300"} />
         <span className="font-semibold text-gray-800 dark:text-[var(--dash-text)]">{name}</span>
       </td>
       <td className="py-2.5 px-2 text-gray-600 dark:text-[var(--dash-text-muted)]">{type}</td>
       <td className="py-2.5 px-2 text-gray-600 dark:text-[var(--dash-text-muted)]">{dep}</td>
       <td className="py-2.5 px-2 text-center text-gray-500">{steps}</td>
       <td className="py-2.5 px-2 flex items-center gap-1.5">
         <img src={`https://ui-avatars.com/api/?name=${resp.replace(' ','+')}`} className="w-5 h-5 rounded-full" />
         {resp}
       </td>
       <td className="py-2.5 px-2 text-center text-gray-800 dark:text-[var(--dash-text)]">{docs}</td>
       <td className="py-2.5 px-2 text-center">
         <span className={`px-2 py-0.5 rounded flex items-center justify-center w-max mx-auto border font-bold
           ${stat==='Actif'?'bg-green-50 text-green-600 border-green-200':
             stat==='Brouillon'?'bg-yellow-50 text-yellow-600 border-yellow-200':
             'bg-gray-100 text-gray-500 border-gray-200 dark:border-[var(--dash-border)]'}`}>{stat}</span>
       </td>
       <td className="py-2.5 px-2 text-gray-500">{date}</td>
       <td className="py-2.5 px-2">
         <div className="flex items-center justify-center gap-2 text-gray-400">
           <Eye size={12} className="hover:text-gray-700 dark:text-[var(--dash-text-muted)]" />
           <Edit2 size={12} className="hover:text-gray-700 dark:text-[var(--dash-text-muted)]" />
           <Copy size={12} className="hover:text-gray-700 dark:text-[var(--dash-text-muted)]" />
           <MoreVertical size={12} className="hover:text-gray-700 dark:text-[var(--dash-text-muted)]" />
         </div>
       </td>
    </tr>
  );
}

function WfNode({ title, sub, user, delay, color, border, shadow='', active, zIndex }: any) {
  return (
    <div className={`w-48 p-2.5 rounded-xl border-2 ${border} ${color} flex gap-2 relative ${shadow} ${zIndex} transition-transform ${active ? 'scale-105' : ''}`}>
       <img src={`https://ui-avatars.com/api/?name=${user.replace(' ','+')}`} className="w-8 h-8 rounded-full border border-white" />
       <div className="flex flex-col text-left">
          <strong className="text-[10px] font-bold text-gray-800 dark:text-[var(--dash-text)] leading-tight">{title}</strong>
          <span className="text-[9px] font-medium text-gray-700 dark:text-[var(--dash-text-muted)]">{user}</span>
          <span className="text-[8px] text-gray-500">{sub} • Délai: {delay}</span>
       </div>
       {active && <ChevronRight size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-500" />}
    </div>
  );
}

function ArrowDown() {
  return <div className="h-4 w-px bg-gray-300 my-0.5 z-0"></div>;
}

function Field({ label, val, isSelect }: any) {
  return (
    <div className="flex flex-col gap-1.5">
       <label className="text-[10px] font-medium text-gray-500">{label}</label>
       {isSelect ? (
         <select className="border border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] rounded-lg p-2 text-xs font-semibold text-gray-800 dark:text-[var(--dash-text)] outline-none" defaultValue={val}>
           <option value={val}>{val}</option>
         </select>
       ) : (
         <input type="text" className="border border-gray-200 dark:border-[var(--dash-border)] bg-white dark:bg-[var(--dash-card-bg)] rounded-lg p-2 text-xs font-semibold text-gray-800 dark:text-[var(--dash-text)] outline-none" defaultValue={val} />
       )}
    </div>
  );
}

function ToggleRow({ label, on }: any) {
  return (
    <div className="flex justify-between items-center text-[10px] font-medium">
      <span className="text-gray-600 dark:text-[var(--dash-text-muted)]">{label}</span>
      <div className={`w-6 h-3 rounded-full flex items-center p-0.5 ${on ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'}`}>
        <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-[var(--dash-card-bg)] shadow-sm"></div>
      </div>
    </div>
  );
}

function ProgressStep({ status, icon: Icon, label, sub, user }: any) {
  const isDone = status === 'done';
  const isActive = status === 'active';
  const color = isDone ? 'text-green-500 border-green-500 bg-green-50' : isActive ? 'text-orange-500 border-orange-500 bg-orange-50' : 'text-gray-400 border-gray-300 bg-white dark:bg-[var(--dash-card-bg)]';
  
  return (
    <div className="flex flex-col items-center gap-1 z-10 w-16 text-center">
      <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shadow-sm ${color}`}>
        <Icon size={12} strokeWidth={2.5} />
      </div>
      <strong className={`text-[8px] leading-tight font-bold mt-1 ${isActive ? 'text-gray-900 dark:text-[#FFFFFF]' : 'text-gray-600 dark:text-[var(--dash-text-muted)]'}`}>{label}</strong>
      {sub !== '-' && <span className="text-[7px] text-gray-400">{sub}</span>}
      {user !== '-' && <span className="text-[7px] font-medium text-gray-500">{user}</span>}
    </div>
  );
}

function NotifRow({ icon: Icon, label, count, alert }: any) {
  return (
    <div className="flex justify-between items-center text-[10px] font-medium">
      <div className="flex items-center gap-2 text-gray-600 dark:text-[var(--dash-text-muted)]">
         <Icon size={12} className={alert ? 'text-red-500' : 'text-gray-400'} /> {label}
      </div>
      <div className="flex gap-4 w-20 justify-between items-center">
         <strong className={`text-xs ${alert ? 'text-red-600' : 'text-gray-800 dark:text-[var(--dash-text)]'}`}>{count}</strong>
         <span className="text-[8px] text-gray-400">{alert ? 'À traiter' : 'Ce mois'}</span>
      </div>
    </div>
  );
}

function MetaRow({ label, val }: any) {
  return (
    <div className="flex justify-between pb-1.5 border-b border-gray-100 dark:border-[var(--dash-border)] last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800 dark:text-[var(--dash-text)] text-right max-w-[140px] truncate">{val}</span>
    </div>
  );
}

function HistItem({ icon: Icon, color, bg, dot, title, sub, pulse, last }: any) {
  return (
    <div className="relative">
      <div className={`absolute -left-[23px] top-0 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${bg} shadow-sm z-10`}>
         <div className={`w-1.5 h-1.5 rounded-full ${dot} ${pulse ? 'animate-ping' : ''}`}></div>
      </div>
      <div className={`flex flex-col ${!last ? 'pb-4' : ''}`}>
        <strong className="text-[11px] font-semibold text-gray-800 dark:text-[var(--dash-text)]">{title}</strong>
        <span className="text-[9px] text-gray-500">{sub}</span>
      </div>
    </div>
  );
}

function UsedDoc({ icon, bg, name, stat, statColor }: any) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 rounded flex items-center justify-center text-white text-[8px] font-bold shrink-0 ${bg}`}>
        {typeof icon === 'string' ? icon : icon}
      </div>
      <div className="flex flex-col flex-1 truncate">
         <strong className="text-[10px] font-semibold text-gray-800 dark:text-[var(--dash-text)] truncate">{name}</strong>
         <span className={`text-[9px] font-bold ${statColor}`}>{stat}</span>
      </div>
    </div>
  );
}
