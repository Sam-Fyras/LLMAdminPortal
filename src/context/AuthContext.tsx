import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PublicClientApplication,
  AccountInfo,
  InteractionRequiredAuthError
} from '@azure/msal-browser';
import { MockTenantUser, mockTenantUsers } from '../mocks/data/mockUsers';

interface AuthContextType {
  isAuthenticated: boolean;
  account: AccountInfo | null;
  login: () => Promise<void>;
  logout: () => void;
  getToken: () => Promise<string | null>;
  // Mock user switching
  currentMockUser: MockTenantUser;
  switchUser: (user: MockTenantUser) => void;
  isSuperAdmin: boolean;
}

// Check if mock mode is enabled (for development/testing without Azure AD)
const MOCK_AUTH_MODE = process.env.REACT_APP_MOCK_AUTH === 'true';

const buildMockAccount = (user: MockTenantUser): AccountInfo => ({
  homeAccountId: `mock-${user.id}`,
  environment: 'mock-environment',
  tenantId: user.tenantId,
  username: user.username,
  localAccountId: user.id,
  name: user.name,
  idTokenClaims: {
    aud: 'mock-audience',
    iss: 'mock-issuer',
    iat: Date.now() / 1000,
    nbf: Date.now() / 1000,
    exp: (Date.now() / 1000) + 3600,
    name: user.name,
    preferred_username: user.username,
    oid: user.id,
    sub: user.id,
    tid: user.tenantId,
    ver: '2.0',
    roles: [user.role],
  },
});

const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_CLIENT_ID || 'mock-client-id',
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_TENANT_ID || 'mock-tenant-id'}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage' as const,
    storeAuthStateInCookie: false,
  }
};

// Only create MSAL instance if not in mock mode
let msalInstance: PublicClientApplication | null = null;
if (!MOCK_AUTH_MODE) {
  msalInstance = new PublicClientApplication(msalConfig);
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Default to Sam (super_admin)
  const [currentMockUser, setCurrentMockUser] = useState<MockTenantUser>(mockTenantUsers[0]);

  useEffect(() => {
    if (MOCK_AUTH_MODE) {
      console.log('🔧 Mock Auth Mode: Auto-login as', mockTenantUsers[0].name);
      setAccount(buildMockAccount(mockTenantUsers[0]));
      setIsAuthenticated(true);
    } else {
      const initializeMsal = async () => {
        try {
          if (msalInstance) {
            await msalInstance.initialize();
            const accounts = msalInstance.getAllAccounts();
            if (accounts.length > 0) {
              setAccount(accounts[0]);
              setIsAuthenticated(true);
            }
          }
        } catch (error) {
          console.error('MSAL initialization failed:', error);
        }
      };
      initializeMsal();
    }
  }, []);

  const switchUser = (user: MockTenantUser): void => {
    console.log('🔧 Switching to user:', user.name, `(${user.role})`);
    setCurrentMockUser(user);
    setAccount(buildMockAccount(user));
  };

  const login = async (): Promise<void> => {
    if (MOCK_AUTH_MODE) {
      console.log('🔧 Mock Auth Mode: Login successful');
      setAccount(buildMockAccount(currentMockUser));
      setIsAuthenticated(true);
      return;
    }

    try {
      if (!msalInstance) throw new Error('MSAL instance not initialized');
      const loginRequest = {
        scopes: ["openid", "profile", "api://fyras-gateway-client-id/llm.access"]
      };
      const response = await msalInstance.loginPopup(loginRequest);
      setAccount(response.account);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = (): void => {
    if (MOCK_AUTH_MODE) {
      setAccount(null);
      setIsAuthenticated(false);
      return;
    }
    if (msalInstance) msalInstance.logoutRedirect();
    setAccount(null);
    setIsAuthenticated(false);
  };

  const getToken = async (): Promise<string | null> => {
    if (MOCK_AUTH_MODE) return 'mock-jwt-token-for-testing';

    if (!account || !msalInstance) return null;

    const tokenRequest = {
      scopes: ["api://fyras-gateway-client-id/llm.access"],
      account: account
    };

    try {
      const response = await msalInstance.acquireTokenSilent(tokenRequest);
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        try {
          const response = await msalInstance.acquireTokenPopup(tokenRequest);
          return response.accessToken;
        } catch (interactiveError) {
          console.error("Interactive token acquisition failed", interactiveError);
          return null;
        }
      }
      console.error("Token acquisition failed", error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      account,
      login,
      logout,
      getToken,
      currentMockUser,
      switchUser,
      isSuperAdmin: currentMockUser.role === 'super_admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
