import React from 'react';
import {
  Box, Chip, Divider, Drawer, IconButton,
  Stack, Tooltip, Typography,
} from '@mui/material';
import {
  Close, Edit,
  Business, Person, Key, SmartToy,
  Storage, CheckCircle, Cancel,
} from '@mui/icons-material';
import { TenantRow, TenantStatus } from '../../mocks/data/tenantList';

interface TenantDetailProps {
  tenant: TenantRow | null;
  open: boolean;
  onClose: () => void;
  onEdit: (tenant: TenantRow) => void;
}

const STATUS_COLORS: Record<TenantStatus, 'success' | 'default' | 'error'> = {
  active: 'success',
  inactive: 'default',
  suspended: 'error',
};

const TIER_COLORS: Record<string, 'warning' | 'primary' | 'default'> = {
  Enterprise: 'warning',
  Pro: 'primary',
  Free: 'default',
};

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

const TenantDetail: React.FC<TenantDetailProps> = ({ tenant, open, onClose, onEdit }) => {
  if (!tenant) return null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const formatTokens = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `${(n / 1_000).toFixed(0)}K`
      : String(n);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: 420, p: 0 } } }}
    >
      {/* Header */}
      <Box sx={{ p: 2.5, pb: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700} noWrap>
            {tenant.tenant_name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
            {tenant.tenant_id}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
          <Tooltip title="Edit tenant">
            <IconButton size="small" onClick={() => { onClose(); onEdit(tenant); }}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose}>
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Status badges */}
      <Box sx={{ px: 2.5, py: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Chip
          label={tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
          size="small"
          color={STATUS_COLORS[tenant.status]}
          sx={{ fontWeight: 600, fontSize: 11 }}
        />
        <Chip
          label={tenant.tier_id}
          size="small"
          color={TIER_COLORS[tenant.tier_id] ?? 'default'}
          sx={{ fontWeight: 600, fontSize: 11 }}
        />
        <Chip
          icon={tenant.is_active ? <CheckCircle sx={{ fontSize: '14px !important' }} /> : <Cancel sx={{ fontSize: '14px !important' }} />}
          label={tenant.is_active ? 'Active' : 'Inactive'}
          size="small"
          color={tenant.is_active ? 'success' : 'default'}
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: 11 }}
        />
      </Box>

      {/* Body */}
      <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>
        <Stack spacing={3}>

          {/* Tenant Info */}
          <Section icon={<Business fontSize="small" />} title="Tenant Info">
            <Field label="Tenant Name" value={tenant.tenant_name} />
            <Field label="Object ID" value={<Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>{tenant.id}</Typography>} />
            <Field label="Tenant ID" value={<Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>{tenant.tenant_id}</Typography>} />
          </Section>

          <Divider />

          {/* Admin */}
          <Section icon={<Person fontSize="small" />} title="Administrator">
            <Field label="Name" value={tenant.tenant_admin.name} />
            <Field label="Email" value={tenant.tenant_admin.email} />
          </Section>

          <Divider />

          {/* Azure AD */}
          <Section icon={<Key fontSize="small" />} title="Azure Active Directory">
            <Field
              label="Tenant ID"
              value={<Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>{tenant.azure_ad_tenant_id}</Typography>}
            />
            <Field
              label="Client ID"
              value={<Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>{tenant.azure_ad_client_id}</Typography>}
            />
          </Section>

          <Divider />

          {/* LLM */}
          <Section icon={<SmartToy fontSize="small" />} title="LLM Configuration">
            <Field label="Model" value={tenant.llm_use} />
            <Field label="Token Count" value={
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
                <Typography variant="body2" fontWeight={700} color="primary.main">
                  {formatTokens(tenant.token_count)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({tenant.token_count.toLocaleString()} tokens)
                </Typography>
              </Box>
            } />
            <Field label="Firewall Version" value={tenant.firewall_version_id} />
          </Section>

          <Divider />

          {/* Database */}
          <Section icon={<Storage fontSize="small" />} title="Database">
            <Field
              label="MongoDB URL"
              value={<Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-all' }}>{tenant.mongo_url}</Typography>}
            />
          </Section>

          {/* Metadata */}
          {Object.keys(tenant.metadata).length > 0 && (
            <>
              <Divider />
              <Section icon={<Box sx={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{ '{}'}</Box>} title="Metadata">
                {Object.entries(tenant.metadata).map(([k, v]) => (
                  <Field key={k} label={k.replace(/_/g, ' ')} value={v} />
                ))}
              </Section>
            </>
          )}

          <Divider />

          {/* Timestamps */}
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">Created</Typography>
              <Typography variant="caption">{formatDate(tenant.created_date)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">Last Updated</Typography>
              <Typography variant="caption">{formatDate(tenant.updated_date)}</Typography>
            </Box>
          </Stack>

        </Stack>
      </Box>
    </Drawer>
  );
};

export default TenantDetail;
