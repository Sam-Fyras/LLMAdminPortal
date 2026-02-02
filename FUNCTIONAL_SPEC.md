# Functional & Technical Specification: Tenant Admin Portal

## Document Information
- **Project**: Fyras LLM Admin Portal
- **Version**: 1.0
- **Last Updated**: 2026-02-01
- **Status**: Draft

---

## 1. Executive Summary

### 1.1 Purpose
The Tenant Admin Portal is a web-based control panel that enables tenant administrators to configure moderation rules, manage users, set token budgets, and integrate LLM providers for their organization. This portal provides complete governance and control over LLM usage, costs, and compliance.

### 1.2 Scope
This specification covers the frontend application built with React/Next.js/TypeScript. The application will integrate with the Fyras LLM Gateway API for all backend operations.

---

## 2. Technical Stack

### 2.1 Frontend Framework
- **React 19.1.0** - UI library
- **TypeScript 4.9.5** - Type safety
- **Material-UI (MUI) 7.2.0** - Component library
- **React Router 7.7.1** - Client-side routing

### 2.2 State Management
- **Redux Toolkit 2.8.2** - Global state management
- **React Hook Form 7.61.1** - Form state management
- **Zod 4.0.10** - Schema validation

### 2.3 Data Visualization
- **Recharts 3.1.0** - Charts and graphs

### 2.4 Authentication
- **Azure MSAL Browser 4.16.0** - Azure AD authentication
- **Azure MSAL React 3.0.16** - React integration for MSAL

### 2.5 API Communication
- **Axios 1.11.0** - HTTP client

### 2.6 Testing
- **Jest** - Unit testing
- **React Testing Library** - Component testing

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         React Application (SPA)                      │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │   Pages    │  │ Components │  │   Redux    │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │ API Layer  │  │   Hooks    │  │   Utils    │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Fyras LLM Gateway API (Backend)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Authentication │ Authorization │ Business Logic     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Database (User, Rules, Usage Data)          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         External LLM Providers (OpenAI, Anthropic)          │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Application Structure

```
src/
├── api/                        # API integration layer
│   ├── axios.ts                # Axios configuration & interceptors
│   ├── rules.ts                # Rule management APIs
│   ├── tokens.ts               # Token usage APIs
│   ├── users.ts                # User management APIs
│   ├── providers.ts            # LLM provider configuration APIs
│   ├── alerts.ts               # Alert & audit log APIs
│   └── dashboard.ts            # Dashboard data APIs
│
├── components/                 # Reusable UI components
│   ├── common/                 # Shared components
│   │   ├── Layout.tsx          # Main layout wrapper
│   │   ├── Navbar.tsx          # Navigation bar
│   │   ├── Sidebar.tsx         # Sidebar navigation
│   │   ├── ErrorBoundary.tsx   # Error handling
│   │   ├── LoadingSpinner.tsx  # Loading states
│   │   └── ConfirmDialog.tsx   # Confirmation dialogs
│   │
│   ├── dashboard/              # Dashboard-specific components
│   │   ├── TokenUsageChart.tsx # Token usage visualization
│   │   ├── UsageOverview.tsx   # Overview cards
│   │   ├── AlertsSummary.tsx   # Recent alerts
│   │   └── TopUsersTable.tsx   # Top users by usage
│   │
│   ├── users/                  # User management components
│   │   ├── UserList.tsx        # User table
│   │   ├── UserForm.tsx        # Add/edit user form
│   │   ├── UserDetails.tsx     # User detail view
│   │   └── UserUsageHistory.tsx# Per-user usage history
│   │
│   ├── rules/                  # Rule management components
│   │   ├── RuleList.tsx        # Rules table
│   │   ├── RuleForm.tsx        # Add/edit rule form
│   │   ├── RuleTestPanel.tsx   # Rule testing interface
│   │   └── RuleTypeSelector.tsx# Rule type selection
│   │
│   ├── providers/              # LLM provider components
│   │   ├── ProviderList.tsx    # Provider configuration list
│   │   ├── ProviderForm.tsx    # Add/edit provider
│   │   └── ProviderStatus.tsx  # Provider health status
│   │
│   ├── budget/                 # Budget management components
│   │   ├── BudgetOverview.tsx  # Budget summary
│   │   ├── BudgetForm.tsx      # Set/edit budgets
│   │   └── CostProjection.tsx  # Cost forecasting
│   │
│   └── alerts/                 # Alerts & audit logs
│       ├── AlertList.tsx       # Alert table
│       ├── AlertDetails.tsx    # Alert detail view
│       └── AuditLogExport.tsx  # Export functionality
│
├── context/                    # React context providers
│   ├── AuthContext.tsx         # Authentication state
│   └── ThemeContext.tsx        # Theme configuration
│
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts              # Authentication hook
│   ├── usePermissions.ts       # Permission checking
│   ├── useDebounce.ts          # Debounce utility
│   ├── useToast.ts             # Toast notifications
│   └── usePagination.ts        # Pagination helper
│
├── pages/                      # Route pages
│   ├── Dashboard.tsx           # Dashboard page
│   ├── Users.tsx               # User management page
│   ├── Rules.tsx               # Rule management page
│   ├── Providers.tsx           # LLM provider config page
│   ├── Budget.tsx              # Budget management page
│   ├── Alerts.tsx              # Alerts & audit logs page
│   ├── Login.tsx               # Login page
│   └── NotFound.tsx            # 404 page
│
├── redux/                      # Redux state management
│   ├── store.ts                # Redux store configuration
│   ├── slices/
│   │   ├── authSlice.ts        # Authentication state
│   │   ├── usersSlice.ts       # Users state
│   │   ├── rulesSlice.ts       # Rules state
│   │   ├── providersSlice.ts   # Providers state
│   │   ├── budgetSlice.ts      # Budget state
│   │   └── alertsSlice.ts      # Alerts state
│
├── types/                      # TypeScript type definitions
│   ├── user.ts                 # User-related types
│   ├── rule.ts                 # Rule-related types
│   ├── provider.ts             # Provider-related types
│   ├── budget.ts               # Budget-related types
│   ├── alert.ts                # Alert-related types
│   └── api.ts                  # API response types
│
├── utils/                      # Utility functions
│   ├── formatters.ts           # Data formatting utilities
│   ├── validators.ts           # Validation helpers
│   ├── constants.ts            # Application constants
│   └── permissions.ts          # Permission checking logic
│
├── App.tsx                     # Main application component
└── index.tsx                   # Application entry point
```

