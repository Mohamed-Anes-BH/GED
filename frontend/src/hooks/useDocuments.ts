import { useState, useEffect, useCallback } from 'react';
import { documentsService } from '../services/documents';
import { Document } from '../types';
import api from '../utils/api';

export const useDocuments = (initialParams: any = {}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchDocuments = useCallback(async (params: any = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentsService.getDocuments({ ...initialParams, ...params });
      if (data.results) {
        setDocuments(data.results);
        setTotalCount(data.count || 0);
      } else if (Array.isArray(data)) {
        setDocuments(data as unknown as Document[]);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const deleteDocument = async (id: number) => {
    await documentsService.deleteDocument(id);
    fetchDocuments();
  };

  const archiveDocument = async (id: number) => {
    await documentsService.archiveDocument(id);
    fetchDocuments();
  };

  const toggleFavorite = async (id: number) => {
    let currentFav = false;
    setDocuments(prev => prev.map(doc => {
      if (doc.id === id) {
        currentFav = !!doc.is_favorite;
        return { ...doc, is_favorite: !currentFav };
      }
      return doc;
    }));

    try {
      const response = await api.post(`/documents/${id}/toggle_favorite/`);
      const isFav = response.data.is_favorite;
      setDocuments(prev => prev.map(doc => {
        if (doc.id === id) {
          return { ...doc, is_favorite: isFav };
        }
        return doc;
      }));
    } catch (err) {
      setDocuments(prev => prev.map(doc => {
        if (doc.id === id) {
          return { ...doc, is_favorite: currentFav };
        }
        return doc;
      }));
      console.error("Failed to toggle favorite:", err);
    }
  };

  return { 
    documents, 
    loading, 
    error, 
    totalCount, 
    refetch: fetchDocuments, 
    deleteDocument,
    archiveDocument,
    toggleFavorite
  };
};
