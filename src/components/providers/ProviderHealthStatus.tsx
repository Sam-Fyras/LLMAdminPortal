import { 
    Box, 
    Typography, 
    Chip, 
    LinearProgress, 
    Tooltip,
    IconButton,
    Card,
    CardContent,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    CheckCircle as HealthyIcon,
    Warning as DegradedIcon,
    Error as DownIcon,
    Refresh as RefreshIcon,
    Speed as LatencyIcon,
    TrendingUp as UptimeIcon,
    ErrorOutline as ErrorRateIcon,
    AccessTime as LastCheckedIcon
} from '@mui/icons-material';
import { useState } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export type HealthStatus = 'healthy' | 'degraded' | 'down';

export interface ProviderHealthData {
    status: HealthStatus;
    lastChecked: Date;
    uptime: {
        last24h: number;  // Percentage
        last7d: number;   // Percentage
        last30d: number;  // Percentage
    };
    avgResponseTime: number;  // milliseconds
    errorRate: number;        // Percentage
    lastError?: {
        message: string;
        timestamp: Date;
    };
}

export interface ProviderHealthStatusProps {
    providerId: string;
    providerName: string;
    healthData?: ProviderHealthData;
    onRefresh?: (providerId: string) => void;
    compact?: boolean;  // For use in tables
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
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

const getUptimeColor = (uptime: number): 'success' | 'warning' | 'error' => {
    if (uptime >= 99) return 'success';
    if (uptime >= 95) return 'warning';
    return 'error';
};

const getErrorRateColor = (errorRate: number): 'success' | 'warning' | 'error' => {
    if (errorRate <= 1) return 'success';
    if (errorRate <= 5) return 'warning';
    return 'error';
};

const getResponseTimeColor = (ms: number): 'success' | 'warning' | 'error' => {
    if (ms <= 500) return 'success';
    if (ms <= 1500) return 'warning';
    return 'error';
};

// ── Compact Status Indicator (for tables) ────────────────────────────────────

export const ProviderHealthIndicator: React.FC<{
    status: HealthStatus;
    lastChecked?: Date;
    showLabel?: boolean;
}> = ({ status, lastChecked, showLabel = true }) => {
    return (
        <Tooltip 
            title={lastChecked ? `Last checked: ${formatTimestamp(lastChecked)}` : 'No health data'}
            arrow
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                    sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: `${getStatusColor(status)}.main`,
                        animation: status === 'healthy' ? 'none' : 'pulse 2s infinite',
                        '@keyframes pulse': {
                            '0%': { opacity: 1 },
                            '50%': { opacity: 0.5 },
                            '100%': { opacity: 1 },
                        },
                    }}
                />
                {showLabel && (
                    <Typography variant="body2" color={`${getStatusColor(status)}.main`}>
                        {getStatusLabel(status)}
                    </Typography>
                )}
            </Box>
        </Tooltip>
    );
};

// ── Uptime Bar Component ─────────────────────────────────────────────────────

const UptimeBar: React.FC<{ 
    label: string; 
    value: number;
    showPercentage?: boolean;
}> = ({ label, value, showPercentage = true }) => {
    const color = getUptimeColor(value);
    
    return (
        <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                    {label}
                </Typography>
                {showPercentage && (
                    <Typography variant="caption" color={`${color}.main`} fontWeight={500}>
                        {value.toFixed(2)}%
                    </Typography>
                )}
            </Box>
            <LinearProgress
                variant="determinate"
                value={value}
                color={color}
                sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    bgcolor: 'grey.200',
                }}
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
    sublabel?: string;
}> = ({ icon, label, value, color, sublabel }) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: 1,
            bgcolor: `${color}.50`,
            border: 1,
            borderColor: `${color}.200`,
        }}
    >
        <Box sx={{ color: `${color}.main` }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="subtitle2" fontWeight={600} color={`${color}.main`}>
                {value}
            </Typography>
            {sublabel && (
                <Typography variant="caption" color="text.secondary">
                    {sublabel}
                </Typography>
            )}
        </Box>
    </Box>
);

