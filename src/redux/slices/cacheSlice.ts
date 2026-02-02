import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Cache entry with TTL
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

/**
 * Cache state interface
 */
interface CacheState {
  entries: Record<string, CacheEntry<any>>;
}

/**
 * Initial cache state
 */
const initialState: CacheState = {
  entries: {},
};

/**
 * Cache slice for storing data with TTL
 * Used primarily for dashboard metrics to avoid frequent API calls
 */
const cacheSlice = createSlice({
  name: 'cache',
  initialState,
  reducers: {
    /**
     * Set a cache entry
     */
    setCacheEntry: <T>(
      state: CacheState,
      action: PayloadAction<{
        key: string;
        data: T;
        ttl?: number; // Default: 5 minutes
      }>
    ) => {
      const { key, data, ttl = 300000 } = action.payload; // 5 min default
      state.entries[key] = {
        data,
        timestamp: Date.now(),
        ttl,
      };
    },

    /**
     * Remove a cache entry
     */
    removeCacheEntry: (state, action: PayloadAction<string>) => {
      delete state.entries[action.payload];
    },

    /**
     * Clear all cache entries
     */
    clearCache: (state) => {
      state.entries = {};
    },

    /**
     * Clear expired cache entries
     */
    clearExpiredCache: (state) => {
      const now = Date.now();
      Object.keys(state.entries).forEach((key) => {
        const entry = state.entries[key];
        if (now - entry.timestamp > entry.ttl) {
          delete state.entries[key];
        }
      });
    },
  },
});

// Export actions
export const {
  setCacheEntry,
  removeCacheEntry,
  clearCache,
  clearExpiredCache,
} = cacheSlice.actions;

// Export reducer
export default cacheSlice.reducer;

// Selectors

/**
 * Get a cache entry if it exists and hasn't expired
 */
export const selectCacheEntry = <T>(key: string) => (state: { cache: CacheState }): T | null => {
  const entry = state.cache.entries[key];
  if (!entry) return null;

  const now = Date.now();
  const isExpired = now - entry.timestamp > entry.ttl;

  if (isExpired) {
    return null;
  }

  return entry.data as T;
};

/**
 * Check if a cache entry exists and is valid
 */
export const selectIsCacheValid = (key: string) => (state: { cache: CacheState }): boolean => {
  const entry = state.cache.entries[key];
  if (!entry) return false;

  const now = Date.now();
  return now - entry.timestamp <= entry.ttl;
};

/**
 * Get all cache keys
 */
export const selectCacheKeys = (state: { cache: CacheState }): string[] => {
  return Object.keys(state.cache.entries);
};

/**
 * Cache key generators for common data
 */
export const CacheKeys = {
  dashboardOverview: (tenantId: string, timeRange: string) =>
    `dashboard:overview:${tenantId}:${timeRange}`,

  tokenUsage: (tenantId: string, timeRange: string) =>
    `usage:tokens:${tenantId}:${timeRange}`,

  modelUsage: (tenantId: string, timeRange: string) =>
    `usage:models:${tenantId}:${timeRange}`,

  topUsers: (tenantId: string, limit: number) =>
    `usage:top-users:${tenantId}:${limit}`,

  userQuota: (tenantId: string, userId: string) =>
    `quota:user:${tenantId}:${userId}`,

  tenantContext: (tenantId: string) =>
    `tenant:context:${tenantId}`,
};
