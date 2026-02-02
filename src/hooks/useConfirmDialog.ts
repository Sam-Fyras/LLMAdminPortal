import { useState, useCallback } from 'react';

/**
 * Confirm dialog configuration
 */
export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  requiresTyping?: boolean; // Require user to type confirmation text
  typingText?: string; // Text that must be typed (e.g., username)
}

/**
 * Confirm dialog state
 */
export interface ConfirmDialogState extends ConfirmDialogConfig {
  isOpen: boolean;
  onConfirm: () => void | Promise<void>;
}

/**
 * Confirm dialog hook return type
 */
export interface UseConfirmDialogReturn {
  dialogState: ConfirmDialogState | null;
  openDialog: (
    config: ConfirmDialogConfig,
    onConfirm: () => void | Promise<void>
  ) => void;
  closeDialog: () => void;
  confirm: () => void | Promise<void>;
}

/**
 * Confirm dialog hook
 * Manages confirmation dialog state
 *
 * @returns Dialog state and handlers
 */
export const useConfirmDialog = (): UseConfirmDialogReturn => {
  const [dialogState, setDialogState] = useState<ConfirmDialogState | null>(
    null
  );

  const openDialog = useCallback(
    (
      config: ConfirmDialogConfig,
      onConfirm: () => void | Promise<void>
    ) => {
      setDialogState({
        ...config,
        isOpen: true,
        onConfirm,
        confirmText: config.confirmText || 'Confirm',
        cancelText: config.cancelText || 'Cancel',
        confirmColor: config.confirmColor || 'primary',
        requiresTyping: config.requiresTyping || false,
      });
    },
    []
  );

  const closeDialog = useCallback(() => {
    setDialogState(null);
  }, []);

  const confirm = useCallback(async () => {
    if (dialogState?.onConfirm) {
      await dialogState.onConfirm();
      closeDialog();
    }
  }, [dialogState, closeDialog]);

  return {
    dialogState,
    openDialog,
    closeDialog,
    confirm,
  };
};

/**
 * Usage example:
 *
 * function UserManagement() {
 *   const confirmDialog = useConfirmDialog();
 *   const toast = useToast();
 *
 *   const handleDelete = (user: User) => {
 *     confirmDialog.openDialog(
 *       {
 *         title: 'Delete User',
 *         message: `Are you sure you want to delete ${user.name}?`,
 *         confirmText: 'Delete',
 *         cancelText: 'Cancel',
 *         confirmColor: 'error',
 *         requiresTyping: true,
 *         typingText: user.name,
 *       },
 *       async () => {
 *         try {
 *           await deleteUserAPI(user.id);
 *           toast.success('User deleted successfully');
 *         } catch (error) {
 *           toast.error('Failed to delete user');
 *         }
 *       }
 *     );
 *   };
 *
 *   return (
 *     <>
 *       <Button onClick={() => handleDelete(user)}>Delete</Button>
 *
 *       {confirmDialog.dialogState && (
 *         <ConfirmDialog
 *           open={confirmDialog.dialogState.isOpen}
 *           title={confirmDialog.dialogState.title}
 *           message={confirmDialog.dialogState.message}
 *           confirmText={confirmDialog.dialogState.confirmText}
 *           cancelText={confirmDialog.dialogState.cancelText}
 *           confirmColor={confirmDialog.dialogState.confirmColor}
 *           requiresTyping={confirmDialog.dialogState.requiresTyping}
 *           typingText={confirmDialog.dialogState.typingText}
 *           onConfirm={confirmDialog.confirm}
 *           onCancel={confirmDialog.closeDialog}
 *         />
 *       )}
 *     </>
 *   );
 * }
 */
