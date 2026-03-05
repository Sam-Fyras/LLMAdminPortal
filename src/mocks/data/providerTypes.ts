// ══════════════════════════════════════════════════════════════════════════════
// Provider Types - Based on Functional Specification Section 5.3
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Provider type enumeration
 * Supported LLM provider types
 */
export enum ProviderType {
    OPENAI = 'openai',
    ANTHROPIC = 'anthropic',
    AZURE_OPENAI = 'azure_openai',
    GOOGLE_VERTEX = 'google_vertex',
    AWS_BEDROCK = 'aws_bedrock',
    CUSTOM = 'custom',
}

/**
 * Health status enumeration
 */
export type HealthStatus = 'healthy' | 'degraded' | 'down';

/**
 * API Key status enumeration
 */
export type ApiKeyStatus = 'valid' | 'invalid' | 'expired' | 'not_set';

/**
 * Provider health status data
 * As per Section 4.4.4 Provider Health Monitoring
 */
export interface ProviderHealthStatus {
    /** Current health status */
    status: HealthStatus;
    
    /** Timestamp of last health check */
    lastChecked: Date;
    
    /** Uptime percentages for different time windows */
    uptime: {
        /** Uptime percentage for last 24 hours */
        last24h: number;
        /** Uptime percentage for last 7 days */
        last7d: number;
        /** Uptime percentage for last 30 days */
        last30d: number;
    };
    
    /** Average response time in milliseconds */
    avgResponseTime: number;
    
    /** Error rate as a percentage */
    errorRate: number;
    
    /** Details of the last error (if any) */
    lastError?: {
        message: string;
        code?: string;
        timestamp: Date;
    };
}

/**
 * Rate limit configuration
 */
export interface RateLimits {
    /** Requests per minute */
    rpm?: number;
    /** Tokens per minute */
    tpm?: number;
}

/**
 * Complete LLM Provider interface
 * As per Section 5.3 LLM Provider Data Model
 */
export interface LLMProvider {
    /** Unique identifier */
    _id: string;
    
    /** Tenant ID this provider belongs to */
    tenant_id: string;
    
    /** Provider type */
    type: ProviderType;
    
    /** Provider type string (legacy field, same as type) */
    provider: string;
    
    /** Custom display name (e.g., "OpenAI Production") */
    name: string;
    
    /** Selected model */
    model: string;
    
    /** API endpoint URL */
    api_url: string;
    
    /** Reference to encrypted API key */
    api_key_id: string;
    
    /** API key status */
    api_key_status: ApiKeyStatus;
    
    /** Organization ID (for OpenAI) */
    organization_id?: string;
    
    /** Region (for Azure/AWS) */
    region?: string;
    
    /** List of enabled model IDs */
    enabled_models: string[];
    
    /** Whether this is the default provider */
    is_default: boolean;
    
    /** Whether this provider is active */
    is_active: boolean;
    
    /** Fallback priority (lower = higher priority) */
    fallback_priority: number;
    
    /** Priority for selection (legacy field) */
    priority: number;
    
    /** Optional rate limit overrides */
    rate_limits?: RateLimits;
    
    /** Inference parameters */
    max_tokens: number | null;
    temperature: number | null;
    top_p: number | null;
    
    /** Health status data */
    health_status: ProviderHealthStatus;
    
    /** Creation timestamp */
    created_date: string;
    
    /** Last update timestamp */
    updated_date: string;
}

/**
 * Provider creation payload
 * Fields required when creating a new provider
 */
export interface LLMProviderCreate {
    type: ProviderType;
    provider: string;
    name: string;
    model: string;
    api_url: string;
    api_key: string;  // Actual key (will be encrypted server-side)
    organization_id?: string;
    region?: string;
    enabled_models: string[];
    is_default?: boolean;
    is_active?: boolean;
    fallback_priority?: number;
    priority?: number;
    rate_limits?: RateLimits;
    max_tokens?: number | null;
    temperature?: number | null;
    top_p?: number | null;
}

/**
 * Provider update payload
 * Fields that can be updated on an existing provider
 */
export interface LLMProviderUpdate {
    type?: ProviderType;
    provider?: string;
    name?: string;
    model?: string;
    api_url?: string;
    api_key?: string;  // Only if rotating the key
    organization_id?: string;
    region?: string;
    enabled_models?: string[];
    is_default?: boolean;
    is_active?: boolean;
    fallback_priority?: number;
    priority?: number;
    rate_limits?: RateLimits;
    max_tokens?: number | null;
    temperature?: number | null;
    top_p?: number | null;
}

/**
 * Provider list item (for table views)
 * Simplified version with key display fields
 */
export interface LLMProviderListItem {
    _id: string;
    provider: string;
    name: string;
    model: string;
    is_active: boolean;
    is_default: boolean;
    api_key_status: ApiKeyStatus;
    health_status: ProviderHealthStatus;
    fallback_priority: number;
}

