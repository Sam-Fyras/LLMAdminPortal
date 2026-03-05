import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    Button,
    Divider,
    Paper,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    LinearProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    CheckCircle as HealthyIcon,
    Warning as DegradedIcon,
    Error as DownIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Speed as SpeedIcon,
    CloudQueue as ProviderIcon,
    Notifications as AlertIcon,
    SwapVert as FailoverIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import ProviderHealthStatus, { 
    ProviderHealthData, 
    HealthStatus, 
    ProviderHealthIndicator 
} from './ProviderHealthStatus';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ProviderWithHealth {
    _id: string;
    provider: string;
    model: string;
    is_active: boolean;
    isDefault: boolean;
    fallbackPriority: number;
    healthStatus: ProviderHealthData;
}

interface ProviderHealthDashboardProps {
    providers: ProviderWithHealth[];
    onRefreshProvider?: (providerId: string) => void;
    onRefreshAll?: () => void;
    onTriggerFailover?: (fromProviderId: string, toProviderId: string) => void;
    autoRefreshInterval?: number;  // in seconds, 0 to disable
}

interface HealthSummary {
    total: number;
    healthy: number;
    degraded: number;
    down: number;
    avgUptime: number;
    avgResponseTime: number;
    avgErrorRate: number;
}

// ── Helper Functions ─────────────────────────────────────────────────────────

const calculateHealthSummary = (providers: ProviderWithHealth[]): HealthSummary => {
    const activeProviders = providers.filter(p => p.is_active && p.healthStatus);
    
    if (activeProviders.length === 0) {
        return {
            total: providers.length,
            healthy: 0,
            degraded: 0,
            down: 0,
            avgUptime: 0,
            avgResponseTime: 0,
            avgErrorRate: 0,
        };
    }

    const summary = activeProviders.reduce(
        (acc, p) => ({
            healthy: acc.healthy + (p.healthStatus.status === 'healthy' ? 1 : 0),
            degraded: acc.degraded + (p.healthStatus.status === 'degraded' ? 1 : 0),
            down: acc.down + (p.healthStatus.status === 'down' ? 1 : 0),
            totalUptime: acc.totalUptime + p.healthStatus.uptime.last24h,
            totalResponseTime: acc.totalResponseTime + p.healthStatus.avgResponseTime,
            totalErrorRate: acc.totalErrorRate + p.healthStatus.errorRate,
        }),
        { healthy: 0, degraded: 0, down: 0, totalUptime: 0, totalResponseTime: 0, totalErrorRate: 0 }
    );

    return {
        total: providers.length,
        healthy: summary.healthy,
        degraded: summary.degraded,
        down: summary.down,
        avgUptime: summary.totalUptime / activeProviders.length,
        avgResponseTime: summary.totalResponseTime / activeProviders.length,
        avgErrorRate: summary.totalErrorRate / activeProviders.length,
    };
};

const getOverallHealth = (summary: HealthSummary): HealthStatus => {
    if (summary.down > 0) return 'down';
    if (summary.degraded > 0) return 'degraded';
    return 'healthy';
};

const formatMs = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
};

// ── Summary Card Component ───────────────────────────────────────────────────

const SummaryCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: 'success' | 'warning' | 'error' | 'info' | 'primary';
    trend?: 'up' | 'down' | 'neutral';
}> = ({ title, value, subtitle, icon, color, trend }) => (
    <Card 
        variant="outlined" 
        sx={{ 
            height: '100%',
            borderLeft: 4,
            borderLeftColor: `${color}.main`,
        }}
    >
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color={`${color}.main`}>
                        {value}
                    </Typography>
                    {subtitle && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            {trend === 'up' && <TrendingUpIcon fontSize="small" color="success" />}
                            {trend === 'down' && <TrendingDownIcon fontSize="small" color="error" />}
                            <Typography variant="caption" color="text.secondary">
                                {subtitle}
                            </Typography>
                        </Box>
                    )}
                </Box>
                <Box 
                    sx={{ 
                        p: 1, 
                        borderRadius: 2, 
                        bgcolor: `${color}.50`,
                        color: `${color}.main`,
                    }}
                >
                    {icon}
                </Box>
            </Box>
        </CardContent>
    </Card>
);

