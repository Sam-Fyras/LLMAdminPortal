import { 
    Table, TableHead, TableBody, TableRow, Dialog, DialogContent, DialogContentText,
    TableCell, Pagination, Box, Tooltip, IconButton, DialogTitle, DialogActions,
    FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Button,
    Chip, Typography, LinearProgress, CircularProgress
} from '@mui/material';

import ProviderDetails from './ProviderDetails';
import ProviderEditForm from './ProviderEditForm';

import { 
    Delete as DeleteIcon, 
    Edit as EditIcon,
    Refresh as RefreshIcon,
    WifiTethering as TestConnectionIcon,
    Star as DefaultIcon
} from '@mui/icons-material';

import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { ChangeEvent, useState } from 'react';

// Import your existing LLMProvider type
import { LLMProvider } from '../../mocks/data/providers';

// ── Local Types for Health Monitoring ────────────────────────────────────────

type HealthStatus = 'healthy' | 'degraded' | 'down';
type ApiKeyStatus = 'valid' | 'invalid' | 'expired' | 'not_set';

export interface ProviderHealthData {
    status: HealthStatus;
    lastChecked: Date;
    uptime: {
        last24h: number;
        last7d: number;
        last30d: number;
    };
    avgResponseTime: number;
    errorRate: number;
    lastError?: {
        message: string;
        timestamp: Date;
    };
}

// ── Component Props ──────────────────────────────────────────────────────────

interface ProviderListProps {
    SearchProvider: LLMProvider[];
    healthData?: Record<string, ProviderHealthData>;  // Health data keyed by provider ID
    onTestConnection?: (providerId: string) => void;
    onRefreshHealth?: (providerId: string) => void;
    onDelete?: (providerId: string) => void;
}

// ── Helper Components ────────────────────────────────────────────────────────

/**
 * Health Status Indicator
 * Displays a colored dot with label based on health status
 */
const HealthStatusIndicator: React.FC<{ 
    status: HealthStatus; 
    lastChecked?: Date;
}> = ({ status, lastChecked }) => {
    const getStatusConfig = (s: HealthStatus) => {
        switch (s) {
            case 'healthy':
                return { color: 'success.main', label: 'Healthy' };
            case 'degraded':
                return { color: 'warning.main', label: 'Degraded' };
            case 'down':
                return { color: 'error.main', label: 'Down' };
            default:
                return { color: 'grey.500', label: 'Unknown' };
        }
    };

    const formatTimestamp = (date: Date): string => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const config = getStatusConfig(status);

    return (
        <Tooltip 
            title={lastChecked ? `Last checked: ${formatTimestamp(lastChecked)}` : 'No health data'}
            arrow
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                    sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: config.color,
                        animation: status !== 'healthy' ? 'pulse 2s infinite' : 'none',
                        '@keyframes pulse': {
                            '0%': { opacity: 1 },
                            '50%': { opacity: 0.5 },
                            '100%': { opacity: 1 },
                        },
                    }}
                />
                <Typography variant="body2" color={config.color}>
                    {config.label}
                </Typography>
            </Box>
        </Tooltip>
    );
};

/**
 * API Key Status Chip
 * Displays the status of the API key
 */
const ApiKeyStatusChip: React.FC<{ status: ApiKeyStatus }> = ({ status }) => {
    const getConfig = (s: ApiKeyStatus) => {
        switch (s) {
            case 'valid':
                return { color: 'success' as const, label: 'Valid' };
            case 'invalid':
                return { color: 'error' as const, label: 'Invalid' };
            case 'expired':
                return { color: 'warning' as const, label: 'Expired' };
            case 'not_set':
                return { color: 'default' as const, label: 'Not Set' };
            default:
                return { color: 'default' as const, label: 'Unknown' };
        }
    };

    const config = getConfig(status);

    return (
        <Chip 
            label={config.label} 
            color={config.color} 
            size="small" 
            variant="outlined"
        />
    );
};

/**
 * Uptime Progress Bar
 * Mini progress bar showing uptime percentage
 */
