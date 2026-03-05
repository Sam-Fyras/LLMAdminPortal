import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Tab,
  Tabs,
  Paper,
  Button,
  Skeleton,
  Alert as MuiAlert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccountBalance as BudgetIcon,
  Settings as ConfigureIcon,
  TrendingUp as ProjectionIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  fetchBudgets,
  fetchProjection,
  addBudget,
  editBudget,
  removeBudget,
  selectBudgets,
  selectProjection,
  selectBudgetLoading,
  selectProjectionLoading,
  selectBudgetError,
  clearBudgetError,
} from '../redux/slices/budgetSlice';
import { useToast } from '../hooks/useToast';

import { BudgetOverview, BudgetForm, CostProjection } from '../components/budget';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  Budget,
  BudgetOverviewData,
  BudgetAlertStatus,
  BudgetFormValues,
} from '../types/budget';

// ============================================================================
// Helpers
// ============================================================================

/** Compute end-of-month target date string (YYYY-MM-DD) */
const getEndOfMonthDate = (): string => {
  const now = new Date();
  const eom = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return eom.toISOString().split('T')[0];
};

/** Derive BudgetAlertStatus from percentage used vs configured thresholds */
const deriveAlertStatus = (
  pct: number,
  thresholds: Budget['alertThresholds']
): BudgetAlertStatus => {
  if (pct >= thresholds.block)    return 'blocked';
  if (pct >= thresholds.critical) return 'critical';
  if (pct >= thresholds.warning)  return 'warning';
  return 'on_track';
};

/** Build the BudgetOverviewData display model from a Budget + projection */
const buildOverviewData = (
  budget: Budget,
  projectedCost: number
): BudgetOverviewData => {
  const pctCost  = budget.costCap  ? (budget.currentUsage.cost   / budget.costCap)  * 100 : 0;
  const pctToken = budget.tokenCap ? (budget.currentUsage.tokens / budget.tokenCap) * 100 : 0;
  const percentageUsed = Math.max(pctCost, pctToken);

  return {
    budget,
    percentageUsed,
    remainingCost:   budget.costCap  ? Math.max(0, budget.costCap  - budget.currentUsage.cost)   : undefined,
    remainingTokens: budget.tokenCap ? Math.max(0, budget.tokenCap - budget.currentUsage.tokens) : undefined,
    projectedEndOfMonthCost: projectedCost,
    alertStatus: deriveAlertStatus(percentageUsed, budget.alertThresholds),
  };
};

// ============================================================================
// Tab Panel helper
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

