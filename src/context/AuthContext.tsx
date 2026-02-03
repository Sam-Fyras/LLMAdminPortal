import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PublicClientApplication,
  AuthenticationResult,
  AccountInfo,
  InteractionRequiredAuthError
} from '@azure/msal-browser';

interface AuthContextType {
  isAuthenticated: boolean;
  account: AccountInfo | null;
  login: () => Promise<void>;
  logout: () => void;
  getToken: () => Promise<string | null>;
}

// Check if mock mode is enabled (for development/testing without Azure AD)
const MOCK_AUTH_MODE = process.env.REACT_APP_MOCK_AUTH === 'true';

// Mock account data for testing
const mockAccount: AccountInfo = {
  homeAccountId: 'mock-home-account-id',
  environment: 'mock-environment',
  tenantId: 'mock-tenant-123',
  username: 'testuser@example.com',
  localAccountId: 'mock-local-account-id',
  name: 'Test User',
  idTokenClaims: {
    aud: 'mock-audience',
    iss: 'mock-issuer',
    iat: Date.now() / 1000,
    nbf: Date.now() / 1000,
    exp: (Date.now() / 1000) + 3600,
    name: 'Test User',
    preferred_username: 'testuser@example.com',
    oid: 'mock-object-id',
    sub: 'mock-subject',
    tid: 'mock-tenant-123',
    ver: '2.0'
  }
};

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

  useEffect(() => {
    if (MOCK_AUTH_MODE) {
      // In mock mode, automatically log in with mock account
      console.log('🔧 Mock Auth Mode: Auto-login with test user');
      setAccount(mockAccount);
      setIsAuthenticated(true);
    } else {
      // Real MSAL authentication
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

  const login = async (): Promise<void> => {
    if (MOCK_AUTH_MODE) {
      // Mock login - instantly succeed
      console.log('🔧 Mock Auth Mode: Login successful');
      setAccount(mockAccount);
      setIsAuthenticated(true);
      return;
    }

    // Real MSAL login
    try {
      if (!msalInstance) {
        throw new Error('MSAL instance not initialized');
      }
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
      // Mock logout
      console.log('🔧 Mock Auth Mode: Logout');
      setAccount(null);
      setIsAuthenticated(false);
      return;
    }

    // Real MSAL logout
    if (msalInstance) {
      msalInstance.logout();
    }
    setAccount(null);
    setIsAuthenticated(false);
  };

  const getToken = async (): Promise<string | null> => {
    if (MOCK_AUTH_MODE) {
      // Return mock JWT token
      return 'mock-jwt-token-for-testing';
    }

    // Real MSAL token acquisition
    if (!account || !msalInstance) {
      return null;
    }

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
      getToken 
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
