export type ProviderType =
  | "openai"
  | "anthropic"
  | "azure_openai"
  | "google_vertex"
  | "aws_bedrock"
  | "custom";

export interface LLMConfigCreate {
  provider: ProviderType;
  models: string[];
  api_url: string;
  api_key_id: string;
  max_tokens?: number | null;
  temperature?: number | null;
  top_p?: number | null;
  is_active?: boolean;
  is_default?: boolean;
  fallback_priority?: number;
}

export interface LLMProvider {
  _id: { $oid: string };
  id: { $oid: string };
  schema_version: number;
  created_date: { $date: string };
  updated_date: { $date: string };
  deleted_at: null;
  is_deleted: boolean;
  metadata: Record<string, unknown>;
  tenant_id: string;
  provider: ProviderType;
  models: string[];
  api_url: string;
  api_key_id: string;
  max_tokens: number | null;
  temperature: number | null;
  top_p: number | null;
  is_active: boolean;
  is_default: boolean;
  fallback_priority: number;
}

export let Providersdata: LLMProvider[] = [
  {
    _id: { $oid: "691ad5defe0955fff6cac652" },
    id: { $oid: "691ad5defe0955fff6cac651" },
    schema_version: 1,
    created_date: { $date: "2025-11-17T07:59:26.378Z" },
    updated_date: { $date: "2025-11-17T07:59:26.378Z" },
    deleted_at: null,
    is_deleted: false,
    metadata: {},
    tenant_id: "tenant-123",
    provider: "openai",
    models: ["gpt-4", "gpt-4o", "gpt-4o-mini"],
    api_url: "https://api.openai.com/v1/chat/completions",
    api_key_id: "key001",
    max_tokens: 4000,
    temperature: null,
    top_p: null,
    is_active: true,
    is_default: true,
    fallback_priority: 1,
  },
  {
    _id: { $oid: "691ad5defe0955fff6cac653" },
    id: { $oid: "691ad5defe0955fff6cac654" },
    schema_version: 1,
    created_date: { $date: "2025-11-18T09:00:00.000Z" },
    updated_date: { $date: "2025-11-18T09:00:00.000Z" },
    deleted_at: null,
    is_deleted: false,
    metadata: {},
    tenant_id: "tenant-123",
    provider: "anthropic",
    models: ["claude-3-opus", "claude-sonnet-4-5"],
    api_url: "https://api.anthropic.com/v1/messages",
    api_key_id: "key002",
    max_tokens: 4096,
    temperature: 0.7,
    top_p: null,
    is_active: true,
    is_default: false,
    fallback_priority: 2,
  },
  {
    _id: { $oid: "691ad5defe0955fff6cac655" },
    id: { $oid: "691ad5defe0955fff6cac656" },
    schema_version: 1,
    created_date: { $date: "2025-11-19T11:00:00.000Z" },
    updated_date: { $date: "2025-11-19T11:00:00.000Z" },
    deleted_at: null,
    is_deleted: false,
    metadata: {},
    tenant_id: "tenant-123",
    provider: "google_vertex",
    models: ["gemini-1.5-pro", "gemini-1.5-flash"],
    api_url: "https://us-central1-aiplatform.googleapis.com/v1/projects/myproject/locations/us-central1/publishers/google/models/gemini-1.5-pro:generateContent",
    api_key_id: "key003",
    max_tokens: 8192,
    temperature: null,
    top_p: 0.9,
    is_active: false,
    is_default: false,
    fallback_priority: 3,
  },
  {
    _id: { $oid: "691ad5defe0955fff6cac657" },
    id: { $oid: "691ad5defe0955fff6cac658" },
    schema_version: 1,
    created_date: { $date: "2025-11-20T10:00:00.000Z" },
    updated_date: { $date: "2025-11-20T10:00:00.000Z" },
    deleted_at: null,
    is_deleted: false,
    metadata: {},
    tenant_id: "tenant-123",
    provider: "aws_bedrock",
    models: ["anthropic.claude-3-haiku", "amazon.titan-text-express"],
    api_url: "https://bedrock-runtime.us-east-1.amazonaws.com/model/anthropic.claude-3-haiku/invoke",
    api_key_id: "key004",
    max_tokens: 4096,
    temperature: 0.5,
    top_p: null,
    is_active: true,
    is_default: false,
    fallback_priority: 4,
  },
];