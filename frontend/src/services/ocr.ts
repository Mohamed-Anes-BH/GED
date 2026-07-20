import api from '../utils/api';

export const ocrService = {
  getJobs: async (params?: any) => {
    const response = await api.get('/ocr/jobs/', { params });
    return response.data;
  },
  getJob: async (id: number) => {
    const response = await api.get(`/ocr/jobs/${id}/`);
    return response.data;
  },
  processDocument: async (
    documentId: number,
    sourceFile?: string,
    language = 'fra',
    engine = 'tesseract',
  ) => {
    const payload: any = { document: documentId, language, engine };
    if (sourceFile) payload.source_file = sourceFile;
    const response = await api.post('/ocr/jobs/process/', payload);
    return response.data;
  },
  retryJob: async (id: number) => {
    const response = await api.post(`/ocr/jobs/${id}/retry/`);
    return response.data;
  },
  updateText: async (jobId: number, text: string, pageNumber?: number) => {
    const payload: any = { text };
    if (pageNumber !== undefined) payload.page_number = pageNumber;
    const response = await api.post(`/ocr/jobs/${jobId}/update-text/`, payload);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/ocr/jobs/stats/');
    return response.data;
  },
  getResults: async (params?: any) => {
    const response = await api.get('/ocr/results/', { params });
    return response.data;
  },
  getPages: async (params?: any) => {
    const response = await api.get('/ocr/pages/', { params });
    return response.data;
  },
};
