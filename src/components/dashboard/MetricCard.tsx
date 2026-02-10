import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface MetricCardProps {
  title: string;
  value: string | number;
}

/**
 * MetricCard Component
 * Reusable card component for displaying dashboard metrics
 * Used for stats like Total Tokens, Active Users, Cost, etc.
 */
export const MetricCard: React.FC<MetricCardProps> = ({ title, value }) => {
  return (
    <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
      <CardContent>
        <Typography color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
