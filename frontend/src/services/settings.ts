import api from '../utils/api';

export const settingsService = {
  getSettings: async () => {
    const response = await api.get('/settings/global/');
    return response.data;
  },
  updateSettings: async (data: any) => {
    const response = await api.put('/settings/global/1/', data);
    return response.data;
  },
  getAbout: async () => {
    const response = await api.get('/settings/global/about/');
    return response.data;
  },
  getStorage: async () => {
    const response = await api.get('/settings/global/storage/');
    return response.data;
  },
  // Backups
  triggerBackup: async () => {
    const response = await api.post('/settings/backups/trigger_backup/');
    return response.data;
  },
  listBackups: async () => {
    const response = await api.get('/settings/backups/');
    return response.data;
  },
  restoreBackup: async (id: number) => {
    const response = await api.post(`/settings/backups/${id}/restore/`);
    return response.data;
  },
};
