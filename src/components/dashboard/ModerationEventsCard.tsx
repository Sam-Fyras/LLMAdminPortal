import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { Block as BlockIcon } from '@mui/icons-material';

interface ModerationEvent {
  ruleType: string;
  count: number;
}

interface ModerationEventsCardProps {
  total: number;
  breakdown: ModerationEvent[];
}

/**
 * ModerationEventsCard Component
 * Displays total blocked/redacted prompts with breakdown by rule type
 * Used in dashboard overview section
 */
export const ModerationEventsCard: React.FC<ModerationEventsCardProps> = ({
  total,
  breakdown,
}) => {
  return (
    <Card sx={{ flex: '1 1 250px', minWidth: '250px' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <BlockIcon color="error" fontSize="small" />
          <Typography color="text.secondary" variant="body2">
            Triggered Moderation Events
          </Typography>
        </Box>

        <Typography variant="h4" sx={{ mb: 2 }}>
          {total.toLocaleString()}
        </Typography>

        {breakdown && breakdown.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {breakdown.map((event, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  • {event.ruleType}
                </Typography>
                <Chip
                  label={event.count}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ModerationEventsCard;
