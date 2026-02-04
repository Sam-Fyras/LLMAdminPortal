import { TenantRule, RuleTestResult, RuleValidation, RuleVersion } from '../../types/rule';
import { Rule } from '../../types';

// Mock tenant rules (new format) - simplified to match type definitions exactly
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
      type: 'token_limit',
      limit_type: 'daily',
      max_tokens: 50000,
      scope: 'user',
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
      type: 'model_restriction',
      restriction_type: 'allowlist',
      models: ['gpt-4', 'claude-3-opus'],
    },
    parameters: {
      block_message: 'You do not have access to premium models. Contact admin for upgrade.',
      allowed_roles: ['admin', 'power-user'],
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
      type: 'rate_limit',
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
      type: 'hard_block',
      keywords: ['password', 'api_key', 'secret', 'private_key'],
      case_sensitive: false,
      whole_word_only: false,
      custom_message: 'Request blocked: Sensitive content detected.',
    },
    parameters: {},
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
    name: 'Email Redaction',
    type: 'redaction',
    priority: 5,
    enabled: false,
    conditions: {
      type: 'redaction',
      pattern_type: 'email',
      replacement: '[REDACTED]',
      apply_to: 'both',
    },
    parameters: {
      apply_to_input: true,
      apply_to_output: true,
    },
    description: 'Automatically redact email addresses from requests and responses',
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
      type: 'cost_control',
      monthly_cost_cap: 5000,
    },
    parameters: {
      alert_threshold_percent: 80,
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
  triggered_rules: [
    {
      rule_id: 'rule-1',
      rule_name: 'Daily Token Limit',
      action: 'block',
    },
    {
      rule_id: 'rule-4',
      rule_name: 'Block Sensitive Content',
      action: 'block',
    },
  ],
  modified_prompt: undefined,
  modified_response: undefined,
  is_blocked: true,
  block_reason: 'Daily token limit exceeded (50000/50000 tokens used)',
  warnings: [],
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
};

// Mock rule versions (for version history)
export const mockRuleVersions: RuleVersion[] = [
  {
    version: 2,
    rule_id: 'rule-1',
    snapshot: {
      ...mockTenantRules[0],
      version: 2,
      updatedDate: '2026-01-15T00:00:00Z',
    },
    changed_by: 'admin@acme.com',
    changed_at: '2026-01-15T00:00:00Z',
    change_description: 'Increased daily token limit from 30000 to 50000',
  },
  {
    version: 1,
    rule_id: 'rule-1',
    snapshot: {
      ...mockTenantRules[0],
      version: 1,
      conditions: {
        type: 'token_limit',
        limit_type: 'daily',
        max_tokens: 30000,
        scope: 'user',
      },
      updatedDate: '2025-01-05T00:00:00Z',
    },
    changed_by: 'admin@acme.com',
    changed_at: '2025-01-05T00:00:00Z',
    change_description: 'Initial rule creation',
  },
];
