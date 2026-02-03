// This utility file helps access the auth context outside of React components

// We need to create a singleton to access the auth context outside of React components
let getTokenFunction: () => Promise<string | null> = async () => null;

export const setAuthTokenGetter = (fn: () => Promise<string | null>) => {
  getTokenFunction = fn;
};

export const getAuthToken = async (): Promise<string | null> => {
  return getTokenFunction();
};

export const refreshAuthToken = async (): Promise<string | null> => {
  // This would normally be implemented with a refresh token flow
  // For MSAL, we can just call getToken again as it handles refresh internally
  return getTokenFunction();
};

// Initialize the auth token getter (not a hook, just a regular function)
export const initAuthTokenGetter = (getToken: () => Promise<string | null>) => {
  setAuthTokenGetter(getToken);
};

// Legacy export for backward compatibility
// @deprecated Use initAuthTokenGetter instead
export const useInitAuthTokenGetter = initAuthTokenGetter;