---

## 4. Feature Requirements

### 4.1 Dashboard (Home)

#### 4.1.1 Overview Cards
**Purpose**: Provide at-a-glance metrics for tenant administrators.

**Metrics**:
- **Monthly Token Usage** (Organization-level)
  - Total tokens consumed this month
  - Percentage of budget used
  - Trend indicator (up/down vs last month)

- **Active Users This Month**
  - Count of unique users who made LLM requests
  - Trend vs previous month

- **Triggered Moderation Events**
  - Total blocked/redacted prompts
  - Breakdown by rule type

- **Alerts Summary**
  - Count of unread alerts
  - Critical/warning/info breakdown

#### 4.1.2 Token Usage Visualization
**Chart Type**: Line chart or area chart

**Data Points**:
- Daily/weekly token consumption over time
- Breakdown by LLM provider (OpenAI, Anthropic, etc.)
- Breakdown by user or department (if applicable)

**Interactions**:
- Hover to see exact values
- Click to drill down into specific dates
- Export chart data as CSV

#### 4.1.3 Top Users Table
**Columns**:
- User name
- Total tokens used
- Cost estimate
- Last activity date

**Actions**:
- Click user to view detailed usage history
- Sort by any column

#### 4.1.4 Recent Alerts
**Display**:
- Last 5-10 alerts
- Alert severity (critical, warning, info)
- Timestamp
- Brief description

**Actions**:
- Click to view alert details
- Link to full alerts page

---

### 4.2 User Management

#### 4.2.1 User List View
**Display Format**: Data table

**Columns**:
- User name
- Email
- Role (Admin, Analyst, Developer, Viewer)
- Token limit (per month)
- Current usage
- Status (Active/Inactive)
- Last login
- Actions (Edit, Delete)

**Features**:
- Search/filter by name, email, role
- Sort by any column
- Pagination (25/50/100 per page)
- Bulk actions (activate/deactivate, delete)

#### 4.2.2 Add/Edit User
**Form Fields**:
- **Name** (required, text)
- **Email** (required, email validation)
- **Role** (required, dropdown)
  - Options: Admin, Analyst, Developer, Viewer
- **Monthly Token Limit** (optional, number)
  - If empty, inherits organization default
- **Model Access** (multi-select)
  - GPT-4, GPT-3.5, Claude, etc.
- **Status** (toggle: Active/Inactive)

**Validation**:
- Email must be unique
- Token limit must be positive number
- At least one model must be selected

**Actions**:
- Save & Close
- Save & Add Another
- Cancel

#### 4.2.3 User Detail View
**Sections**:
1. **User Information**
   - Name, email, role, status
   - Created date, last modified
   - Edit button

2. **Token Usage**
   - Current month usage
   - Historical usage chart (last 6 months)
   - Cost breakdown by model

