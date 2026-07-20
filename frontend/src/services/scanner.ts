import api from '../utils/api';

export interface ScannedFilePayload {
  dataUrl: string;   // e.g. "data:application/pdf;base64,..."
  filename: string;
  mimeType: string;
}

export interface ScanSavePayload {
  title: string;
  category?: number;
  direction?: number;
  departement?: number;
  service?: number;
  dossier?: number;
  status?: string;
  scanner_name?: string;
  dpi?: number;
  color_mode?: string;
  paper_size?: string;
  duplex?: boolean;
  format?: string;
  ocr_enabled?: boolean;
  files: File[];
}

export const scannerService = {
  /** Save a scanned document with all its pages to the backend. */
  scanSave: async (payload: ScanSavePayload, onProgress?: (pct: number) => void) => {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('status', payload.status || 'actif');
    formData.append('scanner_name', payload.scanner_name || 'Import');
    formData.append('dpi', String(payload.dpi ?? 300));
    formData.append('color_mode', payload.color_mode || 'Couleur');
    formData.append('paper_size', payload.paper_size || 'A4');
    formData.append('duplex', String(payload.duplex ?? false));
    formData.append('format', payload.format || 'PDF');
    formData.append('ocr_enabled', String(payload.ocr_enabled ?? false));

    if (payload.category)   formData.append('category',   String(payload.category));
    if (payload.direction)  formData.append('direction',  String(payload.direction));
    if (payload.departement) formData.append('departement', String(payload.departement));
    if (payload.service)    formData.append('service',    String(payload.service));
    if (payload.dossier)    formData.append('dossier',    String(payload.dossier));

    payload.files.forEach(f => formData.append('files', f));

    const response = await api.post('/documents/scan-save/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          onProgress(Math.round((evt.loaded * 100) / evt.total));
        }
      },
    });
    return response.data;
  },

  /** Poll OCR status for a given ocr job id. */
  pollOcrStatus: async (jobId: number) => {
    const response = await api.get('/documents/ocr-status/', { params: { job_id: jobId } });
    return response.data as { status: string; progress: number; extracted_text: string };
  },
};
