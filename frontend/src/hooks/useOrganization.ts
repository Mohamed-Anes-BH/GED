import { useState, useEffect, useCallback } from 'react';

export const useOrganizationCrud = (service: any) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async (query = '') => {
    try {
      setLoading(true);
      const data = await service.getAll({ search: query, page_size: 1000 });
      setItems(data.results || data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    fetchData(searchQuery);
  }, [fetchData, searchQuery]);

  const create = async (data: any) => {
    try {
      await service.create(data);
      fetchData(searchQuery);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || "Erreur de création." };
    }
  };

  const update = async (id: number, data: any) => {
    try {
      await service.update(id, data);
      fetchData(searchQuery);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || "Erreur de modification." };
    }
  };

  const remove = async (id: number) => {
    try {
      await service.delete(id);
      fetchData(searchQuery);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || "Erreur de suppression." };
    }
  };

  return { items, loading, create, update, remove, refetch: fetchData, searchQuery, setSearchQuery };
};