3. **Moderation History**
   - List of blocked/redacted prompts
   - Timestamps and reasons
   - Export to CSV

4. **Activity Log**
   - Login history
   - API calls made
   - Configuration changes

#### 4.2.4 User Deletion
**Flow**:
1. Click delete icon
2. Show confirmation dialog:
   - "Are you sure you want to delete [User Name]?"
   - "This action cannot be undone."
   - "All usage history will be retained but anonymized."
3. Require confirmation (type username or click checkbox)
4. Delete user
5. Show success toast

---

### 4.3 Rule Management

#### 4.3.1 Rule Types
1. **Token Limit Rules**
   - Per user (daily/weekly/monthly)
   - Per organization (daily/weekly/monthly)

2. **Model Restriction Rules**
   - Allowed models per user/role
   - Blocked models for specific content types

3. **Rate Limit Rules**
   - Requests per minute/hour
   - Concurrent request limits

4. **Content Moderation Rules**
   - Hard block keywords
   - Redaction patterns (PII, sensitive data)
   - Prompt injection detection

5. **Cost Control Rules**
   - Maximum cost per request
   - Daily/monthly cost caps

#### 4.3.2 Rule List View
**Display**:
- Rule name
- Rule type
- Status (Enabled/Disabled)
- Scope (Global/Tenant-specific)
- Priority
- Last modified
- Actions (Edit, Delete, Duplicate, Test)

**Features**:
- Filter by rule type
- Filter by status (enabled/disabled)
- Search by name
- Drag-and-drop to reorder priority

#### 4.3.3 Global vs Tenant Rules
**Global Rules**:
- Created by platform administrators
- Read-only for tenant admins
- Applied to all tenants
- Displayed with "Global" badge

**Tenant Rules**:
- Created by tenant admins
- Can override global rules (if permitted)
- Only apply to current tenant
- Full CRUD operations

#### 4.3.4 Add/Edit Rule Form
**Common Fields**:
- **Rule Name** (required)
- **Description** (optional, multiline)
- **Rule Type** (required, dropdown)
- **Status** (toggle: Enabled/Disabled)
- **Priority** (number, lower = higher priority)

**Type-Specific Fields**:

*Token Limit Rule*:
- Scope: User/Organization
- Period: Daily/Weekly/Monthly
- Limit: Number of tokens
- Action: Block/Warning

*Hard Block Keywords*:
- Keywords list (comma-separated or one per line)
- Case sensitive (checkbox)
- Match whole words only (checkbox)
- Custom block message (text)

*Redaction Patterns*:
- Pattern type: Email/Phone/SSN/Credit Card/Custom Regex
- Replacement text (default: [REDACTED])
- Apply to: Prompts/Responses/Both

*Rate Limit*:
- Scope: User/Organization
- Window: Per minute/hour/day
- Max requests: Number
- Action: Block/Throttle

**Validation**:
- All required fields must be filled
- Regex patterns must be valid
- Token/rate limits must be positive

#### 4.3.5 Rule Testing Interface
**Purpose**: Allow admins to test rules against sample prompts before deployment.

**UI**:
- Text area for sample prompt
- Select which rules to test (multi-select)
- "Test" button

**Output**:
- List of triggered rules
- Actions taken (blocked, redacted, warning)
- Modified prompt (if redaction applied)
- Explanation of why rule triggered

**Example**:
```
Input: "My email is john@example.com and my SSN is 123-45-6789"
Rules Applied:
  ✓ PII Redaction Rule - Email
  ✓ PII Redaction Rule - SSN
Output: "My email is [REDACTED] and my SSN is [REDACTED]"
```

---

### 4.4 LLM Provider Configuration

#### 4.4.1 Provider List View
**Display**:
- Provider name (OpenAI, Anthropic, Azure OpenAI, etc.)
- Status (Active/Inactive)
- API key status (Valid/Invalid/Not Set)
- Last health check
- Default provider indicator
- Actions (Edit, Test Connection, Delete)

#### 4.4.2 Add/Edit Provider Form
**Fields**:
- **Provider Type** (dropdown)
  - OpenAI
  - Anthropic
  - Azure OpenAI
  - Google Vertex AI
  - AWS Bedrock
  - Custom

- **Provider Name** (text, e.g., "OpenAI Production")
- **API Key** (password field, encrypted)
  - Show/hide toggle
  - "Test Connection" button

- **Base URL** (optional, for custom endpoints)
- **Organization ID** (optional, for OpenAI)
- **Region** (optional, for Azure/AWS)

- **Models Enabled** (multi-select)
  - List all available models for this provider
  - Select which to make available

