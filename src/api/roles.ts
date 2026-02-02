import axiosInstance from './axios';
import { Role } from '../types';

// ============================================================================
// Role Management (UsageTrackingService)
// ============================================================================

/**
 * Get all roles for a tenant
 */
export const getRoles = (tenantId: string) => {
  return axiosInstance.get<Role[]>(`/api/v1/role/${tenantId}`);
};

/**
 * Get a specific role
 */
export const getRole = (tenantId: string, roleId: string) => {
  return axiosInstance.get<Role>(`/api/v1/role/${tenantId}/${roleId}`);
};

/**
 * Create a new role
 */
export const createRole = (
  tenantId: string,
  data: {
    name: string;
    description: string;
    tokenLimits: {
      daily: number;
      monthly: number;
    };
    allowedModels: string[];
  }
) => {
  return axiosInstance.post<Role>(`/api/v1/role/${tenantId}`, data);
};

/**
 * Update a role
 */
export const updateRole = (
  tenantId: string,
  roleId: string,
  data: Partial<Role>
) => {
  return axiosInstance.put<Role>(`/api/v1/role/${tenantId}/${roleId}`, data);
};

/**
 * Delete a role
 */
export const deleteRole = (tenantId: string, roleId: string) => {
  return axiosInstance.delete(`/api/v1/role/${tenantId}/${roleId}`);
};

/**
 * Get users with a specific role
 */
export const getUsersByRole = (tenantId: string, roleId: string) => {
  return axiosInstance.get(`/api/v1/role/${tenantId}/${roleId}/users`);
};
