/**
 * Standard API response wrapper
 */
export interface APIResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/**
 * API error response (from backend)
 */
export interface APIError {
  error: {
    code: string; // e.g., "VALIDATION_ERROR", "UNAUTHORIZED", "NOT_FOUND"
    message: string; // User-friendly message
    details?: Record<string, any>; // Additional context
    field_errors?: Array<{
      field: string;
      message: string;
    }>;
  };
}

/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Success response for mutations
 */
export interface MutationResponse {
  success: boolean;
  message: string;
  id?: string; // ID of created/updated resource
}

/**
 * Batch operation response
 */
export interface BatchOperationResponse {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    index: number;
    error: string;
  }>;
}

/**
 * Export job response (for large datasets)
 */
export interface ExportJobResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  download_url?: string; // Available when status is 'completed'
  error_message?: string; // Available when status is 'failed'
  expires_at?: string; // Download link expiration
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'down';
  services: Record<string, {
    status: 'healthy' | 'degraded' | 'down';
    latency_ms?: number;
    error?: string;
  }>;
  timestamp: string;
}

/**
 * Request options for API calls
 */
export interface RequestOptions {
  signal?: AbortSignal; // For cancellation
  timeout?: number; // Milliseconds
  retries?: number; // Retry attempts
  headers?: Record<string, string>;
}

/**
 * Sorting parameters
 */
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * Filter parameters
 */
export interface FilterParams {
  [key: string]: string | number | boolean | string[] | undefined;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Search parameters
 */
export interface SearchParams {
  query?: string;
  fields?: string[]; // Fields to search in
}

/**
 * Date range parameters
 */
export interface DateRangeParams {
  start_date?: string; // ISO date
  end_date?: string; // ISO date
}

/**
 * Complete query parameters
 */
export interface QueryParams
  extends PaginationParams,
    FilterParams,
    DateRangeParams {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
}
