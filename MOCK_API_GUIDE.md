# Mock API Guide

## Overview

The Mock API system allows you to develop and test the entire frontend application without needing any backend services running. All API calls are intercepted and return realistic mock data.

## Features

✅ **Complete Backend Simulation**
- All 3 microservices mocked (TenantConfigService, UsageTrackingService, RuleManagementService)
- 60+ API endpoints with mock responses
- Full CRUD operations supported
- Realistic data with relationships

✅ **Configurable Network Delay**
- Simulates real network latency (default 500ms)
- Test loading states and spinners
- Adjustable per environment

✅ **State Preservation**
- Create/update/delete operations persist during session
- Data resets on page refresh
- Perfect for testing workflows

✅ **Developer Friendly**
- Console indicators show mock mode is active
- Easy to toggle on/off
- Works alongside mock authentication

## Quick Start

### Enable Mock API

Mock API is **already enabled** by default in development:

```bash
# .env.development
REACT_APP_MOCK_API=true
REACT_APP_MOCK_API_DELAY=500
```

Just run:
```bash
npm start
```

You'll see in the console:
```
🔧 Mock API Mode: All API requests will return mock data
🔧 Mock API Delay: 500ms simulated network latency
✅ Mock API initialized successfully
```

### Disable Mock API (Use Real Backend)

Edit `.env.development`:
```bash
REACT_APP_MOCK_API=false
```

Restart the dev server.

## Mock Data Overview

### Tenants & Users

**1 Tenant:**
- Name: Acme Corporation
- Tier: Enterprise
- Status: Active

**4 Mock Users:**
| Email | Name | Role | Status | Models |
|-------|------|------|--------|--------|
| admin@acme.com | Admin User | admin | active | gpt-4, claude-3-opus, gemini-pro |
| analyst@acme.com | Data Analyst | analyst | active | gpt-4, claude-3-sonnet |
| dev@acme.com | Developer User | developer | active | gpt-4, claude-3-sonnet, gemini-pro |
| viewer@acme.com | Viewer User | viewer | inactive | gpt-3.5-turbo |

### LLM Configurations

**3 LLM Providers:**
1. **OpenAI Production** (default)
   - Models: gpt-4, gpt-4-turbo, gpt-3.5-turbo
   - Health: 99.9% uptime, 450ms avg response
   - Status: Healthy

2. **Anthropic Claude**
   - Models: claude-3-opus, claude-3-sonnet, claude-3-haiku
   - Health: 99.8% uptime, 520ms avg response
   - Status: Healthy

3. **Google Vertex AI**
   - Models: gemini-pro, gemini-pro-vision
   - Health: 98.5% uptime, 680ms avg response
   - Status: Degraded

### Token Limits

**Tenant Level:**
- Monthly: 10M tokens (4.5M used - 45%)
- Daily: 500K tokens (125K used - 25%)
- Hourly: 50K tokens (8.5K used - 17%)

**Role Limits (4 roles):**
- Admin: 5M/month, 200K/day
- Developer: 2M/month, 100K/day
- Analyst: 1M/month, 50K/day
- Viewer: 100K/month, 5K/day

**User Overrides:**
- Data Analyst has special limit: 1.5M/month (increased for Q1 project)

### Usage Analytics

**7 Days of Mock Data:**
- Total requests: 15,420
- Success rate: 98.8%
- Total tokens: 8.75M
- Total cost: $437.50
- Avg response time: 1,150ms

**By Model:**
- gpt-4: 48.6% ($255)
- claude-3-sonnet: 24.0% ($105)
- gpt-3.5-turbo: 18.0% ($47.25)
- gemini-pro: 9.4% ($30.25)

**Top Users:**
1. admin@acme.com - 3.2M tokens
2. analyst@acme.com - 2.65M tokens
3. dev@acme.com - 2.35M tokens

### Rules

**6 Mock Rules:**
1. **Daily Token Limit** - Token limit enforcement
2. **Premium Model Restriction** - Allow only admin/power-user
3. **Rate Limit** - 10 req/min, 100 req/hour
4. **Block Sensitive Content** - Hard block for keywords (password, api_key, secret)
5. **PII Redaction** - Redact email, phone, SSN (disabled)
6. **Monthly Cost Budget** - $5K budget with 80% alert

### Roles

**5 Mock Roles:**
1. Admin - Unlimited access
2. Power User - High limits, premium models
3. Developer - Standard access
4. Analyst - Limited access
5. Viewer - Read-only, minimal tokens

## API Endpoints Mocked

### TenantConfigService (20+ endpoints)

**Tenant Management:**
```
GET    /api/v1/tenants/{id}
PUT    /api/v1/tenants/{id}
DELETE /api/v1/tenants/{id}
GET    /api/v1/tenants/{id}/context
GET    /api/v1/tenants/{id}/tier
```

