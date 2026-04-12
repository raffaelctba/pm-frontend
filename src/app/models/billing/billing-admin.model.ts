/**
 * Admin-specific DTOs for billing operations
 */

import { ApprovalStatus } from './charge-status.model';
import { Metadata } from './billing-common.model';

/**
 * Admin request for bulk charge creation
 */
export interface AdminBulkChargeRequest {
  chargeTypeId: number;
  propertyId: number;
  tenantUserIds: number[];
  amount?: number;
  currency?: string;
  startDate: Date;
  endDate?: Date;
  dueDate?: Date;
  metadata?: Metadata;
}

/**
 * Result of bulk charge operation
 */
export interface BulkChargeResult {
  requestId: string;
  totalRequested: number;
  successCount: number;
  failureCount: number;
  results: {
    tenantUserId: number;
    chargeId?: number;
    success: boolean;
    error?: string;
  }[];
}

/**
 * Admin pending approvals view
 */
export interface PendingApprovalView {
  propertyId: number;
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalEscalated: number;
  approvals: ApprovalItem[];
}

/**
 * Single approval item
 */
export interface ApprovalItem {
  chargeId: number;
  chargeTypeId: number;
  chargeTypeName: string;
  tenantUserId: number;
  tenantName: string;
  amount: number;
  currency: string;
  status: ApprovalStatus;
  createdAt: Date;
  createdBy: string;
  notes?: string;
}

/**
 * Filter for approval requests
 */
export interface ApprovalFilter {
  propertyId: number;
  approvalStatus?: ApprovalStatus;
  page?: number;
  size?: number;
}

/**
 * Reconciliation request (admin only)
 */
export interface AdminReconciliationRequest {
  propertyId: number;
  period: string; // YYYY-MM
  includeDetails: boolean;
  notes?: string;
}

/**
 * Billing report request
 */
export interface BillingReportRequest {
  propertyId: number;
  startPeriod: string; // YYYY-MM
  endPeriod: string; // YYYY-MM
  reportType: 'CHARGES' | 'PAYMENTS' | 'STATEMENTS' | 'RECONCILIATION' | 'SUMMARY';
  includeDetails: boolean;
}

/**
 * Billing report result
 */
export interface BillingReport {
  reportId: string;
  propertyId: number;
  startPeriod: string;
  endPeriod: string;
  reportType: string;
  summary: ReportSummary;
  details: ReportDetail[];
  generatedAt: Date;
  generatedBy: string;
}

/**
 * Report summary
 */
export interface ReportSummary {
  totalCharges: number;
  totalChargesAmount: number;
  totalPayments: number;
  totalPaymentsAmount: number;
  totalStatements: number;
  averageStatementAmount: number;
  currency: string;
  period: string;
}

/**
 * Report detail line
 */
export interface ReportDetail {
  itemId: number;
  itemType: 'CHARGE' | 'PAYMENT' | 'STATEMENT';
  description: string;
  amount: number;
  currency: string;
  date: Date;
  status: string;
  reference: string;
}

/**
 * Audit log entry for billing operations
 */
export interface BillingAuditLog {
  id: number;
  propertyId: number;
  operationType: string;
  entityType: 'CHARGE' | 'PAYMENT' | 'STATEMENT' | 'ALLOCATION';
  entityId: number;
  userId: string;
  changes: Record<string, any>;
  performedAt: Date;
  ipAddress?: string;
}

/**
 * Audit log filter
 */
export interface AuditLogFilter {
  propertyId: number;
  operationType?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  page?: number;
  size?: number;
}

/**
 * Dashboard statistics
 */
export interface BillingDashboardStats {
  propertyId: number;
  period: string; // YYYY-MM
  totalCharges: number;
  totalChargesAmount: number;
  totalPayments: number;
  totalPaymentsAmount: number;
  totalStatements: number;
  pendingStatements: number;
  overdueStatements: number;
  pendingApprovals: number;
  currency: string;
  collectionRate: number; // percentage
  updateedAt: Date;
}

/**
 * Tenant aging summary
 */
export interface TenantAgingSummary {
  propertyId: number;
  tenantUserId: number;
  tenantName: string;
  currency: string;
  current: number;
  thirtyDays: number;
  sixtyDays: number;
  ninetyDays: number;
  over120Days: number;
  totalAged: number;
  lastPaymentDate?: Date;
}