// ── Main Component ───────────────────────────────────────────────────────────

const ProviderHealthStatus: React.FC<ProviderHealthStatusProps> = ({
    providerId,
    providerName,
    healthData,
    onRefresh,
    compact = false,
}) => {
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = () => {
        if (!onRefresh) return;
        setRefreshing(true);
        // Simulate refresh delay for UI feedback
        setTimeout(() => {
            onRefresh(providerId);
            setRefreshing(false);
        }, 1000);
    };

    // No health data available
    if (!healthData) {
        return (
            <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                            No health data available for {providerName}
                        </Typography>
                        {onRefresh && (
                            <IconButton size="small" onClick={handleRefresh} disabled={refreshing}>
                                {refreshing ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
                            </IconButton>
                        )}
                    </Box>
                </CardContent>
            </Card>
        );
    }

    // Compact view for tables
    if (compact) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ProviderHealthIndicator status={healthData.status} lastChecked={healthData.lastChecked} />
                <Tooltip title={`Uptime: ${healthData.uptime.last24h.toFixed(1)}% | Latency: ${formatResponseTime(healthData.avgResponseTime)}`}>
                    <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(healthData.lastChecked)}
                    </Typography>
                </Tooltip>
            </Box>
        );
    }

    // Full view
    return (
        <Card variant="outlined">
            <CardContent>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                            Health Status
                        </Typography>
                        <Chip
                            icon={getStatusIcon(healthData.status)}
                            label={getStatusLabel(healthData.status)}
                            color={getStatusColor(healthData.status)}
                            size="small"
                        />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title={`Last checked: ${new Date(healthData.lastChecked).toLocaleString()}`}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LastCheckedIcon fontSize="small" color="action" />
                                <Typography variant="caption" color="text.secondary">
                                    {formatTimestamp(healthData.lastChecked)}
                                </Typography>
                            </Box>
                        </Tooltip>
                        {onRefresh && (
                            <IconButton size="small" onClick={handleRefresh} disabled={refreshing}>
                                {refreshing ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
                            </IconButton>
                        )}
                    </Box>
                </Box>

                {/* Last Error Alert */}
                {healthData.lastError && healthData.status !== 'healthy' && (
                    <Alert 
                        severity="error" 
                        sx={{ mb: 2 }}
                        icon={<ErrorRateIcon fontSize="small" />}
                    >
                        <Typography variant="body2">
                            {healthData.lastError.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(healthData.lastError.timestamp)}
                        </Typography>
                    </Alert>
                )}

                {/* Metrics Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
                    <MetricCard
                        icon={<LatencyIcon />}
                        label="Avg Response Time"
                        value={formatResponseTime(healthData.avgResponseTime)}
                        color={getResponseTimeColor(healthData.avgResponseTime)}
                    />
                    <MetricCard
                        icon={<ErrorRateIcon />}
                        label="Error Rate"
                        value={`${healthData.errorRate.toFixed(2)}%`}
                        color={getErrorRateColor(healthData.errorRate)}
                    />
                    <MetricCard
                        icon={<UptimeIcon />}
                        label="Uptime (24h)"
                        value={`${healthData.uptime.last24h.toFixed(2)}%`}
                        color={getUptimeColor(healthData.uptime.last24h)}
                    />
                </Box>

                {/* Uptime History */}
                <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1.5 }}>
                    Uptime History
                </Typography>
                <UptimeBar label="Last 24 Hours" value={healthData.uptime.last24h} />
                <UptimeBar label="Last 7 Days" value={healthData.uptime.last7d} />
                <UptimeBar label="Last 30 Days" value={healthData.uptime.last30d} />
            </CardContent>
        </Card>
    );
};

export default ProviderHealthStatus;
