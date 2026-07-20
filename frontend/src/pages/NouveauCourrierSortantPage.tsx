import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock, Plus, Search, UploadCloud, X, Check, Send,
  FilePenLine, ChevronRight, Info, Loader2, FileText, MapPin
} from 'lucide-react';

import { courriersService } from '../services/courriers';
import { correspondantsService, directionsService, departementsService, servicesService } from '../services/organization';
import { useDependentDropdowns } from '../hooks/useDependentDropdowns';
import { useOrganizationCrud } from '../hooks/useOrganization';
import { useDossiers } from '../hooks/useDossiers';
import api from '../utils/api';
import {
  CS_TYPES, CS_CANAUX, CS_SIGNATURES, CS_STATUSES, CS_WORKFLOWS, CS_TAGS,
  PRIORITIES, CONFIDENTIALITIES,
  DIRECTIONS_STATIC, DEPARTEMENTS_BY_DIR, SERVICES_BY_DEPT, DeptKey, SvcKey,
  PHYSICAL_BUILDINGS, PHYSICAL_OFFICES, PHYSICAL_TREASURIES, PHYSICAL_SHELVES,
} from '../constants/dropdowns';

// Reuse the entrant CSS (shared base classes) + sortant overrides
import '../styles/nouveau-courrier-entrant.css';
import '../styles/nouveau-courrier-sortant.css';

