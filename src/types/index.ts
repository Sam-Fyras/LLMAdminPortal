// ============================================================================
// Type Exports - Backend Aligned
// ============================================================================

// Export all types from modular files
export * from './tenant';
export * from './usage';
export * from './rule';
export * from './provider';
export * from './api';
export * from './alert';
export * from './budget';

// ============================================================================
// Legacy Types (for existing components - will migrate gradually)
// ============================================================================

/**
 * Azure AD user account (from MSAL)
 * @deprecated Use User from './tenant' for application users
 */
export interface UserAccount {
  homeAccountId: string;
  environment: string;
  tenantId: string;
  username: string;
  localAccountId: string;
  name?: string;
}

/**
 * Legacy token usage types (used by existing Dashboard)
 * @deprecated Will migrate to TokenUsageLog from './usage'
 */
export interface TokenUsage {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  cost: number;
  date: string;
}

export interface DailyUsage {
  date: string;
  totalTokens: number;
  cost: number;
  [provider: string]: string | number;
}

export interface TokenUsageSummary {
  totalTokens: number;
  activeUsers: number;
  estimatedCost: number;
  avgTokensPerRequest: number;
  dailyUsage: DailyUsage[];
}

export interface ModelUsage {
  model: string;
  value: number;
  percentage: number;
}

/**
 * Legacy role type (used by existing UserRoleManagement)
 * @deprecated Use RoleTokenLimit from './usage' for new implementations
 */
export interface Role {
  id: string;
  name: string;
  description: string;
  tokenLimits: {
    daily: number;
    monthly: number;
  };
  allowedModels: string[];
}

/**
 * Rule type used by RulesManagementPage
 * Aligned with backend RuleEngine — uses unified 'content_moderation' type
 * for both toxicity blocking and PII redaction.
 */
export type LegacyRuleType =
  | 'token_limit'
  | 'model_restriction'
  | 'rate_limit'
  | 'content_moderation';

export interface Rule {
  id: string;
  name: string;
  description?: string;
  type: LegacyRuleType;
  priority: number;
  enabled: boolean;
  scope?: 'global' | 'tenant';
  conditions: Record<string, any>;
  action?: 'allow' | 'block' | 'modify' | 'throttle' | 'log';
  parameters?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}
