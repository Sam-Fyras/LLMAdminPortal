import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetProjection,
} from '../../api/budget';
import {
  Budget,
  BudgetProjection,
  CreateBudgetPayload,
  UpdateBudgetPayload,
} from '../../types/budget';

// ============================================================================
// State
// ============================================================================

interface BudgetState {
  budgets: Budget[];
  projection: BudgetProjection | null;
  loading: boolean;
  projectionLoading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  budgets: [],
  projection: null,
  loading: false,
  projectionLoading: false,
  error: null,
};

// ============================================================================
// Async Thunks
// ============================================================================

export const fetchBudgets = createAsyncThunk(
  'budget/fetchAll',
  async (tenantId: string, { rejectWithValue }) => {
    try {
      const res = await getBudgets(tenantId);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message ?? 'Failed to fetch budgets');
    }
  }
);

export const addBudget = createAsyncThunk(
  'budget/create',
  async (
    { tenantId, payload }: { tenantId: string; payload: CreateBudgetPayload },
    { rejectWithValue }
  ) => {
    try {
      const res = await createBudget(tenantId, payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message ?? 'Failed to create budget');
    }
  }
);

export const editBudget = createAsyncThunk(
  'budget/update',
  async (
    {
      tenantId,
      budgetId,
      payload,
    }: { tenantId: string; budgetId: string; payload: UpdateBudgetPayload },
    { rejectWithValue }
  ) => {
    try {
      const res = await updateBudget(tenantId, budgetId, payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message ?? 'Failed to update budget');
    }
  }
);

export const removeBudget = createAsyncThunk(
  'budget/delete',
  async (
    { tenantId, budgetId }: { tenantId: string; budgetId: string },
    { rejectWithValue }
  ) => {
    try {
      await deleteBudget(tenantId, budgetId);
      return budgetId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message ?? 'Failed to delete budget');
    }
  }
);

export const fetchProjection = createAsyncThunk(
  'budget/fetchProjection',
  async (
    { tenantId, targetDate }: { tenantId: string; targetDate: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await getBudgetProjection(tenantId, targetDate);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message ?? 'Failed to fetch projection');
    }
  }
);

// ============================================================================
// Slice
// ============================================================================

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    clearBudgetError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchBudgets
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action: PayloadAction<Budget[]>) => {
        state.loading = false;
        state.budgets = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // addBudget
    builder
      .addCase(addBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBudget.fulfilled, (state, action: PayloadAction<Budget>) => {
        state.loading = false;
        state.budgets.push(action.payload);
      })
      .addCase(addBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // editBudget
    builder
      .addCase(editBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editBudget.fulfilled, (state, action: PayloadAction<Budget>) => {
        state.loading = false;
        const idx = state.budgets.findIndex((b) => b.id === action.payload.id);
        if (idx !== -1) {
          state.budgets[idx] = action.payload;
        }
      })
      .addCase(editBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // removeBudget
    builder
      .addCase(removeBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeBudget.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.budgets = state.budgets.filter((b) => b.id !== action.payload);
      })
      .addCase(removeBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchProjection
    builder
      .addCase(fetchProjection.pending, (state) => {
        state.projectionLoading = true;
        state.error = null;
      })
      .addCase(fetchProjection.fulfilled, (state, action: PayloadAction<BudgetProjection>) => {
        state.projectionLoading = false;
        state.projection = action.payload;
      })
      .addCase(fetchProjection.rejected, (state, action) => {
        state.projectionLoading = false;
        state.error = action.payload as string;
      });
  },
});

// ============================================================================
// Actions & Selectors
// ============================================================================

export const { clearBudgetError } = budgetSlice.actions;

export const selectBudgets = (state: RootState) => state.budget.budgets;
export const selectProjection = (state: RootState) => state.budget.projection;
export const selectBudgetLoading = (state: RootState) => state.budget.loading;
export const selectProjectionLoading = (state: RootState) => state.budget.projectionLoading;
export const selectBudgetError = (state: RootState) => state.budget.error;

export default budgetSlice.reducer;
