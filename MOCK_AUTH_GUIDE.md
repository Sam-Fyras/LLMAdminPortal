# Mock Authentication Guide

## Overview

Mock authentication mode allows you to test and develop the application without requiring Azure AD configuration. This is useful for:
- Local development
- Testing Phase 1 components (Redux, hooks, UI components)
- CI/CD environments
- Demo purposes

## How It Works

When `REACT_APP_MOCK_AUTH=true` is set:
- ✅ MSAL (Azure AD) is **completely bypassed**
- ✅ Application auto-logs in with a **mock test user**
- ✅ All protected routes are **accessible**
- ✅ API calls include a **mock JWT token** in headers
- ✅ No Azure AD credentials needed

## Enabling Mock Authentication

### Development Mode (Recommended)

Mock auth is **already enabled** in `.env.development`:

```bash
REACT_APP_MOCK_AUTH=true
```

Just run:
```bash
npm start
```

The app will automatically log you in as the test user.

### Production Mode

To use mock auth in production (not recommended for real deployments):

1. Edit `.env.production`:
   ```bash
   REACT_APP_MOCK_AUTH=true
   ```

2. Build and run:
   ```bash
   npm run build
   npm install -g serve
   serve -s build
   ```

## Mock User Details

When mock auth is enabled, you're automatically logged in as:

```javascript
{
  username: 'testuser@example.com',
  name: 'Test User',
  tenantId: 'mock-tenant-123',
  userId: 'mock-local-account-id'
}
```

**Mock JWT Token:** `mock-jwt-token-for-testing`

## Disabling Mock Authentication

To use **real Azure AD authentication**:

1. Edit `.env.development`:
   ```bash
   REACT_APP_MOCK_AUTH=false
   # or remove the line entirely
   ```

2. Configure Azure AD credentials:
   ```bash
   REACT_APP_AZURE_CLIENT_ID=your-actual-client-id
   REACT_APP_AZURE_TENANT_ID=your-actual-tenant-id
   ```

3. Restart the dev server:
   ```bash
   npm start
   ```

## Visual Indicators

When mock auth is active, you'll see console logs:
```
🔧 Mock Auth Mode: Auto-login with test user
🔧 Mock Auth Mode: Login successful
🔧 Mock Auth Mode: Logout
```

## Testing Phase 1 Components

With mock auth enabled, you can test:

### ✅ Redux Store
- Auth state (auto-populated with mock user)
- Notifications (toast messages)
- Cache (dashboard data caching)

### ✅ Custom Hooks
- `useToast` - Test notifications
- `useDebounce` - Test search debouncing
- `usePagination` - Test table pagination
- `useConfirmDialog` - Test confirmation dialogs

### ✅ Common Components
- `ConfirmDialog` - Test confirmation flows
- `LoadingSpinner` - Test loading states
- `EmptyState` - Test empty list states
- `ErrorBoundary` - Test error handling

### ✅ API Modules
All API calls will include the mock token:
```
Authorization: Bearer mock-jwt-token-for-testing
```

**Note:** Backend API calls will fail if the backend doesn't accept mock tokens. Use mock API responses or configure backend to accept the mock token for testing.

## Troubleshooting

### Issue: Still getting MSAL errors

**Solution:** Ensure you've:
1. Set `REACT_APP_MOCK_AUTH=true` in `.env.development`
2. Restarted the dev server completely
3. Cleared browser cache

```bash
# Stop server (Ctrl+C)
# Clear cache
rm -rf node_modules/.cache
# Restart
npm start
```

### Issue: Mock user not appearing

**Solution:** Check browser console for:
```
🔧 Mock Auth Mode: Auto-login with test user
```

If not present, verify the environment variable:
```bash
echo $REACT_APP_MOCK_AUTH  # Should output: true
```

### Issue: Protected routes still redirecting to login

**Solution:** Mock auth auto-logs you in on app load. If redirecting:
1. Check console for errors
2. Verify `isAuthenticated` is `true` in Redux DevTools
3. Clear session storage and reload

## Production Considerations

⚠️ **IMPORTANT:** Never deploy to production with mock auth enabled!

Before deploying:
1. ✅ Set `REACT_APP_MOCK_AUTH=false` in `.env.production`
2. ✅ Configure real Azure AD credentials
3. ✅ Test login flow with real Azure AD
4. ✅ Verify no console logs show "🔧 Mock Auth Mode"

## Environment Variables Reference

| Variable | Values | Description |
|----------|--------|-------------|
| `REACT_APP_MOCK_AUTH` | `true` / `false` | Enable/disable mock authentication |
| `REACT_APP_AZURE_CLIENT_ID` | Azure AD Client ID | Required when mock auth is disabled |
| `REACT_APP_AZURE_TENANT_ID` | Azure AD Tenant ID | Required when mock auth is disabled |
| `REACT_APP_API_BASE_URL` | API URL | Backend API base URL |

## Next Steps

With mock auth enabled, you can now:
1. ✅ Test all Phase 1 components
2. ✅ Run the manual testing plan (`PHASE1_TESTING_PLAN.md`)
3. ✅ Develop Phase 2 features without auth blocking
4. ✅ Create test users and roles
5. ✅ Build UI components without backend dependencies

---

**Happy Testing! 🚀**
