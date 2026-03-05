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
    created_at: '2025-01-05T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z',
    name: 'Daily Token Limit',
    type: 'token_limit',
    priority: 0,
    enabled: true,
    conditions: {
      type: 'token_limit',
      limit_type: 'daily',
      max_tokens: 50000,
      scope: 'user',
    },
    parameters: {
      action: 'block',
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
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2026-01-20T00:00:00Z',
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
      action: 'block',
      block_message: 'You do not have access to premium models. Contact admin for upgrade.',
      allowed_roles: ['admin', 'power-user'],
    },
    description: 'Restrict premium models to authorized roles',
    tags: ['production', 'model-access'],
    version: 1,
    effective_start: '2025-01-10T00:00:00Z',
    effective_end: '2026-12-31T23:59:59Z',
    created_by: 'admin@acme.com',
  },
  {
    id: 'rule-3',
    tenantId: 'tenant-123',
    schemaVersion: '1.0',
    createdDate: '2025-02-01T00:00:00Z',
    updatedDate: '2026-02-01T00:00:00Z',
    created_at: '2025-02-01T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
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
      action: 'throttle',
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
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z',
    name: 'Content Safety Check',
    type: 'content_moderation',
    priority: 4,
    enabled: true,
    conditions: {
      type: 'content_moderation',
      check_toxicity: true,
      toxicity_threshold: 0.7,
      check_pii: true,
      pii_types: ['email', 'phone', 'ssn', 'credit_card'],
    },
    parameters: {
      block_toxic: true,
      redact_pii: true,
      block_message: 'Content violates safety policies.',
    },
    description: 'Detect and block toxic content; redact PII from requests',
    tags: ['security', 'content-safety', 'pii'],
    version: 1,
    created_by: 'admin@acme.com',
  },
  {
    id: 'rule-5',
    tenantId: 'tenant-123',
    schemaVersion: '1.0',
    createdDate: '2026-01-20T00:00:00Z',
    updatedDate: '2026-01-20T00:00:00Z',
    created_at: '2026-01-20T00:00:00Z',
    updated_at: '2026-01-20T00:00:00Z',
    name: 'PII Redaction (Strict)',
    type: 'content_moderation',
    priority: 5,
    enabled: false,
    conditions: {
      type: 'content_moderation',
      check_toxicity: false,
      check_pii: true,
      pii_types: ['email', 'phone', 'ssn', 'credit_card', 'ip_address', 'name', 'address'],
    },
    parameters: {
      block_toxic: false,
      redact_pii: true,
      block_message: '',
    },
    description: 'Redact all PII types from requests and responses (strict mode)',
    tags: ['privacy', 'pii', 'gdpr'],
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
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
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
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
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
    createdAt: '2025-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'rule-4',
    name: 'Content Safety Check',
    type: 'content_moderation',
    priority: 4,
    enabled: true,
    conditions: {
      check_toxicity: true,
      toxicity_threshold: 0.7,
      check_pii: true,
      pii_types: ['email', 'phone', 'ssn', 'credit_card'],
    },
    action: 'block',
    parameters: {
      block_toxic: true,
      redact_pii: true,
      block_message: 'Content violates safety policies.',
    },
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-02-10T00:00:00Z',
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
      rule_name: 'Content Safety Check',
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
      updated_at: '2026-01-15T00:00:00Z',
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
      updated_at: '2025-01-05T00:00:00Z',
    },
    changed_by: 'admin@acme.com',
    changed_at: '2025-01-05T00:00:00Z',
    change_description: 'Initial rule creation',
  },
];
