/**
 * Alert severity levels
 */
export type AlertSeverity = 'critical' | 'warning' | 'info';

/**
 * Alert status lifecycle
 */
export type AlertStatus = 'new' | 'acknowledged' | 'resolved';

/**
 * Alert types covering all trigger categories
 */
export type AlertType =
  | 'budget_threshold'
  | 'budget_overspend'
  | 'moderation_block'
  | 'provider_failure'
  | 'auth_failure'
  | 'config_change'
  | 'suspicious_activity';

/**
 * Alert interface
 */
export interface Alert {
  id: string;
  tenantId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  details?: Record<string, any>; // Alert-specific context data
  userId?: string;               // User who triggered the alert (if applicable)
  userName?: string;             // Resolved display name
  status: AlertStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: string;       // ISO date string
  resolvedBy?: string;
  resolvedAt?: string;           // ISO date string
  resolutionNotes?: string;
  createdAt: string;             // ISO date string
}

// ============================================================================
// Audit Log Types
// ============================================================================

/**
 * Resource types that can be audited
 */
export type AuditResourceType = 'user' | 'rule' | 'provider' | 'budget';

/**
 * CRUD actions tracked in audit logs
 */
export type AuditAction = 'create' | 'update' | 'delete';

/**
 * All auditable event types
 */
export type AuditEventType =
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'rule_created'
  | 'rule_updated'
  | 'rule_deleted'
  | 'provider_created'
  | 'provider_updated'
  | 'provider_deleted'
  | 'budget_updated'
  | 'login'
  | 'logout'
  | 'api_key_rotated';

/**
 * Audit log entry
 */
export interface AuditLog {
  id: string;
  tenantId: string;
  timestamp: string;             // ISO date string
  eventType: AuditEventType;
  userId: string;                // Who performed the action
  userName: string;              // Display name of the actor
  resourceType?: AuditResourceType;
  resourceId?: string;
  resourceName?: string;         // Human-readable resource name
  action?: AuditAction;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

// ============================================================================
// Export Types
// ============================================================================

export type ExportFormat = 'csv' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  dateFrom?: string;
  dateTo?: string;
  includeResolved?: boolean;
}
