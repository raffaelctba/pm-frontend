/**
 * Billing statement status enums and label mappings for UI display
 */

// Billing statement lifecycle status
export enum BillingStatementStatus {
  PENDING = 'PENDING',
  ISSUED = 'ISSUED',
  OVERDUE = 'OVERDUE',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  CANCELLED = 'CANCELLED'
}

// UI Labels for billing statement status
export const BillingStatementStatusLabels: Record<BillingStatementStatus, string> = {
  [BillingStatementStatus.PENDING]: 'Pending',
  [BillingStatementStatus.ISSUED]: 'Issued',
  [BillingStatementStatus.OVERDUE]: 'Overdue',
  [BillingStatementStatus.PAID]: 'Paid',
  [BillingStatementStatus.PARTIALLY_PAID]: 'Partially Paid',
  [BillingStatementStatus.CANCELLED]: 'Cancelled'
};

// Color coding for UI
export const BillingStatementStatusColors: Record<BillingStatementStatus, string> = {
  [BillingStatementStatus.PENDING]: 'secondary',     // gray
  [BillingStatementStatus.ISSUED]: 'info',          // blue
  [BillingStatementStatus.OVERDUE]: 'danger',       // red
  [BillingStatementStatus.PAID]: 'success',         // green
  [BillingStatementStatus.PARTIALLY_PAID]: 'warning', // yellow/orange
  [BillingStatementStatus.CANCELLED]: 'secondary'   // gray
};

/**
 * Helper to determine if statement can be edited
 */
export function canEditStatement(status: BillingStatementStatus): boolean {
  return status === BillingStatementStatus.PENDING;
}

/**
 * Helper to determine if statement can be issued
 */
export function canIssueStatement(status: BillingStatementStatus): boolean {
  return status === BillingStatementStatus.PENDING;
}

/**
 * Helper to determine if statement is final (no changes allowed)
 */
export function isStatementFinal(status: BillingStatementStatus): boolean {
  return status === BillingStatementStatus.PAID || status === BillingStatementStatus.CANCELLED;
}

/**
 * Helper to determine if statement should be highlighted (needs attention)
 */
export function requiresAttention(status: BillingStatementStatus): boolean {
  return status === BillingStatementStatus.OVERDUE || status === BillingStatementStatus.ISSUED;
}

