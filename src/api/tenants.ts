import axiosInstance from './axios';
import { Tenant, User, LLMConfig, TestConnectionRequest, TestConnectionResponse } from '../types';

// ============================================================================
// Tenant Management (TenantConfigService)
// ============================================================================

/**
 * Get tenant information
 */
export const getTenant = (tenantId: string) => {
  return axiosInstance.get<Tenant>(`/api/v1/tenants/${tenantId}`);
};

/**
 * Update tenant information
 */
export const updateTenant = (tenantId: string, data: Partial<Tenant>) => {
  return axiosInstance.put<Tenant>(`/api/v1/tenants/${tenantId}`, data);
};

/**
 * Soft delete tenant
 */
export const deleteTenant = (tenantId: string) => {
  return axiosInstance.delete(`/api/v1/tenants/${tenantId}`);
};

/**
 * Get full tenant context (cached on backend)
 */
export const getTenantContext = (tenantId: string) => {
  return axiosInstance.get(`/api/v1/tenants/${tenantId}/context`);
};

/**
 * Get tenant tier information
 */
export const getTenantTier = (tenantId: string) => {
  return axiosInstance.get(`/api/v1/tenants/${tenantId}/tier`);
};

// ============================================================================
// User Management (TenantConfigService)
// ============================================================================

/**
 * Create a new user (onboard)
 */
export const createUser = (tenantId: string, userData: Omit<User, 'id' | 'tenantId' | 'userId' | 'schemaVersion' | 'createdDate' | 'updatedDate'>) => {
  return axiosInstance.post<User>(`/api/v1/tenants/${tenantId}/users`, userData);
};

/**
 * Get all users for a tenant
 */
export const getUsers = (tenantId: string) => {
  return axiosInstance.get<User[]>(`/api/v1/tenants/${tenantId}/users`);
};

/**
 * Get a specific user
 */
export const getUser = (tenantId: string, userId: string) => {
  return axiosInstance.get<User>(`/api/v1/tenants/${tenantId}/users/${userId}`);
};

/**
 * Update user information
 */
export const updateUser = (tenantId: string, userId: string, userData: Partial<User>) => {
  return axiosInstance.put<User>(`/api/v1/tenants/${tenantId}/users/${userId}`, userData);
};

/**
 * Delete user
 */
export const deleteUser = (tenantId: string, userId: string) => {
  return axiosInstance.delete(`/api/v1/tenants/${tenantId}/users/${userId}`);
};

// ============================================================================
// LLM Provider Configuration (TenantConfigService)
// ============================================================================

/**
 * Get all LLM configurations for a tenant
 */
export const getLLMConfigs = (tenantId: string) => {
  return axiosInstance.get<LLMConfig[]>(`/api/v1/tenants/${tenantId}/llm-configs`);
};

/**
 * Get a specific LLM configuration
 */
export const getLLMConfig = (tenantId: string, configId: string) => {
  return axiosInstance.get<LLMConfig>(`/api/v1/tenants/${tenantId}/llm-configs/${configId}`);
};

/**
 * Add a new LLM configuration
 */
export const createLLMConfig = (tenantId: string, config: Omit<LLMConfig, 'id' | 'tenantId' | 'schemaVersion' | 'createdDate' | 'updatedDate'>) => {
  return axiosInstance.post<LLMConfig>(`/api/v1/tenants/${tenantId}/llm-configs`, config);
};

/**
 * Update an LLM configuration
 */
export const updateLLMConfig = (tenantId: string, configId: string, config: Partial<LLMConfig>) => {
  return axiosInstance.put<LLMConfig>(`/api/v1/tenants/${tenantId}/llm-configs/${configId}`, config);
};

/**
 * Delete an LLM configuration
 */
export const deleteLLMConfig = (tenantId: string, configId: string) => {
  return axiosInstance.delete(`/api/v1/tenants/${tenantId}/llm-configs/${configId}`);
};

/**
 * Test LLM provider connection
 */
export const testLLMConnection = (tenantId: string, request: TestConnectionRequest) => {
  return axiosInstance.post<TestConnectionResponse>(`/api/v1/tenants/${tenantId}/llm-configs/test`, request);
};

/**
 * Get available models from a provider
 */
export const getAvailableModels = (tenantId: string, configId: string) => {
  return axiosInstance.get<string[]>(`/api/v1/tenants/${tenantId}/llm-configs/${configId}/models`);
};
