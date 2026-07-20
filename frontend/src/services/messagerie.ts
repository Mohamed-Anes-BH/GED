import api from '../utils/api';

export const messagerieService = {
  getConversations: async (params?: any) => {
    const response = await api.get('/messagerie/conversations/', { params });
    return response.data;
  },

  getConversation: async (id: number) => {
    const response = await api.get(`/messagerie/conversations/${id}/`);
    return response.data;
  },

  createConversation: async (data: { subject: string; participants: number[] }) => {
    const response = await api.post('/messagerie/conversations/', data);
    return response.data;
  },

  getMessages: async (conversationId: number) => {
    const response = await api.get(`/messagerie/conversations/${conversationId}/messages/`);
    return response.data;
  },

  sendMessage: async (conversationId: number, content: string) => {
    const response = await api.post(`/messagerie/conversations/${conversationId}/messages/`, { content });
    return response.data;
  }
};
