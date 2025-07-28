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

const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_TENANT_ID || ''}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  }
};

const msalInstance = new PublicClientApplication(msalConfig);

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (): Promise<void> => {
    try {
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
    msalInstance.logout();
    setAccount(null);
    setIsAuthenticated(false);
  };

  const getToken = async (): Promise<string | null> => {
    if (!account) {
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
