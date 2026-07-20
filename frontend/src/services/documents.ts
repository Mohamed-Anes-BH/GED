import api from '../utils/api';
import { Document, DocumentFile } from '../types';

export const documentsService = {
  getDocuments: async (params?: any): Promise<{ results: Document[], count: number }> => {
    const response = await api.get('/documents/', { params });
    return response.data;
  },

  getDocument: async (id: number): Promise<Document> => {
    const response = await api.get(`/documents/${id}/`);
    return response.data;
  },

  createDocument: async (data: any): Promise<Document> => {
    const response = await api.post('/documents/', data);
    return response.data;
  },

  updateDocument: async (id: number, data: any): Promise<Document> => {
    const response = await api.patch(`/documents/${id}/`, data);
    return response.data;
  },

  deleteDocument: async (id: number): Promise<void> => {
    await api.delete(`/documents/${id}/`);
  },

  uploadFile: async (id: number, file: File, onProgress?: (pct: number) => void): Promise<DocumentFile> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/documents/${id}/upload/`, formData, {
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

  getTrash: async (): Promise<Document[]> => {
    const response = await api.get('/documents/trash/');
    return response.data;
  },

  restoreDocument: async (id: number): Promise<void> => {
    await api.post(`/documents/${id}/restore/`);
  },

  emptyTrash: async (): Promise<void> => {
    await api.post('/documents/trash/empty/');
  },
  
  archiveDocument: async (id: number): Promise<void> => {
    await api.post(`/documents/${id}/archive/`);
  },

  getVersions: async (id: number): Promise<any[]> => {
    const response = await api.get(`/documents/${id}/versions/`);
    return response.data;
  },

  getRelations: async (id: number): Promise<any[]> => {
    const response = await api.get(`/documents/${id}/relations/`);
    return response.data;
  },

  getDocumentFileUrl: (id: number) => {
    return `/documents/${id}/preview/`;
  },

  getFavorites: async (params?: any): Promise<any> => {
    const response = await api.get('/favorites/', { params });
    return response.data;
  },

  addFavorite: async (documentId: number): Promise<any> => {
    const response = await api.post('/favorites/', { document: documentId });
    return response.data;
  },

  removeFavorite: async (favoriteId: number): Promise<void> => {
    await api.delete(`/favorites/${favoriteId}/`);
  },

  getFavoritesStats: async (): Promise<any> => {
    const response = await api.get('/favorites/stats/');
    return response.data;
  },

  getRecentDocuments: async (limit = 20): Promise<Document[]> => {
    const response = await api.get('/documents/recent/', { params: { limit } });
    return response.data;
  },
};
