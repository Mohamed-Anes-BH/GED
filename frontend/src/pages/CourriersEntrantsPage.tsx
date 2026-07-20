import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, MailOpen, Clock, CheckCircle, AlertTriangle, Archive,
  Search, SlidersHorizontal, List, LayoutGrid, ChevronDown,
  Eye, Send, FolderOpen, MoreVertical, Plus, X, Paperclip,
  FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Download, Star
} from 'lucide-react';

import { useCourriers } from '../hooks/useCourriers';
import { courriersService } from '../services/courriers';
import { directionsService, departementsService, servicesService } from '../services/organization';
import { useOrganizationCrud } from '../hooks/useOrganization';
import { formatDate } from '../utils/formatters';
import { CourrierEntrant } from '../types';

/* ─── MOCK DATA (For KPIs only) ──────────────────────────────────────────── */
const kpisTemplate = [
  { label: 'Tous les courriers', key: 'tous', delta: '+2', color: '#FACC15', icon: Mail },
  { label: 'Non lus', key: 'nouveau', delta: '+1', color: '#FF6B00', icon: MailOpen },
  { label: 'En attente', key: 'en_cours', delta: '0', color: '#3B82F6', icon: Clock },
  { label: 'Traités', key: 'traite', delta: '+3', color: '#22C55E', icon: CheckCircle },
  { label: 'Archivés', key: 'archive', delta: '0', color: '#8B5CF6', icon: Archive, trendDown: true },
];

const prioriteStyles: Record<string, any> = {
  haute:   { bg: '#FEF2F2', color: '#EF4444', border: '#FECACA' },
  urgente: { bg: '#FEF2F2', color: '#EF4444', border: '#FECACA' },
  moyenne: { bg: '#FFF7ED', color: '#F59E0B', border: '#FED7AA' },
  normale: { bg: '#FFF7ED', color: '#F59E0B', border: '#FED7AA' },
  basse:   { bg: '#F0FDF4', color: '#22C55E', border: '#BBF7D0' },
};

const statutStyles: Record<string, any> = {
  'nouveau':    { bg: '#FEF2F2', color: '#EF4444', dot: '#EF4444', label: 'Nouveau' },
  'lu':         { bg: '#FFF7ED', color: '#F59E0B', dot: '#F59E0B', label: 'Lu' },
  'en_cours':   { bg: '#FFF7ED', color: '#F59E0B', dot: '#F59E0B', label: 'En attente' },
  'traite':     { bg: '#F0FDF4', color: '#22C55E', dot: '#22C55E', label: 'Traité' },
  'archive':    { bg: '#F1F5F9', color: '#64748B', dot: '#64748B', label: 'Archivé' },
};

