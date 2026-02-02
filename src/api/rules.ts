import axiosInstance from './axios';
import { Rule } from '../types';
import {
  TenantRule,
  RuleTestRequest,
  RuleTestResult,
  RuleValidationResult,
  RuleVersion,
} from '../types/rule';

// ============================================================================
// Rule Management (RuleManagementService)
// ============================================================================

/**
 * Get all rules for a tenant
 */
export const getRules = (tenantId: string) => {
  return axiosInstance.get<TenantRule[]>(`/api/v1/tenants/${tenantId}/rules`);
};

/**
 * Get a specific rule
 */
export const getRule = (tenantId: string, ruleId: string) => {
  return axiosInstance.get<TenantRule>(`/api/v1/tenants/${tenantId}/rules/${ruleId}`);
};

/**
 * Create a new rule
 */
export const createRule = (
  tenantId: string,
  rule: Omit<TenantRule, 'id' | 'tenantId' | 'schemaVersion' | 'createdDate' | 'updatedDate' | 'version'>
) => {
  return axiosInstance.post<TenantRule>(`/api/v1/tenants/${tenantId}/rules`, rule);
};

/**
 * Update an existing rule
 */
export const updateRule = (
  tenantId: string,
  ruleId: string,
  rule: Partial<TenantRule>
) => {
  return axiosInstance.put<TenantRule>(`/api/v1/tenants/${tenantId}/rules/${ruleId}`, rule);
};

/**
 * Delete a rule
 */
export const deleteRule = (tenantId: string, ruleId: string) => {
  return axiosInstance.delete(`/api/v1/tenants/${tenantId}/rules/${ruleId}`);
};

/**
 * Toggle rule enabled status
 */
export const toggleRuleStatus = (tenantId: string, ruleId: string, enabled: boolean) => {
  return axiosInstance.patch<TenantRule>(
    `/api/v1/tenants/${tenantId}/rules/${ruleId}/status`,
    { enabled }
  );
};

// ============================================================================
// Rule Operations
// ============================================================================

/**
 * Validate rule configuration before saving
 * Checks for syntax errors, conflicting rules, invalid conditions
 */
export const validateRule = (
  tenantId: string,
  rule: Omit<TenantRule, 'id' | 'tenantId' | 'schemaVersion' | 'createdDate' | 'updatedDate' | 'version'>
) => {
  return axiosInstance.post<RuleValidationResult>(
    `/api/v1/tenants/${tenantId}/rules/validate`,
    rule
  );
};

/**
 * Test rule against sample data (dry-run)
 * Does not persist results, useful for testing before enabling
 */
export const testRule = (tenantId: string, request: RuleTestRequest) => {
  return axiosInstance.post<RuleTestResult>(
    `/api/v1/tenants/${tenantId}/rules/test`,
    request
  );
};

/**
 * Bulk import rules from JSON/CSV
 */
export const importRules = (
  tenantId: string,
  data: {
    rules: Omit<TenantRule, 'id' | 'tenantId' | 'schemaVersion' | 'createdDate' | 'updatedDate' | 'version'>[];
    overwrite_existing?: boolean; // If true, replaces existing rules with same name
    skip_validation?: boolean; // If true, skips validation (use with caution)
  }
) => {
  return axiosInstance.post<{
    imported: number;
    failed: number;
    errors?: Array<{ rule_name: string; error: string }>;
  }>(`/api/v1/tenants/${tenantId}/rules/import`, data);
};

/**
 * Export rules to JSON
 */
export const exportRules = (
  tenantId: string,
  options?: {
    rule_ids?: string[]; // Export specific rules, if not provided exports all
    include_disabled?: boolean; // Include disabled rules in export
    format?: 'json' | 'csv'; // Export format
  }
) => {
  const params = new URLSearchParams();
  if (options?.rule_ids) {
    options.rule_ids.forEach(id => params.append('rule_ids', id));
  }
  if (options?.include_disabled !== undefined) {
    params.append('include_disabled', String(options.include_disabled));
  }
  if (options?.format) {
    params.append('format', options.format);
  }

  return axiosInstance.get<TenantRule[] | string>(
    `/api/v1/tenants/${tenantId}/rules/export?${params.toString()}`,
    {
      responseType: options?.format === 'csv' ? 'blob' : 'json',
    }
  );
};

// ============================================================================
// Rule Versioning
// ============================================================================

/**
 * Get version history for a rule
 * Returns all previous versions with metadata
 */
export const getRuleHistory = (tenantId: string, ruleId: string) => {
  return axiosInstance.get<RuleVersion[]>(
    `/api/v1/tenants/${tenantId}/rules/${ruleId}/history`
  );
};

/**
 * Rollback rule to a previous version
 * Creates a new version with content from specified version
 */
export const rollbackRule = (
  tenantId: string,
  ruleId: string,
  version: number,
  reason?: string
) => {
  return axiosInstance.post<TenantRule>(
    `/api/v1/tenants/${tenantId}/rules/${ruleId}/rollback/${version}`,
    { reason }
  );
};

/**
 * Get a specific version of a rule (read-only)
 */
export const getRuleVersion = (
  tenantId: string,
  ruleId: string,
  version: number
) => {
  return axiosInstance.get<TenantRule>(
    `/api/v1/tenants/${tenantId}/rules/${ruleId}/versions/${version}`
  );
};

// ============================================================================
// Legacy Support (for backward compatibility with existing components)
// ============================================================================

/**
 * @deprecated Use getRules(tenantId) instead
 */
export const fetchRules = () => {
  // Assumes tenant ID is in context or will be added by interceptor
  return axiosInstance.get<Rule[]>('/api/v1/tenant/rules');
};

/**
 * @deprecated Use getRule(tenantId, ruleId) instead
 */
export const fetchRule = (id: string) => {
  return axiosInstance.get<Rule>(`/api/v1/tenant/rules/${id}`);
};
