// Base interfaces matching backend Odmantic models

/**
 * Base model for tenant-scoped data
 * Maps to TenantScopedModel in backend
 */
export interface TenantScopedModel {
  tenantId: string;
  schemaVersion: string;
  createdDate: string; // ISO 8601 date string
  updatedDate: string; // ISO 8601 date string
}

/**
 * Base model for user-scoped data
 * Maps to UserScopedModel in backend
 */
export interface UserScopedModel extends TenantScopedModel {
  userId: string;
}

/**
 * Tenant entity from TenantConfigService
 */
export interface Tenant {
  id: string;
  name: string;
  tier_id?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_date: string;
  updated_date: string;
}

/**
 * User entity from TenantConfigService
 */
export interface User extends UserScopedModel {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'inactive';
  allowedModels?: string[];
  lastLoginAt?: string;
}

/**
 * User roles in the system
 */
export type UserRole = 'admin' | 'analyst' | 'developer' | 'viewer';

/**
 * Subscription tier
 */
export interface Tier {
  id: string;
  name: string;
  description?: string;
  monthly_token_limit: number;
  features: string[];
  price_usd?: number;
}
