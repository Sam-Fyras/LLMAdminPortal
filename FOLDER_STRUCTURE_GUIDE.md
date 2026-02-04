# Folder Structure Guide for Admin UI

## Current Folder Structure

```
src/
├── api/                    ← API calls (axios)
├── components/             ← Reusable components
│   ├── common/            ← Shared components (Header, Layout, etc.)
│   ├── dashboard/         ← Dashboard-specific components
│   ├── rules/             ← Rules page components
│   └── users/             ← Users page components
├── context/               ← React Context (AuthContext)
├── hooks/                 ← Custom React hooks
├── mocks/                 ← Mock data and API
├── pages/                 ← Page-level components
├── redux/                 ← Redux store (if needed)
├── types/                 ← TypeScript types
└── utils/                 ← Helper functions

```

---

## Where to Put Your Code

### 1. Creating a New Page

**Location:** `src/pages/`

**Example:** Creating a Users Management page

```tsx
// src/pages/UsersPage.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import Layout from '../components/common/Layout';
import UserList from '../components/users/UserList';

function UsersPage() {
  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">Users Management</Typography>
        <UserList />
      </Box>
    </Layout>
  );
}

export default UsersPage;
```

### 2. Creating Feature-Specific Components

**Location:** `src/components/{feature-name}/`

**Example:** Creating a user list component

```tsx
// src/components/users/UserList.tsx
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

function UserList() {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Role</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {/* User rows here */}
      </TableBody>
    </Table>
  );
}

export default UserList;
```

### 3. Creating Shared/Reusable Components

**Location:** `src/components/common/`

**Example:** Components used across multiple pages

```tsx
// src/components/common/DataTable.tsx
import React from 'react';
import { Table } from '@mui/material';

function DataTable({ columns, data }) {
  // Reusable table component
  return <Table>{/* ... */}</Table>;
}

export default DataTable;
```

### 4. Adding API Calls

**Location:** `src/api/`

**Example:** Creating user API functions

```tsx
// src/api/users.ts
import axiosInstance from './axios';

export const getUsers = (tenantId: string) => {
  return axiosInstance.get(`/api/v1/tenants/${tenantId}/users`);
};

export const createUser = (tenantId: string, userData: any) => {
  return axiosInstance.post(`/api/v1/tenants/${tenantId}/users`, userData);
};
```

### 5. Adding TypeScript Types

**Location:** `src/types/`

**Example:** Defining types for your data

```tsx
// src/types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
}
```

### 6. Creating Custom Hooks

**Location:** `src/hooks/`

**Example:** Hook for fetching users

```tsx
// src/hooks/useUsers.ts
import { useState, useEffect } from 'react';
import { getUsers } from '../api/users';

export function useUsers(tenantId: string) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers(tenantId)
      .then(response => setUsers(response.data))
      .finally(() => setLoading(false));
  }, [tenantId]);

  return { users, loading };
}
```

---

## Material-UI Component Organization

### Pattern to Follow

```
Feature Page (src/pages/)
    ↓
Feature Components (src/components/{feature}/)
    ↓
MUI Components (@mui/material)
    ↓
Common Components (src/components/common/)
```

### Example Flow

```tsx
// 1. Page
src/pages/UsersPage.tsx
  └─ Uses Layout from src/components/common/
  └─ Uses UserList from src/components/users/

// 2. Feature Component
src/components/users/UserList.tsx
  └─ Uses MUI Table, TableBody, etc.
  └─ Uses LoadingSpinner from src/components/common/
  └─ Uses UserRow from src/components/users/

// 3. Sub-component
src/components/users/UserRow.tsx
  └─ Uses MUI TableCell, IconButton, etc.
```

---

## Quick Guidelines

### ✅ DO

1. **Pages in `src/pages/`** - One file per route/page
2. **Feature components in `src/components/{feature}/`** - Group related components
3. **Shared components in `src/components/common/`** - Reusable across features
4. **Keep components small** - Each component should do one thing
5. **Use Material-UI components directly** - No need to wrap them unless adding custom logic

### ❌ DON'T

1. **Don't create deeply nested folders** - Keep it max 2-3 levels
2. **Don't put components in `pages/`** - Pages should import from `components/`
3. **Don't duplicate common components** - Reuse from `components/common/`
4. **Don't create a new structure** - The existing one is good!

---

## Real Example from Existing Code

Here's how the Dashboard page is already organized:

```tsx
// Page
src/pages/DashboardPage.tsx
  ├─ Imports Layout from components/common/
  ├─ Imports MUI components (Box, Card, Typography, etc.)
  └─ Renders dashboard content

// When you add dashboard components:
src/components/dashboard/TokenUsageChart.tsx
src/components/dashboard/TopUsersTable.tsx
src/components/dashboard/AlertsSummary.tsx

// These components will be imported by DashboardPage.tsx
```

---

## Adding a New Feature (Step-by-Step)

Let's say you want to add a "Providers Management" feature:

### Step 1: Create the page
```tsx
// src/pages/ProvidersPage.tsx
```

### Step 2: Create feature components folder
```
src/components/providers/
```

### Step 3: Add components
```tsx
// src/components/providers/ProviderList.tsx
// src/components/providers/ProviderForm.tsx
// src/components/providers/ProviderCard.tsx
```

### Step 4: Add API calls
```tsx
// src/api/providers.ts
```

### Step 5: Add types
```tsx
// src/types/provider.ts
```

### Step 6: Add route
```tsx
// src/App.tsx - add route for /providers
```

---

## Summary

**Key Points:**

✅ **Use the existing folder structure**
✅ **Pages go in `src/pages/`**
✅ **Feature components go in `src/components/{feature-name}/`**
✅ **Shared components go in `src/components/common/`**
✅ **Use Material-UI components directly - they're already installed**
✅ **Follow the pattern from `DashboardPage.tsx` and `RulesManagementPage.tsx`**

The structure is already set up perfectly for Material-UI development. Just follow the existing patterns and you'll be good to go! 🚀

---

## Need Help?

- Check existing files like `DashboardPage.tsx` for examples
- Look at components in `src/components/common/` for patterns
- Material-UI docs: https://mui.com/material-ui/getting-started/
- Ask in the team channel if you're unsure!
