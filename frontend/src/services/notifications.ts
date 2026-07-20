import api from '../utils/api';

export const notificationsService = {
  getAll: async (params?: any) => {
    const response = await api.get('/notifications/', { params });
    return response.data;
  },
  markRead: async (id: number) => {
    const response = await api.post(`/notifications/${id}/mark_read/`);
    return response.data;
  },
  markAllRead: async () => {
    const response = await api.post('/notifications/mark_all_read/');
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread_count/');
    return response.data;
  },
  clear: async () => {
    await api.delete('/notifications/clear/');
  },
};
