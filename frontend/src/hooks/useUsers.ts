import { useState, useEffect, useCallback } from 'react';
import { usersService } from '../services/users';

export const useUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        usersService.getUsers(),
        usersService.getRoles(),
      ]);
      setUsers(usersData.results || usersData || []);
      setRoles(rolesData.results || rolesData || []);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const createUser = async (data: any) => {
    await usersService.createUser(data);
    fetchData();
  };

  const updateUser = async (id: number, data: any) => {
    await usersService.updateUser(id, data);
    fetchData();
  };

  const deleteUser = async (id: number) => {
    await usersService.deleteUser(id);
    fetchData();
  };

  return { users, roles, loading, createUser, updateUser, deleteUser, refetch: fetchData };
};
