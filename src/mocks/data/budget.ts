import { Budget, BudgetProjection } from '../../types/budget';

// ============================================================================
// Mock Budgets
// Current date context: Feb 22, 2026
// Scenario: Org is at 78% spend with projection exceeding cap — warning state
// ============================================================================

export const mockBudgets: Budget[] = [
  // Organization-level monthly budget
  {
    id: 'budget-1',
    tenantId: 'mock-tenant-123',
    scope: 'organization',
    period: 'monthly',
    tokenCap: 10_000_000,
    costCap: 500,
    alertThresholds: {
      warning: 80,
      critical: 90,
      block: 100,
    },
    blockRequestsOnLimit: true,
    currentUsage: {
      tokens: 7_820_000,
      cost: 391.00,
      lastUpdated: new Date(),
    },
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-02-01'),
  },

  // User-level monthly budget (example: John Doe)
  {
    id: 'budget-2',
    tenantId: 'mock-tenant-123',
    scope: 'user',
    targetId: 'user-101',
    period: 'monthly',
    tokenCap: 500_000,
    costCap: 25,
    alertThresholds: {
      warning: 80,
      critical: 90,
      block: 100,
    },
    blockRequestsOnLimit: false,
    currentUsage: {
      tokens: 423_000,
      cost: 21.15,
      lastUpdated: new Date(),
    },
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-02-10'),
  },
];

// ============================================================================
// Mock Budget Projection
// Actual: Feb 1–22  |  Projected: Feb 22–28
// Total projected: $514.80 → exceeds $500 cap by ~$14.80
// Confidence interval: ±10% band on projected data points
// ============================================================================

const buildDate = (day: number) => `2026-02-${String(day).padStart(2, '0')}`;

// Daily actual costs for Feb 1–22 (realistic variation)
const actualDailyCosts: [number, number][] = [
  [1,  15.20], [2,  18.40], [3,  17.80], [4,  16.50], [5,  19.10],
  [6,  14.30], [7,  20.60], [8,  18.90], [9,  17.40], [10, 21.00],
  [11, 16.80], [12, 19.50], [13, 22.10], [14, 17.60], [15, 18.30],
  [16, 20.40], [17, 19.20], [18, 16.70], [19, 21.80], [20, 18.00],
  [21, 17.50], [22, 16.90],
];

// Build cumulative actual cost per day
let cumulativeCost = 0;
const actualPoints = actualDailyCosts.map(([day, daily]) => {
  cumulativeCost += daily;
  return {
    date: buildDate(day),
    actualCost: Math.round(cumulativeCost * 100) / 100,
    actualTokens: Math.round((cumulativeCost / 500) * 10_000_000),
  };
});

const costAtDay22 = cumulativeCost; // ~391.00

// Projected daily costs for Feb 22–28 (slightly higher rate — trending up)
const projectedDailyIncrement = [0, 19.8, 20.3, 21.1, 20.7, 19.9, 21.0];
let projectedCumulative = costAtDay22;
const projectedPoints = projectedDailyIncrement.map((delta, i) => {
  projectedCumulative += delta;
  const projected = Math.round(projectedCumulative * 100) / 100;
  // Confidence interval widens slightly further into the future (±8% to ±13%)
  const bandPct = 0.08 + i * 0.01;
  return {
    date: buildDate(22 + i),
    projectedCost: projected,
    projectedTokens: Math.round((projected / 500) * 10_000_000),
    confidenceUpper: Math.round(projected * (1 + bandPct) * 100) / 100,
    confidenceLower: Math.round(projected * (1 - bandPct) * 100) / 100,
  };
});

// Merge: day 22 has both actual and projected (lines connect here)
const mergedDataPoints = [
  ...actualPoints.slice(0, -1),                 // Feb 1–21: actual only
  {                                              // Feb 22: junction point
    date: buildDate(22),
    actualCost: actualPoints[21].actualCost,
    actualTokens: actualPoints[21].actualTokens,
    projectedCost: projectedPoints[0].projectedCost,
    projectedTokens: projectedPoints[0].projectedTokens,
    confidenceUpper: projectedPoints[0].confidenceUpper,
    confidenceLower: projectedPoints[0].confidenceLower,
  },
  ...projectedPoints.slice(1),                  // Feb 23–28: projected only
];

const projectedTotal = Math.round(projectedCumulative * 100) / 100; // ~514.80

export const mockBudgetProjection: BudgetProjection = {
  budgetId: 'budget-1',
  targetDate: '2026-02-28',
  projectedTotalCost: projectedTotal,
  projectedTotalTokens: Math.round((projectedTotal / 500) * 10_000_000),
  willExceedBudget: projectedTotal > 500,
  estimatedOverspend: Math.round((projectedTotal - 500) * 100) / 100,
  dataPoints: mergedDataPoints,
  generatedAt: new Date(),
};
