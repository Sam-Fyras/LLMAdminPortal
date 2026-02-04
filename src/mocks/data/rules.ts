import { TenantRule, RuleTestResult, RuleValidation, RuleVersion } from '../../types/rule';
import { Rule } from '../../types';

// Mock tenant rules (new format)
export const mockTenantRules: TenantRule[] = [
  {
    id: 'rule-1',
    tenantId: 'tenant-123',
    schemaVersion: '1.0',
    createdDate: '2025-01-05T00:00:00Z',
    updatedDate: '2026-01-15T00:00:00Z',
    name: 'Daily Token Limit',
    type: 'token_limit',
    priority: 1,
    enabled: true,
    conditions: {
      limit_type: 'daily',
      max_tokens: 50000,
    },
    parameters: {
      block_message: 'Daily token limit exceeded. Please try again tomorrow.',
    },
    description: 'Enforce daily token limits for all users',
    tags: ['production', 'token-management'],
    version: 2,
    effective_start: '2025-01-05T00:00:00Z',
    created_by: 'admin@acme.com',
  },
  {
    id: 'rule-2',
    tenantId: 'tenant-123',
    schemaVersion: '1.0',
    createdDate: '2025-01-10T00:00:00Z',
    updatedDate: '2026-01-20T00:00:00Z',
    name: 'Premium Model Restriction',
    type: 'model_restriction',
    priority: 2,
    enabled: true,
    conditions: {
      restriction_type: 'allowlist',
      models: ['gpt-4', 'claude-3-opus'],
      apply_to_roles: ['admin', 'power-user'],
    },
    parameters: {
      block_message: 'You do not have access to premium models. Contact admin for upgrade.',
    },
    description: 'Restrict premium models to authorized roles',
    tags: ['production', 'model-access'],
    version: 1,
    created_by: 'admin@acme.com',
  },
  {
    id: 'rule-3',
    tenantId: 'tenant-123',
    schemaVersion: '1.0',
    createdDate: '2025-02-01T00:00:00Z',
    updatedDate: '2026-02-01T00:00:00Z',
    name: 'Rate Limit - Heavy Users',
    type: 'rate_limit',
    priority: 3,
    enabled: true,
    conditions: {
      requests_per_minute: 10,
      requests_per_hour: 100,
      scope: 'user',
    },
    parameters: {
      block_message: 'Rate limit exceeded. Please slow down your requests.',
    },
    description: 'Prevent API abuse with rate limiting',
    tags: ['production', 'rate-limiting'],
    version: 1,
    created_by: 'admin@acme.com',
  },
  {
    id: 'rule-4',
    tenantId: 'tenant-123',
    schemaVersion: '1.0',
    createdDate: '2026-01-15T00:00:00Z',
    updatedDate: '2026-01-15T00:00:00Z',
    name: 'Block Sensitive Content',
    type: 'hard_block',
    priority: 4,
    enabled: true,
    conditions: {
      keywords: ['password', 'api_key', 'secret', 'private_key'],
      case_sensitive: false,
      match_type: 'contains',
    },
    parameters: {
      block_message: 'Request blocked: Sensitive content detected.',
    },
    description: 'Block requests containing sensitive keywords',
    tags: ['security', 'content-filtering'],
    version: 1,
    created_by: 'admin@acme.com',
  },
  {
    id: 'rule-5',
    tenantId: 'tenant-123',
    schemaVersion: '1.0',
    createdDate: '2026-01-20T00:00:00Z',
    updatedDate: '2026-01-20T00:00:00Z',
    name: 'PII Redaction',
    type: 'redaction',
    priority: 5,
    enabled: false,
    conditions: {
      patterns: [
        { type: 'email', regex: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
        { type: 'phone', regex: '\\(\\d{3}\\)\\s*\\d{3}-\\d{4}' },
        { type: 'ssn', regex: '\\d{3}-\\d{2}-\\d{4}' },
      ],
      replacement_text: '[REDACTED]',
    },
    parameters: {
      apply_to_input: true,
      apply_to_output: true,
    },
    description: 'Automatically redact PII from requests and responses',
    tags: ['security', 'privacy', 'pii'],
    version: 1,
    created_by: 'admin@acme.com',
  },
  {
    id: 'rule-6',
    tenantId: 'tenant-123',
    schemaVersion: '1.0',
    createdDate: '2026-01-25T00:00:00Z',
    updatedDate: '2026-01-25T00:00:00Z',
    name: 'Monthly Cost Budget',
    type: 'cost_control',
    priority: 6,
    enabled: true,
    conditions: {
      budget_period: 'monthly',
      max_cost_usd: 5000,
      alert_threshold_percent: 80,
    },
    parameters: {
      block_when_exceeded: true,
      notification_emails: ['admin@acme.com', 'finance@acme.com'],
    },
    description: 'Enforce monthly cost budget and send alerts',
    tags: ['production', 'cost-management'],
    version: 1,
    created_by: 'admin@acme.com',
  },
];

// Mock legacy rules (for existing RulesManagementPage)
export const mockLegacyRules: Rule[] = [
  {
    id: 'rule-1',
    name: 'Daily Token Limit',
    type: 'token_limit',
    priority: 1,
    enabled: true,
    conditions: {
      limit_type: 'daily',
      max_tokens: 50000,
    },
    action: 'block',
    parameters: {
      block_message: 'Daily token limit exceeded.',
    },
  },
  {
    id: 'rule-2',
    name: 'Premium Model Restriction',
    type: 'model_restriction',
    priority: 2,
    enabled: true,
    conditions: {
      restriction_type: 'allowlist',
      models: ['gpt-4', 'claude-3-opus'],
    },
    action: 'block',
    parameters: {
      block_message: 'Premium model access denied.',
    },
  },
  {
    id: 'rule-3',
    name: 'Rate Limit',
    type: 'rate_limit',
    priority: 3,
    enabled: true,
    conditions: {
      requests_per_minute: 10,
      requests_per_hour: 100,
      scope: 'user',
    },
    action: 'throttle',
    parameters: {
      block_message: 'Rate limit exceeded.',
    },
  },
];

// Mock rule test result
export const mockRuleTestResult: RuleTestResult = {
  triggered_rules: ['rule-1', 'rule-4'],
  actions_taken: ['blocked'],
  modified_prompt: null,
  explanation: 'Request blocked by rule "Daily Token Limit" - daily quota exceeded (50000/50000 tokens used)',
  test_timestamp: '2026-02-03T10:00:00Z',
  sample_data: {
    prompt: 'Test prompt for rule validation',
    user_id: 'user-1',
    tokens_requested: 1000,
  },
};

// Mock rule validation
export const mockRuleValidation: RuleValidation = {
  is_valid: true,
  errors: [],
  warnings: [
    {
      field: 'conditions.max_tokens',
      message: 'Token limit is very high (>1M). Consider if this is intentional.',
    },
  ],
  conflicts: [],
  validation_timestamp: '2026-02-03T10:00:00Z',
};

// Mock rule versions (for version history)
export const mockRuleVersions: RuleVersion[] = [
  {
    version: 2,
    rule_snapshot: {
      ...mockTenantRules[0],
      version: 2,
      updatedDate: '2026-01-15T00:00:00Z',
    },
    changed_by: 'admin@acme.com',
    change_summary: 'Increased daily token limit from 30000 to 50000',
    change_timestamp: '2026-01-15T00:00:00Z',
  },
  {
    version: 1,
    rule_snapshot: {
      ...mockTenantRules[0],
      version: 1,
      conditions: {
        limit_type: 'daily',
        max_tokens: 30000,
      },
      updatedDate: '2025-01-05T00:00:00Z',
    },
    changed_by: 'admin@acme.com',
    change_summary: 'Initial rule creation',
    change_timestamp: '2025-01-05T00:00:00Z',
  },
];

// Rule templates (for quick rule creation)
export const mockRuleTemplates = [
  {
    id: 'template-token-limit',
    name: 'Token Limit Template',
    type: 'token_limit' as const,
    description: 'Standard token limit rule',
    conditions: {
      limit_type: 'daily',
      max_tokens: 10000,
    },
  },
  {
    id: 'template-model-restrict',
    name: 'Model Restriction Template',
    type: 'model_restriction' as const,
    description: 'Restrict access to specific models',
    conditions: {
      restriction_type: 'allowlist',
      models: ['gpt-3.5-turbo'],
    },
  },
];
