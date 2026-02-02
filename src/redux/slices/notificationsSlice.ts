import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Notification severity types
 */
export type NotificationSeverity = 'success' | 'error' | 'warning' | 'info';

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  message: string;
  severity: NotificationSeverity;
  autoHideDuration?: number; // Milliseconds (null = no auto-hide)
  timestamp: number;
}

/**
 * Notifications state interface
 */
interface NotificationsState {
  notifications: Notification[];
  maxNotifications: number; // Maximum notifications to keep in queue
}

/**
 * Initial notifications state
 */
const initialState: NotificationsState = {
  notifications: [],
  maxNotifications: 5,
};

/**
 * Notifications slice for managing toast notifications
 */
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    /**
     * Add a notification
     */
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: `notification-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      };

      // Add to beginning of array
      state.notifications.unshift(notification);

      // Limit to max notifications
      if (state.notifications.length > state.maxNotifications) {
        state.notifications = state.notifications.slice(
          0,
          state.maxNotifications
        );
      }
    },

    /**
     * Remove a notification by ID
     */
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },

    /**
     * Clear all notifications
     */
    clearNotifications: (state) => {
      state.notifications = [];
    },

    /**
     * Add success notification (helper)
     */
    addSuccess: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: `notification-${Date.now()}-${Math.random()}`,
        message: action.payload,
        severity: 'success',
        autoHideDuration: 4000,
        timestamp: Date.now(),
      };
      state.notifications.unshift(notification);

      if (state.notifications.length > state.maxNotifications) {
        state.notifications = state.notifications.slice(
          0,
          state.maxNotifications
        );
      }
    },

    /**
     * Add error notification (helper)
     */
    addError: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: `notification-${Date.now()}-${Math.random()}`,
        message: action.payload,
        severity: 'error',
        autoHideDuration: 6000,
        timestamp: Date.now(),
      };
      state.notifications.unshift(notification);

      if (state.notifications.length > state.maxNotifications) {
        state.notifications = state.notifications.slice(
          0,
          state.maxNotifications
        );
      }
    },

    /**
     * Add warning notification (helper)
     */
    addWarning: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: `notification-${Date.now()}-${Math.random()}`,
        message: action.payload,
        severity: 'warning',
        autoHideDuration: 5000,
        timestamp: Date.now(),
      };
      state.notifications.unshift(notification);

      if (state.notifications.length > state.maxNotifications) {
        state.notifications = state.notifications.slice(
          0,
          state.maxNotifications
        );
      }
    },

    /**
     * Add info notification (helper)
     */
    addInfo: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: `notification-${Date.now()}-${Math.random()}`,
        message: action.payload,
        severity: 'info',
        autoHideDuration: 4000,
        timestamp: Date.now(),
      };
      state.notifications.unshift(notification);

      if (state.notifications.length > state.maxNotifications) {
        state.notifications = state.notifications.slice(
          0,
          state.maxNotifications
        );
      }
    },
  },
});

// Export actions
export const {
  addNotification,
  removeNotification,
  clearNotifications,
  addSuccess,
  addError,
  addWarning,
  addInfo,
} = notificationsSlice.actions;

// Export reducer
export default notificationsSlice.reducer;

// Selectors
export const selectNotifications = (state: {
  notifications: NotificationsState;
}) => state.notifications.notifications;

export const selectLatestNotification = (state: {
  notifications: NotificationsState;
}) => state.notifications.notifications[0] || null;
