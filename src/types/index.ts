// Auth types
export interface UserAccount {
  homeAccountId: string;
  environment: string;
  tenantId: string;
  username: string;
  localAccountId: string;
  name?: string;
}

// Rule types
export interface Rule {
  id: string;
  name: string;
  type: 'token_limit' | 'model_restriction' | 'rate_limit';
  action: 'block' | 'alert';
  priority: number;
  enabled: boolean;
  conditions: TokenLimitCondition | ModelRestrictionCondition | RateLimitCondition;
  parameters: {
    block_message?: string;
    [key: string]: any;
  };
}

export interface TokenLimitCondition {
  limit_type: 'daily' | 'monthly' | 'hourly';
  max_tokens: number;
}

export interface ModelRestrictionCondition {
  restriction_type: 'allowlist' | 'blocklist';
  models: string[];
}

export interface RateLimitCondition {
  requests_per_minute?: number;
  requests_per_hour?: number;
  scope: 'user' | 'tenant';
}

// Token usage types
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

// User role types
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

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  tokenUsage: {
    daily: number;
    monthly: number;
  };
}
