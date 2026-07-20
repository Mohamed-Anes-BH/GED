import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Printer, Scan, RefreshCw, ZoomIn, ZoomOut, Crop, Trash2, RotateCcw,
  RotateCw, Plus, CheckCircle, FileText, Clock, Settings, ChevronDown,
  Loader2, Upload, WifiOff, GripVertical, X, AlertCircle, AlertTriangle,
} from 'lucide-react';

import { useOrganizationCrud } from '../hooks/useOrganization';
import { useDependentDropdowns } from '../hooks/useDependentDropdowns';
import {
  categoriesService, directionsService, departementsService, servicesService
} from '../services/organization';
import { useDossiers } from '../hooks/useDossiers';
import { scannerService } from '../services/scanner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScannerDevice {
  id: number;
  name: string;
  device: string;
  driver: string;
  connected: boolean;
}

interface ScannedPage {
  id: string;           // unique key
  file: File;           // the actual File object to upload
  previewUrl: string;   // blob URL for display
  rotation: number;     // 0 / 90 / 180 / 270
  mimeType: string;
}

type OcrStatus = 'idle' | 'running' | 'completed' | 'failed';

type ProgressPhase = 'scanning' | 'saving' | 'ocr' | null;

// ─── Toast helper ─────────────────────────────────────────────────────────────

