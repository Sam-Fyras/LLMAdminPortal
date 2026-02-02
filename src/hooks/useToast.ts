import { useCallback } from 'react';
import { useAppDispatch } from '../redux/hooks';
import {
  addSuccess,
  addError,
  addWarning,
  addInfo,
} from '../redux/slices/notificationsSlice';

/**
 * Toast notification hook
 * Provides convenient methods to show toast notifications
 */
export const useToast = () => {
  const dispatch = useAppDispatch();

  const success = useCallback(
    (message: string) => {
      dispatch(addSuccess(message));
    },
    [dispatch]
  );

  const error = useCallback(
    (message: string) => {
      dispatch(addError(message));
    },
    [dispatch]
  );

  const warning = useCallback(
    (message: string) => {
      dispatch(addWarning(message));
    },
    [dispatch]
  );

  const info = useCallback(
    (message: string) => {
      dispatch(addInfo(message));
    },
    [dispatch]
  );

  return {
    success,
    error,
    warning,
    info,
  };
};

/**
 * Usage example:
 *
 * const toast = useToast();
 *
 * // Show success
 * toast.success('User created successfully!');
 *
 * // Show error
 * toast.error('Failed to save changes');
 *
 * // Show warning
 * toast.warning('Token limit approaching');
 *
 * // Show info
 * toast.info('New feature available');
 */
