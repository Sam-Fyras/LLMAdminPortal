import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserAccount } from '../../types';

/**
 * Auth state interface
 */
interface AuthState {
  isAuthenticated: boolean;
  user: UserAccount | null;
  tenantId: string | null;
  userId: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Initial auth state
 */
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  tenantId: null,
  userId: null,
  loading: false,
  error: null,
};

/**
 * Auth slice for managing authentication state
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Set authentication loading state
     */
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    /**
     * Set authenticated user
     */
    setAuthUser: (state, action: PayloadAction<UserAccount>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.tenantId = action.payload.tenantId;
      state.userId = action.payload.localAccountId;
      state.loading = false;
      state.error = null;
    },

    /**
     * Clear authentication (logout)
     */
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.tenantId = null;
      state.userId = null;
      state.loading = false;
      state.error = null;
    },

    /**
     * Set authentication error
     */
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    /**
     * Clear authentication error
     */
    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

// Export actions
export const {
  setAuthLoading,
  setAuthUser,
  clearAuth,
  setAuthError,
  clearAuthError,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;

// Selectors
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user;
export const selectTenantId = (state: { auth: AuthState }) =>
  state.auth.tenantId;
export const selectUserId = (state: { auth: AuthState }) => state.auth.userId;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
