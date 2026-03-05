import { TenantScopedModel } from './tenant';

/**
 * Rule types supported by RuleManagementService
 */
export type RuleType =
  | 'token_limit'
  | 'model_restriction'
  | 'rate_limit'
  | 'content_moderation';

/**
 * Rule action types
 */
export type RuleAction = 'allow' | 'block' | 'modify' | 'throttle' | 'log';

/**
 * Tenant-specific rule from RuleManagementService
 * Extends TenantScopedModel for tenantId/schemaVersion; uses backend timestamp names directly.
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
  // Backend timestamp fields (backend uses created_at/updated_at, not createdDate/updatedDate)
  created_at?: string;
  updated_at?: string;
}

/**
 * Rule condition types (discriminated union)
 */
export type RuleConditions =
  | TokenLimitCondition
  | ModelRestrictionCondition
  | RateLimitCondition
  | ContentModerationCondition;

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
 * Content moderation rule condition (toxicity + PII detection)
 */
export interface ContentModerationCondition {
  type: 'content_moderation';
  check_toxicity?: boolean;
  toxicity_threshold?: number; // 0.0 – 1.0
  check_pii?: boolean;
  pii_types?: ('email' | 'phone' | 'ssn' | 'credit_card' | 'ip_address' | 'name' | 'address')[];
}


/**
 * Rule evaluation status (from RuleEngine)
 */
export type RuleEvaluationStatus = 'success' | 'error' | 'skipped' | 'timeout';

/**
 * Rule severity levels
 */
export type RuleSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Global rule template (optional template library, copied to tenants)
 */
export interface GlobalRule {
  id: string;
  name: string;
  type: RuleType;
  description: string;
  // Default configuration (can be overridden when copied to tenants)
  default_conditions: Record<string, any>;
  default_parameters: Record<string, any>;
  default_priority: number;
  default_enabled: boolean;
  // Categorization
  category?: string;
  severity: RuleSeverity;
  tags: string[];
  // Metadata
  version: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
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
