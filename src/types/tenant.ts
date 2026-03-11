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

/**
 * Request model for tenant onboarding
 * Maps to onboardRequest backend model
 */
export interface OnboardRequest {
  tenant_name: string;
  admin_email: string;
  azure_tenant_id: string;
  azure_client_id: string;
  tier_name: string;
  firewall_version: string;
  llm_model: string;
  token_count: number;
  mongo_url?: string;
}

/**
 * Request model for updating an existing tenant
 * Maps to updateRequest backend model
 */
export interface UpdateRequest {
  tenant_id?: string;
  tenant_name?: string;
  tenant_admin?: { name: string; email: string };
  tier_id?: string;
  firewall_version_id?: string;
  llm_use?: string;
  token_count?: number;
  mongo_url?: string;
  azure_ad_tenant_id?: string;
  azure_ad_client_id?: string;
  status?: string;
  is_active?: boolean;
  schema_version?: number;
  metadata?: Record<string, string>;
  created_date?: string;
  updated_date?: string;
  deleted_at?: string;
  is_deleted?: boolean;
}
