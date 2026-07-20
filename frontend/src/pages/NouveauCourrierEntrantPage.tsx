import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock, Plus, Search, UploadCloud, X, Check, FileText,
  Send, FilePenLine, ChevronRight, Info, Loader2, MapPin
} from 'lucide-react';

import { courriersService } from '../services/courriers';
import { correspondantsService, directionsService, departementsService, servicesService } from '../services/organization';
import { useDependentDropdowns } from '../hooks/useDependentDropdowns';
import { useOrganizationCrud } from '../hooks/useOrganization';
import { useDossiers } from '../hooks/useDossiers';
import api from '../utils/api';
import {
  CE_TYPES, CE_CANAUX, CE_STATUSES, CE_WORKFLOWS, CE_TAGS,
  PRIORITIES, CONFIDENTIALITIES,
  DIRECTIONS_STATIC, DEPARTEMENTS_BY_DIR, SERVICES_BY_DEPT, DeptKey, SvcKey,
  PHYSICAL_BUILDINGS, PHYSICAL_OFFICES, PHYSICAL_TREASURIES, PHYSICAL_SHELVES,
} from '../constants/dropdowns';
import '../styles/nouveau-courrier-entrant.css';

/* ─── Progress Ring ─────────────────────────────────── */
function ProgressRing({ pct }: { pct: number }) {
  const r = 30; const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="nce-prog-ring">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle className="nce-prog-ring-track" cx="36" cy="36" r={r} />
        <circle className="nce-prog-ring-fill" cx="36" cy="36" r={r}
          strokeDasharray={c} strokeDashoffset={offset} />
      </svg>
      <div className="nce-prog-pct">{pct}%</div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export function NouveauCourrierEntrantPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Core fields
  const [objet, setObjet]                   = useState('');
  const [typeCourrier, setTypeCourrier]     = useState('lettre');
  const [expediteur, setExpediteur]         = useState('');
  const [refExterne, setRefExterne]         = useState('');
  const [dateReception, setDateReception]   = useState(new Date().toISOString().split('T')[0]);
  const [heureReception, setHeureReception] = useState(
    new Date().toTimeString().slice(0, 5)
  );
  const [canalReception, setCanalReception] = useState('email');
  const [priorite, setPriorite]             = useState('normale');
  const [confidentialite, setConfidentialite] = useState('public');
  const [statut, setStatut]                 = useState('nouveau');
  const [notes, setNotes]                   = useState('');

  // ── Extra fields (from model additions)
  const [numeroExpedition, setNumeroExpedition]     = useState('');
  const [dateExpedition, setDateExpedition]         = useState('');
  const [numeroEnregistrement, setNumeroEnregistrement] = useState('');

  // ── Affectation (API or static fallback)
  const [directionId, setDirectionId]   = useState<number | ''>('');
  const [departementId, setDepartementId] = useState<number | ''>('');
  const [serviceId, setServiceId]       = useState<number | ''>('');
  const [dossierId, setDossierId]       = useState<number | ''>('');
  // static dependent selects (used when API data is empty)
  const [staticDirKey, setStaticDirKey] = useState<DeptKey | ''>('');
  const [staticDeptKey, setStaticDeptKey] = useState<SvcKey | ''>('');
  const staticDepts = staticDirKey ? DEPARTEMENTS_BY_DIR[staticDirKey] ?? [] : [];
  const staticSvcs  = staticDeptKey ? SERVICES_BY_DEPT[staticDeptKey as SvcKey] ?? [] : [];

  // ── Correspondent
  const [corrSearch, setCorrSearch]     = useState('');
  const [corrResults, setCorrResults]   = useState<any[]>([]);
  const [selectedCorr, setSelectedCorr] = useState<any>(null);
  const [corrLoading, setCorrLoading]   = useState(false);

  // ── File
  const [file, setFile]                 = useState<File | null>(null);
  const [ocrEnabled, setOcrEnabled]     = useState(true);

  // ── Physical Location
  const [physSite, setPhysSite]           = useState('Siège');
  const [physBuilding, setPhysBuilding]   = useState('');
  const [physOffice, setPhysOffice]       = useState('');
  const [physTreasury, setPhysTreasury]   = useState('');
  const [physShelf, setPhysShelf]         = useState('');

  // ── Tags
  const [tags, setTags]                 = useState<string[]>([]);
  const [tagInput, setTagInput]         = useState('');

  // ── Distribution
  const [users, setUsers]               = useState<any[]>([]);
  const [distSearch, setDistSearch]     = useState('');
  const [distChips, setDistChips]       = useState<any[]>([]);
  const [notifEmail, setNotifEmail]     = useState(true);
  const [notifInterne, setNotifInterne] = useState(true);
  const [dateLimite, setDateLimite]     = useState('');
  const [workflow, setWorkflow]         = useState('validation_simple');

  // ── Submit
  const [submitting, setSubmitting]     = useState(false);
  const [autoNumero, setAutoNumero]     = useState('AGR-CE-' + new Date().getFullYear() + '-XXXX');

  // ── Organization data
  const {
    directions,
    departements,
    services,
    fetchDepartements,
    fetchServices,
  } = useDependentDropdowns();
  const { dossiers }            = useDossiers();

  // ── Load users for distribution
  useEffect(() => {
    api.get('/users/').then(r => {
      const data = r.data;
      setUsers(Array.isArray(data) ? data : (data.results || []));
    }).catch(() => {});
  }, []);

  // ── Search correspondants
  const searchCorrespondants = useCallback(async (q: string) => {
    if (!q.trim()) { setCorrResults([]); return; }
    setCorrLoading(true);
    try {
      const r = await correspondantsService.getAll({ search: q });
      setCorrResults(Array.isArray(r) ? r : (r.results || []));
    } catch { setCorrResults([]); }
    finally { setCorrLoading(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchCorrespondants(corrSearch), 350);
    return () => clearTimeout(timer);
  }, [corrSearch, searchCorrespondants]);

  // ── File handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  };

  // ── Tag helpers
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };
  const removeTag = (t: string) => setTags(prev => prev.filter(x => x !== t));

  // ── Distribution helpers
  const filteredUsers = users.filter(u =>
    !distChips.find(c => c.id === u.id) &&
    (`${u.first_name} ${u.last_name} ${u.username}`.toLowerCase().includes(distSearch.toLowerCase()))
  );
  const addDist = (u: any) => { setDistChips(prev => [...prev, u]); setDistSearch(''); };
  const removeDist = (id: number) => setDistChips(prev => prev.filter(c => c.id !== id));

  // ── Progression calculation
  const steps = [
    { label: 'Métadonnées',  done: !!(objet && dateReception) },
    { label: 'Expéditeur',   done: !!(selectedCorr || expediteur) },
    { label: 'Fichier joint', done: !!file },
    { label: 'Affectation',  done: !!(directionId || departementId) },
    { label: 'Distribution', done: distChips.length > 0 },
  ];
  const doneCnt  = steps.filter(s => s.done).length;
  const progress = Math.round((doneCnt / steps.length) * 100);

  // ── Priorité colors
  const prioColor: Record<string, string> = {
    basse: '#22C55E', normale: '#3B82F6', haute: '#F59E0B', urgente: '#EF4444'
  };

  // ── Submit
  const handleSubmit = async (mode: 'brouillon' | 'distribuer' | 'enregistrer') => {
    if (!objet) return alert('Veuillez saisir l\'objet du courrier.');
    if (!expediteur && !selectedCorr) return alert('Veuillez renseigner l\'expéditeur.');
    setSubmitting(true);
    try {
      const payload: any = {
        objet,
        type_courrier: typeCourrier,
        expediteur: selectedCorr ? selectedCorr.name : expediteur,
        date_reception: dateReception,
        canal_reception: canalReception,
        statut: mode === 'brouillon' ? 'nouveau' : statut,
        priorite,
        confidentialite,
        notes: notes || null,
        numero_expedition: numeroExpedition || null,
        date_expedition: dateExpedition || null,
        numero_enregistrement: numeroEnregistrement || null,
      };
      if (directionId)   payload.direction   = directionId;
      if (departementId) payload.departement = departementId;
      if (serviceId)     payload.service     = serviceId;

      // Physical location
      if (physSite || physBuilding || physOffice || physTreasury || physShelf) {
        payload.physical_location_input = {
          site:      physSite      || 'Siège',
          building:  physBuilding  || null,
          office:    physOffice    || null,
          treasury:  physTreasury  || null,
          shelf:     physShelf     || null,
        };
      }

      const created = await courriersService.createEntrant(payload);

      if (file) {
        await courriersService.uploadEntrantAttachment(created.id, file);
      }

      if (mode === 'brouillon') {
        alert('Courrier enregistré comme brouillon !');
      } else {
        alert('Courrier entrant enregistré avec succès !');
      }
      navigate('/courriers-entrants');
    } catch (err: any) {
      console.error(err);
      alert('Erreur lors de l\'enregistrement du courrier.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="nce-page">
      {/* ── Header ── */}
      <div className="nce-header">
        <div className="nce-header-left">
          <div className="nce-breadcrumbs">
            <span className="nce-bc-link" onClick={() => navigate('/dashboard')}>Accueil</span>
            <ChevronRight size={12} />
            <span className="nce-bc-link" onClick={() => navigate('/courriers-entrants')}>Courriers entrants</span>
            <ChevronRight size={12} />
            <span className="nce-bc-active">Nouveau courrier</span>
          </div>
          <h1 className="nce-page-title">
            Nouveau courrier entrant <span className="nce-dot">.</span>
          </h1>
          <p className="nce-page-subtitle">
            Enregistrez un nouveau courrier reçu et affectez-le au service concerné.
          </p>
        </div>
        <div className="nce-hero-img">📬</div>
      </div>

      {/* ── Main Grid ── */}
      <div className="nce-main">
        <div className="nce-left">

          {/* Row 1: Informations + Expéditeur */}
          <div className="nce-row">

            {/* ── Section 1: Informations du courrier ── */}
            <div className="nce-card">
              <h3 className="nce-card-title">
                <span className="nce-step-badge">1</span> Informations du courrier
              </h3>

              <div className="nce-grid-2">
                <div className="nce-field">
                  <label>Numéro de courrier</label>
                  <div className="nce-auto-number">
                    <Lock size={14} />
                    {autoNumero}
                  </div>
                </div>
                <div className="nce-field">
                  <label>Type de courrier <span className="nce-req">*</span></label>
                  <select value={typeCourrier} onChange={e => setTypeCourrier(e.target.value)}>
                    <option value="lettre">Lettre</option>
                    <option value="demande">Demande</option>
                    <option value="facture">Facture</option>
                    <option value="contrat">Contrat</option>
                    <option value="rapport">Rapport</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>

              <div className="nce-field">
                <label>Référence externe</label>
                <input type="text" placeholder="Entrez la référence (optionnel)"
                  value={refExterne} onChange={e => setRefExterne(e.target.value)} />
              </div>

              <div className="nce-field">
                <label>Objet <span className="nce-req">*</span></label>
                <input type="text" placeholder="Entrez l'objet du courrier"
                  value={objet} onChange={e => setObjet(e.target.value)} />
              </div>

              <div className="nce-grid-3">
                <div className="nce-field">
                  <label>Date de réception <span className="nce-req">*</span></label>
                  <input type="date" value={dateReception}
                    onChange={e => setDateReception(e.target.value)} />
                </div>
                <div className="nce-field">
                  <label>Heure de réception</label>
                  <input type="time" value={heureReception}
                    onChange={e => setHeureReception(e.target.value)} />
                </div>
                <div className="nce-field">
                  <label>Canal de réception <span className="nce-req">*</span></label>
                  <select value={canalReception} onChange={e => setCanalReception(e.target.value)}>
                    <option value="email">Email</option>
                    <option value="courrier_postal">Courrier postal</option>
                    <option value="depot_physique">Dépôt physique</option>
                  </select>
                </div>
              </div>

              <div className="nce-grid-2">
                <div className="nce-field">
                  <label>Numéro d'expédition</label>
                  <input type="text" placeholder="Ex: EXP-2026-001"
                    value={numeroExpedition} onChange={e => setNumeroExpedition(e.target.value)} />
                </div>
                <div className="nce-field">
                  <label>Numéro d'enregistrement</label>
                  <input type="text" placeholder="Ex: REG-2026-001"
                    value={numeroEnregistrement} onChange={e => setNumeroEnregistrement(e.target.value)} />
                </div>
              </div>

              <div className="nce-grid-2">
                <div className="nce-field">
                  <label>Date d'expédition</label>
                  <input type="date" value={dateExpedition}
                    onChange={e => setDateExpedition(e.target.value)} />
                </div>
                <div className="nce-field">
                  <label>Date d'arrivée</label>
                  <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>

              <div className="nce-grid-2">
                <div className="nce-field">
                  <label>Priorité <span className="nce-req">*</span></label>
                  <select value={priorite} onChange={e => setPriorite(e.target.value)}>
                    {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div className="nce-field">
                  <label>Confidentialité</label>
                  <select value={confidentialite} onChange={e => setConfidentialite(e.target.value)}>
                    {CONFIDENTIALITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Section 2: Expéditeur ── */}
            <div className="nce-card">
              <h3 className="nce-card-title">
                <span className="nce-step-badge blue">2</span> Expéditeur
              </h3>

              <div className="nce-field">
                <label>Correspondant <span className="nce-req">*</span></label>
                <div className="nce-corr-search">
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Rechercher un correspondant..."
                      value={corrSearch}
                      onChange={e => { setCorrSearch(e.target.value); setSelectedCorr(null); }}
                      style={{
                        width: '100%', paddingLeft: 36,
                        background: 'var(--dash-bg)',
                        border: '1px solid var(--dash-border)',
                        borderRadius: 12, padding: '10px 14px 10px 36px',
                        fontSize: 13, color: 'var(--dash-text)',
                        fontFamily: 'Poppins, sans-serif', outline: 'none'
                      }}
                    />
                    <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--dash-text-muted)' }} />
                  </div>
                  <button className="nce-corr-new-btn"><Plus size={14} /> Nouveau</button>
                </div>
              </div>

              {/* if no correspondant selected, show manual field */}
              {!selectedCorr && (
                <div className="nce-field">
                  <label>Saisie manuelle de l'expéditeur <span className="nce-req">*</span></label>
                  <input type="text" placeholder="Nom de l'expéditeur ou organisme"
                    value={expediteur} onChange={e => setExpediteur(e.target.value)} />
                </div>
              )}

              {/* Search results */}
              {corrSearch && !selectedCorr && (
                <div className="nce-corr-results">
                  {corrLoading && <div className="nce-no-corr">Recherche...</div>}
                  {!corrLoading && corrResults.length === 0 && (
                    <div className="nce-no-corr">Aucun correspondant trouvé.</div>
                  )}
                  {corrResults.map((c: any) => (
                    <div key={c.id} className="nce-corr-card" onClick={() => {
                      setSelectedCorr(c);
                      setExpediteur(c.name);
                      setCorrSearch('');
                      setCorrResults([]);
                    }}>
                      <div className="nce-corr-avatar">🏢</div>
                      <div className="nce-corr-info">
                        <div className="nce-corr-name">{c.name}</div>
                        <div className="nce-corr-meta">
                          {c.organisme && <span>{c.organisme}</span>}
                          {c.email && <span>• {c.email}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected correspondent card */}
              {selectedCorr && (
                <div className="nce-corr-card selected">
                  <div className="nce-corr-avatar">🏛️</div>
                  <div className="nce-corr-info">
                    <div className="nce-corr-name">{selectedCorr.name}</div>
                    <div className="nce-corr-meta">
                      {selectedCorr.organisme && <span>{selectedCorr.organisme}</span>}
                      {selectedCorr.email && <span>• {selectedCorr.email}</span>}
                      {selectedCorr.phone && <span>• {selectedCorr.phone}</span>}
                    </div>
                  </div>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dash-text-muted)' }}
                    onClick={() => setSelectedCorr(null)}><X size={14} /></button>
                </div>
              )}

              <div className="nce-field" style={{ marginTop: 8 }}>
                <label>Notes / Observations</label>
                <textarea rows={3} placeholder="Notes sur ce courrier..."
                  value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Row 2: Affectation + Pièce jointe */}
          <div className="nce-row">

            {/* ── Section 3: Affectation ── */}
            <div className="nce-card">
              <h3 className="nce-card-title">
                <span className="nce-step-badge green">3</span> Affectation
              </h3>

              {/* Direction → Département → Service (API with static fallback) */}
              <div className="nce-grid-3">
                <div className="nce-field">
                  <label>Direction <span className="nce-req">*</span></label>
                  {directions.length > 0 ? (
                    <select value={directionId} onChange={e => { const val = Number(e.target.value) || ''; setDirectionId(val); setDepartementId(''); setServiceId(''); fetchDepartements(Number(val)); }}>
                      <option value="">Sélectionner</option>
                      {directions.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  ) : (
                    <select value={staticDirKey} onChange={e => { setStaticDirKey(e.target.value as DeptKey | ''); setStaticDeptKey(''); }}>
                      <option value="">Sélectionner</option>
                      {DIRECTIONS_STATIC.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  )}
                </div>
                <div className="nce-field">
                  <label>Département <span className="nce-req">*</span></label>
                  {directions.length > 0 ? (
                    <select value={departementId} onChange={e => { const val = Number(e.target.value) || ''; setDepartementId(val); setServiceId(''); fetchServices(Number(val)); }}>
                      <option value="">Sélectionner</option>
                      {departements.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  ) : (
                    <select value={staticDeptKey} onChange={e => setStaticDeptKey(e.target.value as SvcKey | '')} disabled={!staticDirKey}>
                      <option value="">Sélectionner</option>
                      {staticDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  )}
                </div>
                <div className="nce-field">
                  <label>Service</label>
                  {directions.length > 0 ? (
                    <select value={serviceId} onChange={e => setServiceId(Number(e.target.value) || '')}>
                      <option value="">Sélectionner</option>
                      {services.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  ) : (
                    <select disabled={!staticDeptKey}>
                      <option value="">Sélectionner</option>
                      {staticSvcs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  )}
                </div>
              </div>

              <div className="nce-grid-2">
                <div className="nce-field">
                  <label>Dossier de classement</label>
                  <select value={dossierId} onChange={e => setDossierId(Number(e.target.value) || '')}>
                    <option value="">Sélectionner</option>
                    {dossiers.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="nce-field">
                  <label>Workflow</label>
                  <select value={workflow} onChange={e => setWorkflow(e.target.value)}>
                    {CE_WORKFLOWS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Section 4: Pièce jointe ── */}
            <div className="nce-card">
              <h3 className="nce-card-title">
                <span className="nce-step-badge purple">4</span> Pièce jointe
              </h3>

              {!file ? (
                <div className="nce-dropzone"
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}>
                  <UploadCloud size={32} className="nce-dropzone-icon" />
                  <p className="nce-dropzone-text">
                    Glissez-déposez vos fichiers ici<br />
                    <span>ou cliquez pour parcourir</span>
                  </p>
                  <button className="nce-dropzone-btn" type="button">Choisir un fichier</button>
                </div>
              ) : (
                <div className="nce-file-item">
                  <div className="nce-file-icon">
                    {file.name.split('.').pop()?.toUpperCase() || 'DOC'}
                  </div>
                  <div className="nce-file-info">
                    <div className="nce-file-name">{file.name}</div>
                    <div className="nce-file-size">{(file.size / 1024 / 1024).toFixed(2)} Mo • {file.type || 'fichier'}</div>
                  </div>
                  <button className="nce-file-del" onClick={() => setFile(null)} type="button">
                    <X size={14} />
                  </button>
                </div>
              )}

              <input
                type="file" ref={fileInputRef} style={{ display: 'none' }}
                onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }}
              />

              <div className="nce-ocr-row">
                <input type="checkbox" id="ocr-check" checked={ocrEnabled}
                  onChange={e => setOcrEnabled(e.target.checked)} />
                <label htmlFor="ocr-check" style={{ cursor: 'pointer' }}>
                  Lancer automatiquement l'OCR <Info size={12} style={{ verticalAlign: 'middle', color: 'var(--dash-text-muted)' }} />
                </label>
              </div>
            </div>
          </div>

          {/* Row 3: Physical Location + Classification */}
          <div className="nce-row">

            {/* ── Section 4b: Physical Location ── */}
            <div className="nce-card">
              <h3 className="nce-card-title">
                <span className="nce-step-badge" style={{ background: '#8B5CF6' }}>📍</span> Emplacement physique
              </h3>

              <div className="nce-grid-3">
                <div className="nce-field">
                  <label>Site</label>
                  <select value={physSite} onChange={e => setPhysSite(e.target.value)}>
                    <option value="Siège">Siège</option>
                    <option value="Annexe">Annexe</option>
                  </select>
                </div>
                <div className="nce-field">
                  <label>Bâtiment</label>
                  <select value={physBuilding} onChange={e => setPhysBuilding(e.target.value)}>
                    <option value="">Sélectionner</option>
                    {PHYSICAL_BUILDINGS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </select>
                </div>
                <div className="nce-field">
                  <label>Bureau</label>
                  <select value={physOffice} onChange={e => setPhysOffice(e.target.value)}>
                    <option value="">Sélectionner</option>
                    {PHYSICAL_OFFICES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="nce-grid-2">
                <div className="nce-field">
                  <label>Trésorerie</label>
                  <select value={physTreasury} onChange={e => setPhysTreasury(e.target.value)}>
                    <option value="">Sélectionner</option>
                    {PHYSICAL_TREASURIES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="nce-field">
                  <label>Étagère</label>
                  <select value={physShelf} onChange={e => setPhysShelf(e.target.value)}>
                    <option value="">Sélectionner</option>
                    {PHYSICAL_SHELVES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="nce-grid-2">
                <div className="nce-field">
                  <label>Numéro de boîte</label>
                  <div className="nce-auto-number" style={{ fontSize: 12 }}>
                    <MapPin size={13} /> Auto-généré
                  </div>
                </div>
                <div className="nce-field">
                  <label>Numéro de document</label>
                  <div className="nce-auto-number" style={{ fontSize: 12 }}>
                    <MapPin size={13} /> Auto-généré
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Row 4: Classification + Distribution */}
          <div className="nce-row">

            {/* ── Section 5: Classification ── */}
            <div className="nce-card">
              <h3 className="nce-card-title">
                <span className="nce-step-badge" style={{ background: '#F59E0B' }}>5</span> Classification
              </h3>

              <div className="nce-grid-2">
                <div className="nce-field">
                  <label>Catégorie <span className="nce-req">*</span></label>
                  <div className="nce-auto-number" style={{ fontSize: 13 }}>
                    <FileText size={14} /> Courrier entrant
                  </div>
                </div>
                <div className="nce-field">
                  <label>Statut <span className="nce-req">*</span></label>
                  <div className="nce-statut-select">
                    <span className="nce-statut-dot" style={{
                      background: statut === 'nouveau' ? '#3B82F6' : statut === 'en_traitement' ? '#F59E0B' : statut === 'traite' ? '#22C55E' : '#94A3B8'
                    }} />
                    <select value={statut} onChange={e => setStatut(e.target.value)} style={{ flex: 1 }}>
                      <option value="nouveau">Nouveau</option>
                      <option value="en_traitement">En traitement</option>
                      <option value="traite">Traité</option>
                      <option value="archive">Archivé</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="nce-field">
                <label>Tags</label>
                <div className="nce-tags-input" onClick={() => document.getElementById('nce-tag-input')?.focus()}>
                  {tags.map(t => (
                    <span key={t} className="nce-tag">
                      {t} <button type="button" onClick={() => removeTag(t)}>×</button>
                    </span>
                  ))}
                  <input
                    id="nce-tag-input"
                    placeholder={tags.length === 0 ? 'Ajouter un tag...' : ''}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                  />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                  {CE_TAGS.filter(t => !tags.includes(t)).map(t => (
                    <button key={t} type="button" onClick={() => setTags(prev => [...prev, t])}
                      style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text-muted)', cursor: 'pointer' }}>
                      + {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Section 6: Distribution ── */}
            <div className="nce-card">
              <h3 className="nce-card-title">
                <span className="nce-step-badge" style={{ background: '#6366F1' }}>6</span> Distribution
              </h3>

              <div className="nce-field">
                <label>Destinataires</label>
                <div className="nce-dist-search">
                  <input
                    type="text"
                    placeholder="Rechercher des utilisateurs..."
                    value={distSearch}
                    onChange={e => setDistSearch(e.target.value)}
                  />
                </div>
                {distSearch && filteredUsers.length > 0 && (
                  <div style={{
                    background: 'var(--dash-card-bg)',
                    border: '1px solid var(--dash-border)',
                    borderRadius: 12, overflow: 'hidden',
                    maxHeight: 160, overflowY: 'auto',
                    boxShadow: '0 4px 16px rgba(0,0,0,.1)'
                  }}>
                    {filteredUsers.slice(0, 6).map(u => (
                      <div key={u.id}
                        onClick={() => addDist(u)}
                        style={{
                          padding: '9px 14px', cursor: 'pointer',
                          fontSize: 12, color: 'var(--dash-text)',
                          borderBottom: '1px solid var(--dash-border)',
                          transition: 'background 150ms',
                          display: 'flex', alignItems: 'center', gap: 8
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--dash-bg)')}
                        onMouseLeave={e => (e.currentTarget.style.background = '')}
                      >
                        <div className="nce-dist-chip-avatar">
                          {(u.first_name?.[0] || u.username?.[0] || '?').toUpperCase()}
                        </div>
                        {u.first_name} {u.last_name} {!u.first_name && u.username}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {distChips.length > 0 && (
                <div className="nce-dist-chips">
                  {distChips.map(u => (
                    <div key={u.id} className="nce-dist-chip">
                      <div className="nce-dist-chip-avatar">
                        {(u.first_name?.[0] || u.username?.[0] || '?').toUpperCase()}
                      </div>
                      {u.first_name || u.username}
                      <button type="button" onClick={() => removeDist(u.id)}>×</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="nce-notif-row">
                <label className="nce-notif-item">
                  <input type="checkbox" checked={notifEmail} onChange={e => setNotifEmail(e.target.checked)} />
                  Notification par email
                </label>
                <label className="nce-notif-item">
                  <input type="checkbox" checked={notifInterne} onChange={e => setNotifInterne(e.target.checked)} />
                  Notification interne
                </label>
              </div>

              <div className="nce-field">
                <label>Date limite (optionnel)</label>
                <input type="date" value={dateLimite} onChange={e => setDateLimite(e.target.value)} />
              </div>
            </div>
          </div>

        </div>{/* end .nce-left */}

        {/* ── Right sidebar ── */}
        <div className="nce-right">

          {/* Summary */}
          <div className="nce-summary">
            <h3>Résumé du courrier</h3>
            <div className="nce-sum-row">
              <span className="nce-sum-label">Numéro</span>
              <span className="nce-sum-value" style={{ color: '#FF6B00', fontWeight: 600 }}>{autoNumero}</span>
            </div>
            <div className="nce-sum-row">
              <span className="nce-sum-label">Expéditeur</span>
              <span className="nce-sum-value">{selectedCorr?.name || expediteur || '-'}</span>
            </div>
            <div className="nce-sum-row">
              <span className="nce-sum-label">Objet</span>
              <span className="nce-sum-value" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {objet || '-'}
              </span>
            </div>
            <div className="nce-sum-row">
              <span className="nce-sum-label">Date réception</span>
              <span className="nce-sum-value">{dateReception || '-'}</span>
            </div>
            <div className="nce-sum-row">
              <span className="nce-sum-label">Priorité</span>
              <span className="nce-sum-value">
                <span className="nce-prio-dot" style={{ background: prioColor[priorite] }} />
                {priorite.charAt(0).toUpperCase() + priorite.slice(1)}
              </span>
            </div>
            <div className="nce-sum-row">
              <span className="nce-sum-label">Fichier</span>
              <span className="nce-sum-value">{file ? file.name : '-'}</span>
            </div>
            <div className="nce-sum-row">
              <span className="nce-sum-label">Affectation</span>
              <span className="nce-sum-value">
                {serviceId ? services.find((s: any) => s.id === serviceId)?.name
                  : departementId ? departements.find((d: any) => d.id === departementId)?.name
                  : '-'}
              </span>
            </div>
          </div>

          {/* Progression */}
          <div className="nce-progress-card">
            <h3>Progression</h3>
            <div className="nce-prog-ring-wrap">
              <ProgressRing pct={progress} />
              <div className="nce-prog-steps">
                {steps.map(s => (
                  <div key={s.label} className="nce-prog-step">
                    <div className={`nce-prog-check ${s.done ? 'done' : ''}`}>
                      {s.done && '✓'}
                    </div>
                    <span style={{ color: s.done ? 'var(--dash-text)' : undefined }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>{/* end .nce-right */}
      </div>{/* end .nce-main */}

      {/* ── Action Bar ── */}
      <div className="nce-action-bar">
        <button className="nce-btn-cancel" type="button" onClick={() => navigate('/courriers-entrants')}>
          Annuler
        </button>
        <div className="nce-action-right">
          <button className="nce-btn-draft" type="button" disabled={submitting}
            onClick={() => handleSubmit('brouillon')}>
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <FilePenLine size={14} />}
            Enregistrer comme brouillon
          </button>
          <button className="nce-btn-distribute" type="button" disabled={submitting}
            onClick={() => handleSubmit('distribuer')}>
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Enregistrer et distribuer
          </button>
          <button className="nce-btn-save" type="button" disabled={submitting}
            onClick={() => handleSubmit('enregistrer')}>
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Enregistrer le courrier
          </button>
        </div>
      </div>
    </div>
  );
}
