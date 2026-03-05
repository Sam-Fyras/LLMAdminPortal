import { 
    Box, Dialog, DialogActions, 
    DialogContent, DialogTitle, 
    Chip, Typography, Button,
    Divider, LinearProgress, IconButton,
    CircularProgress, Tooltip
} from "@mui/material";
import {
    CheckCircle as HealthyIcon,
    Warning as DegradedIcon,
    Error as DownIcon,
    Refresh as RefreshIcon,
    Speed as LatencyIcon,
    TrendingUp as UptimeIcon,
    ErrorOutline as ErrorRateIcon
} from '@mui/icons-material';
import { useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type HealthStatus = 'healthy' | 'degraded' | 'down';

interface ProviderHealthData {
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

interface LLMProvider {
    _id: { $oid: string };
    tenant_id: string;
    provider: string;
    models: string[];
    api_url: string;
    api_key_id: string;
    max_tokens: number | null;
    temperature: number | null;
    top_p: number | null;
    is_active: boolean;
    is_default: boolean;
    fallback_priority: number;
    created_date: { $date: string };
    updated_date: { $date: string };
}

interface ProviderDetailsProps {
    open: boolean;
    onClose: () => void;
    provider: LLMProvider;
    healthData?: ProviderHealthData;
    onRefreshHealth?: (providerId: string) => void;
}

// ── Helper Functions ─────────────────────────────────────────────────────────

const getStatusColor = (status: HealthStatus): 'success' | 'warning' | 'error' => {
    switch (status) {
        case 'healthy': return 'success';
        case 'degraded': return 'warning';
        case 'down': return 'error';
        default: return 'error';
    }
};

const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
        case 'healthy': return <HealthyIcon fontSize="small" />;
        case 'degraded': return <DegradedIcon fontSize="small" />;
        case 'down': return <DownIcon fontSize="small" />;
        default: return <DownIcon fontSize="small" />;
    }
};

const getStatusLabel = (status: HealthStatus): string => {
    switch (status) {
        case 'healthy': return 'Healthy';
        case 'degraded': return 'Degraded';
        case 'down': return 'Down';
        default: return 'Unknown';
    }
};

const formatResponseTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
};

const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
};

const getUptimeColor = (uptime: number): 'success' | 'warning' | 'error' => {
    if (uptime >= 99) return 'success';
    if (uptime >= 95) return 'warning';
    return 'error';
};

const getResponseTimeColor = (ms: number): 'success' | 'warning' | 'error' => {
    if (ms <= 500) return 'success';
    if (ms <= 1500) return 'warning';
    return 'error';
};

const getErrorRateColor = (rate: number): 'success' | 'warning' | 'error' => {
    if (rate <= 1) return 'success';
    if (rate <= 5) return 'warning';
    return 'error';
};

// ── Uptime Bar Component ─────────────────────────────────────────────────────

const UptimeBar: React.FC<{ label: string; value: number }> = ({ label, value }) => {
    const color = getUptimeColor(value);
    
    return (
        <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                    {label}
                </Typography>
                <Typography variant="caption" color={`${color}.main`} fontWeight={500}>
                    {value.toFixed(2)}%
                </Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={value}
                color={color}
                sx={{ height: 6, borderRadius: 3, bgcolor: 'grey.200' }}
            />
        </Box>
    );
};

// ── Metric Card Component ────────────────────────────────────────────────────

const MetricCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    color: 'success' | 'warning' | 'error';
}> = ({ icon, label, value, color }) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1.5,
            borderRadius: 1,
            bgcolor: `${color}.50`,
            border: 1,
            borderColor: `${color}.200`,
            flex: 1,
        }}
    >
        <Box sx={{ color: `${color}.main` }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="body2" fontWeight={600} color={`${color}.main`}>
                {value}
            </Typography>
        </Box>
    </Box>
);

// ── Main Component ───────────────────────────────────────────────────────────