- **Default Provider** (checkbox)
  - Only one can be default
  - Used when no provider specified in request

- **Fallback Priority** (number)
  - Order to try if primary fails

- **Rate Limits** (optional)
  - Override provider's default rate limits
  - RPM/TPM limits

**Validation**:
- API key required
- Test connection before saving (recommended)
- Cannot set as default if connection fails

#### 4.4.3 Test Connection
**Flow**:
1. Click "Test Connection" button
2. Show loading spinner
3. Make test API call to provider
4. Display result:
   - ✓ Success: "Connection successful"
   - ✗ Failure: Error message (invalid key, network error, etc.)

#### 4.4.4 Provider Health Monitoring
**Display**:
- Status indicator (green/yellow/red)
- Uptime percentage (last 24h/7d/30d)
- Average response time
- Error rate

**Actions**:
- Auto-failover to backup provider if primary fails
- Alert admins on health issues

---

### 4.5 Budget Management

#### 4.5.1 Budget Overview
**Display**:
- Current month spend (actual cost)
- Budget limit
- Remaining budget
- Percentage used (progress bar)
- Projected end-of-month cost
- Alert status (on track/warning/critical)

#### 4.5.2 Budget Configuration
**Organization Level**:
- Monthly token cap
- Monthly cost cap ($)
- Alert thresholds:
  - Warning at X% (default 80%)
  - Critical at X% (default 90%)
  - Block at X% (default 100%)

**User Level**:
- Per-user monthly token cap
- Per-user monthly cost cap
- Inherit from org default (checkbox)

**Department/Team Level** (Optional):
- Token allocation per team
- Cost allocation per team

#### 4.5.3 Cost Projection
**Algorithm**:
- Based on current usage trend
- Extrapolate to end of month
- Show confidence interval

**Display**:
- Line chart with:
  - Actual usage (solid line)
  - Projected usage (dashed line)
  - Budget limit (horizontal line)
- Estimated overspend (if applicable)

**Alerts**:
- Show warning if projection exceeds budget
- Recommend actions (reduce usage, increase budget)

#### 4.5.4 Budget Alerts
**Trigger Conditions**:
- Usage reaches 80% of budget (Warning)
- Usage reaches 90% of budget (Critical)
- Usage reaches 100% of budget (Block new requests)
- Projection indicates overspend

**Alert Actions**:
- Email notification to admins
- In-app notification
- Optionally block new requests

---

### 4.6 Alerts and Audit Logs

#### 4.6.1 Alert Types
1. **Budget Alerts**
   - Budget threshold exceeded
   - Projected overspend

2. **Moderation Alerts**
   - High frequency of blocked prompts
   - Attempted policy violations

3. **System Alerts**
   - Provider API failures
   - Authentication failures
   - Configuration changes

4. **Security Alerts**
   - Unusual usage patterns
   - Suspicious activity

#### 4.6.2 Alert List View
**Columns**:
- Severity (icon: critical/warning/info)
- Alert type
- Message/description
- User (if applicable)
- Timestamp
- Status (New/Acknowledged/Resolved)
- Actions (View, Acknowledge, Resolve)

**Filters**:
- Severity (multi-select)
- Alert type (multi-select)
- Date range
- Status

**Sorting**:
- Default: Most recent first
- Sort by severity, type, timestamp

#### 4.6.3 Alert Detail View
**Display**:
- Full alert message
- Severity and type
- Timestamp
- User information (if applicable)
- Related context:
  - Prompt text (for moderation alerts)
  - Usage data (for budget alerts)
  - Error logs (for system alerts)
- Actions taken (auto-block, notification sent, etc.)
- Resolution notes (if resolved)

**Actions**:
- Acknowledge (marks as read)
- Resolve (marks as resolved, add notes)
- Export alert details

#### 4.6.4 Audit Logs
**Logged Events**:
- User CRUD operations
- Rule changes (created, updated, deleted)
- Provider configuration changes
- Budget modifications
- Permission changes
- Login/logout events
- API key rotations

**Log Entry Fields**:
- Timestamp
- Event type
- User who performed action
- Target resource (user, rule, etc.)
- Old value → New value (for updates)
- IP address
- User agent

**Display**:
- Filterable table
- Search by user, event type, resource
- Date range filter
- Export to CSV/JSON

#### 4.6.5 Export Functionality
**Export Formats**:
- CSV (for Excel)
- JSON (for programmatic processing)
- PDF (for reports)

**Export Options**:
- Current filters applied
- All logs or selected date range
- Include/exclude specific columns

**Implementation**:
- Client-side export for small datasets (<1000 rows)
- Server-side export for large datasets
- Email download link when ready (for large exports)

