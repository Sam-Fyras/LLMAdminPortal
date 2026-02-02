import axiosInstance from './axios';
import {
  TokenLimit,
  RoleTokenLimit,
  UserTokenLimit,
  TokenQuota,
  QuotaCheck,
  UsageAnalytics,
  UsageAnalyticsParams,
} from '../types';

// ============================================================================
// Usage Tracking (UsageTrackingService)
// ============================================================================

/**
 * Record token usage (called after each request)
 * This is typically fire-and-forget from the gateway
 */
export const recordUsage = (
  tenantId: string,
  userId: string,
  data: {
    request_id: string;
    provider: string;
    model: string;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    response_time_ms?: number;
    success: boolean;
    error_message?: string;
    cost?: number;
  }
) => {
  return axiosInstance.post(`/api/v1/usage/${tenantId}/record/${userId}`, data);
};

/**
 * Batch record usage (for bulk operations)
 */
export const recordUsageBatch = (
  tenantId: string,
  usageRecords: Array<{
    user_id: string;
    request_id: string;
    provider: string;
    model: string;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    timestamp: string;
  }>
) => {
  return axiosInstance.post(`/api/v1/usage/batch`, {
    tenant_id: tenantId,
    records: usageRecords,
  });
};

/**
 * Get current usage for the entire tenant
 */
export const getCurrentUsage = (tenantId: string) => {
  return axiosInstance.get(`/api/v1/usage/current/${tenantId}`);
};

/**
 * Get current usage for a specific user (with quota check)
 */
export const getUserUsage = (tenantId: string, userId: string) => {
  return axiosInstance.get<QuotaCheck>(`/api/v1/usage/current/${tenantId}/users/${userId}`);
};

/**
 * Get remaining quota for tenant
 */
export const getRemainingQuota = (tenantId: string) => {
  return axiosInstance.get(`/api/v1/usage/remaining/${tenantId}`);
};

// ============================================================================
// Token Limits - Tenant Level (UsageTrackingService)
// ============================================================================

/**
 * Get tenant-level token limits
 */
export const getTenantLimits = (tenantId: string) => {
  return axiosInstance.get<TokenLimit>(`/api/v1/limits/${tenantId}`);
};

/**
 * Update tenant-level token limits
 */
export const updateTenantLimits = (
  tenantId: string,
  limits: {
    monthly_limit?: number;
    daily_limit?: number;
    hourly_limit?: number;
  }
) => {
  return axiosInstance.put<TokenLimit>(`/api/v1/limits/${tenantId}`, limits);
};

/**
 * Reset tenant usage counters (admin only)
 */
export const resetTenantUsage = (tenantId: string) => {
  return axiosInstance.post(`/api/v1/limits/${tenantId}/reset`);
};

// ============================================================================
// Token Limits - Role Level (UsageTrackingService)
// ============================================================================

/**
 * Get all role token limits for a tenant
 */
export const getRoleLimits = (tenantId: string) => {
  return axiosInstance.get<RoleTokenLimit[]>(`/api/v1/limits/${tenantId}/roletokenlimit`);
};

/**
 * Get role token limit by role ID
 */
export const getRoleLimit = (tenantId: string, roleId: string) => {
  return axiosInstance.get<RoleTokenLimit>(`/api/v1/limits/${tenantId}/roletokenlimit/${roleId}`);
};

/**
 * Create role token limit
 */
export const createRoleLimit = (
  tenantId: string,
  data: {
    role_id: string;
    role_name: string;
    monthly_limit: number;
    daily_limit: number;
    hourly_limit?: number;
    per_request_limit?: number;
    description?: string;
    is_active?: boolean;
  }
) => {
  return axiosInstance.post<RoleTokenLimit>(`/api/v1/limits/${tenantId}/roletokenlimit`, data);
};

/**
 * Update role token limit
 */