const ProviderDetails: React.FC<ProviderDetailsProps> = ({ 
    open, 
    onClose, 
    provider,
    healthData,
    onRefreshHealth
}) => {
    const [refreshing, setRefreshing] = useState(false);

    if (!provider) return null;

    const handleRefresh = () => {
        if (!onRefreshHealth) return;
        setRefreshing(true);
        setTimeout(() => {
            onRefreshHealth(provider._id.$oid);
            setRefreshing(false);
        }, 1000);
    };

    return (
        <Dialog 
            open={open}
            onClose={onClose} 
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Provider Details</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                                {provider.provider}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">{provider.models.join(', ')}</Typography>
                        </Box>
                        <Chip 
                            label={provider.is_active ? 'Active' : 'Inactive'} 
                            color={provider.is_active ? 'success' : 'default'} 
                            size="small"
                        />
                    </Box>

                    <Divider />

                    {/* ═══════════════════════════════════════════════════════════════
                        HEALTH STATUS SECTION
                    ═══════════════════════════════════════════════════════════════ */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Health Status
                        </Typography>
                        {onRefreshHealth && (
                            <Tooltip title="Refresh Health">
                                <IconButton size="small" onClick={handleRefresh} disabled={refreshing}>
                                    {refreshing ? (
                                        <CircularProgress size={16} />
                                    ) : (
                                        <RefreshIcon fontSize="small" />
                                    )}
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>

                    {healthData ? (
                        <>
                            {/* Status Chip */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
                                <Typography variant="body2" color="text.secondary">Status</Typography>
                                <Chip
                                    icon={getStatusIcon(healthData.status)}
                                    label={getStatusLabel(healthData.status)}
                                    color={getStatusColor(healthData.status)}
                                    size="small"
                                />
                            </Box>

                            {/* Last Checked */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                <Typography variant="body2" color="text.secondary">Last Checked</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {formatTimestamp(healthData.lastChecked)}
                                </Typography>
                            </Box>

                            {/* Metrics Row */}
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <MetricCard
                                    icon={<LatencyIcon fontSize="small" />}
                                    label="Latency"
                                    value={formatResponseTime(healthData.avgResponseTime)}
                                    color={getResponseTimeColor(healthData.avgResponseTime)}
                                />
                                <MetricCard
                                    icon={<ErrorRateIcon fontSize="small" />}
                                    label="Error Rate"
                                    value={`${healthData.errorRate.toFixed(2)}%`}
                                    color={getErrorRateColor(healthData.errorRate)}
                                />
                                <MetricCard
                                    icon={<UptimeIcon fontSize="small" />}
                                    label="Uptime (24h)"
                                    value={`${healthData.uptime.last24h.toFixed(1)}%`}
                                    color={getUptimeColor(healthData.uptime.last24h)}
                                />
                            </Box>

                            {/* Uptime History */}
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                                    Uptime History
                                </Typography>
                                <UptimeBar label="Last 24 Hours" value={healthData.uptime.last24h} />
                                <UptimeBar label="Last 7 Days" value={healthData.uptime.last7d} />
                                <UptimeBar label="Last 30 Days" value={healthData.uptime.last30d} />
                            </Box>

                            {/* Last Error (if any) */}
                            {healthData.lastError && healthData.status !== 'healthy' && (
                                <Box sx={{ 
                                    p: 1.5, 
                                    bgcolor: 'error.50', 
                                    borderRadius: 1, 
                                    border: 1, 
                                    borderColor: 'error.200' 
                                }}>
                                    <Typography variant="caption" color="error.main" fontWeight={600}>
                                        Last Error
                                    </Typography>
                                    <Typography variant="body2" color="error.main">
                                        {healthData.lastError.message}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {formatTimestamp(healthData.lastError.timestamp)}
                                    </Typography>
                                </Box>
                            )}
                        </>
                    ) : (
                        <Box sx={{ 
                            p: 2, 
                            bgcolor: 'grey.100', 
                            borderRadius: 1, 
                            textAlign: 'center' 
                        }}>
                            <Typography variant="body2" color="text.secondary">
                                No health data available
                            </Typography>
                            {onRefreshHealth && (
                                <Button 
                                    size="small" 
                                    startIcon={<RefreshIcon />}
                                    onClick={handleRefresh}
                                    sx={{ mt: 1 }}
                                >
                                    Check Health
                                </Button>
                            )}
                        </Box>
                    )}

                    <Divider />

                    {/* Provider Info */}
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Configuration
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2" color="text.secondary">Provider</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                            {provider.provider}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2" color="text.secondary">Model</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{provider.models.join(', ')}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2" color="text.secondary">API URL</Typography>
                        <Typography 
                            variant="body2" 
                            sx={{ fontWeight: 500, maxWidth: '60%', wordBreak: 'break-all', textAlign: 'right' }}
                        >
                            {provider.api_url}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2" color="text.secondary">API Key ID</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                            {provider.api_key_id}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2" color="text.secondary">Default</Typography>
                        <Chip
                            label={provider.is_default ? 'Yes' : 'No'}
                            color={provider.is_default ? 'primary' : 'default'}
                            size="small"
                            variant="outlined"
                        />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2" color="text.secondary">Fallback Priority</Typography>
                        <Chip label={provider.fallback_priority} size="small" variant="outlined" />
                    </Box>

                    <Divider />

                    {/* Inference Parameters */}
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Inference Parameters
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2" color="text.secondary">Max Tokens</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {provider.max_tokens ?? 'Default'}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2" color="text.secondary">Temperature</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {provider.temperature ?? 'Default'}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2" color="text.secondary">Top P</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {provider.top_p ?? 'Default'}
                        </Typography>
                    </Box>

                    <Divider />

                    {/* Timestamps */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2" color="text.secondary">Created</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {provider.created_date?.$date 
                                ? new Date(provider.created_date.$date).toLocaleDateString() 
                                : 'N/A'}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {provider.updated_date?.$date 
                                ? new Date(provider.updated_date.$date).toLocaleDateString() 
                                : 'N/A'}
                        </Typography>
                    </Box>

                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProviderDetails;