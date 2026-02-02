# Redux Usage Examples

This file demonstrates how to use the Redux store in components.

## Importing Hooks

```typescript
import { useAppDispatch, useAppSelector } from '../redux/hooks';
```

## 1. Authentication (authSlice)

### Setting authenticated user

```typescript
import { setAuthUser, clearAuth } from '../redux/slices/authSlice';
import { useAppDispatch } from '../redux/hooks';

function LoginComponent() {
  const dispatch = useAppDispatch();

  const handleLogin = async () => {
    const userAccount = await msalInstance.loginPopup();

    // Store user in Redux
    dispatch(setAuthUser(userAccount));
  };

  const handleLogout = () => {
    // Clear auth state
    dispatch(clearAuth());
  };
}
```

### Reading auth state

```typescript
import { useAppSelector } from '../redux/hooks';
import { selectIsAuthenticated, selectTenantId } from '../redux/slices/authSlice';

function DashboardComponent() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const tenantId = useAppSelector(selectTenantId);

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <div>Welcome! Tenant: {tenantId}</div>;
}
```

## 2. Notifications (notificationsSlice)

### Showing toast notifications

```typescript
import { addSuccess, addError, addWarning } from '../redux/slices/notificationsSlice';
import { useAppDispatch } from '../redux/hooks';

function UserFormComponent() {
  const dispatch = useAppDispatch();

  const handleSave = async () => {
    try {
      await saveUser(userData);

      // Show success notification
      dispatch(addSuccess('User created successfully!'));
    } catch (error) {
      // Show error notification
      dispatch(addError('Failed to create user'));
    }
  };

  const handleWarning = () => {
    dispatch(addWarning('Token limit approaching 90%'));
  };
}
```

### Displaying notifications (in a Toast component)

```typescript
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { selectNotifications, removeNotification } from '../redux/slices/notificationsSlice';
import { Snackbar, Alert } from '@mui/material';

function ToastNotifications() {
  const notifications = useAppSelector(selectNotifications);
  const dispatch = useAppDispatch();

  return (
    <>
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.autoHideDuration}
          onClose={() => dispatch(removeNotification(notification.id))}
        >
          <Alert severity={notification.severity}>
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
}
```

## 3. Caching (cacheSlice)

### Caching dashboard data

```typescript
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { setCacheEntry, selectCacheEntry, selectIsCacheValid, CacheKeys } from '../redux/slices/cacheSlice';

function DashboardComponent() {
  const dispatch = useAppDispatch();
  const tenantId = useAppSelector(selectTenantId);

  const cacheKey = CacheKeys.dashboardOverview(tenantId!, '7d');

  // Check if cached data exists and is valid
  const cachedData = useAppSelector(selectCacheEntry(cacheKey));
  const isCacheValid = useAppSelector(selectIsCacheValid(cacheKey));

  useEffect(() => {
    if (isCacheValid && cachedData) {
      // Use cached data
      setDashboardData(cachedData);
      return;
    }

    // Fetch fresh data
    const fetchData = async () => {
      const data = await fetchDashboardOverview(tenantId, '7d');

      // Cache the data (5 minute TTL by default)
      dispatch(setCacheEntry({
        key: cacheKey,
        data,
        ttl: 300000, // 5 minutes
      }));

      setDashboardData(data);
    };

    fetchData();
  }, [tenantId, isCacheValid]);
}
```

### Invalidating cache

```typescript
import { removeCacheEntry, clearCache, CacheKeys } from '../redux/slices/cacheSlice';

function UserFormComponent() {
  const dispatch = useAppDispatch();

  const handleSave = async () => {
    await saveUser(userData);

    // Invalidate specific cache
    dispatch(removeCacheEntry(CacheKeys.topUsers(tenantId, 10)));

    // Or clear all cache
    dispatch(clearCache());
  };
}
```

## 4. Combining Multiple Slices

```typescript
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { selectTenantId } from '../redux/slices/authSlice';
import { addError, addSuccess } from '../redux/slices/notificationsSlice';
import { setCacheEntry, CacheKeys } from '../redux/slices/cacheSlice';

function ComplexComponent() {
  const dispatch = useAppDispatch();
  const tenantId = useAppSelector(selectTenantId);

  const fetchAndCacheData = async () => {
    try {
      const data = await apiCall();

      // Cache the result
      dispatch(setCacheEntry({
        key: CacheKeys.tokenUsage(tenantId!, '30d'),
        data,
      }));

      // Show success
      dispatch(addSuccess('Data loaded successfully'));
    } catch (error) {
      // Show error
      dispatch(addError('Failed to load data'));
    }
  };
}
```

## Best Practices

1. **Always use typed hooks** (`useAppDispatch`, `useAppSelector`) instead of plain `useDispatch` and `useSelector`

2. **Use cache for expensive operations**:
   - Dashboard metrics
   - Token usage analytics
   - Quota checks

3. **Clear cache when data changes**:
   - After creating/updating/deleting resources
   - Use `removeCacheEntry` for specific cache or `clearCache` for all

4. **Use notification helpers**:
   - `addSuccess` for successful operations
   - `addError` for failures
   - `addWarning` for warnings (e.g., approaching limits)
   - `addInfo` for informational messages

5. **Keep Redux minimal**:
   - Don't store form state in Redux (use React Hook Form)
   - Don't store local UI state (use useState)
   - Only store: auth, notifications, and cache

## Integration with AuthContext

The Redux auth slice should sync with the existing AuthContext:

```typescript
// In AuthContext.tsx
import { useAppDispatch } from '../redux/hooks';
import { setAuthUser, clearAuth } from '../redux/slices/authSlice';

function AuthProvider({ children }) {
  const dispatch = useAppDispatch();

  const login = async () => {
    const result = await msalInstance.loginPopup();
    setAccount(result.account);

    // Also update Redux
    dispatch(setAuthUser(result.account));
  };

  const logout = () => {
    msalInstance.logout();
    setAccount(null);

    // Also update Redux
    dispatch(clearAuth());
  };

  // ... rest of AuthContext
}
```
