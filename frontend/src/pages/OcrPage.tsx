import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, ZoomIn, ZoomOut, RotateCcw, RotateCw, Maximize2,
  Search, Copy, Download, RefreshCw, CheckCircle, AlertTriangle,
  Clock, ChevronRight, Type, Sparkles, Loader2, Play, X,
  Bold, Italic, Underline, List, AlignLeft, Lightbulb, Upload,
  Eye, FileDown, Languages, Settings, Activity, BarChart3
} from 'lucide-react';
import { ocrService } from '../services/ocr';
import { documentsService } from '../services/documents';
import { useOrganizationCrud } from '../hooks/useOrganization';
import { useDependentDropdowns } from '../hooks/useDependentDropdowns';
import {
  categoriesService, directionsService, departementsService, servicesService
} from '../services/organization';
import { useDossiers } from '../hooks/useDossiers';
import '../styles/ocr.css';

/* ─── Helpers ──────────────────────────────────── */
function statusBadgeClass(s: string) {
  if (s === 'en_attente') return 'queued';
  if (s === 'en_cours') return 'running';
  if (s === 'termine') return 'completed';
  if (s === 'erreur') return 'failed';
  return '';
}
function statusLabel(s: string) {
  const m: Record<string, string> = {
    en_attente: 'En attente', en_cours: 'En cours',
    termine: 'Terminé', erreur: 'Erreur',
  };
  return m[s] || s;
}
function langLabel(l: string) {
  const m: Record<string, string> = { fra: 'Français', eng: 'English', ara: 'العربية' };
  return m[l] || l;
}
function downloadBlob(content: string, filename: string, mime = 'text/plain') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* ═══════════════════════════════════════════════════
   OCR PAGE
   ═══════════════════════════════════════════════════ */
