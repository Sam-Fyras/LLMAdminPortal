import { TenantScopedModel } from './tenant';

/**
 * Supported LLM provider types
 */
export type ProviderType =
  | 'openai'
  | 'anthropic'
  | 'azure_openai'
  | 'google_vertex'
  | 'aws_bedrock'
  | 'custom';

/**
 * Provider health status
 */
export type HealthStatusType = 'healthy' | 'degraded' | 'down';

/**
 * LLM provider configuration from TenantConfigService
 */
export interface LLMConfig extends TenantScopedModel {
  id: string;
  provider: ProviderType;
  name: string; // Custom name (e.g., "OpenAI Production")
  api_key: string; // Encrypted, masked in responses
  base_url?: string; // Optional custom endpoint
  organization_id?: string; // For OpenAI
  region?: string; // For Azure/AWS
  enabled_models: string[];
  is_default: boolean;
  fallback_priority: number; // Lower = higher priority
  rate_limits?: {
    rpm?: number; // Requests per minute
    tpm?: number; // Tokens per minute
  };
  health_status?: HealthStatus;
}

/**
 * Provider health status details
 */
export interface HealthStatus {
  status: HealthStatusType;
  last_checked: string; // ISO date
  uptime: number; // Percentage (0-100)
  avg_response_time: number; // Milliseconds
  error_rate: number; // Percentage (0-100)
}

/**
 * Test connection request
 */
export interface TestConnectionRequest {
  provider: ProviderType;
  api_key: string;
  base_url?: string;
  organization_id?: string;
  region?: string;
}

/**
 * Test connection response
 */
export interface TestConnectionResponse {
  success: boolean;
  message: string;
  details?: {
    latency_ms: number;
    available_models?: string[];
    error_code?: string;
  };
}

/**
 * Model information
 */
export interface ModelInfo {
  id: string;
  name: string;
  provider: ProviderType;
  context_window: number;
  input_cost_per_1k: number; // USD
  output_cost_per_1k: number; // USD
  supports_streaming: boolean;
  supports_function_calling: boolean;
  max_output_tokens?: number;
}

/**
 * Provider metrics for monitoring
 */
export interface ProviderMetrics {
  provider_id: string;
  provider_name: string;
  period_start: string;
  period_end: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  avg_response_time: number;
  p95_response_time: number;
  p99_response_time: number;
  total_tokens: number;
  total_cost: number;
}
