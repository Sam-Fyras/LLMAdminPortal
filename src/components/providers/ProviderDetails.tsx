import React, { useState } from 'react';
import {
    Box, Chip, Divider, Drawer, IconButton,
    Stack, Tooltip, Typography, LinearProgress, Button,
    CircularProgress,
} from '@mui/material';
import {
    Close, Edit,
    Storefront, SmartToy, Key, Schedule,
    CheckCircle as HealthyIcon,
    Warning as DegradedIcon,
    Error as DownIcon,
    Refresh as RefreshIcon,
    Speed as LatencyIcon,
    TrendingUp as UptimeIcon,
    ErrorOutline as ErrorRateIcon,
} from '@mui/icons-material';

// ── Types ─────────────────────────────────────────────────────────────────────

type HealthStatus = 'healthy' | 'degraded' | 'down';

interface ProviderHealthData {
    status: HealthStatus;
    lastChecked: Date;
    uptime: { last24h: number; last7d: number; last30d: number };
    avgResponseTime: number;
    errorRate: number;
    lastError?: { message: string; timestamp: Date };
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
    onEdit?: () => void;
    healthData?: ProviderHealthData;
    onRefreshHealth?: (providerId: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const HEALTH_COLOR: Record<HealthStatus, 'success' | 'warning' | 'error'> = {
    healthy: 'success', degraded: 'warning', down: 'error',
};

const getStatusIcon = (s: HealthStatus) =>
    s === 'healthy' ? <HealthyIcon fontSize="small" /> :
    s === 'degraded' ? <DegradedIcon fontSize="small" /> :
    <DownIcon fontSize="small" />;

const uptimeColor = (v: number): 'success' | 'warning' | 'error' =>
    v >= 99 ? 'success' : v >= 95 ? 'warning' : 'error';

const latencyColor = (ms: number): 'success' | 'warning' | 'error' =>
    ms <= 500 ? 'success' : ms <= 1500 ? 'warning' : 'error';

const errColor = (r: number): 'success' | 'warning' | 'error' =>
    r <= 1 ? 'success' : r <= 5 ? 'warning' : 'error';

const fmtTime = (date: Date): string => {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return new Date(date).toLocaleDateString();
};

const fmtMs = (ms: number) => ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`;

const fmtDate = (d: { $date: string } | undefined) =>
    d?.$date ? new Date(d.$date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

// ── Shared layout primitives (same as TenantDetail) ───────────────────────────

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
                <Typography variant="caption" fontWeight={700} textTransform="uppercase" color="text.secondary">
                    {title}
                </Typography>
            </Box>
            <Stack spacing={1.5}>{children}</Stack>
        </Box>
    );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.25}>
                {label}
            </Typography>
            <Typography variant="body2" fontWeight={500} sx={{ wordBreak: 'break-all' }}>
                {value}
            </Typography>
        </Box>
    );
}

function UptimeBar({ label, value }: { label: string; value: number }) {
    const color = uptimeColor(value);
    return (
        <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="caption" color={`${color}.main`} fontWeight={600}>{value.toFixed(2)}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={value} color={color}
                sx={{ height: 5, borderRadius: 3, bgcolor: 'grey.200' }} />
        </Box>
    );
}

function MetricBadge({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: 'success' | 'warning' | 'error' }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.25, borderRadius: 1.5,
            bgcolor: `${color}.50`, border: 1, borderColor: `${color}.200`, flex: 1 }}>
            <Box sx={{ color: `${color}.main` }}>{icon}</Box>
            <Box>
                <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                <Typography variant="body2" fontWeight={700} color={`${color}.main`}>{value}</Typography>
            </Box>
        </Box>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

const ProviderDetails: React.FC<ProviderDetailsProps> = ({
    open, onClose, provider, onEdit, healthData, onRefreshHealth,
}) => {
    const [refreshing, setRefreshing] = useState(false);

    if (!provider) return null;

    const handleRefresh = () => {
        if (!onRefreshHealth) return;
        setRefreshing(true);
        setTimeout(() => { onRefreshHealth(provider._id.$oid); setRefreshing(false); }, 1000);
    };

    const providerLabel = provider.provider.replace(/_/g, ' ').toUpperCase();

    return (
        <Drawer anchor="right" open={open} onClose={onClose}
            slotProps={{ paper: { sx: { width: 420, p: 0 } } }}>

            {/* Header */}
            <Box sx={{ p: 2.5, pb: 2, display: 'flex', alignItems: 'flex-start',
                justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" fontWeight={700} noWrap>{providerLabel}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        {provider._id.$oid}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                    {onEdit && (
                        <Tooltip title="Edit provider">
                            <IconButton size="small" onClick={() => { onClose(); onEdit(); }}>
                                <Edit fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    <IconButton size="small" onClick={onClose}>
                        <Close fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            {/* Badge bar */}
            <Box sx={{ px: 2.5, py: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap',
                borderBottom: '1px solid', borderColor: 'divider' }}>
                <Chip
                    label={provider.is_active ? 'Active' : 'Inactive'}
                    size="small"
                    color={provider.is_active ? 'success' : 'default'}
                    sx={{ fontWeight: 600, fontSize: 11 }}
                />
                {provider.is_default && (
                    <Chip label="Default" size="small" color="primary" sx={{ fontWeight: 600, fontSize: 11 }} />
                )}
                <Chip
                    label={`Priority ${provider.fallback_priority}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: 11 }}
                />
            </Box>

            {/* Body */}
            <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>
                <Stack spacing={3}>

                    {/* Configuration */}
                    <Section icon={<Storefront fontSize="small" />} title="Configuration">
                        <Field label="Provider" value={providerLabel} />
                        <Field label="Models Enabled" value={
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.25 }}>
                                {provider.models.map((m) => (
                                    <Chip key={m} label={m} size="small" variant="outlined"
                                        sx={{ fontSize: 11, fontWeight: 500 }} />
                                ))}
                            </Box>
                        } />
                        <Field label="API URL"
                            value={<Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-all' }}>{provider.api_url}</Typography>} />
                        <Field label="API Key ID"
                            value={<Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>{provider.api_key_id}</Typography>} />
                    </Section>

                    <Divider />

                    {/* Health */}
                    <Section icon={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {healthData ? getStatusIcon(healthData.status) : <HealthyIcon fontSize="small" />}
                        </Box>
                    } title="Health Status">
                        {onRefreshHealth && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
                                <Tooltip title="Refresh health">
                                    <IconButton size="small" onClick={handleRefresh} disabled={refreshing}>
                                        {refreshing ? <CircularProgress size={14} /> : <RefreshIcon fontSize="small" />}
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        )}
                        {healthData ? (
                            <Stack spacing={2}>
                                <Field label="Status" value={
                                    <Chip icon={getStatusIcon(healthData.status)}
                                        label={healthData.status.charAt(0).toUpperCase() + healthData.status.slice(1)}
                                        color={HEALTH_COLOR[healthData.status]} size="small"
                                        sx={{ fontWeight: 600, fontSize: 11 }} />
                                } />
                                <Field label="Last Checked" value={fmtTime(healthData.lastChecked)} />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <MetricBadge icon={<LatencyIcon fontSize="small" />} label="Latency"
                                        value={fmtMs(healthData.avgResponseTime)} color={latencyColor(healthData.avgResponseTime)} />
                                    <MetricBadge icon={<ErrorRateIcon fontSize="small" />} label="Error Rate"
                                        value={`${healthData.errorRate.toFixed(2)}%`} color={errColor(healthData.errorRate)} />
                                    <MetricBadge icon={<UptimeIcon fontSize="small" />} label="Uptime 24h"
                                        value={`${healthData.uptime.last24h.toFixed(1)}%`} color={uptimeColor(healthData.uptime.last24h)} />
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
                                        Uptime History
                                    </Typography>
                                    <UptimeBar label="Last 24 Hours" value={healthData.uptime.last24h} />
                                    <UptimeBar label="Last 7 Days" value={healthData.uptime.last7d} />
                                    <UptimeBar label="Last 30 Days" value={healthData.uptime.last30d} />
                                </Box>
                                {healthData.lastError && healthData.status !== 'healthy' && (
                                    <Box sx={{ p: 1.5, bgcolor: 'error.50', borderRadius: 1.5, border: 1, borderColor: 'error.200' }}>
                                        <Typography variant="caption" color="error.main" fontWeight={600} display="block" mb={0.5}>
                                            Last Error
                                        </Typography>
                                        <Typography variant="body2" color="error.main">{healthData.lastError.message}</Typography>
                                        <Typography variant="caption" color="text.secondary">{fmtTime(healthData.lastError.timestamp)}</Typography>
                                    </Box>
                                )}
                            </Stack>
                        ) : (
                            <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1.5, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">No health data available</Typography>
                                {onRefreshHealth && (
                                    <Button size="small" startIcon={<RefreshIcon />} onClick={handleRefresh} sx={{ mt: 1 }}>
                                        Check Health
                                    </Button>
                                )}
                            </Box>
                        )}
                    </Section>

                    <Divider />

                    {/* Inference Parameters */}
                    <Section icon={<SmartToy fontSize="small" />} title="Inference Parameters">
                        <Field label="Max Tokens" value={provider.max_tokens?.toLocaleString() ?? 'Provider default'} />
                        <Field label="Temperature" value={provider.temperature ?? 'Provider default'} />
                        <Field label="Top P" value={provider.top_p ?? 'Provider default'} />
                    </Section>

                    <Divider />

                    {/* API Key */}
                    <Section icon={<Key fontSize="small" />} title="Credentials">
                        <Field label="API Key ID"
                            value={<Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>{provider.api_key_id}</Typography>} />
                    </Section>

                    <Divider />

                    {/* Timestamps */}
                    <Section icon={<Schedule fontSize="small" />} title="Timestamps">
                        <Stack spacing={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color="text.secondary">Created</Typography>
                                <Typography variant="caption">{fmtDate(provider.created_date)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                                <Typography variant="caption">{fmtDate(provider.updated_date)}</Typography>
                            </Box>
                        </Stack>
                    </Section>

                </Stack>
            </Box>
        </Drawer>
    );
};

export default ProviderDetails;