// ── Status Distribution Component ────────────────────────────────────────────

const StatusDistribution: React.FC<{ summary: HealthSummary }> = ({ summary }) => {
    const total = summary.healthy + summary.degraded + summary.down;
    if (total === 0) return null;

    const healthyPercent = (summary.healthy / total) * 100;
    const degradedPercent = (summary.degraded / total) * 100;
    const downPercent = (summary.down / total) * 100;

    return (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                {healthyPercent > 0 && (
                    <Box sx={{ width: `${healthyPercent}%`, bgcolor: 'success.main' }} />
                )}
                {degradedPercent > 0 && (
                    <Box sx={{ width: `${degradedPercent}%`, bgcolor: 'warning.main' }} />
                )}
                {downPercent > 0 && (
                    <Box sx={{ width: `${downPercent}%`, bgcolor: 'error.main' }} />
                )}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                    <Typography variant="caption">{summary.healthy} Healthy</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                    <Typography variant="caption">{summary.degraded} Degraded</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
                    <Typography variant="caption">{summary.down} Down</Typography>
                </Box>
            </Box>
        </Box>
    );
};

// ── Provider Health Table ────────────────────────────────────────────────────

const ProviderHealthTable: React.FC<{
    providers: ProviderWithHealth[];
    onRefresh?: (providerId: string) => void;
    onSelectProvider?: (provider: ProviderWithHealth) => void;
}> = ({ providers, onRefresh, onSelectProvider }) => {
    const [refreshingId, setRefreshingId] = useState<string | null>(null);

    const handleRefresh = (e: React.MouseEvent, providerId: string) => {
        e.stopPropagation();
        if (!onRefresh) return;
        setRefreshingId(providerId);
        // Simulate delay for UI feedback
        setTimeout(() => {
            onRefresh(providerId);
            setRefreshingId(null);
        }, 1000);
    };

    const sortedProviders = [...providers].sort((a, b) => {
        // Sort by: default first, then by fallback priority, then by status
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return a.fallbackPriority - b.fallbackPriority;
    });

    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Provider</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Uptime (24h)</TableCell>
                    <TableCell>Latency</TableCell>
                    <TableCell>Error Rate</TableCell>
                    <TableCell>Last Checked</TableCell>
                    <TableCell align="right">Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {sortedProviders.map((provider) => {
                    const health = provider.healthStatus;
                    return (
                        <TableRow 
                            key={provider._id}
                            hover
                            sx={{ 
                                cursor: onSelectProvider ? 'pointer' : 'default',
                                opacity: provider.is_active ? 1 : 0.5,
                            }}
                            onClick={() => onSelectProvider?.(provider)}
                        >
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                                        {provider.provider}
                                    </Typography>
                                    {provider.isDefault && (
                                        <Chip label="Default" size="small" color="primary" variant="outlined" />
                                    )}
                                    {!provider.is_active && (
                                        <Chip label="Inactive" size="small" variant="outlined" />
                                    )}
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    {provider.model}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                {health ? (
                                    <ProviderHealthIndicator status={health.status} />
                                ) : (
                                    <Typography variant="body2" color="text.secondary">N/A</Typography>
                                )}
                            </TableCell>
                            <TableCell>
                                {health ? (
                                    <Box sx={{ minWidth: 100 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="caption">
                                                {health.uptime.last24h.toFixed(1)}%
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={health.uptime.last24h}
                                            color={health.uptime.last24h >= 99 ? 'success' : health.uptime.last24h >= 95 ? 'warning' : 'error'}
                                            sx={{ height: 4, borderRadius: 2 }}
                                        />
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">—</Typography>
                                )}
                            </TableCell>
                            <TableCell>
                                {health ? (
                                    <Chip
                                        label={formatMs(health.avgResponseTime)}
                                        size="small"
                                        color={health.avgResponseTime <= 500 ? 'success' : health.avgResponseTime <= 1500 ? 'warning' : 'error'}
                                        variant="outlined"
                                    />
                                ) : (
                                    <Typography variant="body2" color="text.secondary">—</Typography>
                                )}
                            </TableCell>
                            <TableCell>
                                {health ? (
                                    <Typography
                                        variant="body2"
                                        color={health.errorRate <= 1 ? 'success.main' : health.errorRate <= 5 ? 'warning.main' : 'error.main'}
                                    >
                                        {health.errorRate.toFixed(2)}%
                                    </Typography>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">—</Typography>
                                )}
                            </TableCell>
                            <TableCell>
                                {health ? (
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(health.lastChecked).toLocaleTimeString()}
                                    </Typography>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">Never</Typography>
                                )}
                            </TableCell>
                            <TableCell align="right">
                                <Tooltip title="Refresh health check">
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleRefresh(e, provider._id)}
                                        disabled={refreshingId === provider._id}
                                    >
                                        {refreshingId === provider._id ? (
                                            <CircularProgress size={16} />
                                        ) : (
                                            <RefreshIcon fontSize="small" />
                                        )}
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};

// ── Failover Alert Component ─────────────────────────────────────────────────

const FailoverAlert: React.FC<{
    downProviders: ProviderWithHealth[];
    availableProviders: ProviderWithHealth[];
    onTriggerFailover?: (fromId: string, toId: string) => void;
}> = ({ downProviders, availableProviders, onTriggerFailover }) => {
    const [selectedBackup, setSelectedBackup] = useState<string>('');
    const [failoverInProgress, setFailoverInProgress] = useState(false);

    if (downProviders.length === 0) return null;

    const handleFailover = (fromId: string) => {
        if (!onTriggerFailover || !selectedBackup) return;
        setFailoverInProgress(true);
        // Simulate delay for UI feedback
        setTimeout(() => {
            onTriggerFailover(fromId, selectedBackup);
            setFailoverInProgress(false);
        }, 1500);
    };

    return (
        <Alert 
            severity="error" 
            icon={<FailoverIcon />}
            sx={{ mb: 2 }}
            action={
                availableProviders.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Failover to</InputLabel>
                            <Select
                                value={selectedBackup}
                                label="Failover to"
                                onChange={(e: SelectChangeEvent) => setSelectedBackup(e.target.value)}
                            >
                                {availableProviders.map((p) => (
                                    <MenuItem key={p._id} value={p._id}>
                                        {p.provider} ({p.model})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            size="small"
                            color="error"
                            disabled={!selectedBackup || failoverInProgress}
                            onClick={() => handleFailover(downProviders[0]._id)}
                        >
                            {failoverInProgress ? <CircularProgress size={16} /> : 'Failover'}
                        </Button>
                    </Box>
                )
            }
        >
            <Typography variant="body2" fontWeight={500}>
                {downProviders.length} provider(s) are currently down
            </Typography>
            <Typography variant="body2">
                {downProviders.map(p => p.provider).join(', ')} - Auto-failover may be triggered
            </Typography>
        </Alert>
    );
};

// ── Main Dashboard Component ─────────────────────────────────────────────────

const ProviderHealthDashboard: React.FC<ProviderHealthDashboardProps> = ({
    providers,
    onRefreshProvider,
    onRefreshAll,
    onTriggerFailover,
    autoRefreshInterval = 60,
}) => {
    const [refreshingAll, setRefreshingAll] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<ProviderWithHealth | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const summary = calculateHealthSummary(providers);
    const overallHealth = getOverallHealth(summary);

    const downProviders = providers.filter(p => p.is_active && p.healthStatus?.status === 'down');
    const healthyProviders = providers.filter(p => p.is_active && p.healthStatus?.status === 'healthy');

    // Auto-refresh effect
    useEffect(() => {
        if (autoRefreshInterval <= 0 || !onRefreshAll) return;

        const interval = setInterval(() => {
            onRefreshAll();
            setLastRefresh(new Date());
        }, autoRefreshInterval * 1000);

        return () => clearInterval(interval);
    }, [autoRefreshInterval, onRefreshAll]);

    const handleRefreshAll = () => {
        if (!onRefreshAll) return;
        setRefreshingAll(true);
        // Simulate delay for UI feedback
        setTimeout(() => {
            onRefreshAll();
            setLastRefresh(new Date());
            setRefreshingAll(false);
        }, 1500);
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={600}>
                        Provider Health Monitoring
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Last updated: {lastRefresh.toLocaleTimeString()}
                        {autoRefreshInterval > 0 && ` • Auto-refresh every ${autoRefreshInterval}s`}
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={refreshingAll ? <CircularProgress size={16} /> : <RefreshIcon />}
                    onClick={handleRefreshAll}
                    disabled={refreshingAll}
                >
                    Refresh All
                </Button>
            </Box>

            {/* Failover Alert */}
            <FailoverAlert
                downProviders={downProviders}
                availableProviders={healthyProviders}
                onTriggerFailover={onTriggerFailover}
            />

            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{xs: 12, sm: 6, md: 3}}>
                    <SummaryCard
                        title="Overall Status"
                        value={overallHealth === 'healthy' ? 'Healthy' : overallHealth === 'degraded' ? 'Degraded' : 'Issues'}
                        subtitle={`${summary.healthy}/${summary.total} providers healthy`}
                        icon={overallHealth === 'healthy' ? <HealthyIcon /> : overallHealth === 'degraded' ? <DegradedIcon /> : <DownIcon />}
                        color={overallHealth === 'healthy' ? 'success' : overallHealth === 'degraded' ? 'warning' : 'error'}
                    />
                </Grid>
                <Grid size={{xs: 12, sm: 6, md: 3}}>
                    <SummaryCard
                        title="Avg Uptime (24h)"
                        value={`${summary.avgUptime.toFixed(2)}%`}
                        subtitle="Across all active providers"
                        icon={<TrendingUpIcon />}
                        color={summary.avgUptime >= 99 ? 'success' : summary.avgUptime >= 95 ? 'warning' : 'error'}
                        trend={summary.avgUptime >= 99 ? 'up' : 'down'}
                    />
                </Grid>
                <Grid size={{xs: 12, sm: 6, md: 3}}>
                    <SummaryCard
                        title="Avg Response Time"
                        value={formatMs(summary.avgResponseTime)}
                        subtitle="Average latency"
                        icon={<SpeedIcon />}
                        color={summary.avgResponseTime <= 500 ? 'success' : summary.avgResponseTime <= 1500 ? 'warning' : 'error'}
                    />
                </Grid>
                <Grid size={{xs: 12, sm: 6, md: 3}}>
                    <SummaryCard
                        title="Avg Error Rate"
                        value={`${summary.avgErrorRate.toFixed(2)}%`}
                        subtitle="Errors across providers"
                        icon={<AlertIcon />}
                        color={summary.avgErrorRate <= 1 ? 'success' : summary.avgErrorRate <= 5 ? 'warning' : 'error'}
                        trend={summary.avgErrorRate <= 1 ? 'up' : 'down'}
                    />
                </Grid>
            </Grid>

            {/* Status Distribution */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Provider Status Distribution
                </Typography>
                <StatusDistribution summary={summary} />
            </Paper>

            {/* Provider Health Table */}
            <Paper variant="outlined" sx={{ mb: 3 }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                        Provider Details
                    </Typography>
                </Box>
                <ProviderHealthTable
                    providers={providers}
                    onRefresh={onRefreshProvider}
                    onSelectProvider={setSelectedProvider}
                />
            </Paper>

            {/* Selected Provider Detail */}
            {selectedProvider && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                            {selectedProvider.provider} - {selectedProvider.model}
                        </Typography>
                        <Button size="small" onClick={() => setSelectedProvider(null)}>
                            Close
                        </Button>
                    </Box>
                    <ProviderHealthStatus
                        providerId={selectedProvider._id}
                        providerName={selectedProvider.provider}
                        healthData={selectedProvider.healthStatus}
                        onRefresh={onRefreshProvider}
                    />
                </Paper>
            )}
        </Box>
    );
};

export default ProviderHealthDashboard;
