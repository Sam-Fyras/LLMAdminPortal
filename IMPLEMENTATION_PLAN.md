# Implementation Plan: Tenant Admin Portal

## Overview

Implement a comprehensive admin portal for the Fyras LLM Gateway based on the functional specification in `FUNCTIONAL_SPEC.md`. The existing codebase has a solid foundation (Dashboard, Rules Management, Authentication) that we'll expand with 5 new major features.

## Current State

**Exists:**
- Pages: Dashboard (token charts), Rules Management (CRUD), User Role Management (roles only), Login
- API: axios.ts, rules.ts, users.ts, tokens.ts with interceptors
- Auth: Azure AD (MSAL) with context-based token management
- UI: Material-UI components, Recharts visualization
- State: Component-level useState (Redux Toolkit installed but unused)

**Backend Microservices Architecture:**
- **TenantConfigService** - Tenant/user management, LLM provider configs, tiers
- **UsageTrackingService** - Real-time token usage, multi-level limits (tenant/role/user), analytics
- **RuleManagementService** - Rule CRUD, versioning, templates, testing

**Missing Frontend Features:**
- Full user management (only roles exist)
- LLM provider configuration UI
- Multi-level token limits management (tenant/role/user)
- Usage analytics dashboard
- Alerts & audit logs
- Enhanced rules (hard block, redaction, testing)
- Common components, custom hooks

**Backend API Integration:**
- Frontend must align with existing FastAPI microservices
- All endpoints use Odmantic/Pydantic models
- MongoDB for persistence, Redis for caching
- Bearer token authentication (Azure AD)

## Implementation Strategy

### State Management Decision

**HYBRID APPROACH:** Continue with component-level state + minimal Redux

- **Redux only for:** Auth state, notifications/toasts, dashboard cache
- **Component state for:** Forms, tables, dialogs, page-specific loading/errors
- **Rationale:** Simpler, faster development; avoid Redux boilerplate for CRUD operations

### Implementation Phases (7 Phases, ~6 weeks)

```
Phase 1 (Foundation) → Phases 2-7 (Features) → Integration Testing
```

---

## Phase 1: Foundation (Week 1) - CRITICAL PATH

**Goal:** Establish shared infrastructure aligned with backend microservices

### 1.1 Type System Expansion

Create TypeScript types matching backend Odmantic/Pydantic models.

**New type files:**
- `src/types/tenant.ts` - Tenant, User types
- `src/types/usage.ts` - TokenLimit, TokenQuota, UsageStats
- `src/types/rule.ts` - TenantRule, GlobalRule types
- `src/types/provider.ts` - LLMConfig, Provider types
- `src/types/api.ts` - Common API response wrappers

**Update:** `src/types/index.ts` - Export all new types

### 1.2 Redux Store Setup (Minimal)

**Files to create:**
- `src/redux/store.ts`
- `src/redux/slices/authSlice.ts`
- `src/redux/slices/notificationsSlice.ts`
- `src/redux/slices/cacheSlice.ts`
- `src/redux/hooks.ts` (typed useAppDispatch, useAppSelector)

**Update:** `src/index.tsx` - Add Redux Provider

### 1.3 Custom Hooks

**Create:** `src/hooks/` directory
- `useToast.ts` - Toast notification wrapper using MUI Snackbar
- `useDebounce.ts` - Debounce utility (300ms default)
- `usePagination.ts` - Table pagination state
- `useConfirmDialog.ts` - Confirmation dialog state

### 1.4 Common Components

**Create:** `src/components/common/`
- `ConfirmDialog.tsx` - Reusable confirmation with "type name to confirm"
- `LoadingSpinner.tsx` - Centered spinner with optional text
- `ErrorBoundary.tsx` - Catch React errors gracefully
- `EmptyState.tsx` - Consistent empty table states with icon + CTA

### 1.5 API Layer Expansion

**Create new API modules:**
- `src/api/tenants.ts` - TenantConfigService endpoints
- `src/api/usage.ts` - UsageTrackingService endpoints
- `src/api/roles.ts` - Role management endpoints

**Update:** `src/api/rules.ts` - Align with RuleManagementService

**Key endpoints:**

**TenantConfigService:**
```
GET/PUT/DELETE /api/v1/tenants/{id}
POST/GET       /api/v1/tenants/{id}/users
GET/POST/PUT/DELETE /api/v1/tenants/{id}/llm-configs
```

**UsageTrackingService:**
```
GET    /api/v1/usage/current/{tenant_id}/users/{user_id}
GET    /api/v1/limits/{tenant_id}
POST   /api/v1/limits/{tenant_id}/roletokenlimit
POST   /api/v1/limits/{tenant_id}/usertokenlimit
GET    /api/v1/analytics/{tenant_id}/usage
```

**RuleManagementService:**
```
GET/POST/PUT/DELETE /api/v1/tenants/{id}/rules
POST   /api/v1/tenants/{id}/rules/test
GET    /api/v1/tenants/{id}/rules/{rule_id}/history
```

---

## Phase 2: Enhanced Dashboard (Week 2)

**New components:** `src/components/dashboard/`
- `TopUsersTable.tsx` - Top 10 users by token usage
- `AlertsSummary.tsx` - Recent 5 alerts
- `UsageOverview.tsx` - Metric cards
- `TokenUsageChart.tsx` - Enhanced chart with provider breakdown

**Update:** `src/pages/DashboardPage.tsx`

---

## Phase 3: Full User Management (Week 2-3) - COMPLEX

**New components:** `src/components/users/`
- `UserList.tsx` - User table
- `UserForm.tsx` - Add/edit user (React Hook Form + Zod)
- `UserDetails.tsx` - User detail view
- `UserUsageHistory.tsx` - Usage chart
- `UserQuotaCard.tsx` - Quota status

