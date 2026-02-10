import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
} from '@mui/material';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';

interface TopUser {
  user_id: string;
  tokens: number;
  rank: number;
}

interface TopUsersTableProps {
  data: TopUser[];
  limit?: number;
}

/**
 * TopUsersTable Component
 * Displays a table of top users ranked by token usage
 * Shows user rank, user ID, and total tokens consumed
 */
export const TopUsersTable: React.FC<TopUsersTableProps> = ({
  data,
  limit = 10,
}) => {
  const topUsers = data.slice(0, limit);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return '#CD7F32'; // bronze
    return 'default';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <TrophyIcon sx={{ fontSize: 20, color: getRankColor(rank) }} />;
    }
    return null;
  };

  return (
    <Card sx={{ flex: '1 1 400px', minWidth: '400px' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Top Users by Token Usage
        </Typography>

        {topUsers && topUsers.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>User ID</TableCell>
                  <TableCell align="right">Tokens</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topUsers.map((user) => (
                  <TableRow
                    key={user.user_id}
                    sx={{
                      '&:hover': { bgcolor: 'action.hover' },
                      bgcolor: user.rank <= 3 ? 'action.selected' : 'inherit',
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getRankIcon(user.rank)}
                        <Typography
                          variant="body2"
                          fontWeight={user.rank <= 3 ? 'bold' : 'normal'}
                        >
                          #{user.rank}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.user_id}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={user.tokens.toLocaleString()}
                        size="small"
                        color={user.rank === 1 ? 'primary' : 'default'}
                        variant={user.rank <= 3 ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 200,
            }}
          >
            <Typography color="text.secondary">
              No user data available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TopUsersTable;
