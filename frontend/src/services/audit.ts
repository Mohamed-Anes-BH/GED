import api from '../utils/api';

export const auditService = {
  getLogs: async (params?: any) => {
    const response = await api.get('/audit/logs/', { params });
    return response.data;
  },
  getLog: async (id: number) => {
    const response = await api.get(`/audit/logs/${id}/`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/audit/logs/stats/');
    return response.data;
  },
};