**New page:** `src/pages/UsersPage.tsx`

**API Integration:**
- TenantConfigService for user CRUD
- UsageTrackingService for usage data

---

## Phase 4: LLM Provider Configuration (Week 3)

**New components:** `src/components/providers/`
- `ProviderList.tsx` - Provider table
- `ProviderForm.tsx` - Add/edit LLM config
- `ProviderStatus.tsx` - Health status badge
- `ProviderHealthMetrics.tsx` - Uptime, response time, error rate

**New page:** `src/pages/ProvidersPage.tsx`

**API Integration:** TenantConfigService `/llm-configs` endpoints

---

## Phase 5: Enhanced Rules (Week 4) - COMPLEX

**New components:** `src/components/rules/`
- `RuleTestPanel.tsx` - Test rules against prompts
- `RuleTypeSelector.tsx` - Dynamic form fields

**Update:** `src/pages/RulesManagementPage.tsx`
- Add hard_block, redaction rule types
- Rule testing interface

---

## Phase 6: Token Limits & Budget Management (Week 4-5)

**New components:** `src/components/budget/`
- `TokenLimitOverview.tsx` - 3-tier hierarchy visualization
- `TenantLimitForm.tsx` - Tenant limits
- `RoleLimitForm.tsx` - Role limits
- `UserLimitForm.tsx` - User overrides
- `UsageProgressBar.tsx` - Multi-level progress
- `QuotaCheckStatus.tsx` - Real-time quota check
- `CostProjection.tsx` - Cost forecast

**New page:** `src/pages/TokenLimitsPage.tsx`

**Multi-Level Limits:**
1. Tenant Level - Organization-wide caps
2. Role Level - Per-role limits
3. User Level - Individual overrides with expiration

**API Integration:** UsageTrackingService

---

## Phase 7: Alerts & Audit Logs (Week 5-6) - COMPLEX

**New components:** `src/components/alerts/`
- `AlertList.tsx` - Alert table
- `AlertDetails.tsx` - Alert detail dialog
- `AuditLogTable.tsx` - Audit log table
- `AuditLogExport.tsx` - Export dialog

**New page:** `src/pages/AlertsPage.tsx` (2 tabs)

---

## Critical Files Summary

| File | Action | Backend Service |
|------|--------|-----------------|
| `src/types/tenant.ts` | CREATE | TenantConfigService |
| `src/types/usage.ts` | CREATE | UsageTrackingService |
| `src/types/rule.ts` | CREATE | RuleManagementService |
| `src/types/provider.ts` | CREATE | TenantConfigService |
| `src/api/tenants.ts` | CREATE | TenantConfigService |
| `src/api/usage.ts` | CREATE | UsageTrackingService |
| `src/api/rules.ts` | UPDATE | RuleManagementService |
| `src/pages/UsersPage.tsx` | CREATE | TenantConfigService |
| `src/pages/ProvidersPage.tsx` | CREATE | TenantConfigService |
| `src/pages/TokenLimitsPage.tsx` | CREATE | UsageTrackingService |
| `src/pages/AlertsPage.tsx` | CREATE | (Future service) |

---

## Backend Integration Strategy

### Service Communication Patterns

**TenantConfigService:**
- Tenant context cached in Redis (5 min TTL)
- User onboarding, LLM config management

**UsageTrackingService:**
- Real-time quota checks (< 5ms with Redis)
- Async usage recording (fire-and-forget)
- Multi-level token limits

**RuleManagementService:**
- Rules cached in gateway memory
- Pub/sub for rule changes

### Error Handling

```typescript
interface APIError {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Authentication Flow

1. Frontend gets Azure AD token via MSAL
2. Token includes tenant ID (`tid`) and user ID (`sub`)
3. Backend validates token and extracts claims
4. All operations scoped to authenticated tenant

---

## Timeline Estimate

- **Phase 1 (Foundation):** 5 days
- **Phase 2 (Dashboard):** 3 days
- **Phase 3 (Users):** 5 days
- **Phase 4 (Providers):** 3 days
- **Phase 5 (Rules):** 4 days
- **Phase 6 (Token Limits):** 4 days
- **Phase 7 (Alerts):** 5 days
- **Testing & Polish:** 3 days

**Total:** ~32 days (6-7 weeks)

---

## Success Criteria

- [ ] All 7 phases implemented and tested
- [ ] 35+ new files created
- [ ] All navigation links functional
- [ ] Forms validate correctly with Zod
- [ ] API error handling with user-friendly messages
- [ ] Mobile responsive (≥375px width)
- [ ] No console errors in production build
- [ ] All CRUD operations work end-to-end with backend

---

## Next Steps

1. **Backend Alignment First:**
   - Review backend API documentation
   - Test backend endpoints with Postman
   - Confirm authentication flow

2. **Phase 1 (Foundation):**
   - Create TypeScript types matching backend models
   - Set up API modules for each microservice
   - Implement custom hooks and common components

3. **Incremental Feature Implementation:**
   - Proceed sequentially through phases 2-7
   - Test each feature against actual backend

4. **Integration Testing:**
   - End-to-end tests with real backend services
   - Verify quota checks enforce limits correctly

5. **Deployment:**
   - Deploy to staging
   - User acceptance testing
   - Production deployment with feature flags

---

## Questions for Backend Team

1. **Alerts & Audit Logs:** Which service will handle these?
2. **WebSocket Support:** For real-time quota updates?
3. **Export Functionality:** Server-side export for large datasets?
4. **Rule Testing:** Does `/tenants/{id}/rules/test` endpoint exist?
5. **Health Monitoring:** Automatic or manual health checks?
