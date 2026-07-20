import { useState, useEffect, useCallback } from 'react';
import { courriersService } from '../services/courriers';
import { CourrierEntrant, CourrierSortant } from '../types';
import api from '../utils/api';

export const useCourriers = (type: 'entrants' | 'sortants', initialParams: any = {}) => {
  const [data, setData] = useState<(CourrierEntrant | CourrierSortant)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = useCallback(async (params: any = {}) => {
    try {
      setLoading(true);
      setError(null);
      let response;
      if (type === 'entrants') {
        response = await courriersService.getEntrants({ ...initialParams, ...params });
      } else {
        response = await courriersService.getSortants({ ...initialParams, ...params });
      }

      if (response.results) {
        setData(response.results);
        setTotalCount(response.count || 0);
      } else if (Array.isArray(response)) {
        setData(response);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des courriers');
    } finally {
      setLoading(false);
    }
  }, [type, JSON.stringify(initialParams)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleFavorite = async (id: number) => {
    let currentFav = false;
    setData(prev => prev.map(c => {
      if (c.id === id) {
        currentFav = !!c.is_favorite;
        return { ...c, is_favorite: !currentFav };
      }
      return c;
    }));

    try {
      let isFav = false;
      if (type === 'entrants') {
        const response = await api.post(`/courriers/entrants/${id}/toggle_favorite/`);
        isFav = response.data.is_favorite;
      } else {
        const response = await api.post(`/courriers/sortants/${id}/toggle_favorite/`);
        isFav = response.data.is_favorite;
      }
      setData(prev => prev.map(c => {
        if (c.id === id) {
          return { ...c, is_favorite: isFav };
        }
        return c;
      }));
    } catch (err) {
      setData(prev => prev.map(c => {
        if (c.id === id) {
          return { ...c, is_favorite: currentFav };
        }
        return c;
      }));
      console.error("Failed to toggle favorite on courrier:", err);
    }
  };

  return { 
    data, 
    loading, 
    error, 
    totalCount, 
    refetch: fetchData,
    toggleFavorite
  };
};