/**
 * Test connection result
 */
export interface TestConnectionResult {
    success: boolean;
    message: string;
    latency_ms?: number;
    error_code?: string;
}

/**
 * Provider models mapping
 * Available models per provider type
 */
export const PROVIDER_MODELS: Record<ProviderType, string[]> = {
    [ProviderType.OPENAI]: [
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-4-turbo',
        'gpt-4',
        'gpt-3.5-turbo',
        'o1-preview',
        'o1-mini',
    ],
    [ProviderType.ANTHROPIC]: [
        'claude-opus-4-20250514',
        'claude-sonnet-4-20250514',
        'claude-3-5-haiku-20241022',
    ],
    [ProviderType.AZURE_OPENAI]: [
        'gpt-4o',
        'gpt-4-turbo',
        'gpt-4',
        'gpt-35-turbo',
    ],
    [ProviderType.GOOGLE_VERTEX]: [
        'gemini-2.0-flash',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-1.0-pro',
    ],
    [ProviderType.AWS_BEDROCK]: [
        'anthropic.claude-3-opus',
        'anthropic.claude-3-sonnet',
        'amazon.titan-text-express',
        'meta.llama3-70b-instruct',
    ],
    [ProviderType.CUSTOM]: [],
};

/**
 * Default API URLs per provider type
 */
export const PROVIDER_DEFAULT_URLS: Record<ProviderType, string> = {
    [ProviderType.OPENAI]: 'https://api.openai.com/v1/chat/completions',
    [ProviderType.ANTHROPIC]: 'https://api.anthropic.com/v1/messages',
    [ProviderType.AZURE_OPENAI]: 'https://<resource>.openai.azure.com/openai/deployments/<deployment>',
    [ProviderType.GOOGLE_VERTEX]: 'https://generativelanguage.googleapis.com/v1beta',
    [ProviderType.AWS_BEDROCK]: 'https://bedrock-runtime.<region>.amazonaws.com',
    [ProviderType.CUSTOM]: '',
};

/**
 * Provider display names
 */
export const PROVIDER_DISPLAY_NAMES: Record<ProviderType, string> = {
    [ProviderType.OPENAI]: 'OpenAI',
    [ProviderType.ANTHROPIC]: 'Anthropic',
    [ProviderType.AZURE_OPENAI]: 'Azure OpenAI',
    [ProviderType.GOOGLE_VERTEX]: 'Google Vertex AI',
    [ProviderType.AWS_BEDROCK]: 'AWS Bedrock',
    [ProviderType.CUSTOM]: 'Custom',
};

// ══════════════════════════════════════════════════════════════════════════════
// Mock Data Generator (for testing)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Generate mock health status data
 */
export const generateMockHealthStatus = (
    status: HealthStatus = 'healthy'
): ProviderHealthStatus => {
    const baseUptime = status === 'healthy' ? 99.5 : status === 'degraded' ? 96 : 85;
    const baseLatency = status === 'healthy' ? 350 : status === 'degraded' ? 800 : 2000;
    const baseErrorRate = status === 'healthy' ? 0.5 : status === 'degraded' ? 3 : 15;

    return {
        status,
        lastChecked: new Date(),
        uptime: {
            last24h: baseUptime + Math.random() * 0.5,
            last7d: baseUptime - 0.2 + Math.random() * 0.4,
            last30d: baseUptime - 0.5 + Math.random() * 0.5,
        },
        avgResponseTime: baseLatency + Math.random() * 100,
        errorRate: baseErrorRate + Math.random() * 0.5,
        ...(status !== 'healthy' && {
            lastError: {
                message: status === 'down' 
                    ? 'Connection timeout - provider unreachable'
                    : 'Elevated latency detected',
                code: status === 'down' ? 'ETIMEDOUT' : 'SLOW_RESPONSE',
                timestamp: new Date(Date.now() - Math.random() * 3600000),
            },
        }),
    };
};

/**
 * Generate mock provider data
 */
export const generateMockProvider = (
    overrides: Partial<LLMProvider> = {}
): LLMProvider => {
    const type = overrides.type || ProviderType.OPENAI;
    const models = PROVIDER_MODELS[type];
    
    return {
        _id: `provider_${Math.random().toString(36).substr(2, 9)}`,
        tenant_id: 'tenant_123',
        type,
        provider: type,
        name: `${PROVIDER_DISPLAY_NAMES[type]} Production`,
        model: models[0] || 'custom-model',
        api_url: PROVIDER_DEFAULT_URLS[type],
        api_key_id: `key_${Math.random().toString(36).substr(2, 9)}`,
        api_key_status: 'valid',
        enabled_models: models,
        is_default: false,
        is_active: true,
        fallback_priority: 1,
        priority: 1,
        max_tokens: null,
        temperature: null,
        top_p: null,
        health_status: generateMockHealthStatus('healthy'),
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
        ...overrides,
    };
};
