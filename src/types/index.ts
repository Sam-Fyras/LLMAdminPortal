// ============================================================================
// Type Exports - Backend Aligned
// ============================================================================

// Export all types from modular files
export * from './tenant';
export * from './usage';
export * from './rule';
export * from './provider';
export * from './api';

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
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
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
