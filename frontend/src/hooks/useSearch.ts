import { useState } from 'react';
import api from '../utils/api';

export const useSearch = () => {
  const [results, setResults] = useState<{documents: any[], courriers: any[], dossiers: any[]}>({ documents: [], courriers: [], dossiers: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query) {
      setResults({ documents: [], courriers: [], dossiers: [] });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/search/?q=${encodeURIComponent(query)}`);
      setResults(response.data);
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const suggest = async (query: string) => {
    if (!query) return [];
    try {
      const response = await api.get(`/search/suggestions/?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (err) {
      return [];
    }
  };

  return { results, loading, error, search, suggest };
};