export function OcrPage() {
  const navigate = useNavigate();

  /* ─── Job list ─────────────────────────── */
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [activePageIdx, setActivePageIdx] = useState(0);
  const [editedText, setEditedText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ─── New job form ─────────────────────── */
  const [availableDocs, setAvailableDocs] = useState<any[]>([]);
  const [targetDocId, setTargetDocId] = useState<number | string>('');
  const [processing, setProcessing] = useState(false);

  /* ─── OCR Settings ─────────────────────── */
  const [ocrLang, setOcrLang] = useState('fra');
  const [ocrEngine, setOcrEngine] = useState('tesseract');
  const [ocrMode, setOcrMode] = useState('accurate');
  const [ocrOutput, setOcrOutput] = useState('searchable_pdf');
  const [autoDetectLang, setAutoDetectLang] = useState(false);
  const [preserveLayout, setPreserveLayout] = useState(true);
  const [autoIndex, setAutoIndex] = useState(true);

  /* ─── Preview ──────────────────────────── */
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  /* ─── Metadata (classification) ────────── */
  const { items: categories } = useOrganizationCrud(categoriesService);
  const {
    directions,
    departements,
    services,
    fetchDepartements,
    fetchServices,
  } = useDependentDropdowns();
  const { dossiers } = useDossiers();

  const [metaTitle, setMetaTitle] = useState('');
  const [metaCategory, setMetaCategory] = useState('');
  const [metaDirection, setMetaDirection] = useState('');
  const [metaDept, setMetaDept] = useState('');
  const [metaService, setMetaService] = useState('');
  const [metaDossier, setMetaDossier] = useState('');
  const [metaTags, setMetaTags] = useState('');

  /* ─── File input ref ───────────────────── */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ═══ Data fetching ═══════════════════════ */
  const fetchJobs = useCallback(async () => {
    try {
      const data = await ocrService.getJobs();
      const results = data.results || data || [];
      setJobs(results);
      if (results.length > 0 && selectedJobId === null) {
        setSelectedJobId(results[0].id);
      }
    } catch (err) { console.error(err); }
  }, [selectedJobId]);

  const fetchDocuments = useCallback(async () => {
    try {
      const docs = await documentsService.getDocuments({ limit: 100 });
      setAvailableDocs(docs.results || docs || []);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ═══ Job detail + polling ═══════════════ */
  useEffect(() => {
    if (selectedJobId === null) { setLoading(false); return; }

    let cancelled = false;
    let poll: any = null;

    const loadDetails = async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
        const job = await ocrService.getJob(selectedJobId);
        if (cancelled) return;
        setSelectedJob(job);

        const pagesData = await ocrService.getPages({ job: selectedJobId });
        if (cancelled) return;
        const sorted = (pagesData.results || pagesData || [])
          .sort((a: any, b: any) => a.page_number - b.page_number);
        setPages(sorted);

        if (sorted.length > 0) {
          const idx = activePageIdx < sorted.length ? activePageIdx : 0;
          setEditedText(sorted[idx]?.text || '');
        } else if (job.result?.full_text) {
          setEditedText(job.result.full_text);
        }

        // Prefill metadata from document
        if (job.document_details) {
          setMetaTitle(prev => prev || job.document_details.title || '');
        }

        if (['en_attente', 'en_cours'].includes(job.status)) {
          if (!poll) poll = setInterval(() => loadDetails(false), 3000);
        } else {
          if (poll) { clearInterval(poll); poll = null; }
        }
      } catch (err) { console.error(err); }
      finally { if (showLoader) setLoading(false); }
    };

    loadDetails(true);
    return () => { cancelled = true; if (poll) clearInterval(poll); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJobId]);

  /* ═══ Keep edited text in sync with page switch ═══ */
  useEffect(() => {
    if (pages.length > 0 && activePageIdx < pages.length) {
      setEditedText(pages[activePageIdx]?.text || '');
    }
  }, [activePageIdx, pages]);

  /* ═══ Actions ════════════════════════════ */
  const handleStartOcr = async () => {
    if (!targetDocId) return alert('Veuillez sélectionner un document.');
    setProcessing(true);
    try {
      const newJob = await ocrService.processDocument(
        Number(targetDocId), undefined, ocrLang, ocrEngine
      );
      setSelectedJobId(newJob.id);
      fetchJobs();
    } catch (err) {
      console.error(err);
      alert('Erreur lors du déclenchement du traitement OCR');
    } finally {
      setProcessing(false);
    }
  };

  const handleRetry = async () => {
    if (!selectedJobId) return;
    try {
      await ocrService.retryJob(selectedJobId);
      const fetched = await ocrService.getJob(selectedJobId);
      setSelectedJob(fetched);
    } catch (err) { console.error(err); }
  };

  const handleSaveText = async () => {
    if (!selectedJobId) return;
    setSaving(true);
    try {
      if (pages.length > 0) {
        await ocrService.updateText(
          selectedJobId, editedText, pages[activePageIdx]?.page_number
        );
      } else {
        await ocrService.updateText(selectedJobId, editedText);
      }
      alert('Texte OCR enregistré !');
      // Reload
      const pagesData = await ocrService.getPages({ job: selectedJobId });
      const sorted = (pagesData.results || pagesData || [])
        .sort((a: any, b: any) => a.page_number - b.page_number);
      setPages(sorted);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedText);
    alert('Texte copié dans le presse-papiers !');
  };

  const handleDownloadTxt = () => {
    const name = selectedJob?.document_details?.title || 'ocr-text';
    downloadBlob(editedText, `${name}.txt`);
  };

  const handleDownloadAllTxt = () => {
    const allText = pages.map(p => p.text || '').join('\n\n--- PAGE BREAK ---\n\n');
    const name = selectedJob?.document_details?.title || 'ocr-full';
    downloadBlob(allText || editedText, `${name}-complet.txt`);
  };

  /* ═══ Computed ═══════════════════════════ */
  const activePage = pages[activePageIdx];
  const result = selectedJob?.result;
  const confidence = result?.confidence ? Number(result.confidence) : null;
  const wordCount = editedText.split(/\s+/).filter(Boolean).length;

  const confColor = (c: number) =>
    c >= 90 ? '#22C55E' : c >= 70 ? '#F59E0B' : '#EF4444';

  /* ═══ Progression for sidebar ════════════ */
  const stepsForProgress = [
    { label: 'Document sélectionné', done: !!selectedJob },
    { label: 'OCR lancé', done: !!selectedJob && selectedJob.status !== 'en_attente' },
    { label: 'Texte extrait', done: !!selectedJob && selectedJob.status === 'termine' },
    { label: 'Métadonnées', done: !!metaTitle && !!metaCategory },
  ];
  const doneCount = stepsForProgress.filter(s => s.done).length;
  const progressPct = Math.round((doneCount / stepsForProgress.length) * 100);

  /* ═══════════════════════════════════════
     RENDER
     ═══════════════════════════════════════ */
  return (
    <div className="ocr-page">

      {/* ── Header ── */}
      <div className="ocr-header">
        <div className="ocr-breadcrumbs">
          <span className="ocr-bc-link" onClick={() => navigate('/dashboard')}>Accueil</span>
          <ChevronRight size={12} />
          <span className="ocr-bc-link" onClick={() => navigate('/documents')}>Documents</span>
          <ChevronRight size={12} />
          <span className="ocr-bc-active">OCR & Reconnaissance</span>
        </div>
        <h1 className="ocr-page-title">
          OCR & Reconnaissance de texte <span style={{ color: '#FF6B00' }}>.</span>
        </h1>
        <p className="ocr-page-subtitle">
          Extrayez et indexez le texte de vos documents numérisés via Tesseract.
        </p>
      </div>

      {/* ── Main Layout ── */}
      <div className="ocr-main">
        <div className="ocr-left">

          {/* ═══ Row 1: OCR Job + Settings ═══ */}
          <div className="ocr-row-2">

            {/* ── Card 1: OCR Job ── */}
            <div className="ocr-card">
              <div className="ocr-card-header">
                <span className="ocr-step-badge">1</span>
                <h3>Tâche OCR</h3>
              </div>

              {/* Existing job selector */}
              <div className="ocr-field">
                <label>Job OCR existant</label>
                <select
                  value={selectedJobId || ''}
                  onChange={e => { setSelectedJobId(Number(e.target.value) || null); setActivePageIdx(0); }}
                >
                  {jobs.length === 0 && <option value="">Aucun job</option>}
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>
                      Job #{j.id} — {j.document_details?.title || 'Doc inconnu'} [{statusLabel(j.status)}]
                    </option>
                  ))}
                </select>
              </div>

              {/* New OCR */}
              <div className="ocr-field">
                <label>Sélectionner un document <span className="ocr-req">*</span></label>
                <select
                  value={targetDocId}
                  onChange={e => setTargetDocId(e.target.value)}
                >
                  <option value="">-- Choisir un document --</option>
                  {availableDocs.map(d => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleStartOcr}
                disabled={processing || !targetDocId}
                className="ocr-btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              >
                {processing ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
                {processing ? 'Lancement...' : 'Lancer l\'OCR'}
              </button>

              {/* Status badge */}
              {selectedJob && (
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`ocr-status-badge ${statusBadgeClass(selectedJob.status)}`}>
                    {selectedJob.status === 'en_cours' && <Loader2 size={11} className="animate-spin" />}
                    {selectedJob.status === 'termine' && <CheckCircle size={11} />}
                    {selectedJob.status === 'erreur' && <AlertTriangle size={11} />}
                    {selectedJob.status === 'en_attente' && <Clock size={11} />}
                    {statusLabel(selectedJob.status)}
                  </span>
                  {selectedJob.status === 'erreur' && (
                    <button onClick={handleRetry} className="ocr-btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>
                      <RefreshCw size={11} /> Relancer
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Card 2: OCR Settings ── */}
            <div className="ocr-card">
              <div className="ocr-card-header">
                <span className="ocr-step-badge" style={{ background: '#6366F1' }}>2</span>
                <h3>Paramètres OCR</h3>
              </div>

              {/* Language */}
              <div className="ocr-segment">
                <span className="ocr-segment-label">Langue</span>
                <div className="ocr-segment-ctrl">
                  {[
                    { v: 'fra', l: 'Français' },
                    { v: 'eng', l: 'English' },
                    { v: 'ara', l: 'العربية' },
                  ].map(o => (
                    <button key={o.v} className={`ocr-seg-opt ${ocrLang === o.v ? 'active' : ''}`}
                      onClick={() => setOcrLang(o.v)}>{o.l}</button>
                  ))}
                </div>
              </div>

              {/* Engine */}
              <div className="ocr-segment">
                <span className="ocr-segment-label">Moteur</span>
                <div className="ocr-segment-ctrl">
                  <button className="ocr-seg-opt active">Tesseract</button>
                </div>
              </div>

              {/* Mode */}
              <div className="ocr-segment">
                <span className="ocr-segment-label">Mode</span>
                <div className="ocr-segment-ctrl">
                  {['fast', 'accurate'].map(m => (
                    <button key={m} className={`ocr-seg-opt ${ocrMode === m ? 'active' : ''}`}
                      onClick={() => setOcrMode(m)}>
                      {m === 'fast' ? 'Rapide' : 'Précis'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Output */}
              <div className="ocr-segment">
                <span className="ocr-segment-label">Format de sortie</span>
                <div className="ocr-segment-ctrl">
                  {[
                    { v: 'searchable_pdf', l: 'PDF' },
                    { v: 'txt', l: 'TXT' },
                    { v: 'json', l: 'JSON' },
                  ].map(o => (
                    <button key={o.v} className={`ocr-seg-opt ${ocrOutput === o.v ? 'active' : ''}`}
                      onClick={() => setOcrOutput(o.v)}>{o.l}</button>
                  ))}
                </div>
              </div>

              {/* Checkboxes */}
              <label className="ocr-checkbox">
                <input type="checkbox" checked={autoDetectLang}
                  onChange={e => setAutoDetectLang(e.target.checked)} />
                Détection automatique de la langue
              </label>
              <label className="ocr-checkbox">
                <input type="checkbox" checked={preserveLayout}
                  onChange={e => setPreserveLayout(e.target.checked)} />
                Préserver la mise en page
              </label>
              <label className="ocr-checkbox">
                <input type="checkbox" checked={autoIndex}
                  onChange={e => setAutoIndex(e.target.checked)} />
                Indexation automatique
              </label>
            </div>
          </div>

          {/* ═══ Row 2: Progress Banner (when job selected) ═══ */}
          {selectedJob && (
            <div className="ocr-card">
              <div className="ocr-progress-banner">
                <div className="ocr-prog-icon">
                  <FileText size={22} className="text-orange-500" style={{ color: '#FF6B00' }} />
                </div>
                <div style={{ flex: '0 0 auto' }}>
                  <strong style={{ fontSize: 13, display: 'block' }}>
                    {selectedJob.document_details?.title || 'Document'}
                  </strong>
                  <span style={{ fontSize: 10, color: 'var(--dash-text-muted)' }}>
                    {pages.length} page{pages.length !== 1 ? 's' : ''} • {selectedJob.engine}
                  </span>
                </div>
                <div className="ocr-prog-bar-wrap">
                  <div className="ocr-prog-bar-labels">
                    <span style={{ color: 'var(--dash-text-muted)' }}>
                      Progression OCR ({statusLabel(selectedJob.status)})
                    </span>
                    <span style={{ color: '#FF6B00' }}>{selectedJob.progress}%</span>
                  </div>
                  <div className="ocr-prog-bar-track">
                    <div className="ocr-prog-bar-fill" style={{ width: `${selectedJob.progress}%` }} />
                  </div>
                  {selectedJob.status === 'en_cours' && (
                    <span style={{ fontSize: 10, color: 'var(--dash-text-muted)', fontStyle: 'italic' }}>
                      Reconnaissance de texte en cours...
                    </span>
                  )}
                  {selectedJob.status === 'erreur' && (
                    <span style={{ fontSize: 10, color: '#EF4444', fontStyle: 'italic' }}>
                      Erreur : {selectedJob.error_message}
                    </span>
                  )}
                </div>
                <div className="ocr-prog-stats">
                  {[
                    ['Langue', langLabel(selectedJob.language)],
                    ['Moteur', selectedJob.engine],
                    ['Statut', statusLabel(selectedJob.status)],
                  ].map(([l, v]) => (
                    <div key={l} className="ocr-prog-stat">
                      <span className="ocr-prog-stat-label">{l}</span>
                      <span className="ocr-prog-stat-value">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ Row 3: Preview + Text Editor ═══ */}
          {selectedJob && (
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

              {/* Thumbnails */}
              <div className="ocr-thumbs">
                {pages.map((p, idx) => (
                  <button key={p.id} className="ocr-thumb"
                    onClick={() => setActivePageIdx(idx)}>
                    <div className={`ocr-thumb-img ${activePageIdx === idx ? 'active' : ''}`}>
                      <div className="ocr-thumb-bar" />
                      <div className="ocr-thumb-bar" />
                      <div className="ocr-thumb-bar" />
                      <div className="ocr-thumb-text">{p.text?.slice(0, 60) || '...'}</div>
                    </div>
                    <span className={`ocr-thumb-label ${activePageIdx === idx ? 'active' : ''}`}>
                      Page {p.page_number}
                    </span>
                  </button>
                ))}
                {pages.length === 0 && (
                  <div style={{ fontSize: 10, color: 'var(--dash-text-muted)', textAlign: 'center' }}>
                    Aucune page
                  </div>
                )}
              </div>

              {/* Preview card */}
              <div className="ocr-card" style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
                <div className="ocr-preview-toolbar">
                  <span className="ocr-preview-toolbar-label">Aperçu du document</span>
                  <div className="ocr-preview-actions">
                    <button className="ocr-preview-btn" onClick={() => setZoom(z => Math.max(25, z - 15))}>
                      <ZoomOut size={14} />
                    </button>
                    <span className="ocr-zoom-text">{zoom}%</span>
                    <button className="ocr-preview-btn" onClick={() => setZoom(z => Math.min(300, z + 15))}>
                      <ZoomIn size={14} />
                    </button>
                    <button className="ocr-preview-btn" onClick={() => setRotation(r => (r - 90 + 360) % 360)}>
                      <RotateCcw size={14} />
                    </button>
                    <button className="ocr-preview-btn" onClick={() => setRotation(r => (r + 90) % 360)}>
                      <RotateCw size={14} />
                    </button>
                    <button className="ocr-preview-btn" onClick={() => { setZoom(100); setRotation(0); }}>
                      <RefreshCw size={14} />
                    </button>
                    <button className="ocr-preview-btn" title="Plein écran">
                      <Maximize2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="ocr-preview-canvas">
                  {activePage?.image_file ? (
                    <img
                      src={activePage.image_file}
                      alt={`Page ${activePage.page_number}`}
                      style={{ transform: `rotate(${rotation}deg) scale(${zoom / 100})` }}
                    />
                  ) : (
                    <div className="ocr-preview-empty">
                      <FileText size={48} />
                      <span>Aperçu non disponible</span>
                      <span style={{ fontSize: 11 }}>Le texte reconnu est affiché à droite.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Text editor card */}
              <div className="ocr-card" style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
                <div className="ocr-text-toolbar">
                  <span className="ocr-text-toolbar-label">Texte reconnu (modifiable)</span>
                  <button className="ocr-text-btn"><Bold size={13} /></button>
                  <button className="ocr-text-btn"><Italic size={13} /></button>
                  <button className="ocr-text-btn"><Underline size={13} /></button>
                  <button className="ocr-text-btn"><List size={13} /></button>
                  <button className="ocr-text-btn"><AlignLeft size={13} /></button>
                  <button className="ocr-text-btn" onClick={() => {
                    const q = prompt('Rechercher :');
                    if (q) {
                      const idx = editedText.toLowerCase().indexOf(q.toLowerCase());
                      if (idx >= 0) alert(`Trouvé à la position ${idx}`);
                      else alert('Non trouvé');
                    }
                  }}><Search size={13} /></button>
                </div>
                <textarea
                  className="ocr-textarea"
                  value={editedText}
                  onChange={e => setEditedText(e.target.value)}
                  placeholder="Le texte reconnu apparaîtra ici..."
                />
                <div className="ocr-text-footer">
                  <span>{wordCount} mots détectés{activePage ? ` — Page ${activePage.page_number}` : ''}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={handleCopy} className="ocr-btn-ghost" style={{ padding: '4px 10px', fontSize: 10 }}>
                      <Copy size={11} /> Copier
                    </button>
                    <button onClick={handleDownloadTxt} className="ocr-btn-ghost" style={{ padding: '4px 10px', fontSize: 10 }}>
                      <Download size={11} /> TXT
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ Row 4: Metadata + Confidence ═══ */}
          {selectedJob && selectedJob.status === 'termine' && (
            <div className="ocr-row-2">

              {/* ── Card 5: Metadata ── */}
              <div className="ocr-card">
                <div className="ocr-card-header">
                  <span className="ocr-step-badge" style={{ background: '#22C55E' }}>5</span>
                  <h3>Métadonnées</h3>
                </div>
                <div className="ocr-field">
                  <label>Titre <span className="ocr-req">*</span></label>
                  <input type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} />
                </div>
                <div className="ocr-form-group">
                  <div className="ocr-field">
                    <label>Catégorie</label>
                    <select value={metaCategory} onChange={e => setMetaCategory(e.target.value)}>
                      <option value="">Sélectionner</option>
                      {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="ocr-field">
                    <label>Direction</label>
                    <select value={metaDirection} onChange={e => { const val = e.target.value; setMetaDirection(val); setMetaDept(''); setMetaService(''); fetchDepartements(Number(val) || 0); }}>
                      <option value="">Sélectionner</option>
                      {directions.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="ocr-form-group">
                  <div className="ocr-field">
                    <label>Département</label>
                    <select value={metaDept} onChange={e => { const val = e.target.value; setMetaDept(val); setMetaService(''); fetchServices(Number(val) || 0); }}>
                      <option value="">Sélectionner</option>
                      {departements.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="ocr-field">
                    <label>Service</label>
                    <select value={metaService} onChange={e => setMetaService(e.target.value)}>
                      <option value="">Sélectionner</option>
                      {services.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="ocr-field">
                  <label>Dossier</label>
                  <select value={metaDossier} onChange={e => setMetaDossier(e.target.value)}>
                    <option value="">Sélectionner</option>
                    {dossiers.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="ocr-field">
                  <label>Tags</label>
                  <input type="text" placeholder="Entrez des tags séparés par des virgules"
                    value={metaTags} onChange={e => setMetaTags(e.target.value)} />
                </div>
              </div>

              {/* ── Card 6: Confidence ── */}
              <div className="ocr-card">
                <div className="ocr-card-header">
                  <span className="ocr-step-badge" style={{ background: '#F59E0B' }}>6</span>
                  <h3>Confiance</h3>
                </div>

                {/* Global confidence */}
                {confidence !== null && (
                  <div className="ocr-conf-bar-wrap">
                    <div className="ocr-conf-bar-head">
                      <span style={{ fontWeight: 600, color: 'var(--dash-text)' }}>Confiance globale</span>
                      <span style={{ fontWeight: 700, color: confColor(confidence) }}>{confidence}%</span>
                    </div>
                    <div className="ocr-conf-bar-track">
                      <div className="ocr-conf-bar-fill"
                        style={{ width: `${confidence}%`, background: confColor(confidence) }} />
                    </div>
                  </div>
                )}

                {/* Per-page confidence */}
                {pages.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--dash-text)', display: 'block', marginBottom: 8 }}>
                      Confiance par page
                    </span>
                    {pages.map(p => {
                      const pc = p.confidence ? Number(p.confidence) : 0;
                      return (
                        <div key={p.id} className="ocr-conf-bar-wrap" style={{ marginBottom: 6 }}>
                          <div className="ocr-conf-bar-head">
                            <span style={{ color: 'var(--dash-text-muted)' }}>Page {p.page_number}</span>
                            <span style={{ fontWeight: 600, color: confColor(pc) }}>{pc}%</span>
                          </div>
                          <div className="ocr-conf-bar-track">
                            <div className="ocr-conf-bar-fill"
                              style={{ width: `${pc}%`, background: confColor(pc) }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Stats summary */}
                {result && (
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--dash-border)', paddingBottom: 6 }}>
                      <span style={{ color: 'var(--dash-text-muted)' }}>Mots détectés</span>
                      <span style={{ fontWeight: 600, color: 'var(--dash-text)' }}>{result.words_count}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--dash-border)', paddingBottom: 6 }}>
                      <span style={{ color: 'var(--dash-text-muted)' }}>Paragraphes</span>
                      <span style={{ fontWeight: 600, color: 'var(--dash-text)' }}>{result.paragraphs}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--dash-border)', paddingBottom: 6 }}>
                      <span style={{ color: 'var(--dash-text-muted)' }}>Tableaux détectés</span>
                      <span style={{ fontWeight: 600, color: 'var(--dash-text)' }}>{result.tables_detected}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--dash-text-muted)' }}>Temps de traitement</span>
                      <span style={{ fontWeight: 600, color: 'var(--dash-text)' }}>{result.processing_time}s</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ Empty state ═══ */}
          {!selectedJob && !loading && (
            <div className="ocr-card" style={{ alignItems: 'center', padding: 48, textAlign: 'center' }}>
              <FileText size={48} style={{ color: 'var(--dash-text-muted)', opacity: .3, marginBottom: 12 }} />
              <p style={{ fontSize: 14, color: 'var(--dash-text-muted)', margin: 0 }}>
                Sélectionnez un job existant ou choisissez un document pour lancer le traitement OCR.
              </p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="ocr-card" style={{ alignItems: 'center', padding: 48 }}>
              <Loader2 size={32} className="animate-spin" style={{ color: '#FF6B00' }} />
              <p style={{ fontSize: 13, color: 'var(--dash-text-muted)', marginTop: 12 }}>Chargement...</p>
            </div>
          )}

        </div>{/* end .ocr-left */}

        {/* ── Right sidebar ── */}
        <div className="ocr-right">

          {/* Graphic */}
          <div className="ocr-graphic-box">🔍</div>

          {/* Summary */}
          <div className="ocr-side-card">
            <h3><Activity size={15} style={{ color: '#FF6B00' }} /> Résumé OCR</h3>
            <div className="ocr-sum-row">
              <span className="ocr-sum-label">Document</span>
              <span className="ocr-sum-value">{selectedJob?.document_details?.title || '-'}</span>
            </div>
            <div className="ocr-sum-row">
              <span className="ocr-sum-label">Langue</span>
              <span className="ocr-sum-value">{selectedJob ? langLabel(selectedJob.language) : '-'}</span>
            </div>
            <div className="ocr-sum-row">
              <span className="ocr-sum-label">Moteur</span>
              <span className="ocr-sum-value">{selectedJob?.engine || '-'}</span>
            </div>
            <div className="ocr-sum-row">
              <span className="ocr-sum-label">Pages</span>
              <span className="ocr-sum-value">{pages.length}</span>
            </div>
            <div className="ocr-sum-row">
              <span className="ocr-sum-label">Mots</span>
              <span className="ocr-sum-value">{result?.words_count ?? '-'}</span>
            </div>
            <div className="ocr-sum-row">
              <span className="ocr-sum-label">Confiance</span>
              <span className="ocr-sum-value" style={{ color: confidence ? confColor(confidence) : undefined }}>
                {confidence !== null ? `${confidence}%` : '-'}
              </span>
            </div>
            <div className="ocr-sum-row">
              <span className="ocr-sum-label">Statut</span>
              <span className="ocr-sum-value">
                {selectedJob ? (
                  <span className={`ocr-status-badge ${statusBadgeClass(selectedJob.status)}`}>
                    {statusLabel(selectedJob.status)}
                  </span>
                ) : '-'}
              </span>
            </div>
          </div>

          {/* Progress steps */}
          <div className="ocr-side-card">
            <h3><BarChart3 size={15} style={{ color: '#FF6B00' }} /> Progression</h3>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>
                <span style={{ color: 'var(--dash-text-muted)' }}>Complétion</span>
                <span style={{ color: '#FF6B00' }}>{progressPct}%</span>
              </div>
              <div className="ocr-prog-bar-track">
                <div className="ocr-prog-bar-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
            {stepsForProgress.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 11, padding: '6px 0',
                borderBottom: i < stepsForProgress.length - 1 ? '1px solid var(--dash-border)' : 'none',
                color: s.done ? '#22C55E' : 'var(--dash-text-muted)',
              }}>
                {s.done ? <CheckCircle size={13} /> : <div style={{
                  width: 13, height: 13, borderRadius: '50%',
                  border: '2px solid var(--dash-border)',
                }} />}
                <span style={{ fontWeight: s.done ? 600 : 400 }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* OCR History / Timeline */}
          {selectedJob && (
            <div className="ocr-side-card">
              <h3><Clock size={15} style={{ color: '#FF6B00' }} /> Historique</h3>
              <div className="ocr-timeline">
                <div className="ocr-timeline-item">
                  <div className="ocr-timeline-dot" style={{ background: '#6366F1' }} />
                  <div className="ocr-timeline-title">Job créé</div>
                  <div className="ocr-timeline-time">
                    {new Date(selectedJob.created_at).toLocaleString('fr-FR')}
                  </div>
                </div>
                {selectedJob.status !== 'en_attente' && (
                  <div className="ocr-timeline-item">
                    <div className="ocr-timeline-dot" style={{ background: '#F59E0B' }} />
                    <div className="ocr-timeline-title">OCR démarré</div>
                    <div className="ocr-timeline-time">Moteur : {selectedJob.engine}</div>
                  </div>
                )}
                {selectedJob.status === 'termine' && (
                  <div className="ocr-timeline-item">
                    <div className="ocr-timeline-dot" style={{ background: '#22C55E' }} />
                    <div className="ocr-timeline-title">OCR terminé</div>
                    <div className="ocr-timeline-time">
                      {result?.processing_time}s — {result?.words_count} mots
                    </div>
                  </div>
                )}
                {selectedJob.status === 'erreur' && (
                  <div className="ocr-timeline-item">
                    <div className="ocr-timeline-dot" style={{ background: '#EF4444' }} />
                    <div className="ocr-timeline-title">Erreur</div>
                    <div className="ocr-timeline-time">{selectedJob.error_message}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tips box */}
          <div className="ocr-info-box">
            <Lightbulb size={16} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 2 }} />
            <p>
              Vous pouvez modifier le texte reconnu avant de l'enregistrer.
              Les corrections sont sauvegardées page par page.
            </p>
          </div>
        </div>

      </div>{/* end .ocr-main */}

      {/* ── Bottom Action Bar ── */}
      <div className="ocr-action-bar">
        <button onClick={() => navigate('/documents')} className="ocr-btn-ghost">Annuler</button>
        <div className="ocr-action-right">
          <button onClick={handleDownloadTxt} className="ocr-btn-ghost" disabled={!editedText}>
            <FileDown size={15} /> Export TXT
          </button>
          <button onClick={handleDownloadAllTxt} className="ocr-btn-ghost" disabled={pages.length === 0}>
            <Download size={15} /> Export complet
          </button>
          <button
            onClick={handleSaveText}
            disabled={saving || !selectedJob || selectedJob.status !== 'termine'}
            className="ocr-btn-primary"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
            Enregistrer l'OCR
          </button>
        </div>
      </div>

    </div>
  );
}
