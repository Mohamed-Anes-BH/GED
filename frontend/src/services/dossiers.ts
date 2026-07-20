import api from '../utils/api';
import { Dossier } from '../types';

export const dossiersService = {
  getDossiers: async (params?: any): Promise<Dossier[]> => {
    const response = await api.get('/dossiers/', { params });
    return response.data.results || response.data;
  },

  getDossierTree: async (id: number): Promise<any> => {
    const response = await api.get(`/dossiers/${id}/tree/`);
    return response.data;
  },

  getDossierContent: async (id: number): Promise<any> => {
    const response = await api.get(`/dossiers/${id}/content/`);
    return response.data;
  },

  getStats: async (id: number): Promise<any> => {
    const response = await api.get(`/dossiers/${id}/stats/`);
    return response.data;
  },

  getActivity: async (id: number): Promise<any> => {
    const response = await api.get(`/dossiers/${id}/activity/`);
    return response.data;
  },

  createDossier: async (data: any): Promise<any> => {
    const response = await api.post('/dossiers/', data);
    return response.data;
  },

  updateDossier: async (id: number, data: any): Promise<any> => {
    const response = await api.patch(`/dossiers/${id}/`, data);
    return response.data;
  },

  deleteDossier: async (id: number): Promise<void> => {
    await api.delete(`/dossiers/${id}/`);
  }
};