**User Management:**
```
GET    /api/v1/tenants/{id}/users
POST   /api/v1/tenants/{id}/users
GET    /api/v1/tenants/{id}/users/{user_id}
PUT    /api/v1/tenants/{id}/users/{user_id}
DELETE /api/v1/tenants/{id}/users/{user_id}
```

**LLM Configuration:**
```
GET    /api/v1/tenants/{id}/llm-configs
POST   /api/v1/tenants/{id}/llm-configs
GET    /api/v1/tenants/{id}/llm-configs/{config_id}
PUT    /api/v1/tenants/{id}/llm-configs/{config_id}
DELETE /api/v1/tenants/{id}/llm-configs/{config_id}
POST   /api/v1/tenants/{id}/llm-configs/test
GET    /api/v1/tenants/{id}/llm-configs/{config_id}/models
```

### UsageTrackingService (25+ endpoints)

**Usage Tracking:**
```
POST   /api/v1/usage/{tenant}/record/{user}
POST   /api/v1/usage/batch
GET    /api/v1/usage/current/{tenant}
GET    /api/v1/usage/current/{tenant}/users/{user}
GET    /api/v1/usage/remaining/{tenant}
```

**Tenant Limits:**
```
GET    /api/v1/limits/{tenant}
PUT    /api/v1/limits/{tenant}
POST   /api/v1/limits/{tenant}/reset
```

**Role Limits:**
```
GET    /api/v1/limits/{tenant}/roletokenlimit
POST   /api/v1/limits/{tenant}/roletokenlimit
GET    /api/v1/limits/{tenant}/roletokenlimit/{role}
PUT    /api/v1/limits/{tenant}/roletokenlimit/{role}
DELETE /api/v1/limits/{tenant}/roletokenlimit/{role}
```

**User Limits:**
```
GET    /api/v1/limits/{tenant}/usertokenlimit
POST   /api/v1/limits/{tenant}/usertokenlimit
GET    /api/v1/limits/{tenant}/usertokenlimit/{user}
PUT    /api/v1/limits/{tenant}/usertokenlimit/{user}
DELETE /api/v1/limits/{tenant}/usertokenlimit/{user}
```

**Analytics:**
```
GET    /api/v1/analytics/{tenant}/usage
GET    /api/v1/analytics/{tenant}/breakdown
GET    /api/v1/analytics/{tenant}/trends
GET    /api/v1/analytics/{tenant}/top-users
GET    /api/v1/analytics/{tenant}/by-model
```

### RuleManagementService (15+ endpoints)

**Rule CRUD:**
```
GET    /api/v1/tenants/{id}/rules
POST   /api/v1/tenants/{id}/rules
GET    /api/v1/tenants/{id}/rules/{rule_id}
PUT    /api/v1/tenants/{id}/rules/{rule_id}
DELETE /api/v1/tenants/{id}/rules/{rule_id}
PATCH  /api/v1/tenants/{id}/rules/{rule_id}/status

# Legacy API (for existing components)
GET    /api/v1/tenant/rules
POST   /api/v1/tenant/rules
...
```

**Rule Operations:**
```
POST   /api/v1/tenants/{id}/rules/validate
POST   /api/v1/tenants/{id}/rules/test
POST   /api/v1/tenants/{id}/rules/import
GET    /api/v1/tenants/{id}/rules/export
```

**Rule Versioning:**
```
GET    /api/v1/tenants/{id}/rules/{rule_id}/history
POST   /api/v1/tenants/{id}/rules/{rule_id}/rollback/{version}
GET    /api/v1/tenants/{id}/rules/{rule_id}/versions/{version}
```

### Role Management (6 endpoints)

```
GET    /api/v1/role/{tenant}
POST   /api/v1/role/{tenant}
GET    /api/v1/role/{tenant}/{role_id}
PUT    /api/v1/role/{tenant}/{role_id}
DELETE /api/v1/role/{tenant}/{role_id}
GET    /api/v1/role/{tenant}/{role_id}/users
```

## Testing Scenarios

### Scenario 1: User Management Workflow

```javascript
// 1. List users
GET /api/v1/tenants/tenant-123/users
// Returns 4 mock users

// 2. Create new user
POST /api/v1/tenants/tenant-123/users
Body: { email: "newuser@acme.com", name: "New User", role: "developer" }
// Returns created user with ID

// 3. Update user
PUT /api/v1/tenants/tenant-123/users/user-5
Body: { role: "admin" }
// Returns updated user

// 4. Delete user
DELETE /api/v1/tenants/tenant-123/users/user-5
// Returns 204 No Content
```

### Scenario 2: Analytics Dashboard

```javascript
// Get usage analytics for last 7 days
GET /api/v1/analytics/tenant-123/usage?timeRange=7d

// Returns:
// - 7 days of daily usage data
// - Usage by model breakdown
// - Top 3 users by tokens
// - Cost breakdown
```

### Scenario 3: Rule Creation & Testing

