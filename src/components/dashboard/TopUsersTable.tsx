import React, { useState, useMemo } from 'react';
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
  TableSortLabel,
  Box,
  Chip,
} from '@mui/material';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';

interface TopUser {
  user_id: string;
  name: string;
  tokens: number;
  cost: number;
  lastActivity: string;
  rank: number;
}

interface TopUsersTableProps {
  data: TopUser[];
  limit?: number;
  onUserClick?: (userId: string) => void;
}

type SortKey = 'rank' | 'name' | 'tokens' | 'cost' | 'lastActivity';
type SortDirection = 'asc' | 'desc';

const columns: { key: SortKey; label: string; align?: 'right' }[] = [
  { key: 'rank', label: 'Rank' },
  { key: 'name', label: 'User Name' },
  { key: 'tokens', label: 'Tokens', align: 'right' },
  { key: 'cost', label: 'Est. Cost', align: 'right' },
  { key: 'lastActivity', label: 'Last Activity' },
];

/**
 * TopUsersTable Component
 * Displays a sortable table of top users ranked by token usage
 */
export const TopUsersTable: React.FC<TopUsersTableProps> = ({
  data,
  limit = 10,
  onUserClick,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'rank' ? 'asc' : 'desc');
    }
  };

  const sortedUsers = useMemo(() => {
    const sliced = data.slice(0, limit);
    return [...sliced].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      let comparison: number;
      if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      } else {
        comparison = (valA as number) - (valB as number);
      }

      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [data, limit, sortKey, sortDir]);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return '#CD7F32';
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

        {sortedUsers && sortedUsers.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell key={col.key} align={col.align}>
                      <TableSortLabel
                        active={sortKey === col.key}
                        direction={sortKey === col.key ? sortDir : 'asc'}
                        onClick={() => handleSort(col.key)}
                      >
                        {col.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedUsers.map((user) => (
                  <TableRow
                    key={user.user_id}
                    onClick={() => onUserClick?.(user.user_id)}
                    sx={{
                      '&:hover': { bgcolor: 'action.hover', cursor: onUserClick ? 'pointer' : 'default' },
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
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{user.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{user.user_id}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={user.tokens.toLocaleString()}
                        size="small"
                        color={user.rank === 1 ? 'primary' : 'default'}
                        variant={user.rank <= 3 ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">${user.cost.toFixed(2)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.lastActivity}</Typography>
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
