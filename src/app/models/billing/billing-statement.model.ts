/**
 * Billing statement models for generating and tracking billing statements
 */

import { BillingStatementStatus } from './billing-statement-status.model';
import { Metadata } from './billing-common.model';
import { Charge } from './charge.model';

/**
 * Represents a billing statement for a tenant/unit for a period
 */
export interface BillingStatement {
  id: number;
  propertyId: number;
  tenantUserId: number;
  unitId?: number;
  billingPeriod: string; // YYYY-MM format
  year: number;
  month: number;
  statementStatus: BillingStatementStatus;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  dueDate?: Date;
  issuedDate?: Date;
  charges: Charge[];
  chargeCount: number;
  paymentCount: number;
  metadata?: Metadata;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Request DTO for generating a billing statement
 */
export interface BillingStatementGenerateRequest {
  propertyId: number;
  tenantUserId: number;
  billingPeriod: string;
}

/**
 * Response DTO for billing statement operations
 */
export interface BillingStatementResponse {
  id: number;
  propertyId: number;
  tenantUserId: number;
  unitId?: number;
  billingPeriod: string;
  statementDate?: Date;
  dueDate?: Date;
  totalCharges: number;
  totalTaxes: number;
  totalDiscounts: number;
  totalDue: number;
  amountPaid: number;
  balanceDue: number;
  statementStatus: BillingStatementStatus;
  currency: string;
  issuedDate?: Date;
  chargeCount?: number;
  paymentCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Request DTO for issuing a statement
 */
export interface IssueStatementRequest {
  statementId: number;
}

/**
 * Detailed statement with all charges and payments
 */
export interface BillingStatementDetail {
  statement: BillingStatement;
  charges: ChargeLineItem[];
  payments: PaymentLineItem[];
  summary: StatementSummary;
}

/**
 * Line item for charge on statement
 */
export interface ChargeLineItem {
  chargeId: number;
  chargeTypeName: string;
  description: string;
  quantity?: number;
  unitPrice?: number;
  amount: number;
  currency: string;
}

/**
 * Line item for payment on statement
 */
export interface PaymentLineItem {
  paymentId: number;
  paymentDate: Date;
  paymentMethod: string;
  amount: number;
  currency: string;
  reference: string;
}

/**
 * Statement summary with totals
 */
export interface StatementSummary {
  subtotal: number;
  taxes: number;
  discounts: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
}

/**
 * Statement list filter
 */
export interface BillingStatementFilter {
  propertyId?: number;
  tenantUserId?: number;
  statementStatus?: BillingStatementStatus;
  year?: number;
  month?: number;
  startPeriod?: string; // YYYY-MM
  endPeriod?: string; // YYYY-MM
  page?: number;
  size?: number;
}

/**
 * Statement export request
 */
export interface ExportStatementRequest {
  statementId: number;
  format: 'PDF' | 'EXCEL' | 'CSV';
}

/**
 * Statement bulk operations
 */
export interface BulkStatementRequest {
  propertyId: number;
  tenantUserIds: number[];
  year: number;
  month: number;
}

/**
 * Batch processing result
 */
export interface BatchProcessingResult {
  totalRequested: number;
  successCount: number;
  failureCount: number;
  results: {
    id: number;
    success: boolean;
    message?: string;
    statementId?: number;
  }[];
}

/**
 * Reconciliation request
 */
export interface ReconciliationRequest {
  propertyId: number;
  period: string; // YYYY-MM
  notes?: string;
}

/**
 * Reconciliation result
 */
export interface ReconciliationResult {
  period: string;
  propertyId: number;
  totalCharges: number;
  totalPayments: number;
  differences: number;
  discrepancies: DiscrepancyItem[];
  reconciled: boolean;
}

/**
 * Discrepancy item in reconciliation
 */
export interface DiscrepancyItem {
  type: 'MISSING_CHARGE' | 'MISSING_PAYMENT' | 'AMOUNT_MISMATCH';
  description: string;
  amount: number;
  reference: string;
}

