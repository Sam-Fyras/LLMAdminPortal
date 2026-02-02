import { TenantScopedModel } from './tenant';

/**
 * Rule types supported by RuleManagementService
 */
export type RuleType =
  | 'token_limit'
  | 'model_restriction'
  | 'rate_limit'
  | 'hard_block'
  | 'redaction'
  | 'cost_control';

/**
 * Rule action types
 */
export type RuleAction = 'block' | 'alert' | 'redact';

/**
 * Tenant-specific rule from RuleManagementService
 */
export interface TenantRule extends TenantScopedModel {
  id: string;
  name: string;
  type: RuleType;
  priority: number; // Lower = higher priority
  enabled: boolean;
  conditions: RuleConditions; // Type-specific configuration
  parameters: Record<string, any>; // Additional settings
  description?: string;
  tags?: string[];
  version: number;
  effective_start?: string; // ISO date
  effective_end?: string; // ISO date
  created_by?: string;
}

/**
 * Rule condition types (discriminated union)
 */
export type RuleConditions =
  | TokenLimitCondition
  | ModelRestrictionCondition
  | RateLimitCondition
  | HardBlockCondition
  | RedactionCondition
  | CostControlCondition;

/**
 * Token limit rule condition
 */
export interface TokenLimitCondition {
  type: 'token_limit';
  limit_type: 'daily' | 'monthly' | 'hourly';
  max_tokens: number;
  scope: 'user' | 'tenant';
}

/**
 * Model restriction rule condition
 */
export interface ModelRestrictionCondition {
  type: 'model_restriction';
  restriction_type: 'allowlist' | 'blocklist';
  models: string[];
}

/**
 * Rate limit rule condition
 */
export interface RateLimitCondition {
  type: 'rate_limit';
  requests_per_minute?: number;
  requests_per_hour?: number;
  scope: 'user' | 'tenant';
}

/**
 * Hard block rule condition (keyword blocking)
 */
export interface HardBlockCondition {
  type: 'hard_block';
  keywords: string[];
  case_sensitive: boolean;
  whole_word_only: boolean;
  custom_message?: string;
}

/**
 * Redaction rule condition (PII removal)
 */
export interface RedactionCondition {
  type: 'redaction';
  pattern_type: 'email' | 'phone' | 'ssn' | 'credit_card' | 'custom';
  custom_regex?: string;
  replacement: string; // Default: "[REDACTED]"
  apply_to: 'prompt' | 'response' | 'both';
}

/**
 * Cost control rule condition
 */
export interface CostControlCondition {
  type: 'cost_control';
  max_cost_per_request?: number;
  daily_cost_cap?: number;
  monthly_cost_cap?: number;
}

/**
 * Global rule template
 */
export interface GlobalRule {
  id: string;
  name: string;
  description: string;
  type: RuleType;
  template_config: RuleConditions;
  category?: string;
  is_recommended: boolean;
  created_date: string;
  updated_date: string;
}

/**
 * Rule test request
 */
export interface RuleTestRequest {
  rule_ids?: string[]; // Specific rules to test, or all if empty
  sample_prompt: string;
  sample_response?: string;
}

/**
 * Rule test result
 */
export interface RuleTestResult {
  triggered_rules: Array<{
    rule_id: string;
    rule_name: string;
    action: RuleAction;
  }>;
  modified_prompt?: string; // After redaction
  modified_response?: string; // After redaction
  is_blocked: boolean;
  block_reason?: string;
  warnings: string[];
}

/**
 * Rule version history entry
 */
export interface RuleVersion {
  version: number;
  rule_id: string;
  snapshot: TenantRule;
  changed_by: string;
  changed_at: string;
  change_description?: string;
}

/**
 * Rule validation result
 */
export interface RuleValidation {
  is_valid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
  }>;
}
