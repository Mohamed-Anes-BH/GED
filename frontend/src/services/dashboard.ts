import api from '../utils/api';
import { GlobalStats, Document } from '../types';

export const dashboardService = {
  getKpis: async (): Promise<GlobalStats> => {
    const response = await api.get('/dashboard/kpis/');
    return response.data;
  },
  
  getRecentDocuments: async (): Promise<Document[]> => {
    const response = await api.get('/dashboard/recent-documents/');
    return response.data;
  },
  
  getRecentActivity: async (): Promise<any[]> => {
    const response = await api.get('/dashboard/recent-activity/');
    return response.data;
  },
  
  getStorageInfo: async (): Promise<any> => {
    const response = await api.get('/dashboard/storage/');
    return response.data;
  },
  
  getChartData: async (params?: any): Promise<any> => {
    const response = await api.get('/stats/evolution/', { params });
    return response.data;
  },

  getCategoryStats: async (): Promise<any[]> => {
    const response = await api.get('/stats/by-category/');
    return response.data;
  },

  getCourrierStats: async (): Promise<any> => {
    const response = await api.get('/stats/courriers/');
    return response.data;
  },

  getUserStats: async (): Promise<any> => {
    const response = await api.get('/stats/users/');
    return response.data;
  },

  exportStatsPdf: async (): Promise<Blob> => {
    const response = await api.get('/stats/export/', {
      params: { format: 'pdf' },
      responseType: 'blob',
    });
    return response.data;
  },
};
