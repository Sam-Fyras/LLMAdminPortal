import { Role } from '../../types';

// Mock roles data
export const mockRoles: Role[] = [
  {
    id: 'role-1',
    name: 'Admin',
    description: 'Full access to all features and unlimited token usage',
    tokenLimits: {
      daily: 200000,
      monthly: 5000000,
    },
    allowedModels: ['gpt-4', 'gpt-4-turbo', 'claude-3-opus', 'claude-3-sonnet', 'gemini-pro'],
  },
  {
    id: 'role-2',
    name: 'Power User',
    description: 'High token limits with access to premium models',
    tokenLimits: {
      daily: 100000,
      monthly: 2000000,
    },
    allowedModels: ['gpt-4', 'claude-3-sonnet', 'gemini-pro'],
  },
  {
    id: 'role-3',
    name: 'Developer',
    description: 'Standard development access with moderate token limits',
    tokenLimits: {
      daily: 50000,
      monthly: 1000000,
    },
    allowedModels: ['gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet', 'claude-3-haiku'],
  },
  {
    id: 'role-4',
    name: 'Analyst',
    description: 'Data analysis access with limited token usage',
    tokenLimits: {
      daily: 25000,
      monthly: 500000,
    },
    allowedModels: ['gpt-3.5-turbo', 'claude-3-haiku', 'gemini-pro'],
  },
  {
    id: 'role-5',
    name: 'Viewer',
    description: 'Read-only access with minimal token limits',
    tokenLimits: {
      daily: 5000,
      monthly: 100000,
    },
    allowedModels: ['gpt-3.5-turbo'],
  },
];

// Mock users by role
export const mockUsersByRole = {
  'role-1': [
    { id: 'user-1', email: 'admin@acme.com', name: 'Admin User' },
  ],
  'role-2': [],
  'role-3': [
    { id: 'user-3', email: 'dev@acme.com', name: 'Developer User' },
  ],
  'role-4': [
    { id: 'user-2', email: 'analyst@acme.com', name: 'Data Analyst' },
  ],
  'role-5': [
    { id: 'user-4', email: 'viewer@acme.com', name: 'Viewer User' },
  ],
};