/* ─── Progress Ring ─────────────────────────────────── */
function ProgressRing({ pct }: { pct: number }) {
  const r = 30; const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="nce-prog-ring">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle className="nce-prog-ring-track" cx="36" cy="36" r={r} />
        <circle className="nce-prog-ring-fill" cx="36" cy="36" r={r}
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ stroke: '#3B82F6' }} />
      </svg>
      <div className="nce-prog-pct">{pct}%</div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export function NouveauCourrierSortantPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Core fields
  const [objet, setObjet]                     = useState('');
  const [typeCourrier, setTypeCourrier]       = useState('lettre');
  const [destinataire, setDestinataire]       = useState('');
  const [refInterne, setRefInterne]           = useState('');
  const [dateEnvoi, setDateEnvoi]             = useState(new Date().toISOString().split('T')[0]);
  const [heureEnvoi, setHeureEnvoi]           = useState(
    new Date().toTimeString().slice(0, 5)
  );
  const [canalEnvoi, setCanalEnvoi]           = useState('email');
  const [signature, setSignature]             = useState('electronique');
  const [priorite, setPriorite]               = useState('normale');
  const [confidentialite, setConfidentialite] = useState('public');
  const [statut, setStatut]                   = useState('brouillon');

  // ── Extra fields
  const [numeroExpedition, setNumeroExpedition] = useState('');
  const [dateExpedition, setDateExpedition]     = useState('');

  // ── Affectation (API or static fallback)
  const [directionId, setDirectionId]     = useState<number | ''>('');
  const [departementId, setDepartementId] = useState<number | ''>('');
  const [serviceId, setServiceId]         = useState<number | ''>('');
  const [dossierId, setDossierId]         = useState<number | ''>('');
  // static dependent selects
  const [staticDirKey, setStaticDirKey]   = useState<DeptKey | ''>('');
  const [staticDeptKey, setStaticDeptKey] = useState<SvcKey | ''>('');
  const staticDepts = staticDirKey ? DEPARTEMENTS_BY_DIR[staticDirKey] ?? [] : [];
  const staticSvcs  = staticDeptKey ? SERVICES_BY_DEPT[staticDeptKey as SvcKey] ?? [] : [];

  // ── Correspondent (destinataire externe)
  const [corrSearch, setCorrSearch]     = useState('');
  const [corrResults, setCorrResults]   = useState<any[]>([]);
  const [selectedCorr, setSelectedCorr] = useState<any>(null);
  const [corrLoading, setCorrLoading]   = useState(false);

  // ── File
  const [file, setFile]           = useState<File | null>(null);
  const [ocrPdf, setOcrPdf]       = useState(true);

  // ── Physical Location
  const [physSite, setPhysSite]           = useState('Siège');
  const [physBuilding, setPhysBuilding]   = useState('');
  const [physOffice, setPhysOffice]       = useState('');
  const [physTreasury, setPhysTreasury]   = useState('');
  const [physShelf, setPhysShelf]         = useState('');

  // ── Tags
  const [tags, setTags]           = useState<string[]>([]);
  const [tagInput, setTagInput]   = useState('');

  // ── Distribution interne
  const [users, setUsers]               = useState<any[]>([]);
  const [distSearch, setDistSearch]     = useState('');
  const [distChips, setDistChips]       = useState<any[]>([]);
  const [notifEmail, setNotifEmail]     = useState(true);
  const [notifInterne, setNotifInterne] = useState(true);
  const [creerTache, setCreerTache]     = useState(false);
  const [validationRequise, setValidationRequise] = useState(true);
  const [workflowVal, setWorkflowVal]   = useState('validation_simple');
  const [dateLimite, setDateLimite]     = useState('');

  // ── Submit
  const [submitting, setSubmitting] = useState(false);
  const autoNumero = 'AGR-CS-' + new Date().getFullYear() + '-XXXX';

  // ── Organization data
  const {
    directions,
    departements,
    services,
    fetchDepartements,
    fetchServices,
  } = useDependentDropdowns();
  const { dossiers }            = useDossiers();

  // ── Load users
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
    const t = setTimeout(() => searchCorrespondants(corrSearch), 350);
    return () => clearTimeout(t);
  }, [corrSearch, searchCorrespondants]);

  // ── File handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  };

  // ── Tags
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };
  const removeTag = (t: string) => setTags(prev => prev.filter(x => x !== t));

  // ── Distribution
  const filteredUsers = users.filter(u =>
    !distChips.find(c => c.id === u.id) &&
    (`${u.first_name} ${u.last_name} ${u.username}`).toLowerCase().includes(distSearch.toLowerCase())
  );
  const addDist = (u: any) => { setDistChips(prev => [...prev, u]); setDistSearch(''); };
  const removeDist = (id: number) => setDistChips(prev => prev.filter(c => c.id !== id));

  // ── Progression
  const steps = [
    { label: 'Métadonnées',  done: !!(objet && dateEnvoi) },
    { label: 'Destinataire', done: !!(selectedCorr || destinataire) },
    { label: 'Pièce jointe', done: !!file },
    { label: 'Affectation',  done: !!(directionId || departementId) },
    { label: 'Validation',   done: distChips.length > 0 || !validationRequise },
  ];
  const doneCnt  = steps.filter(s => s.done).length;
  const progress = Math.round((doneCnt / steps.length) * 100);

  const prioColor: Record<string, string> = {
    basse: '#22C55E', normale: '#3B82F6', haute: '#F59E0B', urgente: '#EF4444'
  };

  // ── Submit
  const handleSubmit = async (mode: 'brouillon' | 'validation' | 'envoyer') => {
    if (!objet) return alert("Veuillez saisir l'objet du courrier.");
    if (!destinataire && !selectedCorr) return alert("Veuillez renseigner le destinataire.");
    setSubmitting(true);
    try {
      const payload: any = {
        objet,
        type_courrier: typeCourrier,
        destinataire: selectedCorr ? selectedCorr.name : destinataire,
        date_envoi: dateEnvoi,
        canal_envoi: canalEnvoi,
        signature,
        confidentialite,
        statut: mode === 'brouillon' ? 'brouillon' : mode === 'validation' ? 'en_validation' : 'envoye',
        priorite,
        numero_expedition: numeroExpedition || null,
        date_expedition: dateExpedition || null,
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

      const created = await courriersService.createSortant(payload);

      if (file) {
        await courriersService.uploadSortantAttachment(created.id, file);
      }

      const msg = mode === 'brouillon'
        ? 'Courrier enregistré comme brouillon !'
        : mode === 'validation'
        ? 'Courrier envoyé pour validation !'
        : 'Courrier sortant envoyé avec succès !';
      alert(msg);
      navigate('/courriers-sortants');
    } catch (err: any) {
      console.error(err);
      alert("Erreur lors de l'enregistrement du courrier sortant.");
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
            <span className="nce-bc-link" onClick={() => navigate('/courriers-sortants')}>Courriers sortants</span>
            <ChevronRight size={12} />
            <span className="nce-bc-active">Nouveau courrier</span>
          </div>
          <h1 className="nce-page-title">
            Nouveau courrier sortant <span className="nce-dot" style={{ color: '#3B82F6' }}>.</span>
          </h1>
          <p className="nce-page-subtitle">
            Rédigez, classez et envoyez un nouveau courrier vers un correspondant externe.
          </p>
        </div>
        <div className="ncs-hero-img">📤</div>
      </div>

      {/* ── Main Grid ── */}
      <div className="nce-main">
        <div className="nce-left">

          {/* Row 1: Informations + Destinataire */}
          <div className="nce-row">

            {/* ── Section 1: Informations ── */}
            <div className="nce-card">
              <h3 className="nce-card-title">
                <span className="nce-step-badge">1</span> Informations du courrier
              </h3>

              <div className="nce-grid-2">
                <div className="nce-field">
                  <label>Type de courrier <span className="nce-req">*</span></label>
                  <select value={typeCourrier} onChange={e => setTypeCourrier(e.target.value)}>
                    <option value="lettre">Lettre</option>
                    <option value="reponse">Réponse</option>
                    <option value="facture">Facture</option>
                    <option value="contrat">Contrat</option>
                    <option value="rapport">Rapport</option>
                  </select>
                </div>
                <div className="nce-field">
                  <label>Référence interne</label>
                  <input type="text" placeholder="Ex: REF-2026-458"
                    value={refInterne} onChange={e => setRefInterne(e.target.value)} />
                </div>
              </div>

              <div className="nce-field">
                <label>Objet <span className="nce-req">*</span></label>
                <input type="text" placeholder="Saisir l'objet du courrier"
                  value={objet} onChange={e => setObjet(e.target.value)} />
              </div>

              <div className="nce-grid-3">
                <div className="nce-field">
                  <label>Date d'envoi <span className="nce-req">*</span></label>
                  <input type="date" value={dateEnvoi} onChange={e => setDateEnvoi(e.target.value)} />
                </div>
                <div className="nce-field">
                  <label>Heure d'envoi</label>
                  <input type="time" value={heureEnvoi} onChange={e => setHeureEnvoi(e.target.value)} />
                </div>
                <div className="nce-field">
                  <label>Canal d'envoi <span className="nce-req">*</span></label>
                  <select value={canalEnvoi} onChange={e => setCanalEnvoi(e.target.value)}>
                    <option value="email">Email</option>
                    <option value="courrier_postal">Courrier postal</option>
                    <option value="main_propre">Remise en main propre</option>
                  </select>
                </div>
              </div>

              <div className="nce-grid-2">
                <div className="nce-field">
                  <label>Numéro d'expédition</label>
                  <input type="text" placeholder="Ex: EXP-2026-187"
                    value={numeroExpedition} onChange={e => setNumeroExpedition(e.target.value)} />
                </div>
                <div className="nce-field">
                  <label>Date d'expédition</label>
                  <input type="date" value={dateExpedition}
                    onChange={e => setDateExpedition(e.target.value)} />
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

              <div className="nce-grid-2">
                <div className="nce-field">
                  <label>Signature</label>
                  <select value={signature} onChange={e => setSignature(e.target.value)}>
                    {CS_SIGNATURES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Section 2: Destinataire ── */}
            <div className="nce-card">
              <h3 className="nce-card-title">
                <span className="nce-step-badge ncs-badge-blue">2</span> Destinataire
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
                        width: '100%',
                        background: 'var(--dash-bg)',
                        border: '1px solid var(--dash-border)',
                        borderRadius: 12, padding: '10px 14px 10px 36px',
                        fontSize: 13, color: 'var(--dash-text)',
                        fontFamily: 'Poppins, sans-serif', outline: 'none'
                      }}
                    />
                    <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--dash-text-muted)' }} />
                  </div>
                  <button className="nce-corr-new-btn" style={{ background: '#3B82F6' }}>
                    <Plus size={14} /> Nouveau
                  </button>
                </div>
              </div>

              {!selectedCorr && (
                <div className="nce-field">
                  <label>Saisie manuelle du destinataire <span className="nce-req">*</span></label>
                  <input type="text" placeholder="Nom du destinataire ou organisme"
                    value={destinataire} onChange={e => setDestinataire(e.target.value)} />
                </div>
              )}

              {corrSearch && !selectedCorr && (
                <div className="nce-corr-results">
                  {corrLoading && <div className="nce-no-corr">Recherche...</div>}
                  {!corrLoading && corrResults.length === 0 && (
                    <div className="nce-no-corr">Aucun correspondant trouvé.</div>
                  )}
                  {corrResults.map((c: any) => (
                    <div key={c.id} className="nce-corr-card" onClick={() => {
                      setSelectedCorr(c);
                      setDestinataire(c.name);
                      setCorrSearch(''); setCorrResults([]);
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

              {selectedCorr && (
                <div className="nce-corr-card selected" style={{ borderColor: '#3B82F6', background: 'rgba(59,130,246,.04)' }}>
                  <div className="nce-corr-avatar" style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)' }}>🏛️</div>
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
            </div>
          </div>

          {/* Row 2: Affectation + Pièce jointe */}
          <div className="nce-row">

            {/* ── Section 3: Affectation ── */}
            <div className="nce-card">
              <h3 className="nce-card-title">
                <span className="nce-step-badge ncs-badge-green">3</span> Affectation
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
                  <label>Département</label>
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
                  <select value={workflowVal} onChange={e => setWorkflowVal(e.target.value)}>
                    {CS_WORKFLOWS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Section 4: Pièce jointe ── */}
            <div className="nce-card">
              <h3 className="nce-card-title">
                <span className="nce-step-badge ncs-badge-yellow">4</span> Pièce jointe
              </h3>

              {!file ? (
                <div className="nce-dropzone"
                  style={{ borderColor: 'rgba(59,130,246,.3)', background: 'rgba(59,130,246,.02)' }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}>
                  <UploadCloud size={32} style={{ color: '#3B82F6' }} />
                  <p className="nce-dropzone-text">
                    Glissez-déposez vos fichiers ici<br />
                    <span>ou cliquez pour parcourir</span>
                  </p>
                  <button className="nce-dropzone-btn"
                    style={{ borderColor: '#3B82F6', color: '#3B82F6' }}
                    type="button">Choisir un fichier</button>
                </div>
              ) : (
                <div className="nce-file-item">
                  <div className="nce-file-icon" style={{ background: '#DBEAFE', color: '#3B82F6' }}>
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

              <input type="file" ref={fileInputRef} style={{ display: 'none' }}
                onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />

              <div className="nce-ocr-row">
                <input type="checkbox" id="ocr-pdf" checked={ocrPdf}
                  onChange={e => setOcrPdf(e.target.checked)} />
                <label htmlFor="ocr-pdf" style={{ cursor: 'pointer' }}>
                  Générer automatiquement un PDF OCR{' '}
                  <Info size={12} style={{ verticalAlign: 'middle', color: 'var(--dash-text-muted)' }} />
                </label>
              </div>
            </div>
          </div>

          {/* Row 3: Physical Location */}
          <div className="nce-row">
            {/* ── Physical Location Card ── */}
            <div className="nce-card">
              <h3 className="nce-card-title">
                <span className="nce-step-badge ncs-badge-indigo">📍</span> Emplacement physique
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

          {/* Row 4: Classification + Validation & Diffusion */}
          <div className="nce-row">

            {/* ── Section 5: Classification ── */}
            <div className="nce-card">
              <h3 className="nce-card-title">
                <span className="nce-step-badge" style={{ background: '#F59E0B' }}>5</span> Classification
              </h3>

              <div className="nce-grid-2">
                <div className="nce-field">
                  <label>Catégorie <span className="nce-req">*</span></label>
                  <div className="nce-auto-number" style={{ fontSize: 13, borderColor: 'rgba(59,130,246,.3)' }}>
                    <FileText size={14} style={{ color: '#3B82F6' }} />
                    <span style={{ color: '#3B82F6' }}>Courrier sortant</span>
                  </div>
                </div>
                <div className="nce-field">
                  <label>Statut <span className="nce-req">*</span></label>
                  <div className="nce-statut-select">
                    <span className="nce-statut-dot" style={{
                      background: statut === 'brouillon' ? '#F59E0B' : statut === 'envoye' ? '#22C55E' : '#3B82F6'
                    }} />
                    <select value={statut} onChange={e => setStatut(e.target.value)} style={{ flex: 1 }}>
                      {CS_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="nce-field">
                <label>Tags</label>
                <div className="nce-tags-input" onClick={() => document.getElementById('ncs-tag-input')?.focus()}>
                  {tags.map(t => (
                    <span key={t} className="nce-tag" style={{ background: 'rgba(59,130,246,.1)', color: '#3B82F6' }}>
                      {t} <button type="button" onClick={() => removeTag(t)}>×</button>
                    </span>
                  ))}
                  <input
                    id="ncs-tag-input"
                    placeholder={tags.length === 0 ? 'Ajouter un tag...' : ''}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                  />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                  {CS_TAGS.filter(t => !tags.includes(t)).map(t => (
                    <button key={t} type="button" onClick={() => setTags(prev => [...prev, t])}
                      style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text-muted)', cursor: 'pointer' }}>
                      + {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Section 6: Validation & Diffusion ── */}
            <div className="nce-card">
              <h3 className="nce-card-title">
                <span className="nce-step-badge ncs-badge-indigo">6</span> Validation &amp; Diffusion
              </h3>

              <div className="nce-field">
                <label>Destinataires internes</label>
                <div className="nce-dist-search">
                  <input type="text" placeholder="Rechercher des utilisateurs..."
                    value={distSearch} onChange={e => setDistSearch(e.target.value)} />
                </div>
                {distSearch && filteredUsers.length > 0 && (
                  <div style={{
                    background: 'var(--dash-card-bg)', border: '1px solid var(--dash-border)',
                    borderRadius: 12, overflow: 'hidden', maxHeight: 160, overflowY: 'auto',
                    boxShadow: '0 4px 16px rgba(0,0,0,.1)'
                  }}>
                    {filteredUsers.slice(0, 6).map(u => (
                      <div key={u.id} onClick={() => addDist(u)}
                        style={{
                          padding: '9px 14px', cursor: 'pointer', fontSize: 12, color: 'var(--dash-text)',
                          borderBottom: '1px solid var(--dash-border)', transition: 'background 150ms',
                          display: 'flex', alignItems: 'center', gap: 8
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--dash-bg)')}
                        onMouseLeave={e => (e.currentTarget.style.background = '')}>
                        <div className="nce-dist-chip-avatar" style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)' }}>
                          {(u.first_name?.[0] || u.username?.[0] || '?').toUpperCase()}
                        </div>
                        {u.first_name} {u.last_name} {!u.first_name && u.username}
                      </div>
                    ))}
                  </div>
                )}
                {distChips.length > 0 && (
                  <div className="nce-dist-chips" style={{ marginTop: 8 }}>
                    {distChips.map(u => (
                      <div key={u.id} className="nce-dist-chip">
                        <div className="nce-dist-chip-avatar" style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)' }}>
                          {(u.first_name?.[0] || u.username?.[0] || '?').toUpperCase()}
                        </div>
                        {u.first_name || u.username}
                        <button type="button" onClick={() => removeDist(u.id)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="nce-notif-row">
                <label className="nce-notif-item">
                  <input type="checkbox" checked={notifEmail} onChange={e => setNotifEmail(e.target.checked)} />
                  Notification email
                </label>
                <label className="nce-notif-item">
                  <input type="checkbox" checked={notifInterne} onChange={e => setNotifInterne(e.target.checked)} />
                  Notification interne
                </label>
                <label className="nce-notif-item">
                  <input type="checkbox" checked={creerTache} onChange={e => setCreerTache(e.target.checked)} />
                  Créer une tâche
                </label>
              </div>

              <div className="nce-grid-3">
                <div className="nce-field">
                  <label>Validation requise ?</label>
                  <div className="ncs-radio-group">
                    <label className="ncs-radio-label">
                      <input type="radio" name="validation" checked={validationRequise}
                        onChange={() => setValidationRequise(true)} /> Oui
                    </label>
                    <label className="ncs-radio-label">
                      <input type="radio" name="validation" checked={!validationRequise}
                        onChange={() => setValidationRequise(false)} /> Non
                    </label>
                  </div>
                </div>
                <div className="nce-field">
                  <label>Workflow</label>
                  <select value={workflowVal} onChange={e => setWorkflowVal(e.target.value)}>
                    {CS_WORKFLOWS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                  </select>
                </div>
                <div className="nce-field">
                  <label>Date limite (optionnelle)</label>
                  <input type="date" value={dateLimite} onChange={e => setDateLimite(e.target.value)} />
                </div>
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
              <span className="nce-sum-value" style={{ color: '#3B82F6', fontWeight: 600 }}>{autoNumero}</span>
            </div>
            <div className="nce-sum-row">
              <span className="nce-sum-label">Destinataire</span>
              <span className="nce-sum-value">{selectedCorr?.name || destinataire || '-'}</span>
            </div>
            <div className="nce-sum-row">
              <span className="nce-sum-label">Objet</span>
              <span className="nce-sum-value" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {objet || '-'}
              </span>
            </div>
            <div className="nce-sum-row">
              <span className="nce-sum-label">Date d'envoi</span>
              <span className="nce-sum-value">{dateEnvoi || '-'}</span>
            </div>
            <div className="nce-sum-row">
              <span className="nce-sum-label">Service</span>
              <span className="nce-sum-value">
                {serviceId ? services.find((s: any) => s.id === serviceId)?.name : '-'}
              </span>
            </div>
            <div className="nce-sum-row">
              <span className="nce-sum-label">Workflow</span>
              <span className="nce-sum-value">{workflowVal.replace(/_/g, ' ')}</span>
            </div>
            <div className="nce-sum-row">
              <span className="nce-sum-label">Priorité</span>
              <span className="nce-sum-value">
                <span className="nce-prio-dot" style={{ background: prioColor[priorite] }} />
                {priorite.charAt(0).toUpperCase() + priorite.slice(1)}
              </span>
            </div>
            <div className="nce-sum-row">
              <span className="nce-sum-label">Statut</span>
              <span className="nce-sum-value">
                <span className="nce-prio-dot" style={{ background: statut === 'brouillon' ? '#F59E0B' : '#3B82F6' }} />
                {statut === 'brouillon' ? 'À envoyer' : statut}
              </span>
            </div>
            <div className="nce-sum-row">
              <span className="nce-sum-label">Fichier</span>
              <span className="nce-sum-value">{file ? file.name : '-'}</span>
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
                    <div className={`nce-prog-check ${s.done ? 'done' : ''}`}
                      style={s.done ? { background: '#3B82F6', borderColor: '#3B82F6' } : {}}>
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
        <button className="nce-btn-cancel" type="button"
          onClick={() => navigate('/courriers-sortants')}>
          Annuler
        </button>
        <div className="nce-action-right">
          <button className="nce-btn-draft" type="button" disabled={submitting}
            onClick={() => handleSubmit('brouillon')}>
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <FilePenLine size={14} />}
            Enregistrer comme brouillon
          </button>
          <button className="nce-btn-validate" type="button" disabled={submitting}
            onClick={() => handleSubmit('validation')}>
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Envoyer pour validation
          </button>
          <button className="nce-btn-send" type="button" disabled={submitting}
            onClick={() => handleSubmit('envoyer')}>
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Envoyer le courrier
          </button>
        </div>
      </div>
    </div>
  );
}
