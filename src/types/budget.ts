// ============================================================================
// Budget Management Types
// Aligned with backend Budget model and FUNCTIONAL_SPEC.md Section 4.5 & 5.4
// ============================================================================

export type BudgetScope = 'organization' | 'user' | 'team';
export type BudgetPeriod = 'daily' | 'weekly' | 'monthly';
export type BudgetAlertStatus = 'on_track' | 'warning' | 'critical' | 'blocked';

// ============================================================================
// Core Budget Model
// ============================================================================

export interface BudgetAlertThresholds {
  warning: number;   // Percentage (default 80)
  critical: number;  // Percentage (default 90)
  block: number;     // Percentage (default 100)
}

export interface BudgetCurrentUsage {
  tokens: number;
  cost: number;       // USD
  lastUpdated: Date;
}

export interface Budget {
  id: string;
  tenantId: string;
  scope: BudgetScope;
  targetId?: string;              // User ID or Team ID; null for org-level
  period: BudgetPeriod;
  tokenCap?: number;              // Max tokens allowed
  costCap?: number;               // Max cost in USD
  alertThresholds: BudgetAlertThresholds;
  blockRequestsOnLimit: boolean;  // Block new LLM requests when block threshold is hit
  currentUsage: BudgetCurrentUsage;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Budget Overview (computed/derived display data)
// ============================================================================

export interface BudgetOverviewData {
  budget: Budget;
  percentageUsed: number;      // 0–100
  remainingTokens?: number;
  remainingCost?: number;      // USD
  projectedEndOfMonthCost: number;
  alertStatus: BudgetAlertStatus;
}

// ============================================================================
// Cost Projection
// ============================================================================

export interface ProjectionDataPoint {
  date: string;              // ISO date string (YYYY-MM-DD)
  actualCost?: number;       // USD — present for past/today dates
  projectedCost?: number;    // USD — present for future dates
  actualTokens?: number;
  projectedTokens?: number;
  confidenceUpper?: number;  // USD — upper bound of projected confidence interval
  confidenceLower?: number;  // USD — lower bound of projected confidence interval
}

export interface BudgetProjection {
  budgetId: string;
  targetDate: string;         // ISO date string (end of period)
  projectedTotalCost: number; // USD
  projectedTotalTokens: number;
  willExceedBudget: boolean;
  estimatedOverspend?: number; // USD, if willExceedBudget
  dataPoints: ProjectionDataPoint[];
  generatedAt: Date;
}

// ============================================================================
// Form / Request Payloads
// ============================================================================

export interface BudgetFormValues {
  scope: BudgetScope;
  targetId?: string;
  period: BudgetPeriod;
  tokenCap?: number;
  costCap?: number;
  alertThresholds: BudgetAlertThresholds;
  blockRequestsOnLimit: boolean;
}

export type CreateBudgetPayload = Omit<BudgetFormValues, 'id'>;
export type UpdateBudgetPayload = Partial<BudgetFormValues>;
