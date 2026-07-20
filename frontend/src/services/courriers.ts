import api from '../utils/api';
import { CourrierEntrant, CourrierSortant, DocumentFile } from '../types';

export const courriersService = {
  // Courriers Entrants
  getEntrants: async (params?: any): Promise<{ results: CourrierEntrant[], count: number }> => {
    const response = await api.get('/courriers/entrants/', { params });
    return response.data;
  },
  
  getEntrant: async (id: number): Promise<CourrierEntrant> => {
    const response = await api.get(`/courriers/entrants/${id}/`);
    return response.data;
  },

  createEntrant: async (data: any): Promise<CourrierEntrant> => {
    const response = await api.post('/courriers/entrants/', data);
    return response.data;
  },

  updateEntrant: async (id: number, data: any): Promise<CourrierEntrant> => {
    const response = await api.patch(`/courriers/entrants/${id}/`, data);
    return response.data;
  },

  markEntrantRead: async (id: number): Promise<void> => {
    await api.post(`/courriers/entrants/${id}/mark_read/`);
  },

  markEntrantTreated: async (id: number): Promise<void> => {
    await api.post(`/courriers/entrants/${id}/mark_treated/`);
  },

  uploadEntrantAttachment: async (id: number, file: File, onProgress?: (pct: number) => void): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/courriers/entrants/${id}/upload_attachment/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
    return response.data;
  },

  // Courriers Sortants
  getSortants: async (params?: any): Promise<{ results: CourrierSortant[], count: number }> => {
    const response = await api.get('/courriers/sortants/', { params });
    return response.data;
  },

  getSortant: async (id: number): Promise<CourrierSortant> => {
    const response = await api.get(`/courriers/sortants/${id}/`);
    return response.data;
  },

  createSortant: async (data: any): Promise<CourrierSortant> => {
    const response = await api.post('/courriers/sortants/', data);
    return response.data;
  },

  uploadSortantAttachment: async (id: number, file: File, onProgress?: (pct: number) => void): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/courriers/sortants/${id}/upload_attachment/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
    return response.data;
  },

  updateSortant: async (id: number, data: any): Promise<CourrierSortant> => {
    const response = await api.patch(`/courriers/sortants/${id}/`, data);
    return response.data;
  },

  sendSortant: async (id: number): Promise<void> => {
    await api.post(`/courriers/sortants/${id}/send/`);
  },

  // KPI
  getKpis: async (): Promise<any> => {
    const response = await api.get('/courriers/kpis/');
    return response.data;
  }
};

export const diffusionsService = {
  createDiffusion: async (data: any): Promise<any> => {
    const response = await api.post('/courriers/diffusions/', data);
    return response.data;
  },
  getDiffusions: async (params?: any): Promise<any> => {
    const response = await api.get('/courriers/diffusions/', { params });
    return response.data;
  },
  getTracking: async (diffusionId: number): Promise<any> => {
    const response = await api.get(`/courriers/diffusions/${diffusionId}/tracking/`);
    return response.data;
  },
  markRead: async (diffusionId: number): Promise<any> => {
    const response = await api.post(`/courriers/diffusions/${diffusionId}/read/`);
    return response.data;
  }
};