```javascript
// 1. Create rule
POST /api/v1/tenants/tenant-123/rules
Body: {
  name: "Test Rule",
  type: "token_limit",
  conditions: { max_tokens: 10000 }
}

// 2. Validate rule
POST /api/v1/tenants/tenant-123/rules/validate
// Returns validation result

// 3. Test rule
POST /api/v1/tenants/tenant-123/rules/test
Body: {
  rule_id: "rule-7",
  sample_data: { prompt: "Test prompt", tokens: 15000 }
}
// Returns test result (should block - exceeds limit)
```

### Scenario 4: Token Limit Management

```javascript
// 1. Get tenant limits
GET /api/v1/limits/tenant-123
// Returns: monthly 10M, daily 500K, hourly 50K

// 2. Create role limit
POST /api/v1/limits/tenant-123/roletokenlimit
Body: {
  role_id: "role-custom",
  role_name: "Custom Role",
  monthly_limit: 750000,
  daily_limit: 30000
}

// 3. Create user override
POST /api/v1/limits/tenant-123/usertokenlimit
Body: {
  user_id: "user-3",
  monthly_limit: 1000000,
  override_role_limit: true,
  reason: "Special project approval"
}

// 4. Check user quota
GET /api/v1/usage/current/tenant-123/users/user-3
// Returns QuotaCheck with can_proceed, remaining tokens, etc.
```

## Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_MOCK_API` | `false` | Enable/disable mock API |
| `REACT_APP_MOCK_API_DELAY` | `500` | Response delay in milliseconds |

### Customizing Mock Data

To customize mock data, edit files in `src/mocks/data/`:

```typescript
// src/mocks/data/tenants.ts
export const mockUsers: User[] = [
  // Add your custom users here
];

// src/mocks/data/usage.ts
export const mockUsageAnalytics: UsageAnalytics = {
  // Customize analytics data
};

// src/mocks/data/rules.ts
export const mockTenantRules: TenantRule[] = {
  // Add custom rules
};
```

### Adjusting Response Delay

**Fast (Testing):**
```bash
REACT_APP_MOCK_API_DELAY=100  # Quick responses
```

**Realistic (Development):**
```bash
REACT_APP_MOCK_API_DELAY=500  # Moderate delay
```

**Slow (Testing loading states):**
```bash
REACT_APP_MOCK_API_DELAY=2000  # Slow network simulation
```

## Combining with Mock Auth

You can use **both** mock auth and mock API together:

```bash
# .env.development
REACT_APP_MOCK_AUTH=true   # No Azure AD needed
REACT_APP_MOCK_API=true    # No backend needed
```

This gives you a **fully standalone frontend** for development!

## Console Output

When mock API is enabled, you'll see:

```
🔧 Mock API Mode: All API requests will return mock data
🔧 Mock API Delay: 500ms simulated network latency
✅ Mock API initialized successfully
🔧 All backend services mocked:
   - TenantConfigService (tenants, users, LLM configs)
   - UsageTrackingService (usage tracking, token limits, analytics)
   - RuleManagementService (rules CRUD, validation, versioning)
```

## Troubleshooting

### Issue: API calls still hitting real backend

**Solution:**
1. Verify `.env.development` has `REACT_APP_MOCK_API=true`
2. Restart dev server completely
3. Clear browser cache
4. Check console for mock API initialization messages

### Issue: Mock data not persisting

**Expected behavior:** Mock data resets on page refresh. This is intentional.

**Solution:** If you need persistent mock data:
- Use localStorage in mock adapter
- Or use real backend for persistence

### Issue: Want to test specific API failure

**Solution:** Edit `src/mocks/mockApi.ts`:

```typescript
// Force a 500 error for specific endpoint
mock.onGet(/\/api\/v1\/tenants\/[\w-]+/).reply(500, {
  error: 'Internal server error'
});
```

### Issue: Need to test real API alongside mocks

**Solution:** Mock API uses regex patterns. Unmatched requests pass through:

```typescript
// In mockApi.ts, last line:
mock.onAny().passThrough();  // Unmocked requests hit real backend
```

## Production Deployment

⚠️ **CRITICAL:** Never deploy with mock API enabled!

**Before deployment:**
```bash
# .env.production
REACT_APP_MOCK_API=false
REACT_APP_MOCK_AUTH=false
```

**Verify in build:**
```bash
npm run build

# Check build output
grep -r "Mock API Mode" build/  # Should find nothing
```

## Benefits

✅ **Faster Development**
- No backend setup needed
- Instant feedback
- No network delays (configurable)

✅ **Reliable Testing**
- Consistent mock data
- No backend downtime issues
- Perfect for demos

✅ **Parallel Development**
- Frontend and backend teams work independently
- Mock contracts match real API
- Easy integration later

✅ **Offline Development**
- Work without internet
- No VPN needed
- Local-only development

## Next Steps

With mock API enabled:
1. ✅ Test all CRUD operations
2. ✅ Build new features without backend
3. ✅ Create component demos
4. ✅ Test error scenarios
5. ✅ Develop Phase 2+ features

---

**Happy Development! 🚀**
