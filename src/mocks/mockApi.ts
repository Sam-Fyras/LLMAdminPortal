import MockAdapter from 'axios-mock-adapter';
import { AxiosInstance } from 'axios';

// Import mock data
import {
  mockTenant,
  mockUsers,
  mockLLMConfigs,
  mockTenantContext,
} from './data/tenants';
import {
  mockTenantLimit,
  mockRoleLimits,
  mockUserLimits,
  mockQuotaCheck,
  mockUsageLogs,
  mockUsageAnalytics,
} from './data/usage';
import { mockRoles, mockUsersByRole } from './data/roles';
import {
  mockTenantRules,
  mockLegacyRules,
  mockRuleTestResult,
  mockRuleValidation,
  mockRuleVersions,
} from './data/rules';

/**
 * Setup mock API responses for development
 * This allows frontend development without a running backend
 */
export function setupMockApi(axiosInstance: AxiosInstance, delay: number = 500) {
  const mock = new MockAdapter(axiosInstance, { delayResponse: delay });

  console.log('🔧 Mock API Mode: All API requests will return mock data');
  console.log(`🔧 Mock API Delay: ${delay}ms simulated network latency`);

  // ============================================================================
  // Tenant Management (TenantConfigService)
  // ============================================================================

  // Get tenant
  mock.onGet(/\/api\/v1\/tenants\/[\w-]+$/).reply(200, mockTenant);

  // Update tenant
  mock.onPut(/\/api\/v1\/tenants\/[\w-]+$/).reply((config) => {
    const updatedTenant = { ...mockTenant, ...JSON.parse(config.data) };
    return [200, updatedTenant];
  });

  // Get tenant context
  mock.onGet(/\/api\/v1\/tenants\/[\w-]+\/context/).reply(200, mockTenantContext);

  // Get tenant tier
  mock.onGet(/\/api\/v1\/tenants\/[\w-]+\/tier/).reply(200, {
    tier_id: 'enterprise',
    tier_name: 'Enterprise',
    features: ['advanced_analytics', 'custom_rules', 'priority_support'],
  });

  // ============================================================================
  // User Management (TenantConfigService)
  // ============================================================================

  // Get all users
  mock.onGet(/\/api\/v1\/tenants\/[\w-]+\/users$/).reply(200, mockUsers);

  // Get specific user
  mock.onGet(/\/api\/v1\/tenants\/[\w-]+\/users\/[\w-]+/).reply((config) => {
    const userId = config.url?.split('/').pop();
    const user = mockUsers.find(u => u.id === userId);
    return user ? [200, user] : [404, { error: 'User not found' }];
  });

  // Create user
  mock.onPost(/\/api\/v1\/tenants\/[\w-]+\/users$/).reply((config) => {
    const newUser = {
      id: `user-${Date.now()}`,
      tenantId: 'tenant-123',
      userId: `user-${Date.now()}`,
      schemaVersion: '1.0',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      ...JSON.parse(config.data),
    };
    mockUsers.push(newUser);
    return [201, newUser];
  });

  // Update user
  mock.onPut(/\/api\/v1\/tenants\/[\w-]+\/users\/[\w-]+/).reply((config) => {
    const userId = config.url?.split('/').pop();
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...JSON.parse(config.data) };
      return [200, mockUsers[userIndex]];
    }
    return [404, { error: 'User not found' }];
  });

  // Delete user
  mock.onDelete(/\/api\/v1\/tenants\/[\w-]+\/users\/[\w-]+/).reply(204);

  // ============================================================================
  // LLM Provider Configuration (TenantConfigService)
  // ============================================================================

  // Get all LLM configs
  mock.onGet(/\/api\/v1\/tenants\/[\w-]+\/llm-configs$/).reply(200, mockLLMConfigs);

  // Get specific LLM config
  mock.onGet(/\/api\/v1\/tenants\/[\w-]+\/llm-configs\/[\w-]+/).reply((config) => {
    const configId = config.url?.split('/').pop();
    const llmConfig = mockLLMConfigs.find(c => c.id === configId);
    return llmConfig ? [200, llmConfig] : [404, { error: 'Config not found' }];
  });

  // Create LLM config
  mock.onPost(/\/api\/v1\/tenants\/[\w-]+\/llm-configs$/).reply((config) => {
    const newConfig = {
      id: `llm-config-${Date.now()}`,
      tenantId: 'tenant-123',
      schemaVersion: '1.0',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      ...JSON.parse(config.data),
    };
    mockLLMConfigs.push(newConfig);
    return [201, newConfig];
  });

  // Update LLM config
  mock.onPut(/\/api\/v1\/tenants\/[\w-]+\/llm-configs\/[\w-]+/).reply((config) => {
    const configId = config.url?.split('/').pop();
    const configIndex = mockLLMConfigs.findIndex(c => c.id === configId);
    if (configIndex !== -1) {
      mockLLMConfigs[configIndex] = { ...mockLLMConfigs[configIndex], ...JSON.parse(config.data) };
      return [200, mockLLMConfigs[configIndex]];
    }
    return [404, { error: 'Config not found' }];
  });

  // Delete LLM config
  mock.onDelete(/\/api\/v1\/tenants\/[\w-]+\/llm-configs\/[\w-]+/).reply(204);

  // Test LLM connection
  mock.onPost(/\/api\/v1\/tenants\/[\w-]+\/llm-configs\/test/).reply(200, {
    success: true,
    message: 'Connection successful',
    latency_ms: 234,
    model_available: true,
  });

  // Get available models
  mock.onGet(/\/api\/v1\/tenants\/[\w-]+\/llm-configs\/[\w-]+\/models/).reply(200, [
    'gpt-4',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
  ]);

  // ============================================================================
  // Usage Tracking (UsageTrackingService)
  // ============================================================================

  // Record usage
  mock.onPost(/\/api\/v1\/usage\/[\w-]+\/record\/[\w-]+/).reply(200, { success: true });

  // Batch record usage
  mock.onPost(/\/api\/v1\/usage\/batch/).reply(200, {
    success: true,
    recorded: 10,
    failed: 0,
  });

  // Get current tenant usage
  mock.onGet(/\/api\/v1\/usage\/current\/[\w-]+$/).reply(200, {
    current_usage: mockTenantLimit,
    quota_status: 'healthy',
  });

  // Get user usage with quota check
  mock.onGet(/\/api\/v1\/usage\/current\/[\w-]+\/users\/[\w-]+/).reply(200, mockQuotaCheck);

  // Get remaining quota
  mock.onGet(/\/api\/v1\/usage\/remaining\/[\w-]+/).reply(200, {
    monthly_remaining: 5500000,
    daily_remaining: 375000,
    hourly_remaining: 41500,
  });

  // ============================================================================
  // Token Limits - Tenant Level (UsageTrackingService)
  // ============================================================================

  // Get tenant limits
  mock.onGet(/\/api\/v1\/limits\/[\w-]+$/).reply(200, mockTenantLimit);

  // Update tenant limits
  mock.onPut(/\/api\/v1\/limits\/[\w-]+$/).reply((config) => {
    const updated = { ...mockTenantLimit, ...JSON.parse(config.data) };
    return [200, updated];
  });

  // Reset tenant usage
  mock.onPost(/\/api\/v1\/limits\/[\w-]+\/reset/).reply(200, {
    success: true,
    message: 'Usage counters reset',
  });

  // ============================================================================
  // Token Limits - Role Level (UsageTrackingService)
  // ============================================================================

  // Get all role limits
  mock.onGet(/\/api\/v1\/limits\/[\w-]+\/roletokenlimit$/).reply(200, mockRoleLimits);

  // Get role limit by ID
  mock.onGet(/\/api\/v1\/limits\/[\w-]+\/roletokenlimit\/[\w-]+/).reply((config) => {
    const roleId = config.url?.split('/').pop();
    const roleLimit = mockRoleLimits.find(r => r.role_id === roleId);
    return roleLimit ? [200, roleLimit] : [404, { error: 'Role limit not found' }];
  });

  // Create role limit
  mock.onPost(/\/api\/v1\/limits\/[\w-]+\/roletokenlimit$/).reply((config) => {
    const newLimit = {
      id: `role-limit-${Date.now()}`,
      tenantId: 'tenant-123',
      schemaVersion: '1.0',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      ...JSON.parse(config.data),
    };
    mockRoleLimits.push(newLimit);
    return [201, newLimit];
  });

  // Update role limit
  mock.onPut(/\/api\/v1\/limits\/[\w-]+\/roletokenlimit\/[\w-]+/).reply((config) => {
    const roleId = config.url?.split('/').pop();
    const limitIndex = mockRoleLimits.findIndex(r => r.role_id === roleId);
    if (limitIndex !== -1) {
      mockRoleLimits[limitIndex] = { ...mockRoleLimits[limitIndex], ...JSON.parse(config.data) };
      return [200, mockRoleLimits[limitIndex]];
    }
    return [404, { error: 'Role limit not found' }];
  });

  // Delete role limit
  mock.onDelete(/\/api\/v1\/limits\/[\w-]+\/roletokenlimit\/[\w-]+/).reply(204);

  // ============================================================================
  // Token Limits - User Level (UsageTrackingService)
  // ============================================================================

  // Get all user limits
  mock.onGet(/\/api\/v1\/limits\/[\w-]+\/usertokenlimit$/).reply(200, mockUserLimits);

  // Get user limit by ID
  mock.onGet(/\/api\/v1\/limits\/[\w-]+\/usertokenlimit\/[\w-]+/).reply((config) => {
    const userId = config.url?.split('/').pop();
    const userLimit = mockUserLimits.find(u => u.userId === userId);
    return userLimit ? [200, userLimit] : [404, { error: 'User limit not found' }];
  });

  // Create user limit
  mock.onPost(/\/api\/v1\/limits\/[\w-]+\/usertokenlimit$/).reply((config) => {
    const newLimit = {
      id: `user-limit-${Date.now()}`,
      tenantId: 'tenant-123',
      userId: `user-${Date.now()}`,
      schemaVersion: '1.0',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      ...JSON.parse(config.data),
    };
    mockUserLimits.push(newLimit);
    return [201, newLimit];
  });

  // Update user limit
  mock.onPut(/\/api\/v1\/limits\/[\w-]+\/usertokenlimit\/[\w-]+/).reply((config) => {
    const userId = config.url?.split('/').pop();
    const limitIndex = mockUserLimits.findIndex(u => u.userId === userId);
    if (limitIndex !== -1) {
      mockUserLimits[limitIndex] = { ...mockUserLimits[limitIndex], ...JSON.parse(config.data) };
      return [200, mockUserLimits[limitIndex]];
    }
    return [404, { error: 'User limit not found' }];
  });

  // Delete user limit
  mock.onDelete(/\/api\/v1\/limits\/[\w-]+\/usertokenlimit\/[\w-]+/).reply(204);

  // ============================================================================
  // Analytics (UsageTrackingService)
  // ============================================================================

  // Get usage analytics
  mock.onGet(/\/api\/v1\/analytics\/[\w-]+\/usage/).reply(200, mockUsageAnalytics);

  // Get usage breakdown
  mock.onGet(/\/api\/v1\/analytics\/[\w-]+\/breakdown/).reply(200, {
    by_user: mockUsageAnalytics.by_user,
    by_model: mockUsageAnalytics.by_model,
  });

  // Get usage trends
  mock.onGet(/\/api\/v1\/analytics\/[\w-]+\/trends/).reply(200, {
    daily: mockUsageAnalytics.by_day,
    trend: 'increasing',
    growth_rate: 5.2,
  });

  // Get top users
  mock.onGet(/\/api\/v1\/analytics\/[\w-]+\/top-users/).reply(200, mockUsageAnalytics.top_users);

  // Get usage by model
  mock.onGet(/\/api\/v1\/analytics\/[\w-]+\/by-model/).reply(200, mockUsageAnalytics.by_model);

  // ============================================================================
  // Role Management
  // ============================================================================

  // Get all roles
  mock.onGet(/\/api\/v1\/role\/[\w-]+$/).reply(200, mockRoles);

  // Get specific role
  mock.onGet(/\/api\/v1\/role\/[\w-]+\/[\w-]+$/).reply((config) => {
    const roleId = config.url?.split('/').pop();
    const role = mockRoles.find(r => r.id === roleId);
    return role ? [200, role] : [404, { error: 'Role not found' }];
  });

  // Create role
  mock.onPost(/\/api\/v1\/role\/[\w-]+$/).reply((config) => {
    const newRole = {
      id: `role-${Date.now()}`,
      ...JSON.parse(config.data),
    };
    mockRoles.push(newRole);
    return [201, newRole];
  });

  // Update role
  mock.onPut(/\/api\/v1\/role\/[\w-]+\/[\w-]+/).reply((config) => {
    const roleId = config.url?.split('/').pop();
    const roleIndex = mockRoles.findIndex(r => r.id === roleId);
    if (roleIndex !== -1) {
      mockRoles[roleIndex] = { ...mockRoles[roleIndex], ...JSON.parse(config.data) };
      return [200, mockRoles[roleIndex]];
    }
    return [404, { error: 'Role not found' }];
  });

  // Delete role
  mock.onDelete(/\/api\/v1\/role\/[\w-]+\/[\w-]+/).reply(204);

  // Get users by role
  mock.onGet(/\/api\/v1\/role\/[\w-]+\/[\w-]+\/users/).reply((config) => {
    const roleId = config.url?.split('/')[5];
    return [200, mockUsersByRole[roleId as keyof typeof mockUsersByRole] || []];
  });

  // ============================================================================
  // Rule Management (RuleManagementService)
  // ============================================================================

  // Get all rules (new API)
  mock.onGet(/\/api\/v1\/tenants\/[\w-]+\/rules$/).reply(200, mockTenantRules);

  // Get all rules (legacy API)
  mock.onGet(/\/api\/v1\/tenant\/rules$/).reply(200, mockLegacyRules);

  // Get specific rule (new API)
  mock.onGet(/\/api\/v1\/tenants\/[\w-]+\/rules\/[\w-]+$/).reply((config) => {
    const ruleId = config.url?.split('/').pop();
    const rule = mockTenantRules.find(r => r.id === ruleId);
    return rule ? [200, rule] : [404, { error: 'Rule not found' }];
  });

  // Get specific rule (legacy API)
  mock.onGet(/\/api\/v1\/tenant\/rules\/[\w-]+$/).reply((config) => {
    const ruleId = config.url?.split('/').pop();
    const rule = mockLegacyRules.find(r => r.id === ruleId);
    return rule ? [200, rule] : [404, { error: 'Rule not found' }];
  });

  // Create rule (new API)
  mock.onPost(/\/api\/v1\/tenants\/[\w-]+\/rules$/).reply((config) => {
    const newRule = {
      id: `rule-${Date.now()}`,
      tenantId: 'tenant-123',
      schemaVersion: '1.0',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      version: 1,
      ...JSON.parse(config.data),
    };
    mockTenantRules.push(newRule);
    return [201, newRule];
  });

  // Create rule (legacy API)
  mock.onPost(/\/api\/v1\/tenant\/rules$/).reply((config) => {
    const newRule = {
      id: `rule-${Date.now()}`,
      ...JSON.parse(config.data),
    };
    mockLegacyRules.push(newRule);
    return [201, newRule];
  });

  // Update rule (new API)
  mock.onPut(/\/api\/v1\/tenants\/[\w-]+\/rules\/[\w-]+/).reply((config) => {
    const ruleId = config.url?.split('/').pop();
    const ruleIndex = mockTenantRules.findIndex(r => r.id === ruleId);
    if (ruleIndex !== -1) {
      mockTenantRules[ruleIndex] = {
        ...mockTenantRules[ruleIndex],
        ...JSON.parse(config.data),
        version: mockTenantRules[ruleIndex].version + 1,
      };
      return [200, mockTenantRules[ruleIndex]];
    }
    return [404, { error: 'Rule not found' }];
  });

  // Update rule (legacy API)
  mock.onPut(/\/api\/v1\/tenant\/rules\/[\w-]+/).reply((config) => {
    const ruleId = config.url?.split('/').pop();
    const ruleIndex = mockLegacyRules.findIndex(r => r.id === ruleId);
    if (ruleIndex !== -1) {
      mockLegacyRules[ruleIndex] = { ...mockLegacyRules[ruleIndex], ...JSON.parse(config.data) };
      return [200, mockLegacyRules[ruleIndex]];
    }
    return [404, { error: 'Rule not found' }];
  });

  // Delete rule (new API)
  mock.onDelete(/\/api\/v1\/tenants\/[\w-]+\/rules\/[\w-]+/).reply(204);

  // Delete rule (legacy API)
  mock.onDelete(/\/api\/v1\/tenant\/rules\/[\w-]+/).reply(204);

  // Toggle rule status (legacy API)
  mock.onPatch(/\/api\/v1\/tenant\/rules\/[\w-]+\/status/).reply((config) => {
    const ruleId = config.url?.split('/')[5];
    const ruleIndex = mockLegacyRules.findIndex(r => r.id === ruleId);
    if (ruleIndex !== -1) {
      mockLegacyRules[ruleIndex].enabled = JSON.parse(config.data).enabled;
      return [200, mockLegacyRules[ruleIndex]];
    }
    return [404, { error: 'Rule not found' }];
  });

  // Toggle rule status (new API)
  mock.onPatch(/\/api\/v1\/tenants\/[\w-]+\/rules\/[\w-]+\/status/).reply((config) => {
    const ruleId = config.url?.split('/').pop()?.replace('/status', '');
    const ruleIndex = mockTenantRules.findIndex(r => r.id === ruleId);
    if (ruleIndex !== -1) {
      mockTenantRules[ruleIndex].enabled = JSON.parse(config.data).enabled;
      return [200, mockTenantRules[ruleIndex]];
    }
    return [404, { error: 'Rule not found' }];
  });

  // Validate rule
  mock.onPost(/\/api\/v1\/tenants\/[\w-]+\/rules\/validate/).reply(200, mockRuleValidation);

  // Test rule
  mock.onPost(/\/api\/v1\/tenants\/[\w-]+\/rules\/test/).reply(200, mockRuleTestResult);

  // Import rules
  mock.onPost(/\/api\/v1\/tenants\/[\w-]+\/rules\/import/).reply(200, {
    imported: 5,
    failed: 0,
    errors: [],
  });

  // Export rules
  mock.onGet(/\/api\/v1\/tenants\/[\w-]+\/rules\/export/).reply(200, mockTenantRules);

  // Get rule history
  mock.onGet(/\/api\/v1\/tenants\/[\w-]+\/rules\/[\w-]+\/history/).reply(200, mockRuleVersions);

  // Rollback rule
  mock.onPost(/\/api\/v1\/tenants\/[\w-]+\/rules\/[\w-]+\/rollback\/\d+/).reply((config) => {
    const version = parseInt(config.url?.split('/').pop() || '1');
    const versionData = mockRuleVersions.find(v => v.version === version);
    return versionData ? [200, versionData.rule_snapshot] : [404, { error: 'Version not found' }];
  });

  // Get rule version
  mock.onGet(/\/api\/v1\/tenants\/[\w-]+\/rules\/[\w-]+\/versions\/\d+/).reply((config) => {
    const version = parseInt(config.url?.split('/').pop() || '1');
    const versionData = mockRuleVersions.find(v => v.version === version);
    return versionData ? [200, versionData.rule_snapshot] : [404, { error: 'Version not found' }];
  });

  // ============================================================================
  // Pass through any unmatched requests (in case we missed something)
  // ============================================================================
  mock.onAny().passThrough();

  return mock;
}

/**
 * Reset mock API to initial state
 * Useful for testing
 */
export function resetMockApi(mock: MockAdapter) {
  mock.reset();
  console.log('🔧 Mock API: Reset to initial state');
}
