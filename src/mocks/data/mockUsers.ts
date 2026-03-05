export type MockUserRole = 'super_admin' | 'admin';

export interface MockTenantUser {
  id: string;
  name: string;
  username: string;
  tenantId: string;
  role: MockUserRole;
}

export const mockTenantUsers: MockTenantUser[] = [
  {
    id: 'mu-1',
    name: 'Sam',
    username: 'sam@fyras.com',
    tenantId: 'tenant-fyras',
    role: 'super_admin',
  },
  {
    id: 'mu-2',
    name: 'Aswin',
    username: 'aswin@fyras.com',
    tenantId: 'tenant-fyras',
    role: 'admin',
  },
  {
    id: 'mu-3',
    name: 'JP',
    username: 'jp@fyras.com',
    tenantId: 'tenant-fyras',
    role: 'admin',
  },
];
