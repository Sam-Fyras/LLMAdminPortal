import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, MenuItem,
  Select, FormControl, InputLabel, Switch, Chip, IconButton,
  Tooltip, InputAdornment,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Science as TestIcon,
  Search as SearchIcon,
  DragIndicator as DragHandleIcon,
} from '@mui/icons-material';
import { TenantRule } from '../../types/rule';
import { RULE_TYPE_OPTIONS, RULE_TYPE_COLORS, getRuleTypeName } from './RuleTypeSelector';

interface RuleListProps {
  rules: TenantRule[];
  onEdit: (rule: TenantRule) => void;
  onDelete: (id: string) => void;
  onDuplicate: (rule: TenantRule) => void;
  onToggleStatus: (id: string, enabled: boolean) => void;
  onTest: (ruleId: string) => void;
  onReorder?: (draggedId: string, droppedOnId: string) => void;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString();
};

export const RuleList: React.FC<RuleListProps> = ({
  rules,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
  onTest,
  onReorder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const isFiltered = searchQuery || filterType !== 'all' || filterStatus !== 'all';

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      const matchesSearch = !searchQuery || rule.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || rule.type === filterType;
      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'enabled' && rule.enabled) ||
        (filterStatus === 'disabled' && !rule.enabled);
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [rules, searchQuery, filterType, filterStatus]);

  return (
    <>
      {/* Filter Toolbar */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 220 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Rule Type</InputLabel>
          <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="Rule Type">
            <MenuItem value="all">All Types</MenuItem>
            {RULE_TYPE_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="enabled">Enabled</MenuItem>
            <MenuItem value="disabled">Disabled</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          {filteredRules.length} of {rules.length} rules
        </Typography>
      </Paper>

      {/* Rules Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {onReorder && <TableCell sx={{ width: 40, p: 1 }} />}
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Scope</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Last Modified</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={onReorder ? 9 : 8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {rules.length === 0
                      ? 'No rules found. Create your first rule to get started.'
                      : 'No rules match your current filters.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRules.map((rule) => {
                const canDrag = !!onReorder && !isFiltered;
                return (
                  <TableRow
                    key={rule.id}
                    draggable={canDrag}
                    onDragStart={canDrag ? () => setDraggedId(rule.id) : undefined}
                    onDragOver={canDrag ? (e) => { e.preventDefault(); setDragOverId(rule.id); } : undefined}
                    onDrop={canDrag ? () => {
                      if (draggedId && draggedId !== rule.id) onReorder!(draggedId, rule.id);
                      setDraggedId(null);
                      setDragOverId(null);
                    } : undefined}
                    onDragEnd={() => { setDraggedId(null); setDragOverId(null); }}
                    sx={{
                      opacity: draggedId === rule.id ? 0.4 : (rule.enabled ? 1 : 0.6),
                      bgcolor: dragOverId === rule.id && draggedId !== rule.id ? 'action.hover' : undefined,
                      transition: 'background-color 0.15s',
                    }}

                  >
                    {onReorder && (
                      <TableCell sx={{ p: 1, width: 40 }}>
                        <Tooltip title={isFiltered ? 'Remove filters to reorder' : 'Drag to reorder'}>
                          <span>
                            <DragHandleIcon
                              fontSize="small"
                              sx={{
                                color: canDrag ? 'text.disabled' : 'action.disabled',
                                cursor: canDrag ? 'grab' : 'not-allowed',
                                display: 'block',
                              }}
                            />
                          </span>
                        </Tooltip>
                      </TableCell>
                    )}
                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body2" fontWeight={500}>{rule.name}</Typography>
                        </Box>
                        {rule.description && (
                          <Typography variant="caption" color="text.secondary">
                            {rule.description.length > 60
                              ? `${rule.description.substring(0, 60)}...`
                              : rule.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getRuleTypeName(rule.type)}
                        color={RULE_TYPE_COLORS[rule.type] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label="Tenant" variant="outlined" size="small" color="default" />
                    </TableCell>
                    <TableCell>{rule.priority}</TableCell>
                    <TableCell>
                      <Switch
                        checked={rule.enabled}
                        onChange={(e) => onToggleStatus(rule.id, e.target.checked)}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={(rule.parameters?.action as string) || 'block'}
                        color={
                          rule.parameters?.action === 'block' ? 'error' :
                          rule.parameters?.action === 'modify' ? 'warning' :
                          rule.parameters?.action === 'throttle' ? 'info' :
                          rule.parameters?.action === 'allow' ? 'success' : 'default'
                        }
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(rule.updated_at || rule.updatedDate)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Tooltip title="Edit">
                          <span>
                            <IconButton size="small" onClick={() => onEdit(rule)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Duplicate">
                          <IconButton size="small" onClick={() => onDuplicate(rule)}>
                            <DuplicateIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Test">
                          <IconButton size="small" onClick={() => onTest(rule.id)}>
                            <TestIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <span>
                            <IconButton size="small" color="error" onClick={() => onDelete(rule.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default RuleList;
