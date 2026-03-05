import React, { useState } from 'react';
import {
  Box, Typography, Tab, Tabs, Paper,
  CircularProgress, Alert as MuiAlert,
} from '@mui/material';
import {
  NotificationsActive as AlertsIcon,
  History as AuditIcon,
} from '@mui/icons-material';
import { Alert } from '../types/alert';
import { AlertList }     from '../components/alerts/AlertList';
import { AlertDetails }  from '../components/alerts/AlertDetails';
import { AuditLogTable } from '../components/alerts/AuditLogTable';
import { mockAlerts, mockAuditLogs } from '../mocks/data/alerts';

// ============================================================================
// Tab panel helper
// ============================================================================

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

// ============================================================================
// Page Component
// ============================================================================

const AlertsAuditPage: React.FC = () => {
  const [activeTab,     setActiveTab]     = useState(0);
  const [alerts,        setAlerts]        = useState<Alert[]>(mockAlerts);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [loading]                         = useState(false);
  const [error]                           = useState<string | null>(null);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a =>
        a.id === alertId
          ? {
              ...a,
              status: 'acknowledged',
              acknowledgedBy: 'admin@acme.com',
              acknowledgedAt: new Date().toISOString(),
            }
          : a
      )
    );
    // Update selected alert if it's open in the drawer
    setSelectedAlert(prev =>
      prev?.id === alertId
        ? {
            ...prev,
            status: 'acknowledged',
            acknowledgedBy: 'admin@acme.com',
            acknowledgedAt: new Date().toISOString(),
          }
        : prev
    );
  };

  const handleResolve = (alertId: string, notes: string) => {
    setAlerts(prev =>
      prev.map(a =>
        a.id === alertId
          ? {
              ...a,
              status: 'resolved',
              resolvedBy: 'admin@acme.com',
              resolvedAt: new Date().toISOString(),
              resolutionNotes: notes || undefined,
            }
          : a
      )
    );
    setSelectedAlert(null);
  };

  // ============================================================================
  // Derived stats
  // ============================================================================

  const newCount      = alerts.filter(a => a.status === 'new').length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length;

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Alerts &amp; Audit Logs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor system alerts and track all administrative changes.
        </Typography>
      </Box>

      {/* Error banner */}
      {error && (
        <MuiAlert severity="error" sx={{ mb: 2 }}>{error}</MuiAlert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Tabs */}
          <Paper sx={{ mb: 0 }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
            >
              <Tab
                icon={<AlertsIcon fontSize="small" />}
                iconPosition="start"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    Alerts
                    {newCount > 0 && (
                      <Box
                        sx={{
                          bgcolor: 'error.main', color: 'white',
                          borderRadius: '10px', px: 0.75, py: 0.1,
                          fontSize: 11, fontWeight: 700, lineHeight: 1.6,
                          minWidth: 20, textAlign: 'center',
                        }}
                      >
                        {newCount}
                      </Box>
                    )}
                  </Box>
                }
              />
              <Tab
                icon={<AuditIcon fontSize="small" />}
                iconPosition="start"
                label="Audit Logs"
              />
            </Tabs>
          </Paper>

          {/* Alerts Tab */}
          <TabPanel value={activeTab} index={0}>
            {criticalCount > 0 && (
              <MuiAlert severity="error" sx={{ mb: 2 }}>
                {criticalCount} critical alert{criticalCount > 1 ? 's require' : ' requires'} your attention.
              </MuiAlert>
            )}
            <AlertList
              alerts={alerts}
              onView={setSelectedAlert}
              onAcknowledge={handleAcknowledge}
              onResolve={(id) => handleResolve(id, '')}
            />
          </TabPanel>

          {/* Audit Logs Tab */}
          <TabPanel value={activeTab} index={1}>
            <AuditLogTable logs={mockAuditLogs} />
          </TabPanel>
        </>
      )}

      {/* Alert Detail Drawer */}
      <AlertDetails
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
      />
    </Box>
  );
};

export default AlertsAuditPage;