let _toastId = 0;
type ToastType = 'success' | 'error' | 'info';
interface Toast { id: number; msg: string; type: ToastType }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2)}`; }

function b64ToFile(b64: string, filename: string, mime: string): File {
  const arr = b64.split(',');
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

// ─── ScannerPage ──────────────────────────────────────────────────────────────

export function ScannerPage() {
  // ── Scanner detection ──
  const [scanners, setScanners] = useState<ScannerDevice[]>([]);
  const [detectingDevices, setDetectingDevices] = useState(false);
  const [activeScanner, setActiveScanner] = useState<ScannerDevice | null>(null);

  // ── Scan settings ──
  const [resolution, setResolution] = useState('300 dpi');
  const [colorMode, setColorMode] = useState('Couleur');
  const [paperSize, setPaperSize] = useState('A4');
  const [sides, setSides] = useState('Recto');
  const [outputFormat, setOutputFormat] = useState('PDF');

  // ── Pages ──
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [activePage, setActivePage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [scanning, setScanning] = useState(false);
  const [progressPhase, setProgressPhase] = useState<ProgressPhase>(null);
  const [progressVal, setProgressVal] = useState(0);

  // ── OCR ──
  const [ocrEnabled, setOcrEnabled] = useState(true);
  const [ocrStatus, setOcrStatus] = useState<OcrStatus>('idle');
  const [ocrJobId, setOcrJobId] = useState<number | null>(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrText, setOcrText] = useState('');

  // ── Classification ──
  const { items: categories } = useOrganizationCrud(categoriesService);
  const {
    directions,
    departements,
    services,
    fetchDepartements,
    fetchServices,
  } = useDependentDropdowns();
  const { dossiers } = useDossiers();

  const [docState, setDocState] = useState({
    title: 'Document Scanné',
    category: '',
    direction: '',
    departement: '',
    service: '',
    dossier: '',
    status: 'actif',
  });

  const [saving, setSaving] = useState(false);

  // ── Drag & drop reorder ──
  const dragIdx = useRef<number | null>(null);

  // ── Toast ──
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((msg: string, type: ToastType = 'info') => {
    const id = ++_toastId;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // ── File input ref for web fallback ──
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Scanner detection on mount ────────────────────────────────────────────

  const detectScanners = useCallback(async () => {
    setDetectingDevices(true);
    try {
      const el = (window as any).electronAPI;
      if (el?.detectScanners) {
        const result = await el.detectScanners();
        if (result?.success) {
          setScanners(result.scanners || []);
          if (result.scanners?.length > 0) {
            setActiveScanner(result.scanners[0]);
          } else {
            setActiveScanner(null);
          }
        }
      } else {
        // Browser / non-Electron: no scanner hardware
        setScanners([]);
        setActiveScanner(null);
      }
    } catch (e) {
      setScanners([]);
      setActiveScanner(null);
    } finally {
      setDetectingDevices(false);
    }
  }, []);

  useEffect(() => {
    detectScanners();
  }, [detectScanners]);

  // ─── OCR polling ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!ocrJobId || ocrStatus !== 'running') return;
    const interval = setInterval(async () => {
      try {
        const res = await scannerService.pollOcrStatus(ocrJobId);
        setOcrProgress(res.progress);
        if (res.status === 'termine') {
          setOcrStatus('completed');
          setOcrText(res.extracted_text || '');
          toast('OCR terminé avec succès.', 'success');
          clearInterval(interval);
        } else if (res.status === 'erreur') {
          setOcrStatus('failed');
          toast('OCR échoué. Le document est enregistré sans texte.', 'error');
          clearInterval(interval);
        }
      } catch (_) {}
    }, 1500);
    return () => clearInterval(interval);
  }, [ocrJobId, ocrStatus, toast]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const addPages = (files: File[]) => {
    const newPages: ScannedPage[] = files.map(f => ({
      id: uid(),
      file: f,
      previewUrl: URL.createObjectURL(f),
      rotation: 0,
      mimeType: f.type,
    }));
    setPages(prev => {
      const updated = [...prev, ...newPages];
      setActivePage(updated.length - 1);
      return updated;
    });
  };

  const handleScan = async () => {
    if (scanning) return;

    const el = (window as any).electronAPI;

    if (el?.scanDocument && activeScanner) {
      // Real scanner via Electron
      setScanning(true);
      setProgressPhase('scanning');
      setProgressVal(10);
      try {
        const dpi = resolution.replace(' dpi', '');
        const result = await el.scanDocument({
          resolution: dpi,
          colorMode,
          format: outputFormat,
          device: activeScanner.device,
        });
        setProgressVal(80);
        if (result?.success && result.base64) {
          const ext = outputFormat.toLowerCase() === 'pdf' ? 'pdf' : 'png';
          const mime = outputFormat.toLowerCase() === 'pdf' ? 'application/pdf' : 'image/png';
          const file = b64ToFile(result.base64, `Scan_${pages.length + 1}.${ext}`, mime);
          addPages([file]);
          setProgressVal(100);
          toast('Page scannée avec succès !', 'success');
        } else {
          toast(result?.error || 'Erreur de numérisation. Importez un fichier à la place.', 'error');
          // Fallback to import
          triggerImport();
        }
      } catch (e) {
        toast('Erreur scanner. Importez un fichier à la place.', 'error');
        triggerImport();
      } finally {
        setScanning(false);
        setProgressPhase(null);
        setProgressVal(0);
      }
    } else {
      // No scanner → import fallback
      triggerImport();
    }
  };

  const triggerImport = async () => {
    const el = (window as any).electronAPI;
    if (el?.openFileDialog) {
      // Electron native dialog
      const result = await el.openFileDialog({ multiple: true });
      if (!result.canceled && result.files?.length > 0) {
        const files = result.files
          .filter((f: any) => f.base64)
          .map((f: any) => b64ToFile(f.base64, f.filename, f.mimeType));
        if (files.length > 0) addPages(files);
      }
    } else {
      // Browser fallback
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) addPages(files);
    e.target.value = '';
  };

  const rotatePage = (dir: 'left' | 'right') => {
    setPages(prev => prev.map((p, i) => i === activePage
      ? { ...p, rotation: ((p.rotation + (dir === 'right' ? 90 : -90)) + 360) % 360 }
      : p
    ));
  };

  const deletePage = () => {
    setPages(prev => {
      const updated = prev.filter((_, i) => i !== activePage);
      setActivePage(Math.max(0, activePage - 1));
      return updated;
    });
  };

  const clearAll = () => {
    pages.forEach(p => URL.revokeObjectURL(p.previewUrl));
    setPages([]);
    setActivePage(0);
    setOcrStatus('idle');
    setOcrJobId(null);
    setOcrProgress(0);
    setOcrText('');
  };

  // ─── Drag & drop reorder ───────────────────────────────────────────────────

  const onDragStart = (idx: number) => { dragIdx.current = idx; };
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === idx) return;
    setPages(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIdx.current!, 1);
      updated.splice(idx, 0, moved);
      dragIdx.current = idx;
      return updated;
    });
  };
  const onDragEnd = () => { dragIdx.current = null; };

  // ─── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (pages.length === 0) { toast('Aucune page scannée.', 'error'); return; }
    if (!docState.title) { toast('Veuillez renseigner le titre.', 'error'); return; }
    if (!docState.category) { toast('Veuillez choisir une catégorie.', 'error'); return; }
    if (!docState.dossier) { toast('Veuillez choisir un dossier.', 'error'); return; }

    setSaving(true);
    setProgressPhase('saving');
    setProgressVal(5);

    try {
      const result = await scannerService.scanSave(
        {
          title: docState.title,
          category: docState.category ? Number(docState.category) : undefined,
          direction: docState.direction ? Number(docState.direction) : undefined,
          departement: docState.departement ? Number(docState.departement) : undefined,
          service: docState.service ? Number(docState.service) : undefined,
          dossier: docState.dossier ? Number(docState.dossier) : undefined,
          status: docState.status,
          scanner_name: activeScanner?.name || 'Import',
          dpi: Number(resolution.replace(' dpi', '')),
          color_mode: colorMode,
          paper_size: paperSize,
          duplex: sides === 'Recto / Verso',
          format: outputFormat,
          ocr_enabled: ocrEnabled,
          files: pages.map(p => p.file),
        },
        (pct) => {
          setProgressVal(5 + Math.round(pct * 0.9));
        }
      );

      setProgressVal(100);

      if (ocrEnabled && result.ocr_job_id) {
        setOcrJobId(result.ocr_job_id);
        setOcrStatus('running');
        setProgressPhase('ocr');
        toast('Document enregistré ! OCR en cours...', 'success');
      } else {
        toast('Document scanné et enregistré avec succès !', 'success');
        clearAll();
        setDocState({ title: 'Document Scanné', category: '', direction: '', departement: '', service: '', dossier: '', status: 'actif' });
        setProgressPhase(null);
        setProgressVal(0);
      }
    } catch (e: any) {
      const msg = e?.response?.data?.detail || "Erreur lors de l'enregistrement.";
      toast(msg, 'error');
    } finally {
      setSaving(false);
      if (!ocrEnabled) { setProgressPhase(null); setProgressVal(0); }
    }
  };

  // Current page for display
  const currentPage = pages[activePage] ?? null;

  const scannerStatus = detectingDevices
    ? 'Détection...'
    : activeScanner
    ? 'Connecté'
    : 'Non connecté';

  const scannerStatusColor = activeScanner ? 'text-green-600' : 'text-gray-400';
  const dotColor = activeScanner ? 'bg-green-500' : 'bg-gray-400';

  return (
    <div className="flex flex-col gap-6 font-poppins pb-24 text-gray-800 dark:text-[var(--dash-text)]">

      {/* Hidden file input for web fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* ─── Toast stack ────────────────────────────────────────── */}
      <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold animate-in fade-in slide-in-from-right-4 duration-300 ${
            t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-500' : 'bg-gray-700'
          }`}>
            {t.type === 'success' ? <CheckCircle size={16}/> : t.type === 'error' ? <AlertCircle size={16}/> : null}
            {t.msg}
          </div>
        ))}
      </div>

      {/* ─── Progress overlay ───────────────────────────────────── */}
      {progressPhase && (
        <div className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-[var(--dash-card-bg)] rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-5 min-w-[300px]">
            <Loader2 size={40} className="animate-spin text-orange-500" />
            <div className="flex flex-col items-center gap-1">
              <span className="font-bold text-base text-gray-800 dark:text-[var(--dash-text)]">
                {progressPhase === 'scanning' && 'Numérisation...'}
                {progressPhase === 'saving' && 'Enregistrement...'}
                {progressPhase === 'ocr' && 'OCR en cours...'}
              </span>
              <span className="text-sm font-semibold text-orange-500">{progressPhase === 'ocr' ? ocrProgress : progressVal}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-[var(--dash-bg)] rounded-full h-2">
              <div
                className="h-2 bg-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPhase === 'ocr' ? ocrProgress : progressVal}%` }}
              />
            </div>
            {progressPhase === 'ocr' && (
              <div className={`text-xs font-semibold ${
                ocrStatus === 'completed' ? 'text-green-600'
                : ocrStatus === 'failed' ? 'text-red-500'
                : 'text-gray-500'
              }`}>
                {ocrStatus === 'running' && 'Extraction du texte...'}
                {ocrStatus === 'completed' && '✓ OCR terminé'}
                {ocrStatus === 'failed' && '✗ OCR échoué'}
              </div>
            )}
            {progressPhase === 'ocr' && (ocrStatus === 'completed' || ocrStatus === 'failed') && (
              <button
                onClick={() => { setProgressPhase(null); clearAll(); setDocState({ title: 'Document Scanné', category: '', direction: '', departement: '', service: '', dossier: '', status: 'actif' }); }}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors"
              >
                Fermer
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 inline-block">
        <h2 className="text-[28px] font-bold font-oswald text-gray-900 dark:text-[#FFFFFF]">Scanner de documents</h2>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <FileText size={14}/> <span>Documents</span> <span>›</span> <span className="text-gray-900 dark:text-[#FFFFFF] font-semibold dark:text-[#FFFFFF]">Scanner de documents</span>
        </div>
      </div>

      {/* ─── Main Grid Layout ──────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">

        {/* LEFT COLUMN (1) */}
        <div className="w-full xl:w-[280px] shrink-0 flex flex-col h-full">
          <SectionPanel num={1} title="Panneau scanner">

            {/* Scanner Detection */}
            <div className="flex flex-col gap-2 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Scanner détecté</span>
                <button
                  onClick={detectScanners}
                  disabled={detectingDevices}
                  className="flex items-center gap-1 text-[10px] font-semibold text-orange-500 hover:text-orange-600 disabled:opacity-50"
                >
                  <RefreshCw size={11} className={detectingDevices ? 'animate-spin' : ''} />
                  Actualiser
                </button>
              </div>

              {/* Scanner list or empty state */}
              {detectingDevices ? (
                <div className="flex items-center gap-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg py-2 px-3 bg-gray-50 dark:bg-[var(--dash-bg)]">
                  <Loader2 size={14} className="animate-spin text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500">Détection en cours...</span>
                </div>
              ) : scanners.length === 0 ? (
                <div className="flex flex-col gap-1.5 border border-dashed border-gray-300 dark:border-[var(--dash-border)] rounded-lg py-3 px-3 bg-gray-50 dark:bg-[var(--dash-bg)]">
                  <div className="flex items-center gap-2">
                    <WifiOff size={14} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500">Aucun scanner détecté</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Le mode import sera utilisé automatiquement.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {scanners.map(sc => (
                    <button
                      key={sc.id}
                      onClick={() => setActiveScanner(sc)}
                      className={`flex items-center justify-between border rounded-lg py-2 px-3 text-left transition-colors ${
                        activeScanner?.id === sc.id
                          ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-[var(--dash-border)] bg-gray-50 dark:bg-[var(--dash-bg)]'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-xs font-semibold"><Printer size={14}/> {sc.name}</span>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Connecté
                        </span>
                        <span className="text-[9px] text-gray-400">{sc.driver}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Scan / Import button */}
              <button
                disabled={scanning}
                onClick={handleScan}
                className="mt-2 w-full py-3 bg-orange-500 text-white font-bold text-sm rounded-xl shadow-sm shadow-orange-500/20 hover:bg-orange-600 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
              >
                {scanning
                  ? <><Loader2 size={18} className="animate-spin"/> Numérisation...</>
                  : activeScanner
                  ? <><Scan size={18}/> Scanner maintenant</>
                  : <><Upload size={18}/> Importer un fichier</>
                }
              </button>
            </div>

            {/* Scan Settings */}
            <div className="flex flex-col gap-4">
              <span className="text-[13px] font-bold text-gray-700 dark:text-[var(--dash-text-muted)]">Réglages du scan</span>

              <SegmentControl title="Résolution" options={['150 dpi', '300 dpi', '600 dpi']} active={resolution} onChange={setResolution} />
              <SegmentControl title="Couleur" options={['Couleur', 'N&B', 'Niveaux de gris']} active={colorMode} onChange={setColorMode} />
              <SegmentControl title="Format papier" options={['A4', 'A5', 'Letter', 'Legal']} active={paperSize} onChange={setPaperSize} />
              <SegmentControl title="Côtés" options={['Recto', 'Recto / Verso']} active={sides} onChange={setSides} />
              <SegmentControl title="Format de sortie" options={['PDF', 'JPG', 'PNG']} active={outputFormat} onChange={setOutputFormat} />

              <div className="flex justify-between items-center text-xs text-gray-600 dark:text-[var(--dash-text-muted)] font-medium py-2 mt-2 border-t border-gray-100 dark:border-[var(--dash-border)]">
                <span className="flex items-center gap-2"><Settings size={14}/> Paramètres avancés</span>
                <ChevronDown size={14}/>
              </div>
            </div>

          </SectionPanel>
        </div>

        {/* MIDDLE COLUMN (2) */}
        <div className="flex-1 flex flex-col h-full min-w-0">
          <SectionPanel num={2} title="Aperçu du document" noPadding>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-center gap-6 p-4 border-b border-gray-100 dark:border-[var(--dash-border)] bg-gray-50 dark:bg-[var(--dash-bg)]/50 rounded-t-2xl">
              <ToolBtn icon={RotateCcw} label="Rotation gauche" onClick={() => rotatePage('left')} />
              <ToolBtn icon={RotateCw} label="Rotation droite" onClick={() => rotatePage('right')} />
              <ToolBtn icon={ZoomOut} label="Zoom -" onClick={() => setZoom(z => Math.max(0.3, +(z - 0.15).toFixed(2)))} />
              <ToolBtn icon={ZoomIn} label="Zoom +" onClick={() => setZoom(z => Math.min(3, +(z + 0.15).toFixed(2)))} />
              <ToolBtn icon={Crop} label="Recadrer" />
              <ToolBtn icon={Trash2} label="Supprimer" onClick={deletePage} />
              <ToolBtn icon={RefreshCw} label="Réinitialiser" onClick={clearAll} />
            </div>

            {/* Canvas Area */}
            <div className="p-6 bg-gray-100 dark:bg-gray-800/30 flex justify-center items-center h-[460px] overflow-hidden shadow-inner relative">
              {currentPage ? (
                <div
                  className="transition-transform duration-300 origin-center"
                  style={{ transform: `rotate(${currentPage.rotation}deg) scale(${zoom})` }}
                >
                  {currentPage.mimeType === 'application/pdf' ? (
                    <div className="bg-white dark:bg-[var(--dash-card-bg)] w-[300px] h-[420px] shadow-sm rounded flex flex-col p-4 border border-gray-200 dark:border-[var(--dash-border)] justify-center items-center">
                      <FileText size={48} className="text-gray-300 mb-2"/>
                      <span className="text-sm font-bold text-gray-500">{currentPage.file.name}</span>
                      <span className="text-xs text-gray-400 mt-1">Page {activePage + 1}</span>
                    </div>
                  ) : (
                    <img
                      src={currentPage.previewUrl}
                      alt={`Page ${activePage + 1}`}
                      className="max-w-[320px] max-h-[420px] object-contain rounded shadow-sm border border-gray-200 dark:border-[var(--dash-border)]"
                    />
                  )}
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center text-gray-400 cursor-pointer select-none"
                  onClick={() => triggerImport()}
                >
                  <Scan size={48} className="mb-2 opacity-50" />
                  <span className="text-sm">Aucune page scannée</span>
                  <span className="text-xs mt-1 text-gray-400">Cliquez pour importer ou scannez via le panneau gauche</span>
                </div>
              )}
            </div>

            {/* Thumbnails — drag & drop aware */}
            <div className="p-4 border-t border-gray-100 dark:border-[var(--dash-border)] flex items-center justify-start gap-3 overflow-x-auto bg-gray-50 dark:bg-[var(--dash-bg)]">
              {pages.map((page, i) => (
                <div
                  key={page.id}
                  draggable
                  onDragStart={() => onDragStart(i)}
                  onDragOver={e => onDragOver(e, i)}
                  onDragEnd={onDragEnd}
                  className="relative group flex-shrink-0"
                >
                  <Thumbnail
                    active={i === activePage}
                    num={(i + 1).toString()}
                    rotation={page.rotation}
                    previewUrl={page.mimeType !== 'application/pdf' ? page.previewUrl : undefined}
                    onClick={() => setActivePage(i)}
                  />
                  {/* Delete button on thumbnail */}
                  <button
                    onClick={e => { e.stopPropagation(); setPages(prev => { const upd = prev.filter((_, idx) => idx !== i); setActivePage(Math.max(0, i - 1)); return upd; }); }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10}/>
                  </button>
                  {/* Drag handle hint */}
                  <div className="absolute bottom-5 left-1 opacity-0 group-hover:opacity-50 pointer-events-none">
                    <GripVertical size={10} className="text-gray-500"/>
                  </div>
                </div>
              ))}

              {/* Add more pages button */}
              <button
                onClick={() => triggerImport()}
                disabled={scanning}
                className="w-16 h-20 border-2 border-dashed border-gray-300 bg-white dark:bg-[var(--dash-card-bg)] rounded flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] dark:bg-[var(--dash-bg)] disabled:opacity-50 flex-shrink-0"
              >
                <Plus size={16}/> <span className="text-[9px] font-bold mt-1">Ajouter<br/>une page</span>
              </button>
            </div>

            {/* Status Bar */}
            <div className="px-4 py-2 bg-gray-100 dark:bg-[var(--dash-bg)]/50 text-[10px] text-gray-500 font-bold flex justify-between items-center rounded-b-2xl">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${dotColor} shadow-sm border border-white`}></div>
                  <span className={scannerStatusColor}>
                    {activeScanner ? `Scanner connecté` : 'Mode import'}
                  </span>
                </span>
                <span className="flex items-center gap-1.5"><FileText size={12}/> {pages.length} page{pages.length > 1 ? 's' : ''} détectée{pages.length > 1 ? 's' : ''}</span>
              </div>
              <div className="flex gap-4 items-center">
                <span className="flex items-center gap-1.5"><Clock size={12}/> {scanning ? 'Numérisation...' : 'Prêt à numériser'}</span>
                {zoom !== 1 && <span>{Math.round(zoom * 100)}%</span>}
              </div>
            </div>

          </SectionPanel>
        </div>

        {/* RIGHT COLUMN (3, 4, 5) */}
        <div className="w-full xl:w-[350px] shrink-0 flex flex-col gap-6 h-full">

          {/* Panel 3 — Scan info */}
          <SectionPanel num={3} title="Informations du scan">
            <div className="flex items-center select-none gap-4 relative justify-between">
              <div className="absolute right-0 -top-6 -bottom-6 w-3/5 opacity-[0.15] bg-[url('https://ui-avatars.com/api/?name=Scanner&background=random')] bg-contain bg-right bg-no-repeat z-0 pointer-events-none grayscale"></div>
              <div className="flex flex-col gap-2.5 text-[11px] font-medium w-full z-10">
                <InfoRow label="Scanner" val={activeScanner?.name || 'Aucun (Import)'} />
                <InfoRow label="Driver" val={activeScanner?.driver || '—'} />
                <InfoRow label="Résolution" val={resolution} />
                <InfoRow label="Couleur" val={colorMode} />
                <InfoRow label="Format papier" val={paperSize} />
                <InfoRow label="Côtés" val={sides} />
                <InfoRow label="Format de sortie" val={outputFormat} />
                <InfoRow label="Pages" val={`${pages.length}`} />
                <InfoRow label="État" val={scanning ? "Numérisation…" : "Prêt"} color={scanning ? "text-orange-600 font-bold" : "text-green-600 font-bold"} />
              </div>
            </div>
          </SectionPanel>

          {/* Panel 4 — OCR */}
          <SectionPanel num={4} title="OCR & Reconnaissance">
            <div className="flex flex-col gap-3">
              {/* OCR toggle */}
              <label className="flex items-center gap-3 cursor-pointer select-none p-2.5 rounded-lg border border-gray-200 dark:border-[var(--dash-border)] bg-gray-50 dark:bg-[var(--dash-bg)]">
                <div
                  onClick={() => setOcrEnabled(v => !v)}
                  className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 relative cursor-pointer ${ocrEnabled ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${ocrEnabled ? 'translate-x-4' : ''}`}/>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-800 dark:text-[var(--dash-text)]">Lancer l'OCR automatiquement</span>
                  <span className="text-[10px] text-gray-500">Extraction et indexation du texte</span>
                </div>
              </label>

              {/* OCR status indicator */}
              {ocrStatus !== 'idle' && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                  ocrStatus === 'running' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' :
                  ocrStatus === 'completed' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' :
                  'bg-red-50 dark:bg-red-900/20 text-red-500'
                }`}>
                  {ocrStatus === 'running' && <Loader2 size={13} className="animate-spin"/>}
                  {ocrStatus === 'completed' && <CheckCircle size={13}/>}
                  {ocrStatus === 'failed' && <AlertTriangle size={13}/>}
                  {ocrStatus === 'running' && `OCR en cours… ${ocrProgress}%`}
                  {ocrStatus === 'completed' && 'OCR terminé'}
                  {ocrStatus === 'failed' && 'OCR échoué'}
                </div>
              )}

              {/* OCR result preview */}
              {ocrStatus === 'completed' && ocrText && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-500">Texte extrait</span>
                  <div className="border border-gray-200 dark:border-[var(--dash-border)] rounded-lg bg-gray-50 dark:bg-[var(--dash-bg)] p-2 max-h-24 overflow-y-auto">
                    <p className="text-[10px] text-gray-600 dark:text-[var(--dash-text-muted)] whitespace-pre-wrap leading-relaxed">{ocrText.slice(0, 400)}{ocrText.length > 400 ? '…' : ''}</p>
                  </div>
                </div>
              )}
            </div>
          </SectionPanel>

          {/* Panel 5 — Classement rapide */}
          <SectionPanel num={5} title="Classement rapide">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500">Titre <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-xs font-semibold text-gray-800 dark:text-[var(--dash-text)] outline-none bg-white dark:bg-[var(--dash-card-bg)]"
                  value={docState.title}
                  onChange={e => setDocState({ ...docState, title: e.target.value })}
                />
              </div>
              <SelectField label="Catégorie *" val={docState.category} onChange={(v: any) => setDocState({ ...docState, category: v })} options={categories} />
              <SelectField label="Direction" val={docState.direction} onChange={(v: any) => { setDocState({ ...docState, direction: v, departement: '', service: '' }); fetchDepartements(Number(v) || 0); }} options={directions} />
              <SelectField label="Département" val={docState.departement} onChange={(v: any) => { setDocState({ ...docState, departement: v, service: '' }); fetchServices(Number(v) || 0); }} options={departements} />
              <SelectField label="Service" val={docState.service} onChange={(v: any) => setDocState({ ...docState, service: v })} options={services} />
              <SelectField label="Dossier *" val={docState.dossier} onChange={(v: any) => setDocState({ ...docState, dossier: v })} options={dossiers} />
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500">Statut</label>
                <div className="flex border border-gray-200 dark:border-[var(--dash-border)] rounded-lg bg-gray-100 dark:bg-[var(--dash-bg)] p-1 gap-1">
                  {['actif', 'brouillon'].map(s => (
                    <button key={s} onClick={() => setDocState({ ...docState, status: s })} className={`flex-1 py-1 rounded-md text-[11px] font-semibold transition-colors capitalize ${docState.status === s ? 'bg-white dark:bg-[var(--dash-card-bg)] text-orange-600 shadow-sm border border-gray-200 dark:border-[var(--dash-border)]' : 'text-gray-500'}`}>
                      {s === 'actif' ? 'Actif' : 'Brouillon'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SectionPanel>

        </div>
      </div>

      {/* ─── Sticky Bottom Actions ─────────────────────────────── */}
      <div className="fixed bottom-0 left-0 lg:left-[250px] right-0 bg-white dark:bg-[var(--dash-card-bg)] border-t border-gray-200 dark:border-[var(--dash-border)] p-4 px-6 flex justify-between items-center z-50">
        <button onClick={clearAll} className="px-5 py-2.5 bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] text-gray-700 dark:text-[var(--dash-text-muted)] font-semibold text-[13px] rounded-xl hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] shadow-sm">Annuler</button>

        <div className="flex items-center gap-3">
          {/* Add page shortcut */}
          <button
            onClick={() => triggerImport()}
            disabled={scanning}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 dark:border-[var(--dash-border)] text-gray-600 dark:text-[var(--dash-text-muted)] font-semibold text-[13px] rounded-xl hover:bg-gray-50 dark:hover:bg-[var(--dash-border)] shadow-sm"
          >
            <Plus size={15}/> Ajouter des pages
          </button>

          <button
            disabled={saving || pages.length === 0}
            onClick={handleSave}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-orange-500 text-white font-bold text-[13px] rounded-xl hover:bg-orange-600 shadow-sm shadow-orange-500/20 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16}/>}
            Terminer et enregistrer
          </button>
        </div>
      </div>

    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function SectionPanel({ num, title, subtitle, children, noPadding }: any) {
  return (
    <div className={`bg-white dark:bg-[var(--dash-card-bg)] border border-gray-200 dark:border-[var(--dash-border)] rounded-2xl shadow-sm flex flex-col h-full ${noPadding ? '' : 'p-5'}`}>
      <div className={`flex items-center gap-2 mb-4 ${noPadding ? 'p-5 pb-0' : ''}`}>
        <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">{num}</div>
        <h3 className="font-semibold text-sm text-gray-800 dark:text-[var(--dash-text)]">{title}</h3>
        {subtitle && <span className="text-[11px] text-gray-500">{subtitle}</span>}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

function SegmentControl({ title, options, active, onChange }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold text-gray-500">{title}</span>
      <div className="flex border border-gray-200 dark:border-[var(--dash-border)] rounded-lg bg-gray-100 dark:bg-[var(--dash-bg)] p-1 w-full gap-1 flex-wrap">
        {options.map((opt: string) => (
          <button key={opt} onClick={() => onChange(opt)} className={`flex-1 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap
            ${active === opt ? 'bg-white dark:bg-[var(--dash-card-bg)] text-orange-600 shadow-sm border border-gray-200 dark:border-[var(--dash-border)]' : 'text-gray-500 hover:text-gray-800 dark:text-[var(--dash-text)]'}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToolBtn({ icon: Icon, label, onClick }: any) {
  return (
    <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={onClick}>
      <div className="w-8 h-8 flex items-center justify-center rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-[var(--dash-border)] text-gray-600 dark:text-[var(--dash-text-muted)] transition-colors">
        <Icon size={16} />
      </div>
      <span className="text-[9px] font-bold text-gray-500 group-hover:text-gray-800 dark:text-[var(--dash-text)] text-center leading-tight">
        {label.split(' ').map((w: string, i: number) => <span key={i} className="block">{w}</span>)}
      </span>
    </div>
  );
}

function Thumbnail({ active, num, onClick, rotation = 0, previewUrl }: any) {
  return (
    <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={onClick}>
      <div className={`w-16 h-20 bg-white dark:bg-[var(--dash-card-bg)] rounded border-2 p-1 flex justify-center items-center overflow-hidden transition-colors ${active ? 'border-orange-500' : 'border-gray-200 dark:border-[var(--dash-border)] group-hover:border-gray-300'}`}>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`page ${num}`}
            className="w-full h-full object-cover rounded transition-transform origin-center"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        ) : (
          <div className="w-full h-full border border-gray-100 dark:border-[var(--dash-border)] bg-gray-50 dark:bg-[var(--dash-bg)] flex flex-col gap-0.5 p-1" style={{ transform: `rotate(${rotation}deg)` }}>
            <div className="w-full h-[20%] bg-gray-200"></div>
            <div className="w-full flex-1 bg-gray-300"></div>
          </div>
        )}
      </div>
      <span className={`text-[10px] font-bold ${active ? 'text-orange-600' : 'text-gray-500'}`}>{num}</span>
    </div>
  );
}

function InfoRow({ label, val, color }: any) {
  return (
    <div className="flex justify-between border-b border-gray-100 dark:border-[var(--dash-border)] pb-1.5 last:border-0 last:pb-0">
      <span className="text-gray-500 w-[45%] flex-shrink-0">{label}</span>
      <span className={`text-right ${color || 'text-gray-800 dark:text-[var(--dash-text)]'}`}>{val}</span>
    </div>
  );
}

function SelectField({ label, val, onChange, options }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-gray-500">{label}</label>
      <select value={val} onChange={(e) => onChange(e.target.value)} className="w-full p-2 border border-gray-200 dark:border-[var(--dash-border)] rounded-lg text-xs font-semibold text-gray-800 dark:text-[var(--dash-text)] outline-none bg-white dark:bg-[var(--dash-card-bg)]">
        <option value="">Sélectionner</option>
        {options?.map((opt: any) => (
          <option key={opt.id} value={opt.id}>{opt.name}</option>
        ))}
      </select>
    </div>
  );
}