---

## 5. Data Models

### 5.1 User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  status: 'active' | 'inactive';
  tokenLimit?: number; // Monthly limit, null = inherit from org
  allowedModels: string[]; // Model IDs
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

enum UserRole {
  ADMIN = 'admin',
  ANALYST = 'analyst',
  DEVELOPER = 'developer',
  VIEWER = 'viewer',
}
```

### 5.2 Rule
```typescript
interface Rule {
  id: string;
  tenantId?: string; // null for global rules
  name: string;
  description?: string;
  type: RuleType;
  config: RuleConfig; // Type-specific configuration
  enabled: boolean;
  priority: number; // Lower = higher priority
  scope: 'global' | 'tenant';
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

enum RuleType {
  TOKEN_LIMIT = 'token_limit',
  MODEL_RESTRICTION = 'model_restriction',
  RATE_LIMIT = 'rate_limit',
  HARD_BLOCK = 'hard_block',
  REDACTION = 'redaction',
  COST_CONTROL = 'cost_control',
}

// Type-specific configurations
interface TokenLimitConfig {
  scope: 'user' | 'organization';
  period: 'daily' | 'weekly' | 'monthly';
  limit: number;
  action: 'block' | 'warning';
}

interface HardBlockConfig {
  keywords: string[];
  caseSensitive: boolean;
  wholeWordOnly: boolean;
  customMessage?: string;
}

interface RedactionConfig {
  patternType: 'email' | 'phone' | 'ssn' | 'credit_card' | 'custom';
  customRegex?: string;
  replacement: string;
  applyTo: 'prompt' | 'response' | 'both';
}

interface RateLimitConfig {
  scope: 'user' | 'organization';
  window: 'minute' | 'hour' | 'day';
  maxRequests: number;
  action: 'block' | 'throttle';
}

type RuleConfig =
  | TokenLimitConfig
  | HardBlockConfig
  | RedactionConfig
  | RateLimitConfig;
```

### 5.3 LLM Provider
```typescript
interface LLMProvider {
  id: string;
  tenantId: string;
  type: ProviderType;
  name: string; // Custom name, e.g., "OpenAI Production"
  apiKey: string; // Encrypted
  baseUrl?: string;
  organizationId?: string; // For OpenAI
  region?: string; // For Azure/AWS
  enabledModels: string[];
  isDefault: boolean;
  fallbackPriority: number;
  rateLimits?: {
    rpm?: number; // Requests per minute
    tpm?: number; // Tokens per minute
  };
  healthStatus: {
    status: 'healthy' | 'degraded' | 'down';
    lastChecked: Date;
    uptime: number; // Percentage
    avgResponseTime: number; // ms
    errorRate: number; // Percentage
  };
  createdAt: Date;
  updatedAt: Date;
}

enum ProviderType {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  AZURE_OPENAI = 'azure_openai',
  GOOGLE_VERTEX = 'google_vertex',
  AWS_BEDROCK = 'aws_bedrock',
  CUSTOM = 'custom',
}
```

### 5.4 Budget
```typescript
interface Budget {
  id: string;
  tenantId: string;
  scope: 'organization' | 'user' | 'team';
  targetId?: string; // User ID or Team ID (null for org)
  period: 'daily' | 'weekly' | 'monthly';
  tokenCap?: number;
  costCap?: number; // USD
  alertThresholds: {
    warning: number; // Percentage
    critical: number; // Percentage
    block: number; // Percentage
  };
  currentUsage: {
    tokens: number;
    cost: number;
    lastUpdated: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.5 Alert
```typescript
interface Alert {
  id: string;
  tenantId: string;
  type: AlertType;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  details?: Record<string, any>; // Alert-specific data
  userId?: string; // User who triggered alert
  status: 'new' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
  createdAt: Date;
}

enum AlertType {
  BUDGET_THRESHOLD = 'budget_threshold',
  BUDGET_OVERSPEND = 'budget_overspend',
  MODERATION_BLOCK = 'moderation_block',
  PROVIDER_FAILURE = 'provider_failure',
  AUTH_FAILURE = 'auth_failure',
  CONFIG_CHANGE = 'config_change',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
}
```

### 5.6 Audit Log
```typescript
interface AuditLog {
  id: string;
  tenantId: string;
  timestamp: Date;
  eventType: AuditEventType;
  userId: string; // Who performed the action
  resourceType: 'user' | 'rule' | 'provider' | 'budget';
  resourceId: string;
  action: 'create' | 'update' | 'delete';
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

enum AuditEventType {
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  RULE_CREATED = 'rule_created',
  RULE_UPDATED = 'rule_updated',
  RULE_DELETED = 'rule_deleted',
  PROVIDER_CREATED = 'provider_created',
  PROVIDER_UPDATED = 'provider_updated',
  PROVIDER_DELETED = 'provider_deleted',
  BUDGET_UPDATED = 'budget_updated',
  LOGIN = 'login',
  LOGOUT = 'logout',
  API_KEY_ROTATED = 'api_key_rotated',
}
```

### 5.7 Usage Statistics
```typescript
interface UsageStats {
  id: string;
  tenantId: string;
  userId?: string; // null for org-level stats
  date: Date; // Daily granularity
  provider: string;
  model: string;
  metrics: {
    requestCount: number;
    tokenCount: number;
    cost: number; // USD
    avgResponseTime: number; // ms
  };
  moderationEvents: {
    blocked: number;
    redacted: number;
    warned: number;
  };
}
```

---

## 6. API Requirements

### 6.1 Authentication & Authorization
All API requests must include:
- **Authorization Header**: `Bearer <Azure AD token>`
- **Tenant Context**: `X-Tenant-Id: <tenant-id>` (optional, inferred from token)

### 6.2 API Endpoints

#### 6.2.1 Dashboard
```
GET /api/v1/dashboard/overview
Response: {
  monthlyTokenUsage: { total, limit, percentage, trend },
  activeUsers: { count, trend },
  moderationEvents: { total, byType },
  alerts: { total, byStatus }
}

GET /api/v1/dashboard/token-usage
Query: ?period=30d&groupBy=day|week|provider
Response: [{
  date: Date,
  provider: string,
  tokens: number,
  cost: number
}]

GET /api/v1/dashboard/top-users
Query: ?limit=10
Response: [{
  userId: string,
  name: string,
  tokens: number,
  cost: number,
  lastActivity: Date
}]
```

#### 6.2.2 User Management
```
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id

GET /api/v1/users/:id/usage
Query: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD

GET /api/v1/users/:id/moderation-history
Query: ?page=1&limit=50
```

#### 6.2.3 Rule Management
```
GET    /api/v1/rules
POST   /api/v1/rules
GET    /api/v1/rules/:id
PUT    /api/v1/rules/:id
DELETE /api/v1/rules/:id
POST   /api/v1/rules/reorder (bulk priority update)
POST   /api/v1/rules/test (test rules against sample prompt)

GET /api/v1/rules/global (read-only global rules)
```

#### 6.2.4 Provider Management
```
GET    /api/v1/providers
POST   /api/v1/providers
GET    /api/v1/providers/:id
PUT    /api/v1/providers/:id
DELETE /api/v1/providers/:id
POST   /api/v1/providers/:id/test-connection
GET    /api/v1/providers/:id/health
```

#### 6.2.5 Budget Management
```
GET    /api/v1/budgets
POST   /api/v1/budgets
GET    /api/v1/budgets/:id
PUT    /api/v1/budgets/:id
DELETE /api/v1/budgets/:id

GET /api/v1/budgets/projection
Query: ?targetDate=YYYY-MM-DD
```

#### 6.2.6 Alerts & Audit Logs
```
GET    /api/v1/alerts
PUT    /api/v1/alerts/:id/acknowledge
PUT    /api/v1/alerts/:id/resolve
POST   /api/v1/alerts/export

GET    /api/v1/audit-logs
Query: ?eventType=&userId=&startDate=&endDate=&page=&limit=
POST   /api/v1/audit-logs/export
```

### 6.3 Error Handling
```typescript
interface APIError {
  error: {
    code: string; // e.g., "VALIDATION_ERROR", "UNAUTHORIZED"
    message: string;
    details?: Record<string, any>;
  };
}

// Standard HTTP status codes:
// 200 OK
// 201 Created
// 400 Bad Request
// 401 Unauthorized
// 403 Forbidden
// 404 Not Found
// 409 Conflict
// 500 Internal Server Error
```

---

## 7. UI/UX Requirements

### 7.1 Design System
- **Theme**: Material-UI theme with custom brand colors
- **Typography**: Roboto font family
- **Spacing**: 8px base unit
- **Colors**:
  - Primary: #1976d2 (Blue)
  - Secondary: #dc004e (Pink)
  - Success: #4caf50 (Green)
  - Warning: #ff9800 (Orange)
  - Error: #f44336 (Red)
  - Info: #2196f3 (Light Blue)

### 7.2 Responsive Design
- **Desktop**: >= 1200px (full layout with sidebar)
- **Tablet**: 768px - 1199px (collapsible sidebar)
- **Mobile**: < 768px (hamburger menu, vertical stacking)

### 7.3 Navigation
- **Sidebar**: Persistent on desktop, collapsible on tablet/mobile
- **Navigation Items**:
  - Dashboard
  - Users
  - Rules
  - Providers
  - Budget
  - Alerts
  - Settings (future)

### 7.4 Accessibility
- **WCAG 2.1 Level AA** compliance
- Keyboard navigation support
- Screen reader friendly
- Color contrast ratios >= 4.5:1
- ARIA labels on interactive elements

### 7.5 Loading States
- Skeleton loaders for tables and cards
- Progress bars for long operations
- Spinners for button actions

### 7.6 Error States
- Inline form validation errors
- Toast notifications for API errors
- Error boundary for uncaught exceptions
- Retry mechanisms for failed requests

### 7.7 Empty States
- Friendly illustrations/icons
- Call-to-action buttons
- Helpful guidance text
- Example: "No users found. Click 'Add User' to get started."

---

## 8. Security Requirements

### 8.1 Authentication
- **Azure AD** authentication via MSAL
- **Token Refresh**: Automatic token refresh before expiration
- **Session Timeout**: 30 minutes of inactivity
- **Re-authentication**: Required for sensitive actions (delete user, change API keys)

### 8.2 Authorization
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full access to all features
  - **Analyst**: Read-only access to dashboard, users, alerts
  - **Developer**: Manage rules and test rules
  - **Viewer**: Read-only access to dashboard

- **Permission Checks**:
  - Frontend: Hide/disable UI elements based on role
  - Backend: Enforce permissions on all API endpoints

### 8.3 Data Protection
- **API Keys**: Encrypted at rest, never displayed in full
- **PII**: Redact sensitive user data in logs
- **HTTPS**: All communication over TLS 1.2+
- **CSP**: Content Security Policy headers
- **XSS Protection**: Sanitize all user inputs

### 8.4 Audit Trail
- Log all CRUD operations
- Track who, what, when, where
- Immutable audit logs (write-only)
- Retention: 1 year minimum

---

## 9. Performance Requirements

### 9.1 Page Load Time
- **Initial Load**: < 3 seconds
- **Subsequent Pages**: < 1 second (SPA)
- **API Responses**: < 500ms (p95)

### 9.2 Data Pagination
- Default page size: 25 items
- Max page size: 100 items
- Virtual scrolling for large datasets (>1000 rows)

### 9.3 Caching
- **Browser Cache**: Static assets (7 days)
- **API Cache**: Dashboard metrics (5 minutes)
- **Redux Store**: Cached data with TTL

### 9.4 Optimization
- Code splitting by route
- Lazy loading for heavy components
- Image optimization (WebP, responsive images)
- Debounce search inputs (300ms)

---

## 10. Testing Requirements

### 10.1 Unit Tests
- All utility functions
- Redux reducers and actions
- Custom hooks
- Target coverage: >= 80%

### 10.2 Integration Tests
- API integration layer
- Form submissions
- User flows (login, create user, etc.)

### 10.3 E2E Tests (Future)
- Critical user journeys
- Cross-browser testing
- Accessibility testing

---

## 11. Deployment & DevOps

### 11.1 Build Process
```bash
npm run build
# Outputs to /build directory
# Minified, optimized production bundle
```

### 11.2 Environment Configuration
```
REACT_APP_API_BASE_URL=https://api.fyras.com
REACT_APP_AZURE_CLIENT_ID=<client-id>
REACT_APP_AZURE_TENANT_ID=<tenant-id>
REACT_APP_AZURE_REDIRECT_URI=https://admin.fyras.com
```

### 11.3 Deployment Targets
- **Azure Static Web Apps** (preferred)
- **Azure App Service**
- **Docker container**

### 11.4 CI/CD Pipeline
1. **Lint & Test**: Run on every commit
2. **Build**: Create production bundle
3. **Deploy to Staging**: Auto-deploy on merge to `develop`
4. **Deploy to Production**: Manual trigger on merge to `main`

---

## 12. Future Enhancements

### 12.1 Phase 2 Features
- Multi-factor authentication (MFA)
- Custom branding (white-label)
- Advanced analytics (usage predictions, anomaly detection)
- Webhooks for alerts
- Slack/Teams integration for notifications

### 12.2 Phase 3 Features
- Department/team management
- Advanced budgeting (chargebacks, cost allocation)
- Custom report builder
- Mobile app (React Native)
- GraphQL API support

---

## 13. Acceptance Criteria

### 13.1 Functional Criteria
- [ ] All 6 main features implemented and functional
- [ ] User can CRUD users, rules, providers, budgets
- [ ] Dashboard displays accurate real-time data
- [ ] Rule testing works correctly
- [ ] Alerts trigger based on configured thresholds
- [ ] Export functionality works for logs and alerts

### 13.2 Non-Functional Criteria
- [ ] Page load time < 3 seconds
- [ ] Mobile responsive on screens >= 375px
- [ ] WCAG 2.1 Level AA compliance
- [ ] 80%+ test coverage
- [ ] Zero console errors on production build

### 13.3 Security Criteria
- [ ] Azure AD authentication working
- [ ] RBAC enforced on all routes
- [ ] API keys encrypted and not exposed
- [ ] All API calls authenticated
- [ ] Audit logs capturing all changes

---

## 14. Glossary

- **Tenant**: An organization or customer using the LLM platform
- **Token**: Unit of text processed by LLM (roughly 0.75 words)
- **Moderation**: Automatic filtering/redaction of prompts and responses
- **Redaction**: Replacing sensitive data with placeholder text
- **Hard Block**: Completely blocking a request (vs warning)
- **TPM**: Tokens Per Minute
- **RPM**: Requests Per Minute
- **PII**: Personally Identifiable Information
- **MSAL**: Microsoft Authentication Library

---

## 15. Appendix

### 15.1 Sample Wireframes

#### Dashboard
```
+----------------------------------------------------------+
| [Logo] Fyras Admin Portal              [User] [Logout]  |
+----------+-----------------------------------------------+
| SIDEBAR  |                 DASHBOARD                     |
| • Home   | +------------------+ +----------------------+  |
| • Users  | | Monthly Tokens   | | Active Users       |  |
| • Rules  | | 45M / 50M (90%)  | | 128 (+12%)         |  |
| • Provid | | ▓▓▓▓▓▓▓▓▓░       | +----------------------+  |
| • Budget | +------------------+ +----------------------+  |
| • Alerts | +------------------+ | Moderation Events  |  |
|          | | Token Usage Chart                        |  |
|          | | [Line chart showing usage over time]     |  |
|          | +------------------------------------------+  |
|          | +------------------------------------------+  |
|          | | Top Users by Usage                       |  |
|          | | 1. John Doe     - 2.3M tokens            |  |
|          | | 2. Jane Smith   - 1.8M tokens            |  |
|          | | 3. Bob Johnson  - 1.2M tokens            |  |
|          | +------------------------------------------+  |
+----------+-----------------------------------------------+
```

#### User Management
```
+----------------------------------------------------------+
| Users                                    [+ Add User]    |
+----------------------------------------------------------+
| [Search...] [Filter by Role ▼] [Export CSV]             |
+----------------------------------------------------------+
| Name          | Email         | Role   | Usage  | Status |
|---------------|---------------|--------|--------|--------|
| John Doe      | john@ex.com   | Admin  | 2.3M   | ✓      |
| Jane Smith    | jane@ex.com   | Dev    | 1.8M   | ✓      |
| Bob Johnson   | bob@ex.com    | Viewer | 1.2M   | ✗      |
+----------------------------------------------------------+
| [< Previous] Page 1 of 5 [Next >]                       |
+----------------------------------------------------------+
```

#### Rule Management
```
+----------------------------------------------------------+
| Rules                                    [+ Add Rule]    |
+----------------------------------------------------------+
| [Filter by Type ▼] [Enabled/Disabled ▼] [Test Rules]   |
+----------------------------------------------------------+
| Name               | Type         | Status | Actions     |
|--------------------|--------------|--------|-------------|
| PII Redaction      | Redaction    | ✓ On   | Edit Delete |
| Token Limit (Org)  | Token Limit  | ✓ On   | Edit Delete |
| Block Bad Words    | Hard Block   | ✗ Off  | Edit Delete |
+----------------------------------------------------------+
```

### 15.2 Technology Rationale

**Why React?**
- Component-based architecture
- Large ecosystem and community
- Excellent TypeScript support
- Virtual DOM for performance

**Why TypeScript?**
- Type safety reduces bugs
- Better IDE autocomplete
- Self-documenting code
- Refactoring confidence

**Why Material-UI?**
- Comprehensive component library
- Accessible by default
- Themeable and customizable
- Good documentation

**Why Redux Toolkit?**
- Simplified Redux setup
- Built-in best practices
- Excellent DevTools
- TypeScript friendly

**Why Azure AD?**
- Enterprise-grade authentication
- Single sign-on (SSO)
- Multi-factor auth support
- Integration with Microsoft 365

---

## Document History

| Version | Date       | Author | Changes                |
|---------|------------|--------|------------------------|
| 1.0     | 2026-02-01 | Claude | Initial specification  |

---

**End of Document**
