import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import notificationsReducer from './slices/notificationsSlice';
import cacheReducer from './slices/cacheSlice';

/**
 * Configure Redux store with minimal slices
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationsReducer,
    cache: cacheReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializability checks
        ignoredActions: ['cache/setCacheEntry'],
        // Ignore these paths in the state
        ignoredPaths: ['cache.entries'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer RootState and AppDispatch types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export store as default
export default store;