/* ─── COMPONENT ──────────────────────────────────────────── */
export function CourriersEntrantsPage({ variant = 1 }: { variant?: 1 | 2 }) {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [statutFilter, setStatutFilter] = useState('Tous');
  const [prioriteFilter, setPrioriteFilter] = useState('Toutes');
  
  // Form states (variant 2)
  const [objet, setObjet] = useState('');
  const [expediteur, setExpediteur] = useState('');
  const [dateReception, setDateReception] = useState(new Date().toISOString().split('T')[0]);
  const [priorite, setPriorite] = useState('normale');
  const [statut, setStatut] = useState('nouveau');
  const [notes, setNotes] = useState('');
  const [directionId, setDirectionId] = useState<number | ''>('');
  const [departementId, setDepartementId] = useState<number | ''>('');
  const [serviceId, setServiceId] = useState<number | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { items: directions } = useOrganizationCrud(directionsService);
  const { items: departements } = useOrganizationCrud(departementsService);
  const { items: services } = useOrganizationCrud(servicesService);

  const { data: courriersRaw, loading, refetch, toggleFavorite } = useCourriers('entrants');
  
  // Apply filtering
  const courriers = courriersRaw.filter((c: any) => {
    let match = true;
    if (statutFilter !== 'Tous' && c.statut !== statutFilter) match = false;
    if (prioriteFilter !== 'Toutes' && c.priorite !== prioriteFilter) match = false;
    return match;
  });

  const selected = courriers.find((c: any) => c.id === selectedId) as (CourrierEntrant & { pieces_jointes?: any[], historique?: any[] }) | null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objet || !expediteur || !dateReception) {
      alert("Veuillez remplir les champs obligatoires (Expéditeur, Objet, Date de réception).");
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        objet,
        expediteur,
        date_reception: dateReception,
        priorite,
        statut,
        notes: notes || null,
      };
      if (directionId) payload.direction = directionId;
      if (departementId) payload.departement = departementId;
      if (serviceId) payload.service = serviceId;

      const created = await courriersService.createEntrant(payload);
      
      if (file) {
        await courriersService.uploadEntrantAttachment(created.id, file);
      }

      alert("Courrier entrant créé avec succès !");
      navigate('/courriers-entrants');
      refetch();
    } catch (err: any) {
      console.error(err);
      alert("Erreur lors de la création du courrier.");
    } finally {
      setSubmitting(false);
    }
  };

  if (variant === 2) {
    return (
      <div className="ce-page">
        <h2 className="ce-page-title">Nouveau Courrier Entrant</h2>
        <p className="ce-kpi-label" style={{marginTop: -10, marginBottom: 10, color: 'var(--dash-text-muted)'}}>
          Enregistrer un nouveau courrier entrant reçu dans l'organisation.
        </p>

        <form onSubmit={handleSubmit} className="ce-form-card" style={{display: 'flex', flexDirection: 'column', gap: 20}}>
          <div className="ce-form-group">
            <div className="ce-form-field">
              <label>Expéditeur <span className="ce-form-req">*</span></label>
              <input type="text" placeholder="Ex: Ministère de l'Agriculture, etc." value={expediteur} onChange={e => setExpediteur(e.target.value)} required />
            </div>
            <div className="ce-form-field">
              <label>Objet <span className="ce-form-req">*</span></label>
              <input type="text" placeholder="Ex: Lettre de transmission..." value={objet} onChange={e => setObjet(e.target.value)} required />
            </div>
          </div>

          <div className="ce-form-group" style={{gridTemplateColumns: '1fr 1fr 1fr'}}>
            <div className="ce-form-field">
              <label>Date de réception <span className="ce-form-req">*</span></label>
              <input type="date" value={dateReception} onChange={e => setDateReception(e.target.value)} required />
            </div>
            <div className="ce-form-field">
              <label>Priorité</label>
              <select value={priorite} onChange={e => setPriorite(e.target.value)}>
                <option value="basse">Basse</option>
                <option value="normale">Normale</option>
                <option value="haute">Haute</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div className="ce-form-field">
              <label>Statut</label>
              <select value={statut} onChange={e => setStatut(e.target.value)}>
                <option value="nouveau">Nouveau</option>
                <option value="lu">Lu</option>
                <option value="en_cours">En attente / En cours</option>
                <option value="traite">Traité</option>
                <option value="archive">Archivé</option>
              </select>
            </div>
          </div>

          <div className="ce-form-group" style={{gridTemplateColumns: '1fr 1fr 1fr'}}>
            <div className="ce-form-field">
              <label>Direction destinatrice</label>
              <select value={directionId} onChange={e => setDirectionId(Number(e.target.value) || '')}>
                <option value="">Sélectionner</option>
                {directions.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="ce-form-field">
              <label>Département destinataire</label>
              <select value={departementId} onChange={e => setDepartementId(Number(e.target.value) || '')}>
                <option value="">Sélectionner</option>
                {departements.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="ce-form-field">
              <label>Service destinataire</label>
              <select value={serviceId} onChange={e => setServiceId(Number(e.target.value) || '')}>
                <option value="">Sélectionner</option>
                {services.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="ce-form-field">
            <label>Pièce jointe (facultatif)</label>
            <div className="ce-file-dropzone" onClick={() => fileInputRef.current?.click()} style={{padding: '24px', textAlign: 'center', border: '2px dashed var(--dash-border)', background: 'var(--dash-bg)', borderRadius: 14, cursor: 'pointer'}}>
              <input type="file" ref={fileInputRef} className="hidden" style={{display: 'none'}} onChange={e => setFile(e.target.files?.[0] || null)} />
              {file ? (
                <div>
                  <strong style={{color: '#FF6B00'}}>{file.name}</strong>
                  <div style={{fontSize: 12, color: 'var(--dash-text-muted)', marginTop: 4}}>{(file.size / 1024).toFixed(1)} Ko</div>
                </div>
              ) : (
                <div style={{color: 'var(--dash-text-muted)'}}>
                  Glissez-déposez un fichier ici ou <strong style={{color: '#FF6B00'}}>cliquez pour parcourir</strong>
                </div>
              )}
            </div>
          </div>

          <div className="ce-form-field">
            <label>Notes / Observations</label>
            <textarea placeholder="Observations..." rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <div className="ce-form-actions">
            <button type="button" className="ce-btn-cancel" onClick={() => navigate('/courriers-entrants')} disabled={submitting}>Annuler</button>
            <button type="submit" className="ce-btn-save" style={{background: '#FF6B00', color: '#fff'}} disabled={submitting}>{submitting ? 'Enregistrement...' : 'Enregistrer le Courrier'}</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="ce-page">
      {/* Page Title */}
      <h2 className="ce-page-title">Courriers entrants</h2>

      {/* KPI Row */}
      <div className="ce-kpi-row">
        {kpisTemplate.map((kpi, i) => {
          const Icon = kpi.icon;
          let val = 0;
          if (kpi.key === 'tous') val = courriers.length;
          else val = courriers.filter((c: any) => c.statut === kpi.key).length;
          
          return (
            <div key={i} className="ce-kpi-card">
              <div className="ce-kpi-icon" style={{ background: `${kpi.color}1A`, color: kpi.color }}>
                <Icon size={22} />
              </div>
              <div className="ce-kpi-info">
                <span className="ce-kpi-label">{kpi.label}</span>
                <strong className="ce-kpi-value">{loading ? '-' : val}</strong>
                <span className="ce-kpi-delta" style={{ color: kpi.trendDown ? '#EF4444' : '#22C55E' }}>
                  ↗ {kpi.delta}
                </span>
              </div>
              {/* Mini sparkline */}
              <div className="ce-mini-chart">
                <svg viewBox="0 0 80 24" preserveAspectRatio="none">
                  <path d={kpi.trendDown
                    ? 'M0,4 Q20,20 40,12 T80,20'
                    : 'M0,20 Q20,8 40,14 T80,4'}
                    fill="none" stroke={kpi.color} strokeWidth="2" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters Row */}
      <div className="ce-filters-row">
        <label className="ce-filter-dropdown" style={{flexDirection: 'row', alignItems: 'center'}}>
          <span className="ce-fd-label">Statut</span>
          <select value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)} style={{background: 'transparent', border: 'none', outline: 'none', color: 'var(--dash-text)', fontSize: 13, fontWeight: 500, cursor: 'pointer'}}>
            <option value="Tous">Tous</option>
            <option value="nouveau">Nouveau</option>
            <option value="lu">Lu</option>
            <option value="en_cours">En attente</option>
            <option value="traite">Traité</option>
            <option value="archive">Archivé</option>
          </select>
        </label>
        
        <label className="ce-filter-dropdown" style={{flexDirection: 'row', alignItems: 'center'}}>
          <span className="ce-fd-label">Priorité</span>
          <select value={prioriteFilter} onChange={(e) => setPrioriteFilter(e.target.value)} style={{background: 'transparent', border: 'none', outline: 'none', color: 'var(--dash-text)', fontSize: 13, fontWeight: 500, cursor: 'pointer'}}>
            <option value="Toutes">Toutes</option>
            <option value="Urgent">Urgente</option>
            <option value="Haute">Haute</option>
            <option value="Normale">Normale</option>
            <option value="Basse">Basse</option>
          </select>
        </label>

        <button className="ce-filter-btn" onClick={() => { setStatutFilter('Tous'); setPrioriteFilter('Toutes'); }}><SlidersHorizontal size={14} /> + Réinitialiser</button>

        <div className="ce-filters-right">
          <button className={`ce-view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><List size={16} /></button>
          <button className={`ce-view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><LayoutGrid size={16} /></button>
          <button className="ce-new-courrier-btn" onClick={() => navigate('/courriers-entrants/nouveau')}>
            <Plus size={16} /> Nouveau courrier
          </button>
        </div>
      </div>

      {/* Main Content: Table + Detail Panel */}
      <div className="ce-main-content">
        <div className="ce-table-card">
          {viewMode === 'list' ? (
            <table className="ce-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}><input type="checkbox" /></th>
                  <th>N° de courrier</th>
                  <th>Expéditeur</th>
                  <th>Objet</th>
                  <th>Date de réception</th>
                  <th>Priorité</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                      Chargement...
                    </td>
                  </tr>
                ) : courriers.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                      Aucun courrier trouvé.
                    </td>
                  </tr>
                ) : courriers.map((c: any) => {
                  const prio = c.priorite.toLowerCase();
                  const ps = prioriteStyles[prio] || prioriteStyles.moyenne;
                  const ss = statutStyles[c.statut] || statutStyles['nouveau'];
                  return (
                    <tr
                      key={c.id}
                      className={selectedId === c.id ? 'selected' : ''}
                      onClick={() => {
                        setSelectedId(c.id);
                        if (c.statut === 'nouveau') courriersService.markEntrantRead(c.id).then(refetch);
                      }}
                    >
                      <td><input type="checkbox" onClick={e => e.stopPropagation()} /></td>
                      <td><span className="ce-numero">{c.numero}</span></td>
                      <td>{c.expediteur}</td>
                      <td className="ce-objet-cell">{c.objet}</td>
                      <td className="ce-date-cell">{formatDate(c.date_reception)}</td>
                      <td>
                        <span className="ce-badge capitalize" style={{ background: ps.bg, color: ps.color, border: `1px solid ${ps.border}` }}>
                          {c.priorite}
                        </span>
                      </td>
                      <td>
                        <span className="ce-statut-badge">
                          <span className="ce-dot" style={{ background: ss.dot }} />
                          {ss.label}
                        </span>
                      </td>
                      <td>
                        <div className="ce-actions">
                          <button title="Favori" onClick={(e) => { e.stopPropagation(); toggleFavorite(c.id); }}>
                            <Star size={15} className={c.is_favorite ? "text-yellow-500 fill-current" : "text-gray-400"} />
                          </button>
                          <button title="Voir"><Eye size={15} /></button>
                          <button title="Transférer"><Send size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, padding: 16 }}>
              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>
              ) : courriers.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Aucun courrier trouvé.</div>
              ) : courriers.map((c: any) => {
                const prio = c.priorite?.toLowerCase();
                const ps = prioriteStyles[prio] || prioriteStyles.moyenne;
                const ss = statutStyles[c.statut] || statutStyles['nouveau'];
                return (
                  <div key={c.id} className={`ce-kpi-card ${selectedId === c.id ? 'selected' : ''}`} style={{flexDirection: 'column', gap: 10, cursor: 'pointer', border: selectedId===c.id?'2px solid #FF6B00':'1px solid var(--dash-border)'}} onClick={() => { setSelectedId(c.id); if (c.statut === 'nouveau') courriersService.markEntrantRead(c.id).then(refetch); }}>
                    <div style={{display:'flex', justifyContent:'space-between', width:'100%'}}>
                      <span className="ce-numero">{c.numero}</span>
                      <div style={{display:'flex', itemsCenter: 'center', gap: 6}}>
                        <button title="Favori" onClick={(e) => { e.stopPropagation(); toggleFavorite(c.id); }} style={{background:'none', border:'none', cursor:'pointer'}}>
                          <Star size={14} className={c.is_favorite ? "text-yellow-500 fill-current" : "text-gray-400"} />
                        </button>
                        <span className="ce-statut-badge" style={{fontSize: 10}}><span className="ce-dot" style={{background:ss.dot}}/>{ss.label}</span>
                      </div>
                    </div>
                    <strong style={{fontSize:14}}>{c.objet}</strong>
                    <div style={{fontSize:12, color:'var(--dash-text-muted)'}}>{c.expediteur}</div>
                    <div style={{display:'flex', justifyContent:'space-between', width:'100%', marginTop: 8}}>
                      <span className="ce-date-cell">{formatDate(c.date_reception)}</span>
                      <span className="ce-badge capitalize" style={{ background: ps.bg, color: ps.color, border: `1px solid ${ps.border}` }}>{c.priorite}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          <div className="ce-pagination">
            <span className="ce-pagination-info">Affichage 1 à {Math.min(10, courriers.length)} sur {courriers.length} résultats</span>
            <div className="ce-pagination-controls">
              <button className="ce-page-btn"><ChevronsLeft size={14} /></button>
              <button className="ce-page-btn"><ChevronLeft size={14} /></button>
              <button className="ce-page-btn active">1</button>
              <button className="ce-page-btn"><ChevronRight size={14} /></button>
              <button className="ce-page-btn"><ChevronsRight size={14} /></button>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="ce-detail-panel">
            <div className="ce-detail-header">
              <h3>Détails du courrier</h3>
              <button className="ce-close-btn" onClick={() => setSelectedId(null)}><X size={16} /></button>
            </div>

            <div className="ce-detail-status-row">
              <span className="ce-statut-badge">
                <span className="ce-dot" style={{ background: (statutStyles[selected.statut] || statutStyles['nouveau']).dot }} />
                {(statutStyles[selected.statut] || statutStyles['nouveau']).label}
              </span>
              <span className="ce-badge capitalize" style={{
                background: (prioriteStyles[selected.priorite?.toLowerCase()] || prioriteStyles.moyenne).bg,
                color: (prioriteStyles[selected.priorite?.toLowerCase()] || prioriteStyles.moyenne).color,
                border: `1px solid ${(prioriteStyles[selected.priorite?.toLowerCase()] || prioriteStyles.moyenne).border}`
              }}>
                {selected.priorite} priorité
              </span>
            </div>

            <h4 className="ce-detail-numero" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {selected.numero}
              <button title="Favori" onClick={() => toggleFavorite(selected.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <Star size={16} className={selected.is_favorite ? "text-yellow-500 fill-current" : "text-gray-400"} />
              </button>
            </h4>

            <div className="ce-detail-fields">
              <div className="ce-field"><span>Expéditeur</span><strong>{selected.expediteur}</strong></div>
              <div className="ce-field"><span>Date de réception</span><strong>{formatDate(selected.date_reception)}</strong></div>
              <div className="ce-field"><span>Objet</span><strong>{selected.objet}</strong></div>
            </div>

            {/* Attachments */}
            {selected.pieces_jointes && selected.pieces_jointes.length > 0 && (
              <div className="ce-detail-attachments">
                <div className="ce-attach-title"><Paperclip size={14} /> Pièces jointes ({selected.pieces_jointes.length})</div>
                {selected.pieces_jointes.map((p: any, i: number) => {
                  const ext = p.file.split('.').pop() || p.type || 'PDF';
                  return (
                    <div key={i} className="ce-attach-item">
                      <div className={`ce-attach-icon ${ext.toLowerCase()}`}>
                        {ext.toUpperCase()}
                      </div>
                      <div className="ce-attach-info">
                        <span>{p.file.split('/').pop()}</span>
                        <small>{p.taille_ko} Ko</small>
                      </div>
                      <button className="ce-attach-dl"><Download size={14} /></button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* History */}
            <div className="ce-detail-history">
              <strong>Historique</strong>
              {selected.historique && selected.historique.length > 0 ? (
                selected.historique.map((h: any, i: number) => (
                  <div key={i} className="ce-history-item">
                     <span className="ce-hist-dot" style={{ background: h.statut === 'traite' ? '#22c55e' : '#f59e0b' }} />
                     <div><strong>{h.action} par {(typeof h.utilisateur === 'object' ? h.utilisateur.first_name : 'Utilisateur')}</strong><small>{formatDate(h.date)}</small></div>
                  </div>
                ))
              ) : (
                <div className="ce-history-item">
                   <span className="ce-hist-dot red" />
                   <div><strong>Reçu</strong><small>{formatDate(selected.created_at)}</small></div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="ce-detail-actions">
              {selected.statut !== 'traite' && (
                <button className="ce-mark-btn" onClick={() => {
                  courriersService.markEntrantTreated(selected.id).then(refetch);
                }}>✓ Marquer comme traité</button>
              )}
              <button className="ce-transfer-btn"><Send size={14} /> Transférer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── SUB-COMPONENTS ──────────────────────────────────── */

