import axiosInstance from './axios';
import {
  Budget,
  BudgetProjection,
  CreateBudgetPayload,
  UpdateBudgetPayload,
} from '../types/budget';

// ============================================================================
// Budget Management API
// Spec: FUNCTIONAL_SPEC.md Section 6.2.5
// Endpoints: /api/v1/tenants/{tenantId}/budgets
// ============================================================================

/**
 * Get all budgets for a tenant (org, user, and team level)
 */
export const getBudgets = (tenantId: string) => {
  return axiosInstance.get<Budget[]>(`/api/v1/tenants/${tenantId}/budgets`);
};

/**
 * Create a new budget (org, user, or team level)
 */
export const createBudget = (tenantId: string, payload: CreateBudgetPayload) => {
  return axiosInstance.post<Budget>(`/api/v1/tenants/${tenantId}/budgets`, payload);
};

/**
 * Update an existing budget's caps, thresholds, or period
 */
export const updateBudget = (
  tenantId: string,
  budgetId: string,
  payload: UpdateBudgetPayload
) => {
  return axiosInstance.put<Budget>(
    `/api/v1/tenants/${tenantId}/budgets/${budgetId}`,
    payload
  );
};

/**
 * Delete a budget configuration
 */
export const deleteBudget = (tenantId: string, budgetId: string) => {
  return axiosInstance.delete(`/api/v1/tenants/${tenantId}/budgets/${budgetId}`);
};

/**
 * Get cost projection extrapolated from current usage trend.
 * Returns actual usage to date + projected spend to targetDate.
 */
export const getBudgetProjection = (tenantId: string, targetDate: string) => {
  return axiosInstance.get<BudgetProjection>(
    `/api/v1/tenants/${tenantId}/budgets/projection`,
    { params: { targetDate } }
  );
};
