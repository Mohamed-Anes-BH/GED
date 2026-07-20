import api from '../utils/api';

export const workflowsService = {
  getWorkflows: async (params?: any): Promise<any[]> => {
    const response = await api.get('/workflows/definitions/', { params });
    return response.data.results || response.data;
  },

  getWorkflowStats: async (id: number): Promise<any> => {
    const response = await api.get(`/workflows/definitions/${id}/stats/`);
    return response.data;
  },

  getWorkflowKpis: async (): Promise<any> => {
    const response = await api.get('/workflows/definitions/kpis/');
    return response.data;
  }
};
