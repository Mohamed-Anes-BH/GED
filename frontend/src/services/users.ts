import api from '../utils/api';

export const usersService = {
  getUsers: async (params?: any) => {
    const response = await api.get('/users/', { params });
    return response.data;
  },
  getUser: async (id: number) => {
    const response = await api.get(`/users/${id}/`);
    return response.data;
  },
  createUser: async (data: any) => {
    const response = await api.post('/users/', data);
    return response.data;
  },
  updateUser: async (id: number, data: any) => {
    const response = await api.patch(`/users/${id}/`, data);
    return response.data;
  },
  deleteUser: async (id: number) => {
    await api.delete(`/users/${id}/`);
  },
  // Rôles
  getRoles: async () => {
    const response = await api.get('/users/roles/');
    return response.data;
  },
  createRole: async (data: any) => {
    const response = await api.post('/users/roles/', data);
    return response.data;
  },
  updateRole: async (id: number, data: any) => {
    const response = await api.patch(`/users/roles/${id}/`, data);
    return response.data;
  },
  deleteRole: async (id: number) => {
    await api.delete(`/users/roles/${id}/`);
  },
  // Permissions
  getPermissions: async (params?: any) => {
    const response = await api.get('/users/permissions/', { params });
    return response.data;
  },
  getRolePermissions: async (roleId: number) => {
    const response = await api.get(`/users/roles/${roleId}/permissions/`);
    return response.data;
  },
  updateRolePermissions: async (roleId: number, data: any) => {
    const response = await api.put(`/users/roles/${roleId}/permissions/`, data);
    return response.data;
  },
};