const UptimeBar: React.FC<{ uptime: number }> = ({ uptime }) => {
    const getColor = (value: number): 'success' | 'warning' | 'error' => {
        if (value >= 99) return 'success';
        if (value >= 95) return 'warning';
        return 'error';
    };

    return (
        <Box sx={{ minWidth: 80 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                    {uptime.toFixed(1)}%
                </Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={uptime}
                color={getColor(uptime)}
                sx={{ height: 4, borderRadius: 2 }}
            />
        </Box>
    );
};

// ── Main Component ───────────────────────────────────────────────────────────

const ProviderList: React.FC<ProviderListProps> = ({ 
    SearchProvider,
    healthData = {},
    onTestConnection,
    onRefreshHealth,
    onDelete
}) => {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [providerToDelete, setProviderToDelete] = useState<LLMProvider | null>(null);

    const [openProvider, setOpenProvider] = useState(false);
    const [openEditForm, setOpenEditForm] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<LLMProvider | null>(null);

    const [testingConnection, setTestingConnection] = useState<string | null>(null);
    const [refreshingHealth, setRefreshingHealth] = useState<string | null>(null);

    // ── Helper to get provider ID ─────────────────────────────────────────────
    const getProviderId = (provider: LLMProvider): string => {
        return provider._id.$oid;
    };

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleChangePage = (event: ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleChangeRowsPerPage = (event: SelectChangeEvent<number>) => {
        setRowsPerPage(Number(event.target.value));
        setPage(1);
    };

    const handleDeleteClick = (provider: LLMProvider) => {
        setProviderToDelete(provider);
        setDeleteDialogOpen(true);
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setProviderToDelete(null);
    };

    const handleDeleteConfirm = () => {
        if (providerToDelete && onDelete) {
            onDelete(getProviderId(providerToDelete));
        }
        setDeleteDialogOpen(false);
        setProviderToDelete(null);
    };

    const handleTestConnection = (e: React.MouseEvent, providerId: string) => {
        e.stopPropagation();
        if (!onTestConnection) return;
        setTestingConnection(providerId);
        // Simulate delay for UI feedback
        setTimeout(() => {
            onTestConnection(providerId);
            setTestingConnection(null);
        }, 1500);
    };

    const handleRefreshHealth = (e: React.MouseEvent, providerId: string) => {
        e.stopPropagation();
        if (!onRefreshHealth) return;
        setRefreshingHealth(providerId);
        // Simulate delay for UI feedback
        setTimeout(() => {
            onRefreshHealth(providerId);
            setRefreshingHealth(null);
        }, 1000);
    };

    const handleRowClick = (provider: LLMProvider) => {
        setSelectedProvider(provider);
        setOpenProvider(true);
    };

    const handleEditClick = (e: React.MouseEvent, provider: LLMProvider) => {
        e.stopPropagation();
        setSelectedProvider(provider);
        setOpenEditForm(true);
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            <Table stickyHeader>
                <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.100' } }}>
                        <TableCell sx={{ minWidth: 180 }}>Provider</TableCell>
                        <TableCell sx={{ minWidth: 100 }}>Status</TableCell>
                        <TableCell sx={{ minWidth: 100 }}>API Key</TableCell>
                        <TableCell sx={{ minWidth: 120 }}>Health</TableCell>
                        <TableCell sx={{ minWidth: 100 }}>Uptime (24h)</TableCell>
                        <TableCell sx={{ minWidth: 100 }}>Default</TableCell>
                        <TableCell sx={{ minWidth: 150 }}>Actions</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {SearchProvider
                        .slice((page - 1) * rowsPerPage, (page - 1) * rowsPerPage + rowsPerPage)
                        .map((row) => {
                            const providerId = getProviderId(row);
                            const health = healthData[providerId];

                            return (
                                <TableRow 
                                    key={providerId} 
                                    hover
                                    sx={{ 
                                        cursor: 'pointer',
                                        opacity: row.is_active ? 1 : 0.6,
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                    onClick={() => handleRowClick(row)}
                                >
                                    {/* Provider Name & Model */}
                                    <TableCell>
                                        <Box>
                                            <Typography 
                                                variant="body2" 
                                                fontWeight={500}
                                                sx={{ textTransform: 'capitalize' }}
                                            >
                                                {row.provider}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {row.models.join(', ')}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    {/* Active Status */}
                                    <TableCell>
                                        <Chip 
                                            label={row.is_active ? 'Active' : 'Inactive'}
                                            color={row.is_active ? 'success' : 'default'}
                                            size="small"
                                            variant="filled"
                                        />
                                    </TableCell>

                                    {/* API Key Status */}
                                    <TableCell>
                                        <ApiKeyStatusChip status={row.api_key_id ? 'valid' : 'not_set'} />
                                    </TableCell>

                                    {/* Health Status */}
                                    <TableCell>
                                        {health ? (
                                            <HealthStatusIndicator 
                                                status={health.status}
                                                lastChecked={health.lastChecked}
                                            />
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                N/A
                                            </Typography>
                                        )}
                                    </TableCell>

                                    {/* Uptime */}
                                    <TableCell>
                                        {health?.uptime ? (
                                            <UptimeBar uptime={health.uptime.last24h} />
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">—</Typography>
                                        )}
                                    </TableCell>

                                    {/* Default Provider Indicator */}
                                    <TableCell>
                                        {row.is_default ? (
                                            <Chip
                                                icon={<DefaultIcon fontSize="small" />}
                                                label="Default"
                                                color="primary"
                                                size="small"
                                                variant="filled"
                                            />
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                —
                                            </Typography>
                                        )}
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            {/* Test Connection */}
                                            <Tooltip title="Test Connection">
                                                <IconButton 
                                                    size="small" 
                                                    color="info"
                                                    onClick={(e) => handleTestConnection(e, providerId)}
                                                    disabled={testingConnection === providerId}
                                                >
                                                    {testingConnection === providerId ? (
                                                        <CircularProgress size={16} />
                                                    ) : (
                                                        <TestConnectionIcon fontSize="small" />
                                                    )}
                                                </IconButton>
                                            </Tooltip>

                                            {/* Refresh Health */}
                                            <Tooltip title="Refresh Health">
                                                <IconButton 
                                                    size="small" 
                                                    color="default"
                                                    onClick={(e) => handleRefreshHealth(e, providerId)}
                                                    disabled={refreshingHealth === providerId}
                                                >
                                                    {refreshingHealth === providerId ? (
                                                        <CircularProgress size={16} />
                                                    ) : (
                                                        <RefreshIcon fontSize="small" />
                                                    )}
                                                </IconButton>
                                            </Tooltip>

                                            {/* Edit */}
                                            <Tooltip title="Edit Provider">
                                                <IconButton 
                                                    size="small" 
                                                    color="primary"
                                                    onClick={(e) => handleEditClick(e, row)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>

                                            {/* Delete */}
                                            <Tooltip title="Delete Provider">
                                                <IconButton 
                                                    size="small" 
                                                    color="error"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(row);
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                </TableBody>
            </Table>

            {/* Pagination */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 2,
                p: 1,
                mt: 1,
            }}>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel id="rows-per-page-label">Rows</InputLabel>
                    <Select
                        labelId="rows-per-page-label"
                        value={rowsPerPage}
                        label="Rows"
                        onChange={handleChangeRowsPerPage}
                    >
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={15}>15</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                    </Select>
                </FormControl>
                <Pagination
                    count={Math.ceil(SearchProvider.length / rowsPerPage)}
                    page={page}
                    onChange={handleChangePage}
                    color="primary"
                />
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmberIcon color="error" />
                    Delete Provider
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete{' '}
                        <strong>{providerToDelete?.provider}</strong>?
                        <br /><br />
                        This action cannot be undone. All configuration and usage history 
                        associated with this provider will be removed.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        color="error" 
                        onClick={handleDeleteConfirm}
                    >
                        Delete Provider
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Provider Details Dialog */}
            <ProviderDetails 
                open={openProvider} 
                onClose={() => setOpenProvider(false)} 
                provider={selectedProvider as any}
                healthData={selectedProvider ? healthData[getProviderId(selectedProvider)] : undefined}
                onRefreshHealth={onRefreshHealth}
            />

            {/* Provider Edit Form Dialog */}
            <ProviderEditForm 
                open={openEditForm} 
                onClose={() => setOpenEditForm(false)} 
                provider={selectedProvider as any}
            />
        </>
    );
};

export default ProviderList;