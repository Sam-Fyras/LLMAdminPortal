import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import {
  Inbox as InboxIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

/**
 * Empty state variant types
 */
export type EmptyStateVariant = 'empty' | 'search' | 'error' | 'info';

/**
 * EmptyState props
 */
export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: React.ReactNode; // Custom icon
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  illustration?: React.ReactNode; // Custom illustration
  compact?: boolean; // Smaller padding for compact spaces
}

/**
 * Get default icon based on variant
 */
const getDefaultIcon = (variant: EmptyStateVariant) => {
  const iconProps = { sx: { fontSize: 80, color: 'text.secondary' } };

  switch (variant) {
    case 'search':
      return <SearchIcon {...iconProps} />;
    case 'error':
      return <WarningIcon {...iconProps} />;
    case 'info':
      return <InfoIcon {...iconProps} />;
    case 'empty':
    default:
      return <InboxIcon {...iconProps} />;
  }
};

/**
 * Reusable empty state component
 * Used for empty tables, lists, search results, etc.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'empty',
  icon,
  title,
  description,
  action,
  secondaryAction,
  illustration,
  compact = false,
}) => {
  const displayIcon = illustration || icon || getDefaultIcon(variant);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: compact ? 4 : 8,
        px: 2,
      }}
    >
      {displayIcon}

      <Typography
        variant={compact ? 'h6' : 'h5'}
        sx={{ mt: 2, mb: 1, fontWeight: 500 }}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 500, mb: 3 }}
        >
          {description}
        </Typography>
      )}

      {(action || secondaryAction) && (
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          {action && (
            <Button
              variant="contained"
              onClick={action.onClick}
              color="primary"
            >
              {action.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant="outlined"
              onClick={secondaryAction.onClick}
              color="primary"
            >
              {secondaryAction.label}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

/**
 * Predefined empty state variants for common use cases
 */

/**
 * Empty list state
 */
export const EmptyListState: React.FC<{
  title: string;
  description?: string;
  onAdd?: () => void;
  addLabel?: string;
}> = ({ title, description, onAdd, addLabel = 'Add Item' }) => (
  <EmptyState
    variant="empty"
    title={title}
    description={description}
    action={onAdd ? { label: addLabel, onClick: onAdd } : undefined}
  />
);

/**
 * No search results state
 */
export const NoSearchResultsState: React.FC<{
  searchTerm?: string;
  onClear?: () => void;
}> = ({ searchTerm, onClear }) => (
  <EmptyState
    variant="search"
    title="No results found"
    description={
      searchTerm
        ? `No results found for "${searchTerm}". Try adjusting your search.`
        : 'No results found. Try adjusting your search criteria.'
    }
    action={onClear ? { label: 'Clear Search', onClick: onClear } : undefined}
  />
);

/**
 * Usage examples:
 *
 * // Empty user list
 * {users.length === 0 && (
 *   <EmptyState
 *     variant="empty"
 *     title="No users yet"
 *     description="Get started by creating your first user."
 *     action={{
 *       label: 'Add User',
 *       onClick: () => openCreateDialog(),
 *     }}
 *   />
 * )}
 *
 * // No search results
 * {filteredUsers.length === 0 && searchTerm && (
 *   <NoSearchResultsState
 *     searchTerm={searchTerm}
 *     onClear={() => setSearchTerm('')}
 *   />
 * )}
 *
 * // Error state
 * {error && (
 *   <EmptyState
 *     variant="error"
 *     title="Failed to load data"
 *     description="An error occurred while loading the data."
 *     action={{
 *       label: 'Try Again',
 *       onClick: () => refetch(),
 *     }}
 *   />
 * )}
 *
 * // Compact version (in a small card)
 * <EmptyState
 *   compact
 *   title="No alerts"
 *   description="You're all caught up!"
 * />
 */
