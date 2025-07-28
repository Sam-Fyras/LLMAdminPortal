import axiosInstance from './axios';
import { Role, User } from '../types';

export const fetchRoles = () => {
  return axiosInstance.get('/api/v1/tenant/roles');
};

export const fetchRole = (id: string) => {
  return axiosInstance.get(`/api/v1/tenant/roles/${id}`);
};

export const createRole = (role: Omit<Role, 'id'>) => {
  return axiosInstance.post('/api/v1/tenant/roles', role);
};

export const updateRole = (id: string, role: Partial<Role>) => {
  return axiosInstance.put(`/api/v1/tenant/roles/${id}`, role);
};

export const deleteRole = (id: string) => {
  return axiosInstance.delete(`/api/v1/tenant/roles/${id}`);
};

export const fetchUsers = () => {
  return axiosInstance.get('/api/v1/tenant/users');
};

export const fetchUser = (id: string) => {
  return axiosInstance.get(`/api/v1/tenant/users/${id}`);
};

export const assignRoleToUser = (userId: string, roleId: string) => {
  return axiosInstance.post(`/api/v1/tenant/users/${userId}/roles`, { roleId });
};

export const removeRoleFromUser = (userId: string, roleId: string) => {
  return axiosInstance.delete(`/api/v1/tenant/users/${userId}/roles/${roleId}`);
};

export const updateUserTokenLimits = (userId: string, limits: { daily?: number; monthly?: number }) => {
  return axiosInstance.patch(`/api/v1/tenant/users/${userId}/token-limits`, limits);
};
