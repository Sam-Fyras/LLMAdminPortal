import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * LoadingSpinner props
 */
export interface LoadingSpinnerProps {
  size?: number; // Size of spinner in pixels
  message?: string; // Optional loading message
  fullScreen?: boolean; // If true, centers in viewport
  color?: 'primary' | 'secondary' | 'inherit';
  sx?: any; // Additional sx props
}

/**
 * Reusable loading spinner component
 * Can be used inline or as full-screen overlay
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  message,
  fullScreen = false,
  color = 'primary',
  sx = {},
}) => {
  const containerSx = fullScreen
    ? {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
        ...sx,
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
        gap: 2,
        ...sx,
      };

  return (
    <Box sx={containerSx}>
      <CircularProgress size={size} color={color} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
};

/**
 * Usage examples:
 *
 * // Inline loading (e.g., in a card)
 * {loading && <LoadingSpinner message="Loading users..." />}
 *
 * // Full-screen loading
 * {loading && <LoadingSpinner fullScreen message="Loading dashboard..." />}
 *
 * // Custom size and color
 * <LoadingSpinner size={60} color="secondary" message="Processing..." />
 *
 * // With custom styles
 * <LoadingSpinner sx={{ mt: 4, mb: 4 }} message="Fetching data..." />
 */
