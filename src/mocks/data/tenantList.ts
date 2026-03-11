export type TenantStatus = 'active' | 'inactive' | 'suspended';

export interface TenantRow {
  id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_admin: { name: string; email: string };
  tier_id: string;
  firewall_version_id: string;
  llm_use: string;
  token_count: number;
  mongo_url: string;
  azure_ad_tenant_id: string;
  azure_ad_client_id: string;
  status: TenantStatus;
  is_active: boolean;
  created_date: string;
  updated_date: string;
  metadata: Record<string, string>;
}

export const tenantListData: TenantRow[] = [
  {
    id: '6640a1b2c3d4e5f6a7b8c9d0',
    tenant_id: 'tenant-fyras',
    tenant_name: 'Fyras Internal',
    tenant_admin: { name: 'Sam Al-Rashid', email: 'sam@fyras.com' },
    tier_id: 'Enterprise',
    firewall_version_id: 'v1.2.0',
    llm_use: 'gpt-4',
    token_count: 4_200_000,
    mongo_url: 'mongodb+srv://fyras:***@cluster0.fyras.mongodb.net/fyras',
    azure_ad_tenant_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    azure_ad_client_id: 'f1e2d3c4-b5a6-9870-dcba-fe9876543210',
    status: 'active',
    is_active: true,
    created_date: '2024-01-01T00:00:00Z',
    updated_date: '2026-02-15T10:30:00Z',
    metadata: { region: 'us-east-1', plan_cycle: 'annual' },
  },
  {
    id: '6640a1b2c3d4e5f6a7b8c9d1',
    tenant_id: 'tenant-acme',
    tenant_name: 'Acme Corporation',
    tenant_admin: { name: 'John Carter', email: 'admin@acme.com' },
    tier_id: 'Enterprise',
    firewall_version_id: 'v1.2.0',
    llm_use: 'gpt-4-turbo',
    token_count: 18_750_000,
    mongo_url: 'mongodb+srv://acme:***@cluster0.acme.mongodb.net/acme',
    azure_ad_tenant_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    azure_ad_client_id: 'e2d3c4b5-a6f7-0198-edcb-f09876543211',
    status: 'active',
    is_active: true,
    created_date: '2024-03-15T00:00:00Z',
    updated_date: '2026-03-01T08:00:00Z',
    metadata: { region: 'eu-west-1', plan_cycle: 'annual' },
  },
  {
    id: '6640a1b2c3d4e5f6a7b8c9d2',
    tenant_id: 'tenant-globex',
    tenant_name: 'Globex Industries',
    tenant_admin: { name: 'Maria Chen', email: 'it@globex.com' },
    tier_id: 'Pro',
    firewall_version_id: 'v1.1.5',
    llm_use: 'claude-3-opus',
    token_count: 6_100_000,
    mongo_url: 'mongodb+srv://globex:***@cluster0.globex.mongodb.net/globex',
    azure_ad_tenant_id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    azure_ad_client_id: 'd3c4b5a6-f7e8-2109-dcba-109876543212',
    status: 'active',
    is_active: true,
    created_date: '2024-05-20T00:00:00Z',
    updated_date: '2026-01-20T14:45:00Z',
    metadata: { region: 'ap-southeast-1', plan_cycle: 'monthly' },
  },
  {
    id: '6640a1b2c3d4e5f6a7b8c9d3',
    tenant_id: 'tenant-initech',
    tenant_name: 'Initech Solutions',
    tenant_admin: { name: 'Bob Lumbergh', email: 'ops@initech.com' },
    tier_id: 'Free',
    firewall_version_id: 'v1.0.0',
    llm_use: 'gpt-3.5-turbo',
    token_count: 980_000,
    mongo_url: 'mongodb+srv://initech:***@cluster0.initech.mongodb.net/initech',
    azure_ad_tenant_id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
    azure_ad_client_id: 'c4b5a6f7-e8d9-3210-edcb-210987654323',
    status: 'inactive',
    is_active: false,
    created_date: '2024-07-10T00:00:00Z',
    updated_date: '2025-11-05T09:15:00Z',
    metadata: { region: 'us-west-2', plan_cycle: 'monthly' },
  },
  {
    id: '6640a1b2c3d4e5f6a7b8c9d4',
    tenant_id: 'tenant-umbrella',
    tenant_name: 'Umbrella Corp',
    tenant_admin: { name: 'Albert Wesker', email: 'admin@umbrella.com' },
    tier_id: 'Pro',
    firewall_version_id: 'v1.1.0',
    llm_use: 'gemini-pro',
    token_count: 3_450_000,
    mongo_url: 'mongodb+srv://umbrella:***@cluster0.umbrella.mongodb.net/umbrella',
    azure_ad_tenant_id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
    azure_ad_client_id: 'b5a6f7e8-d9c0-4321-fedc-321098765434',
    status: 'suspended',
    is_active: false,
    created_date: '2024-09-05T00:00:00Z',
    updated_date: '2025-12-20T16:00:00Z',
    metadata: { region: 'eu-central-1', plan_cycle: 'annual', suspend_reason: 'payment_failed' },
  },
  {
    id: '6640a1b2c3d4e5f6a7b8c9d5',
    tenant_id: 'tenant-weyland',
    tenant_name: 'Weyland-Yutani',
    tenant_admin: { name: 'Charles Weyland', email: 'tech@weyland.com' },
    tier_id: 'Enterprise',
    firewall_version_id: 'v1.2.0',
    llm_use: 'claude-3-sonnet',
    token_count: 31_000_000,
    mongo_url: 'mongodb+srv://weyland:***@cluster0.weyland.mongodb.net/weyland',
    azure_ad_tenant_id: 'f6a7b8c9-d0e1-2345-fab c-456789012345',
    azure_ad_client_id: 'a6f7e8d9-c0b1-5432-gfed-432109876545',
    status: 'active',
    is_active: true,
    created_date: '2025-01-12T00:00:00Z',
    updated_date: '2026-03-05T11:20:00Z',
    metadata: { region: 'us-east-1', plan_cycle: 'annual' },
  },
];
