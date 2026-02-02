import { TenantScopedModel, UserScopedModel } from './tenant';

/**
 * Tenant-level token limits from UsageTrackingService
 */
export interface TokenLimit extends TenantScopedModel {
  id: string;
  monthly_limit: number;
  daily_limit: number;
  hourly_limit?: number;
  monthly_used: number;
  daily_used: number;
  hourly_used: number;
  monthly_reset_date: string;
  daily_reset_date: string;
}

/**
 * Role-based token limits from UsageTrackingService
 */
export interface RoleTokenLimit extends TenantScopedModel {
  id: string;
  role_id: string;
  role_name: string;
  monthly_limit: number;
  daily_limit: number;
  hourly_limit?: number;
  per_request_limit?: number;
  description?: string;
  is_active: boolean;
}

/**
 * User-specific token limits (overrides) from UsageTrackingService
 */
export interface UserTokenLimit extends UserScopedModel {
  id: string;
  monthly_limit: number;
  daily_limit: number;
  hourly_limit?: number;
  per_request_limit?: number;
  override_role_limit: boolean;
  reason?: string;
  valid_from?: string; // ISO date - temporary quota start
  valid_until?: string; // ISO date - temporary quota end
  created_by?: string; // Admin user ID
  is_active: boolean;
}

/**
 * Real-time token usage per user from UsageTrackingService
 */
export interface TokenQuota extends UserScopedModel {
  id: string;
  monthly_used: number;
  daily_used: number;
  hourly_used: number;
  usage_by_model: Record<string, number>;
  monthly_reset_date: string;
  daily_reset_date: string;
  hourly_reset_date: string;
  last_request_at?: string;
  total_requests: number;
}

/**
 * Individual token usage record from UsageTrackingService
 */
export interface TokenUsageLog extends UserScopedModel {
  id: string;
  request_id: string;
  provider: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  request_timestamp: string;
  response_time_ms?: number;
  success: boolean;
  error_message?: string;
  cost?: number; // USD
}

/**
 * Aggregated usage statistics from UsageTrackingService
 */
export interface TokenUsageStats extends TenantScopedModel {
  id: string;
  period: 'daily' | 'weekly' | 'monthly';
  period_start: string;
  period_end: string;
  total_tokens: number;
  total_requests: number;
  tokens_by_model: Record<string, number>;
  requests_by_model: Record<string, number>;
  tokens_by_user: Record<string, number>;
  estimated_cost?: number;
}

/**
 * Quota check response from UsageTrackingService
 * Returned when checking if user can proceed with request
 */
export interface QuotaCheck {
  can_proceed: boolean;
  effective_limit: number; // Most restrictive limit across all levels
  current_usage: number;
  remaining: number;
  blocking_reason?: string; // Why request is blocked (if blocked)
  checks: {
    tenant_level: boolean;
    role_level: boolean;
    user_level: boolean;
  };
  reset_times: {
    monthly: string;
    daily: string;
  };
}

/**
 * Usage analytics request parameters
 */
export interface UsageAnalyticsParams {
  tenant_id: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  time_range?: '24h' | '7d' | '30d' | '90d' | '6m' | '1y';
  group_by?: 'day' | 'week' | 'month';
}

/**
 * Usage analytics response
 */
export interface UsageAnalytics {
  period: string;
  data: Array<{
    date: string;
    total_tokens: number;
    total_requests: number;
    cost: number;
    by_model?: Record<string, number>;
  }>;
  summary: {
    total_tokens: number;
    total_requests: number;
    total_cost: number;
    avg_tokens_per_request: number;
  };
}
