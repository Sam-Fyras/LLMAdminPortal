# Phase 1 Testing Plan - Foundation Components

**Version:** 1.0
**Date:** 2026-02-02
**Scope:** Manual testing for Type System, Redux Store, Custom Hooks, Common Components, and API Modules

---

## Table of Contents

1. [Testing Environment Setup](#testing-environment-setup)
2. [Type System Testing](#type-system-testing)
3. [Redux Store Testing](#redux-store-testing)
4. [Custom Hooks Testing](#custom-hooks-testing)
5. [Common Components Testing](#common-components-testing)
6. [API Modules Testing](#api-modules-testing)
7. [Integration Testing](#integration-testing)
8. [Testing Checklist](#testing-checklist)

---

## Testing Environment Setup

### Prerequisites

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```
   - Verify server starts without errors
   - Note: Server should run on http://localhost:3000

3. **Open Browser Console**
   - Open Chrome DevTools (F12)
   - Navigate to Console tab
   - Clear any existing errors

4. **Backend Mock Server (Optional)**
   - If backend is not available, consider setting up mock API responses
   - Use tools like MSW (Mock Service Worker) or json-server

### Expected State
- ✅ No TypeScript compilation errors
- ✅ No console errors on page load
- ✅ React app renders successfully

---

## Type System Testing

**Objective:** Verify TypeScript types compile correctly and provide proper intellisense

### Test 1.1: Type Imports

**Steps:**
1. Create a test file: `src/test-types.ts`
2. Add the following imports:
   ```typescript
   import {
     User, Tenant, Tier,
     TokenLimit, RoleTokenLimit, UserTokenLimit, QuotaCheck,
     TenantRule, RuleType,
     LLMConfig, ProviderType, HealthStatus,
     APIResponse, PaginatedResponse
   } from './types';
   ```
3. Run TypeScript compiler:
   ```bash
   npx tsc --noEmit
   ```

**Expected Result:**
- ✅ No compilation errors
- ✅ All types import successfully

### Test 1.2: Type Structure Validation

**Steps:**
1. In `src/test-types.ts`, create test objects:
   ```typescript
   const testUser: User = {
     id: 'user123',
     tenantId: 'tenant123',
     userId: 'user123',
     schemaVersion: '1.0',
     createdDate: '2026-02-02T00:00:00Z',
     updatedDate: '2026-02-02T00:00:00Z',
     email: 'test@example.com',
     name: 'Test User',
     role: 'admin',
     status: 'active',
     allowedModels: ['gpt-4', 'claude-3'],
   };

   const testQuotaCheck: QuotaCheck = {
     can_proceed: true,
     effective_limit: 10000,
     current_usage: 5000,
     remaining: 5000,
     checks: {
       tenant_level: true,
       role_level: true,
       user_level: true,
     },
     reset_times: {
       monthly: '2026-03-01T00:00:00Z',
       daily: '2026-02-03T00:00:00Z',
     },
   };

   const testRule: TenantRule = {
     id: 'rule123',
     tenantId: 'tenant123',
     schemaVersion: '1.0',
     createdDate: '2026-02-02T00:00:00Z',
     updatedDate: '2026-02-02T00:00:00Z',
     name: 'Test Rule',
     type: 'token_limit',
     priority: 1,
     enabled: true,
     conditions: {},
     parameters: {},
     version: 1,
   };
   ```

2. Run TypeScript compiler again:
   ```bash
   npx tsc --noEmit
   ```

**Expected Result:**
- ✅ No type errors
- ✅ TypeScript validates all required fields
- ✅ Optional fields work correctly

### Test 1.3: Type Safety Validation

**Steps:**
1. Try to create invalid objects (should fail compilation):
   ```typescript
   // Should fail: invalid role
   const invalidUser: User = {
     ...testUser,
     role: 'invalid_role', // TypeScript should error
   };

   // Should fail: missing required field
   const incompleteQuota: QuotaCheck = {
     can_proceed: true,
     // Missing other required fields
   };
   ```

2. Run TypeScript compiler:
   ```bash
   npx tsc --noEmit
   ```

**Expected Result:**
- ✅ TypeScript shows errors for invalid data
- ✅ Required fields are enforced
- ✅ Enum values are validated

### Test 1.4: Backward Compatibility

**Steps:**
1. Check that legacy `Rule` type still works:
   ```typescript
   import { Rule } from './types';

   const legacyRule: Rule = {
     id: 'rule123',
     name: 'Legacy Rule',
     type: 'token_limit',
     priority: 1,
     enabled: true,
     conditions: {},
   };
   ```

2. Run TypeScript compiler

**Expected Result:**
- ✅ Legacy `Rule` type still works
- ✅ No breaking changes for existing components

**Cleanup:**
- Delete `src/test-types.ts` after testing

---

## Redux Store Testing

**Objective:** Verify Redux store, slices, and hooks work correctly

### Test 2.1: Redux Provider Integration

**Steps:**
1. Open `src/index.tsx`
2. Verify Redux Provider wraps the App:
   ```typescript
   <Provider store={store}>
     <App />
   </Provider>
   ```
3. Start the app and check console for Redux DevTools connection

**Expected Result:**
- ✅ Redux DevTools extension shows store state
- ✅ Initial state visible: `{ auth: {...}, notifications: {...}, cache: {...} }`

### Test 2.2: Auth Slice Testing

**Steps:**
1. Create a test component: `src/components/test/ReduxTest.tsx`
   ```typescript
   import React from 'react';
   import { useAppSelector, useAppDispatch } from '../../redux/hooks';
   import { setAuthUser, clearAuth } from '../../redux/slices/authSlice';

   export const ReduxTest: React.FC = () => {
     const dispatch = useAppDispatch();
     const { isAuthenticated, user, tenantId } = useAppSelector((state) => state.auth);

     const handleLogin = () => {
       dispatch(setAuthUser({
         user: {
           id: 'test123',
           name: 'Test User',
           email: 'test@example.com',
         },
         tenantId: 'tenant123',
         userId: 'user123',
       }));
     };

     const handleLogout = () => {
       dispatch(clearAuth());
     };

     return (
       <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
         <h3>Redux Auth Slice Test</h3>
         <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
         <p>User: {user?.name || 'None'}</p>
         <p>Tenant ID: {tenantId || 'None'}</p>
         <button onClick={handleLogin}>Login</button>
         <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</button>
       </div>
     );
   };
   ```

2. Temporarily add to `src/App.tsx`:
   ```typescript
   import { ReduxTest } from './components/test/ReduxTest';

   // Add to render:
   <ReduxTest />
   ```

3. Test in browser:
   - Click "Login" button
   - Verify state updates in Redux DevTools
   - Verify UI shows authenticated state
   - Click "Logout" button
   - Verify state clears

**Expected Result:**
- ✅ Login sets auth state correctly
- ✅ User info displays
- ✅ Logout clears state
- ✅ Redux DevTools shows state changes

### Test 2.3: Notifications Slice Testing

**Steps:**
1. Update `ReduxTest.tsx`:
   ```typescript
   import { addSuccess, addError, addWarning, addInfo, removeNotification } from '../../redux/slices/notificationsSlice';

   // Add to component:
   const notifications = useAppSelector((state) => state.notifications.notifications);

   const handleSuccess = () => {
     dispatch(addSuccess('Operation successful!'));
   };

   const handleError = () => {
     dispatch(addError('An error occurred!'));
   };

   const handleWarning = () => {
     dispatch(addWarning('Warning message!'));
   };

   const handleInfo = () => {
     dispatch(addInfo('Info message!'));
   };

   // Add to render:
   <div>
     <h4>Notifications Test</h4>
     <button onClick={handleSuccess}>Success</button>
     <button onClick={handleError}>Error</button>
     <button onClick={handleWarning}>Warning</button>
     <button onClick={handleInfo}>Info</button>
     <div>
       <h5>Active Notifications:</h5>
       {notifications.map(notif => (
         <div key={notif.id} style={{
           padding: '10px',
           margin: '5px',
           backgroundColor:
             notif.severity === 'error' ? '#ffebee' :
             notif.severity === 'warning' ? '#fff3e0' :
             notif.severity === 'success' ? '#e8f5e9' : '#e3f2fd'
         }}>
           {notif.message} ({notif.severity})
           <button onClick={() => dispatch(removeNotification(notif.id))}>
             Close
           </button>
         </div>
       ))}
     </div>
   </div>
   ```

2. Test each notification type:
   - Click "Success" button
   - Click "Error" button
   - Click "Warning" button
   - Click "Info" button
   - Verify notifications appear in Redux state
   - Click "Close" on a notification
   - Verify it's removed

**Expected Result:**
- ✅ All notification types work
- ✅ Notifications appear in state
- ✅ Remove notification works
- ✅ Each notification has unique ID

### Test 2.4: Cache Slice Testing

**Steps:**
1. Update `ReduxTest.tsx`:
   ```typescript
   import { setCache, getCache, invalidateCache } from '../../redux/slices/cacheSlice';

   const handleSetCache = () => {
     dispatch(setCache({
       key: 'test-key',
       data: { message: 'Cached data', timestamp: Date.now() },
       ttl: 60000, // 1 minute
     }));
   };

   const handleGetCache = () => {
     const cached = getCache('test-key')(store.getState());
     console.log('Cached data:', cached);
     alert(cached ? JSON.stringify(cached) : 'No cache found');
   };

   const handleInvalidate = () => {
     dispatch(invalidateCache('test-key'));
   };

   // Add to render:
   <div>
     <h4>Cache Test</h4>
     <button onClick={handleSetCache}>Set Cache</button>
     <button onClick={handleGetCache}>Get Cache</button>
     <button onClick={handleInvalidate}>Invalidate Cache</button>
   </div>
   ```

2. Test caching:
   - Click "Set Cache"
   - Click "Get Cache" → Should show cached data
   - Wait 61 seconds
   - Click "Get Cache" → Should show no cache (expired)
   - Click "Set Cache" again
   - Click "Invalidate Cache"
   - Click "Get Cache" → Should show no cache

**Expected Result:**
- ✅ Cache stores data correctly
- ✅ Cache retrieval works
- ✅ TTL expiration works (after 60 seconds)
- ✅ Cache invalidation works

**Cleanup:**
- Remove `<ReduxTest />` from App.tsx
- Delete `src/components/test/ReduxTest.tsx` (or keep for future testing)

---

## Custom Hooks Testing

**Objective:** Verify custom hooks function correctly

### Test 3.1: useToast Hook

**Steps:**
1. Create test component: `src/components/test/HooksTest.tsx`
   ```typescript
   import React from 'react';
   import { useToast } from '../../hooks/useToast';

   export const HooksTest: React.FC = () => {
     const toast = useToast();

     return (
       <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
         <h3>useToast Hook Test</h3>
         <button onClick={() => toast.success('Success message!')}>
           Show Success
         </button>
         <button onClick={() => toast.error('Error message!')}>
           Show Error
         </button>
         <button onClick={() => toast.warning('Warning message!')}>
           Show Warning
         </button>
         <button onClick={() => toast.info('Info message!')}>
           Show Info
         </button>
       </div>
     );
   };
   ```

2. Add to App.tsx temporarily
3. Test each toast type

**Expected Result:**
- ✅ Each toast type dispatches correct Redux action
- ✅ Notifications appear in Redux state
- ✅ Hook provides simple API

### Test 3.2: useDebounce Hook

**Steps:**
1. Update `HooksTest.tsx`:
   ```typescript
   import { useDebounce } from '../../hooks/useDebounce';

   const [searchTerm, setSearchTerm] = React.useState('');
   const debouncedSearch = useDebounce(searchTerm, 500);

   React.useEffect(() => {
     if (debouncedSearch) {
       console.log('Debounced search:', debouncedSearch);
     }
   }, [debouncedSearch]);

   // Add to render:
   <div>
     <h4>useDebounce Test</h4>
     <input
       type="text"
       placeholder="Type to search..."
       value={searchTerm}
       onChange={(e) => setSearchTerm(e.target.value)}
     />
     <p>Current value: {searchTerm}</p>
     <p>Debounced value: {debouncedSearch}</p>
   </div>
   ```

2. Test debouncing:
   - Type quickly in the input
   - Verify "Current value" updates immediately
   - Verify "Debounced value" updates after 500ms pause
   - Check console logs

**Expected Result:**
- ✅ Immediate value updates on typing
- ✅ Debounced value updates after delay
- ✅ Delay is configurable (default 300ms, test with 500ms)

### Test 3.3: usePagination Hook

**Steps:**
1. Update `HooksTest.tsx`:
   ```typescript
   import { usePagination } from '../../hooks/usePagination';

   const pagination = usePagination({
     initialPage: 0,
     initialRowsPerPage: 10,
   });

   React.useEffect(() => {
     pagination.setTotalRows(100); // Simulate 100 items
   }, []);

   // Add to render:
   <div>
     <h4>usePagination Test</h4>
     <p>Total Items: 100</p>
     <p>Current Page: {pagination.page + 1}</p>
     <p>Rows Per Page: {pagination.rowsPerPage}</p>
     <p>Total Pages: {pagination.totalPages}</p>
     <p>Has Next Page: {pagination.hasNextPage ? 'Yes' : 'No'}</p>
     <p>Has Previous Page: {pagination.hasPreviousPage ? 'Yes' : 'No'}</p>

     <button
       onClick={() => pagination.handleChangePage(pagination.page - 1)}
       disabled={!pagination.hasPreviousPage}
     >
       Previous
     </button>
     <button
       onClick={() => pagination.handleChangePage(pagination.page + 1)}
       disabled={!pagination.hasNextPage}
     >
       Next
     </button>
     <button onClick={() => pagination.handleChangeRowsPerPage(25)}>
       25 per page
     </button>
     <button onClick={() => pagination.goToFirstPage()}>First</button>
     <button onClick={() => pagination.goToLastPage()}>Last</button>
   </div>
   ```

2. Test pagination:
   - Click "Next" → Page should increment
   - Click "Previous" → Page should decrement
   - Click "25 per page" → Rows per page changes, page resets to 0
   - Click "Last" → Jump to last page
   - Click "First" → Jump to first page
   - Verify "Previous" disabled on first page
   - Verify "Next" disabled on last page

**Expected Result:**
- ✅ Page navigation works
- ✅ Rows per page updates correctly
- ✅ Total pages calculated correctly
- ✅ hasNextPage/hasPreviousPage accurate
- ✅ Buttons disabled appropriately

### Test 3.4: useConfirmDialog Hook

**Steps:**
1. Update `HooksTest.tsx`:
   ```typescript
   import { useConfirmDialog } from '../../hooks/useConfirmDialog';
   import { ConfirmDialog } from '../../components/common/ConfirmDialog';

   const confirmDialog = useConfirmDialog();

   const handleDelete = () => {
     confirmDialog.open({
       title: 'Delete Item',
       message: 'Are you sure you want to delete this item?',
       onConfirm: () => {
         toast.success('Item deleted!');
       },
     });
   };

   const handleDangerousDelete = () => {
     confirmDialog.open({
       title: 'Delete Account',
       message: 'This action cannot be undone. Please type "DELETE" to confirm.',
       requiresTyping: true,
       typingText: 'DELETE',
       confirmColor: 'error',
       onConfirm: () => {
         toast.error('Account deleted!');
       },
     });
   };

   // Add to render:
   <div>
     <h4>useConfirmDialog Test</h4>
     <button onClick={handleDelete}>Delete (Simple)</button>
     <button onClick={handleDangerousDelete}>Delete (Requires Typing)</button>

     <ConfirmDialog
       open={confirmDialog.isOpen}
       title={confirmDialog.title}
       message={confirmDialog.message}
       requiresTyping={confirmDialog.requiresTyping}
       typingText={confirmDialog.typingText}
       confirmColor={confirmDialog.confirmColor}
       onConfirm={confirmDialog.confirm}
       onCancel={confirmDialog.cancel}
     />
   </div>
   ```

2. Test confirmation dialogs:
   - Click "Delete (Simple)"
   - Verify dialog opens
   - Click "Cancel" → Dialog closes
   - Click "Delete (Simple)" again
   - Click "Confirm" → Dialog closes, toast shows
   - Click "Delete (Requires Typing)"
   - Try clicking "Confirm" without typing → Should be disabled
   - Type "DELETE"
   - Click "Confirm" → Dialog closes, toast shows

**Expected Result:**
- ✅ Dialog opens with correct props
- ✅ Simple confirmation works
- ✅ "Type to confirm" validation works
- ✅ Cancel closes dialog
- ✅ Confirm triggers callback

**Cleanup:**
- Remove `<HooksTest />` from App.tsx
- Keep file for future testing

---

## Common Components Testing

**Objective:** Verify common UI components render and function correctly

### Test 4.1: ConfirmDialog Component

**Steps:**
1. Create test page: `src/components/test/ComponentsTest.tsx`
   ```typescript
   import React, { useState } from 'react';
   import { ConfirmDialog } from '../common/ConfirmDialog';
   import { Button, Box } from '@mui/material';

   export const ComponentsTest: React.FC = () => {
     const [open1, setOpen1] = useState(false);
     const [open2, setOpen2] = useState(false);
     const [result, setResult] = useState('');

     return (
       <Box sx={{ p: 3 }}>
         <h2>Common Components Test</h2>

         <h3>ConfirmDialog Tests</h3>
         <Button variant="contained" onClick={() => setOpen1(true)}>
           Simple Confirmation
         </Button>
         <Button
           variant="contained"
           color="error"
           onClick={() => setOpen2(true)}
           sx={{ ml: 2 }}
         >
           Dangerous Action (Type to Confirm)
         </Button>
         <p>Result: {result}</p>

         <ConfirmDialog
           open={open1}
           title="Confirm Action"
           message="Are you sure you want to proceed?"
           onConfirm={() => {
             setResult('Confirmed!');
             setOpen1(false);
           }}
           onCancel={() => {
             setResult('Cancelled');
             setOpen1(false);
           }}
         />

         <ConfirmDialog
           open={open2}
           title="Delete Account"
           message="This action is irreversible. Type CONFIRM to proceed."
           requiresTyping
           typingText="CONFIRM"
           confirmColor="error"
           onConfirm={() => {
             setResult('Dangerous action confirmed!');
             setOpen2(false);
           }}
           onCancel={() => {
             setResult('Cancelled dangerous action');
             setOpen2(false);
           }}
         />
       </Box>
     );
   };
   ```

2. Add route or temporarily render in App.tsx
3. Test dialogs:
   - **Simple Confirmation:**
     - Click button
     - Verify dialog opens
     - Verify title and message display
     - Click "Cancel" → Result shows "Cancelled"
     - Click button again
     - Click "Confirm" → Result shows "Confirmed!"

   - **Type to Confirm:**
     - Click button
     - Verify "Confirm" button is disabled
     - Type incorrect text → Button stays disabled
     - Type "CONFIRM" → Button enables
     - Click "Confirm" → Result shows

**Expected Result:**
- ✅ Dialogs open/close correctly
- ✅ Title and message display
- ✅ Simple confirmation works
- ✅ Type-to-confirm validation works
- ✅ Callbacks fire correctly
- ✅ Color variants work (error, warning, primary)

### Test 4.2: LoadingSpinner Component

**Steps:**
1. Update `ComponentsTest.tsx`:
   ```typescript
   import { LoadingSpinner } from '../common/LoadingSpinner';

   const [loading, setLoading] = useState(false);
   const [fullscreen, setFullscreen] = useState(false);

   // Add to render:
   <div>
     <h3>LoadingSpinner Tests</h3>
     <Button onClick={() => setLoading(!loading)}>
       Toggle Loading
     </Button>
     <Button onClick={() => setFullscreen(!fullscreen)} sx={{ ml: 2 }}>
       Toggle Fullscreen
     </Button>

     {loading && (
       <Box sx={{ mt: 2, height: 200, position: 'relative' }}>
         <LoadingSpinner text="Loading data..." />
       </Box>
     )}

     {fullscreen && (
       <LoadingSpinner fullscreen text="Loading application..." />
     )}
   </div>
   ```

2. Test spinner:
   - Click "Toggle Loading"
   - Verify inline spinner appears
   - Verify loading text displays
   - Click "Toggle Fullscreen"
   - Verify fullscreen overlay appears
   - Verify spinner is centered
   - Close fullscreen spinner

**Expected Result:**
- ✅ Inline spinner renders centered in container
- ✅ Fullscreen spinner covers entire viewport
- ✅ Loading text displays correctly
- ✅ Spinner animates smoothly

### Test 4.3: EmptyState Component

**Steps:**
1. Update `ComponentsTest.tsx`:
   ```typescript
   import { EmptyState, EmptyListState, NoSearchResultsState } from '../common/EmptyState';

   const [showEmpty, setShowEmpty] = useState('none');

   // Add to render:
   <div>
     <h3>EmptyState Tests</h3>
     <Button onClick={() => setShowEmpty('empty')}>Empty List</Button>
     <Button onClick={() => setShowEmpty('search')} sx={{ ml: 1 }}>No Search Results</Button>
     <Button onClick={() => setShowEmpty('error')} sx={{ ml: 1 }}>Error State</Button>
     <Button onClick={() => setShowEmpty('info')} sx={{ ml: 1 }}>Info State</Button>
     <Button onClick={() => setShowEmpty('custom')} sx={{ ml: 1 }}>Custom</Button>
     <Button onClick={() => setShowEmpty('none')} sx={{ ml: 1 }}>Clear</Button>

     {showEmpty === 'empty' && (
       <EmptyListState
         title="No users yet"
         description="Get started by creating your first user."
         onAdd={() => alert('Add user clicked')}
         addLabel="Add User"
       />
     )}

     {showEmpty === 'search' && (
       <NoSearchResultsState
         searchTerm="test query"
         onClear={() => alert('Clear search clicked')}
       />
     )}

     {showEmpty === 'error' && (
       <EmptyState
         variant="error"
         title="Failed to load data"
         description="An error occurred while loading the data."
         action={{
           label: 'Try Again',
           onClick: () => alert('Try again clicked'),
         }}
       />
     )}

     {showEmpty === 'info' && (
       <EmptyState
         variant="info"
         title="No alerts"
         description="You're all caught up!"
       />
     )}

     {showEmpty === 'custom' && (
       <EmptyState
         variant="empty"
         title="Custom Empty State"
         description="This is a custom empty state with two actions."
         action={{
           label: 'Primary Action',
           onClick: () => alert('Primary clicked'),
         }}
         secondaryAction={{
           label: 'Secondary Action',
           onClick: () => alert('Secondary clicked'),
         }}
       />
     )}
   </div>
   ```

2. Test each variant:
   - Click "Empty List"
     - Verify inbox icon appears
     - Verify "Add User" button works
   - Click "No Search Results"
     - Verify search icon appears
     - Verify search term in description
     - Verify "Clear Search" button works
   - Click "Error State"
     - Verify warning icon appears
     - Verify error styling
     - Verify "Try Again" button works
   - Click "Info State"
     - Verify info icon appears
     - Verify no action buttons
   - Click "Custom"
     - Verify both action buttons appear
     - Verify both buttons work

**Expected Result:**
- ✅ All variants render with correct icons
- ✅ Titles and descriptions display
- ✅ Action buttons work
- ✅ Secondary actions work
- ✅ Styling matches variant (error = red, etc.)

### Test 4.4: ErrorBoundary Component

**Steps:**
1. Create a component that throws an error:
   ```typescript
   const BuggyComponent = () => {
     throw new Error('Test error!');
     return <div>This won't render</div>;
   };
   ```

2. Update `ComponentsTest.tsx`:
   ```typescript
   import { ErrorBoundary } from '../common/ErrorBoundary';

   const [showBuggy, setShowBuggy] = useState(false);

   // Add to render:
   <div>
     <h3>ErrorBoundary Test</h3>
     <Button onClick={() => setShowBuggy(!showBuggy)}>
       Toggle Buggy Component
     </Button>

     <ErrorBoundary>
       {showBuggy && <BuggyComponent />}
     </ErrorBoundary>
   </div>
   ```

3. Test error boundary:
   - Click "Toggle Buggy Component"
   - Verify error boundary catches error
   - Verify fallback UI displays
   - Verify error message shows
   - Check console for error log
   - Click toggle again to hide

**Expected Result:**
- ✅ Error boundary catches error
- ✅ Fallback UI displays with error icon
- ✅ Error message shows
- ✅ App doesn't crash
- ✅ Console shows error details

**Cleanup:**
- Keep ComponentsTest.tsx for future testing
- Remove from App.tsx if temporarily added

---

## API Modules Testing

**Objective:** Verify API functions are properly typed and make correct requests

**Note:** These tests require either a running backend or mock API responses. The tests below assume you're using mock responses or the browser Network tab to verify requests.

### Test 5.1: API Module Structure

**Steps:**
1. Verify all API modules exist:
   ```bash
   ls src/api/
   ```
   Expected files:
   - axios.ts
   - tenants.ts
   - usage.ts
   - roles.ts
   - rules.ts
   - users.ts (legacy)
   - tokens.ts (legacy)

2. Import all API functions in a test file to verify no errors:
   ```typescript
   // Create src/api/test-imports.ts
   import * as tenantsAPI from './tenants';
   import * as usageAPI from './usage';
   import * as rolesAPI from './roles';
   import * as rulesAPI from './rules';

   console.log('All imports successful');
   ```

3. Run TypeScript compiler:
   ```bash
   npx tsc --noEmit
   ```

**Expected Result:**
- ✅ All files exist
- ✅ No import errors
- ✅ No TypeScript compilation errors

### Test 5.2: Tenants API (TenantConfigService)

**Steps:**
1. Create test component: `src/components/test/APITest.tsx`
   ```typescript
   import React, { useState } from 'react';
   import * as tenantsAPI from '../../api/tenants';
   import { Button, Box, Typography } from '@mui/material';

   export const APITest: React.FC = () => {
     const [result, setResult] = useState<any>(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);

     const testGetTenant = async () => {
       setLoading(true);
       setError(null);
       try {
         const response = await tenantsAPI.getTenant('test-tenant-123');
         setResult(response.data);
       } catch (err: any) {
         setError(err.message);
       } finally {
         setLoading(false);
       }
     };

     const testGetUsers = async () => {
       setLoading(true);
       setError(null);
       try {
         const response = await tenantsAPI.getUsers('test-tenant-123');
         setResult(response.data);
       } catch (err: any) {
         setError(err.message);
       } finally {
         setLoading(false);
       }
     };

     const testGetLLMConfigs = async () => {
       setLoading(true);
       setError(null);
       try {
         const response = await tenantsAPI.getLLMConfigs('test-tenant-123');
         setResult(response.data);
       } catch (err: any) {
         setError(err.message);
       } finally {
         setLoading(false);
       }
     };

     return (
       <Box sx={{ p: 3 }}>
         <Typography variant="h4">Tenants API Test</Typography>

         <Box sx={{ mt: 2 }}>
           <Button onClick={testGetTenant} disabled={loading}>
             Get Tenant
           </Button>
           <Button onClick={testGetUsers} disabled={loading} sx={{ ml: 1 }}>
             Get Users
           </Button>
           <Button onClick={testGetLLMConfigs} disabled={loading} sx={{ ml: 1 }}>
             Get LLM Configs
           </Button>
         </Box>

         {loading && <Typography sx={{ mt: 2 }}>Loading...</Typography>}
         {error && <Typography color="error" sx={{ mt: 2 }}>Error: {error}</Typography>}
         {result && (
           <Box sx={{ mt: 2 }}>
             <Typography variant="h6">Result:</Typography>
             <pre>{JSON.stringify(result, null, 2)}</pre>
           </Box>
         )}
       </Box>
     );
   };
   ```

2. Open browser Network tab (F12 → Network)
3. Click each button and verify:
   - Request is made to correct endpoint
   - Request method is correct (GET/POST/PUT/DELETE)
   - Request headers include Authorization
   - Request body is correctly formatted (for POST/PUT)

**Endpoints to verify:**
- ✅ `GET /api/v1/tenants/{id}` - getTenant
- ✅ `GET /api/v1/tenants/{id}/users` - getUsers
- ✅ `POST /api/v1/tenants/{id}/users` - createUser
- ✅ `GET /api/v1/tenants/{id}/llm-configs` - getLLMConfigs
- ✅ `POST /api/v1/tenants/{id}/llm-configs` - createLLMConfig
- ✅ `POST /api/v1/tenants/{id}/llm-configs/test` - testLLMConnection

**Expected Result:**
- ✅ Correct endpoints called
- ✅ Correct HTTP methods
- ✅ Authorization header present
- ✅ TypeScript types match responses

### Test 5.3: Usage API (UsageTrackingService)

**Steps:**
1. Update `APITest.tsx`:
   ```typescript
   import * as usageAPI from '../../api/usage';

   const testGetUserUsage = async () => {
     setLoading(true);
     setError(null);
     try {
       const response = await usageAPI.getUserUsage('test-tenant-123', 'user-123');
       setResult(response.data);
     } catch (err: any) {
       setError(err.message);
     } finally {
       setLoading(false);
     }
   };

   const testGetRoleLimits = async () => {
     setLoading(true);
     setError(null);
     try {
       const response = await usageAPI.getRoleLimits('test-tenant-123');
       setResult(response.data);
     } catch (err: any) {
       setError(err.message);
     } finally {
       setLoading(false);
     }
   };

   const testGetUsageAnalytics = async () => {
     setLoading(true);
     setError(null);
     try {
       const response = await usageAPI.getUsageAnalytics({
         tenant_id: 'test-tenant-123',
         time_range: '7d',
       });
       setResult(response.data);
     } catch (err: any) {
       setError(err.message);
     } finally {
       setLoading(false);
     }
   };
   ```

2. Test each endpoint via Network tab

**Endpoints to verify:**
- ✅ `GET /api/v1/usage/current/{tenant}/users/{user}` - getUserUsage
- ✅ `GET /api/v1/limits/{tenant}/roletokenlimit` - getRoleLimits
- ✅ `POST /api/v1/limits/{tenant}/roletokenlimit` - createRoleLimit
- ✅ `GET /api/v1/limits/{tenant}/usertokenlimit` - getUserLimits
- ✅ `POST /api/v1/limits/{tenant}/usertokenlimit` - createUserLimit
- ✅ `GET /api/v1/analytics/{tenant}/usage` - getUsageAnalytics

**Expected Result:**
- ✅ Multi-level limits endpoints work
- ✅ Query parameters correctly formatted
- ✅ QuotaCheck response type matches

### Test 5.4: Rules API (RuleManagementService)

**Steps:**
1. Update `APITest.tsx`:
   ```typescript
   import * as rulesAPI from '../../api/rules';

   const testGetRules = async () => {
     setLoading(true);
     setError(null);
     try {
       const response = await rulesAPI.getRules('test-tenant-123');
       setResult(response.data);
     } catch (err: any) {
       setError(err.message);
     } finally {
       setLoading(false);
     }
   };

   const testValidateRule = async () => {
     setLoading(true);
     setError(null);
     try {
       const response = await rulesAPI.validateRule('test-tenant-123', {
         name: 'Test Rule',
         type: 'token_limit',
         priority: 1,
         enabled: true,
         conditions: {},
         parameters: {},
       });
       setResult(response.data);
     } catch (err: any) {
       setError(err.message);
     } finally {
       setLoading(false);
     }
   };

   const testGetRuleHistory = async () => {
     setLoading(true);
     setError(null);
     try {
       const response = await rulesAPI.getRuleHistory('test-tenant-123', 'rule-123');
       setResult(response.data);
     } catch (err: any) {
       setError(err.message);
     } finally {
       setLoading(false);
     }
   };
   ```

2. Test each endpoint

**Endpoints to verify:**
- ✅ `GET /api/v1/tenants/{id}/rules` - getRules
- ✅ `POST /api/v1/tenants/{id}/rules/validate` - validateRule
- ✅ `POST /api/v1/tenants/{id}/rules/test` - testRule
- ✅ `POST /api/v1/tenants/{id}/rules/import` - importRules
- ✅ `GET /api/v1/tenants/{id}/rules/export` - exportRules
- ✅ `GET /api/v1/tenants/{id}/rules/{rule}/history` - getRuleHistory
- ✅ `POST /api/v1/tenants/{id}/rules/{rule}/rollback/{ver}` - rollbackRule

**Expected Result:**
- ✅ All new endpoints present
- ✅ Versioning endpoints work
- ✅ Test/validate endpoints work
- ✅ Import/export endpoints work

### Test 5.5: Roles API

**Steps:**
1. Test roles endpoints:
   ```typescript
   import * as rolesAPI from '../../api/roles';

   const testGetRoles = async () => {
     const response = await rolesAPI.getRoles('test-tenant-123');
     setResult(response.data);
   };

   const testCreateRole = async () => {
     const response = await rolesAPI.createRole('test-tenant-123', {
       name: 'Test Role',
       description: 'Test role description',
       tokenLimits: {
         daily: 1000,
         monthly: 30000,
       },
       allowedModels: ['gpt-4', 'claude-3'],
     });
     setResult(response.data);
   };
   ```

**Endpoints to verify:**
- ✅ `GET /api/v1/role/{tenant}` - getRoles
- ✅ `POST /api/v1/role/{tenant}` - createRole
- ✅ `PUT /api/v1/role/{tenant}/{role}` - updateRole
- ✅ `DELETE /api/v1/role/{tenant}/{role}` - deleteRole

**Expected Result:**
- ✅ All CRUD operations work
- ✅ Request bodies correctly formatted

---

## Integration Testing

**Objective:** Test how components work together

### Test 6.1: Redux + Custom Hooks Integration

**Steps:**
1. Test useToast with notifications Redux slice:
   ```typescript
   const toast = useToast();
   const notifications = useAppSelector(state => state.notifications.notifications);

   toast.success('Test message');
   // Verify notification appears in Redux state
   ```

**Expected Result:**
- ✅ useToast dispatches to Redux
- ✅ Notifications appear in state
- ✅ Auto-hide works (if implemented)

### Test 6.2: API + Redux Caching Integration

**Steps:**
1. Test API call with caching:
   ```typescript
   import { setCache, getCache } from '../../redux/slices/cacheSlice';
   import { getUserUsage } from '../../api/usage';

   const fetchWithCache = async () => {
     const cacheKey = `quota:user:tenant-123:user-123`;
     const cached = getCache(cacheKey)(store.getState());

     if (cached) {
       console.log('Using cached data:', cached);
       return cached;
     }

     const response = await getUserUsage('tenant-123', 'user-123');
     dispatch(setCache({
       key: cacheKey,
       data: response.data,
       ttl: 300000, // 5 minutes
     }));

     return response.data;
   };
   ```

2. Test caching:
   - First call → Fetches from API
   - Second call (within 5 min) → Uses cache
   - After 5 minutes → Fetches from API again

**Expected Result:**
- ✅ First call hits API
- ✅ Second call uses cache
- ✅ Cache expires after TTL

### Test 6.3: Components + Hooks Integration

**Steps:**
1. Test ConfirmDialog + useConfirmDialog:
   ```typescript
   const confirmDialog = useConfirmDialog();

   const handleDelete = async () => {
     confirmDialog.open({
       title: 'Delete User',
       message: 'Are you sure?',
       onConfirm: async () => {
         try {
           await deleteUser('tenant-123', 'user-123');
           toast.success('User deleted');
         } catch (error) {
           toast.error('Failed to delete user');
         }
       },
     });
   };
   ```

**Expected Result:**
- ✅ Dialog opens on action
- ✅ API call on confirm
- ✅ Toast shows result
- ✅ Error handling works

---

## Testing Checklist

### Type System ✓
- [ ] All type files compile without errors
- [ ] Type imports work correctly
- [ ] Type validation enforces required fields
- [ ] Optional fields work as expected
- [ ] Backward compatibility maintained

### Redux Store ✓
- [ ] Redux Provider wraps App
- [ ] Redux DevTools connected
- [ ] Auth slice works (login/logout)
- [ ] Notifications slice works (all severities)
- [ ] Cache slice works (set/get/expire/invalidate)
- [ ] Typed hooks work (useAppDispatch, useAppSelector)

### Custom Hooks ✓
- [ ] useToast dispatches notifications
- [ ] useDebounce delays updates correctly
- [ ] usePagination handles navigation
- [ ] usePagination calculates pages correctly
- [ ] useConfirmDialog opens/closes dialog

### Common Components ✓
- [ ] ConfirmDialog renders correctly
- [ ] ConfirmDialog simple confirmation works
- [ ] ConfirmDialog type-to-confirm works
- [ ] LoadingSpinner inline mode works
- [ ] LoadingSpinner fullscreen mode works
- [ ] EmptyState all variants render
- [ ] EmptyState actions work
- [ ] ErrorBoundary catches errors

### API Modules ✓
- [ ] All API files compile
- [ ] Tenants API endpoints correct
- [ ] Usage API endpoints correct
- [ ] Rules API endpoints correct
- [ ] Roles API endpoints correct
- [ ] Authorization headers included
- [ ] Request bodies correctly formatted
- [ ] Response types match backend

### Integration ✓
- [ ] Redux + hooks work together
- [ ] API + caching work together
- [ ] Components + hooks work together
- [ ] Error handling flows work
- [ ] Toast notifications display

---

## Known Issues / Notes

**Document any issues found during testing:**

1. **Issue:** [Description]
   - **Impact:** [High/Medium/Low]
   - **Workaround:** [If available]
   - **Fix Required:** [Yes/No]

2. **Performance Note:** [Any performance observations]

3. **Browser Compatibility:** [Test in Chrome, Firefox, Safari, Edge]

---

## Testing Environment

**OS:** Windows 11
**Node Version:** [Run `node --version`]
**NPM Version:** [Run `npm --version`]
**Browser:** Chrome [version], Firefox [version]
**Backend Status:** [Available/Mock/Not Available]

---

## Test Results Summary

| Category | Total Tests | Passed | Failed | Skipped | Notes |
|----------|-------------|--------|--------|---------|-------|
| Type System | 4 | - | - | - | |
| Redux Store | 4 | - | - | - | |
| Custom Hooks | 4 | - | - | - | |
| Common Components | 4 | - | - | - | |
| API Modules | 5 | - | - | - | |
| Integration | 3 | - | - | - | |
| **TOTAL** | **24** | **-** | **-** | **-** | |

---

## Sign-off

**Tester Name:** _________________________
**Date:** _________________________
**Signature:** _________________________

**Status:** [ ] All tests passed  [ ] Some tests failed (see issues)  [ ] Testing incomplete

---

## Next Steps

After Phase 1 testing is complete and all issues resolved:

1. **Fix any issues found** - Address failing tests before moving to Phase 2
2. **Update documentation** - Document any changes made during testing
3. **Commit changes** - Commit tested and verified Phase 1 code
4. **Proceed to Phase 2** - Begin Enhanced Dashboard implementation

---

**End of Phase 1 Testing Plan**
