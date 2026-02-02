import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
} from '@mui/material';

/**
 * ConfirmDialog props
 */
export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  requiresTyping?: boolean;
  typingText?: string; // Text that must be typed to enable confirm button
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

/**
 * Reusable confirmation dialog component
 * Supports "type to confirm" for dangerous actions
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  requiresTyping = false,
  typingText = '',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const [typedText, setTypedText] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  // Reset typed text when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setTypedText('');
      setIsConfirming(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
      setTypedText('');
    }
  };

  const handleCancel = () => {
    setTypedText('');
    onCancel();
  };

  // Check if confirm button should be disabled
  const isConfirmDisabled =
    isConfirming ||
    loading ||
    (requiresTyping && typedText !== typingText);

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isConfirming}
    >
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {message}
        </DialogContentText>

        {requiresTyping && (
          <Box>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone. Please type{' '}
              <strong>{typingText}</strong> to confirm.
            </Alert>

            <TextField
              fullWidth
              label={`Type "${typingText}" to confirm`}
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              disabled={isConfirming || loading}
              autoFocus
              placeholder={typingText}
              error={typedText !== '' && typedText !== typingText}
              helperText={
                typedText !== '' && typedText !== typingText
                  ? 'Text does not match'
                  : ''
              }
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleCancel}
          disabled={isConfirming || loading}
          color="inherit"
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isConfirmDisabled}
          color={confirmColor}
          variant="contained"
          autoFocus={!requiresTyping}
        >
          {isConfirming || loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * Usage example:
 *
 * const confirmDialog = useConfirmDialog();
 *
 * const handleDelete = (user: User) => {
 *   confirmDialog.openDialog({
 *     title: 'Delete User',
 *     message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
 *     confirmText: 'Delete',
 *     confirmColor: 'error',
 *     requiresTyping: true,
 *     typingText: user.name,
 *   }, async () => {
 *     await deleteUser(user.id);
 *     toast.success('User deleted');
 *   });
 * };
 *
 * return (
 *   <>
 *     <Button onClick={() => handleDelete(user)}>Delete</Button>
 *
 *     {confirmDialog.dialogState && (
 *       <ConfirmDialog
 *         open={confirmDialog.dialogState.isOpen}
 *         title={confirmDialog.dialogState.title}
 *         message={confirmDialog.dialogState.message}
 *         confirmText={confirmDialog.dialogState.confirmText}
 *         cancelText={confirmDialog.dialogState.cancelText}
 *         confirmColor={confirmDialog.dialogState.confirmColor}
 *         requiresTyping={confirmDialog.dialogState.requiresTyping}
 *         typingText={confirmDialog.dialogState.typingText}
 *         onConfirm={confirmDialog.confirm}
 *         onCancel={confirmDialog.closeDialog}
 *       />
 *     )}
 *   </>
 * );
 */