const BudgetPage: React.FC = () => {
  const dispatch    = useAppDispatch();
  const { account } = useAuth();
  const tenantId    = account?.tenantId ?? '';

  // Redux state
  const budgets           = useAppSelector(selectBudgets);
  const projection        = useAppSelector(selectProjection);
  const loading           = useAppSelector(selectBudgetLoading);
  const projectionLoading = useAppSelector(selectProjectionLoading);
  const error             = useAppSelector(selectBudgetError);

  const toast = useToast();

  // Local UI state
  const [activeTab,        setActiveTab]        = useState(0);
  const [formOpen,         setFormOpen]         = useState(false);
  const [editingBudget,    setEditingBudget]    = useState<Budget | null>(null);
  const [deletingBudget,   setDeletingBudget]   = useState<Budget | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Track last notified status to avoid repeat toasts on every re-render
  const lastNotifiedStatus = useRef<BudgetAlertStatus | null>(null);

  // Fetch on mount
  useEffect(() => {
    if (!tenantId) return;
    dispatch(fetchBudgets(tenantId));
    dispatch(fetchProjection({ tenantId, targetDate: getEndOfMonthDate() }));
  }, [dispatch, tenantId]);

  // Clear error when leaving page
  useEffect(() => () => { dispatch(clearBudgetError()); }, [dispatch]);

  // Derive the org-level budget for the Overview tab
  const orgBudget = useMemo(
    () => budgets.find((b) => b.scope === 'organization') ?? null,
    [budgets]
  );

  const overviewData = useMemo<BudgetOverviewData | null>(() => {
    if (!orgBudget) return null;
    const projectedCost = projection?.projectedTotalCost ?? orgBudget.currentUsage.cost;
    return buildOverviewData(orgBudget, projectedCost);
  }, [orgBudget, projection]);

  // In-app notification when alert status changes
  useEffect(() => {
    const status = overviewData?.alertStatus;
    if (!status || status === lastNotifiedStatus.current) return;
    lastNotifiedStatus.current = status;
    if (status === 'blocked') {
      toast.error('Budget limit reached — new LLM requests are being blocked.');
    } else if (status === 'critical') {
      toast.error('Critical threshold reached: budget usage is at or above the critical level.');
    } else if (status === 'warning') {
      toast.warning('Budget warning: spending is approaching the configured cap.');
    }
  }, [overviewData?.alertStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleOpenCreate = () => {
    setEditingBudget(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormOpen(true);
  };

  const handleFormSave = (values: BudgetFormValues, editing: Budget | null) => {
    if (editing) {
      dispatch(editBudget({ tenantId, budgetId: editing.id, payload: values }));
    } else {
      dispatch(addBudget({ tenantId, payload: values }));
    }
    setFormOpen(false);
  };

  const handleOpenDelete = (budget: Budget) => {
    setDeletingBudget(budget);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingBudget) return;
    dispatch(removeBudget({ tenantId, budgetId: deletingBudget.id }));
    toast.success('Budget deleted successfully.');
    setDeleteConfirmOpen(false);
    setDeletingBudget(null);
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Budget Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Set cost and token caps, configure alert thresholds, and monitor spend projections.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Configure Budget
        </Button>
      </Box>

      {/* Error Banner */}
      {error && (
        <MuiAlert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearBudgetError())}>
          {error}
        </MuiAlert>
      )}

      {loading && !budgets.length ? (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width={220} height={44} />
              <Skeleton variant="text" width={380} height={24} />
            </Box>
            <Skeleton variant="rounded" width={160} height={36} />
          </Box>
          <Skeleton variant="rounded" height={56} sx={{ mb: 3 }} />
          <Skeleton variant="rounded" height={400} />
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
                icon={<BudgetIcon fontSize="small" />}
                iconPosition="start"
                label="Overview"
              />
              <Tab
                icon={<ProjectionIcon fontSize="small" />}
                iconPosition="start"
                label="Cost Projection"
              />
              <Tab
                icon={<ConfigureIcon fontSize="small" />}
                iconPosition="start"
                label="Configure"
              />
            </Tabs>
          </Paper>

          {/* Tab 0 — Overview */}
          <TabPanel value={activeTab} index={0}>
            <BudgetOverview data={overviewData} loading={loading} />
          </TabPanel>

          {/* Tab 1 — Cost Projection */}
          <TabPanel value={activeTab} index={1}>
            <CostProjection
              projection={projection}
              budgetCap={orgBudget?.costCap}
              loading={projectionLoading}
            />
          </TabPanel>

          {/* Tab 2 — Configure (list of all budgets) */}
          <TabPanel value={activeTab} index={2}>
            {budgets.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary" gutterBottom>
                  No budgets configured yet.
                </Typography>
                <Button variant="outlined" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                  Configure Budget
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {budgets.map((budget) => (
                  <Paper key={budget.id} variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                          {budget.scope} Budget
                          {budget.targetId ? ` — ${budget.targetId}` : ''}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Period: {budget.period}
                          {budget.costCap  ? ` · Cost cap: $${budget.costCap.toLocaleString()}`      : ''}
                          {budget.tokenCap ? ` · Token cap: ${budget.tokenCap.toLocaleString()}` : ''}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Thresholds — Warning: {budget.alertThresholds.warning}% ·
                          Critical: {budget.alertThresholds.critical}% ·
                          Block: {budget.alertThresholds.block}%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenEdit(budget)}
                        >
                          Edit
                        </Button>
                        <Tooltip title="Delete budget">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDelete(budget)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </TabPanel>
        </>
      )}

      {/* Budget Form Dialog */}
      <BudgetForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleFormSave}
        editingBudget={editingBudget}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Budget"
        message={
          deletingBudget
            ? `Are you sure you want to delete the ${deletingBudget.scope} budget${
                deletingBudget.targetId ? ` for ${deletingBudget.targetId}` : ''
              }? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeletingBudget(null);
        }}
      />
    </Box>
  );
};

export default BudgetPage;