export const updateRoleLimit = (
  tenantId: string,
  roleId: string,
  data: Partial<RoleTokenLimit>
) => {
  return axiosInstance.put<RoleTokenLimit>(`/api/v1/limits/${tenantId}/roletokenlimit/${roleId}`, data);
};

/**
 * Delete role token limit
 */
export const deleteRoleLimit = (tenantId: string, roleId: string) => {
  return axiosInstance.delete(`/api/v1/limits/${tenantId}/roletokenlimit/${roleId}`);
};

// ============================================================================
// Token Limits - User Level (UsageTrackingService)
// ============================================================================

/**
 * Get all user token limits (overrides)
 */
export const getUserLimits = (tenantId: string) => {
  return axiosInstance.get<UserTokenLimit[]>(`/api/v1/limits/${tenantId}/usertokenlimit`);
};

/**
 * Get user token limit by user ID
 */
export const getUserLimit = (tenantId: string, userId: string) => {
  return axiosInstance.get<UserTokenLimit>(`/api/v1/limits/${tenantId}/usertokenlimit/${userId}`);
};

/**
 * Create user token limit (override)
 */
export const createUserLimit = (
  tenantId: string,
  data: {
    user_id: string;
    monthly_limit: number;
    daily_limit: number;
    hourly_limit?: number;
    per_request_limit?: number;
    override_role_limit?: boolean;
    reason?: string;
    valid_from?: string; // ISO date
    valid_until?: string; // ISO date
    created_by?: string;
    is_active?: boolean;
  }
) => {
  return axiosInstance.post<UserTokenLimit>(`/api/v1/limits/${tenantId}/usertokenlimit`, data);
};

/**
 * Update user token limit
 */
export const updateUserLimit = (
  tenantId: string,
  userId: string,
  data: Partial<UserTokenLimit>
) => {
  return axiosInstance.put<UserTokenLimit>(`/api/v1/limits/${tenantId}/usertokenlimit/${userId}`, data);
};

/**
 * Delete user token limit
 */
export const deleteUserLimit = (tenantId: string, userId: string) => {
  return axiosInstance.delete(`/api/v1/limits/${tenantId}/usertokenlimit/${userId}`);
};

// ============================================================================
// Analytics (UsageTrackingService)
// ============================================================================

/**
 * Get usage analytics over time
 */
export const getUsageAnalytics = (params: UsageAnalyticsParams) => {
  const queryParams = new URLSearchParams();

  if (params.user_id) queryParams.append('user_id', params.user_id);
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  if (params.time_range) queryParams.append('timeRange', params.time_range);
  if (params.group_by) queryParams.append('group_by', params.group_by);

  return axiosInstance.get<UsageAnalytics>(
    `/api/v1/analytics/${params.tenant_id}/usage?${queryParams.toString()}`
  );
};

/**
 * Get usage breakdown by user and model
 */
export const getUsageBreakdown = (tenantId: string, timeRange?: string) => {
  const params = timeRange ? `?timeRange=${timeRange}` : '';
  return axiosInstance.get(`/api/v1/analytics/${tenantId}/breakdown${params}`);
};

/**
 * Get usage trends
 */
export const getUsageTrends = (tenantId: string, timeRange?: string) => {
  const params = timeRange ? `?timeRange=${timeRange}` : '';
  return axiosInstance.get(`/api/v1/analytics/${tenantId}/trends${params}`);
};

/**
 * Get top users by token usage
 */
export const getTopUsers = (tenantId: string, limit: number = 10, timeRange?: string) => {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (timeRange) params.append('timeRange', timeRange);

  return axiosInstance.get(`/api/v1/analytics/${tenantId}/top-users?${params.toString()}`);
};

/**
 * Get usage by model
 */
export const getUsageByModel = (tenantId: string, timeRange?: string) => {
  const params = timeRange ? `?timeRange=${timeRange}` : '';
  return axiosInstance.get(`/api/v1/analytics/${tenantId}/by-model${params}`);
};
