# Mock Service - Simple Guide for Developers

## What is the Mock Service?

The mock service is a **fake backend** built into the frontend. It lets you develop and test the app **without needing the real backend running**.

Think of it like this:
- **Real Backend**: Your frontend talks to actual API servers
- **Mock Service**: Your frontend talks to fake data stored in JavaScript files

## Why Use It?

✅ **Work independently** - No need to wait for backend to be ready
✅ **No setup needed** - No database, no API servers to run
✅ **Fast development** - Test your UI changes immediately
✅ **Always works** - Never breaks because backend is down
✅ **Offline coding** - Work without internet connection

## How to Turn It On/Off

### Option 1: Use Mock Service (Fake Backend)

Open the file `.env.development` and set:

```bash
REACT_APP_MOCK_API=true
```

Then restart your app:
```bash
npm start
```

You'll see this in the browser console:
```
🔧 Mock API Mode: All API requests will return mock data
✅ Mock API initialized successfully
```

### Option 2: Use Real Backend

Change the setting to:

```bash
REACT_APP_MOCK_API=false
```

Then restart the app. Now it will call the real backend.

## What Mock Data is Available?

When mock service is ON, you get fake data for:

### 1. Users (4 fake users)
- admin@acme.com (Admin role)
- analyst@acme.com (Analyst role)
- dev@acme.com (Developer role)
- viewer@acme.com (Viewer role)

### 2. Roles (5 roles)
- Admin
- Power User
- Developer
- Analyst
- Viewer

### 3. Rules (6 example rules)
- Daily Token Limit
- Premium Model Restriction
- Rate Limit
- Block Sensitive Content
- Email Redaction
- Monthly Cost Budget

### 4. LLM Providers (3 providers)
- OpenAI (with GPT-4, GPT-3.5)
- Anthropic (with Claude models)
- Google Vertex AI (with Gemini)

### 5. Usage Data
- 7 days of fake usage statistics
- Token usage charts
- Cost breakdown by model

## How to Work With Mock Data

### Simple Example: Add a New Feature

Let's say you want to add a feature to display user emails:

**Step 1**: Turn on mock service (see above)

**Step 2**: Write your component code:

```jsx
import React, { useEffect, useState } from 'react';
import { getUsers } from '../api/tenants';

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // This will call the MOCK API automatically
    getUsers('tenant-123')
      .then(response => {
        setUsers(response.data);
      });
  }, []);

  return (
    <div>
      <h2>Users</h2>
      {users.map(user => (
        <div key={user.id}>
          {user.name} - {user.email}
        </div>
      ))}
    </div>
  );
}
```

**Step 3**: Test it in the browser

The mock service will automatically return 4 fake users. You'll see:
- Admin User - admin@acme.com
- Data Analyst - analyst@acme.com
- Developer User - dev@acme.com
- Viewer User - viewer@acme.com

**Step 4**: When ready for real backend

Just change `.env.development` to `REACT_APP_MOCK_API=false` and restart. Your code doesn't change at all!

## Where is the Mock Data Stored?

All fake data is in these files:

```
src/mocks/data/
  ├── tenants.ts      ← Users and LLM providers
  ├── usage.ts        ← Token usage and limits
  ├── roles.ts        ← User roles
  └── rules.ts        ← Rules and policies
```

### Can I Change the Mock Data?

**Yes!** You can edit these files to add more fake data.

Example - Add a new fake user:

Open `src/mocks/data/tenants.ts` and add:

```typescript
export const mockUsers: User[] = [
  // Existing users...
  {
    id: 'user-5',
    tenantId: 'tenant-123',
    email: 'newdev@acme.com',
    name: 'New Developer',
    role: 'developer',
    status: 'active',
    schemaVersion: '1.0',
    createdDate: '2026-02-01T00:00:00Z',
    updatedDate: '2026-02-01T00:00:00Z',
  },
];
```

Save the file and refresh the browser. You'll now see 5 users!

## Common Questions

### Q: Do I need to change my code when switching between mock and real backend?

**A: No!** Your code stays the same. Just change the `.env.development` setting.

### Q: Will my changes to mock data be saved?

**A: No.** Mock data is reset every time you refresh the page. It's just for testing.

### Q: Can I test creating/updating/deleting data?

**A: Yes!** The mock service supports:
- Creating new items (they'll appear in the list)
- Updating items (changes will show)
- Deleting items (they'll disappear)

But remember: refresh the page and everything resets to the original mock data.

### Q: How do I know if mock service is ON?

**A:** Check the browser console (press F12). You'll see:
```
🔧 Mock API Mode: All API requests will return mock data
```

If you don't see this message, mock service is OFF.

### Q: What if my API call doesn't work with mock service?

**A:** The mock service has 60+ API endpoints already set up. If you need a new endpoint:
1. Open `src/mocks/mockApi.ts`
2. Add a new handler (see existing examples)
3. Or ask the team lead for help

## Quick Reference

| Task | Command/Setting |
|------|----------------|
| Turn mock ON | Set `REACT_APP_MOCK_API=true` in `.env.development` |
| Turn mock OFF | Set `REACT_APP_MOCK_API=false` in `.env.development` |
| Restart app | Stop server (Ctrl+C), then run `npm start` |
| Check if mock is ON | Look for "🔧 Mock API Mode" in browser console (F12) |
| Edit mock data | Open files in `src/mocks/data/` |
| Add mock endpoints | Edit `src/mocks/mockApi.ts` |

## Best Practices for New React Developers

### ✅ DO:
- Keep mock service ON while building new features
- Test your UI with mock data first
- Add more mock data if you need it
- Switch to real backend before final testing

### ❌ DON'T:
- Don't commit changes to mock data unless needed by whole team
- Don't rely on mock data for production
- Don't forget to test with real backend eventually
- Don't mix up `.env.development` with `.env.production`

## Example Workflow

Here's a typical day of development:

1. **Morning**: Start work
   ```bash
   # Make sure mock is ON
   REACT_APP_MOCK_API=true
   npm start
   ```

2. **Build features**: Write components, test with mock data

3. **Afternoon**: Test with real backend
   ```bash
   # Turn mock OFF
   REACT_APP_MOCK_API=false
   npm start
   ```

4. **Fix bugs**: If real backend has issues, turn mock back ON and keep coding

5. **Before commit**: Make sure your code works with BOTH mock and real backend

## Need Help?

- **Full documentation**: See `MOCK_API_GUIDE.md` for advanced details
- **Mock data files**: Look in `src/mocks/data/` folder
- **Mock API setup**: Check `src/mocks/mockApi.ts`

## Summary

The mock service is your friend! It lets you:
- 🚀 Code faster without waiting for backend
- 🧪 Test features instantly
- 💻 Work offline
- 🎯 Focus on frontend without backend worries

Just remember to test with the real backend before releasing your code!

---

**Happy Coding! 🎉**
