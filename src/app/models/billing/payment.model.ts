/**
 * Payment-related models for recording and tracking payments
 */

import { PaymentStatus, PaymentMethod, AllocationStatus } from './payment-status.model';
import { Metadata } from './billing-common.model';

/**
 * Represents a payment recorded by tenant/payer
 */
export interface Payment {
  id: number;
  propertyId: number;
  tenantUserId: number;
  amount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  externalTransactionId?: string;
  receivedDate: Date;
  paymentDate?: Date;
  notes?: string;
  metadata?: Metadata;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Request DTO for recording a payment
 */
export interface PaymentRecordRequest {
  propertyId: number;
  tenantUserId: number;
  processedByUserId?: number;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  paymentDate?: Date;
  receivedDate: Date;
  notes?: string;
  externalTransactionId?: string;
  metadata?: Metadata;
}

/**
 * Response DTO for payment operations
 */
export interface PaymentResponse {
  id: number;
  propertyId: number;
  tenantUserId: number;
  amount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  paymentDate?: Date;
  receivedDate: Date;
  allocatedAmount: number;
  unallocatedAmount: number;
  externalTransactionId?: string;
  notes?: string;
  metadata?: Metadata;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Represents the allocation of payment to charges/statements
 */
export interface PaymentAllocation {
  id: number;
  paymentId: number;
  chargeId?: number;
  billingStatementId?: number;
  amount: number;
  currency: string;
  allocationStatus: AllocationStatus;
  allocationOrder: number;
  allocatedAt: Date;
}

/**
 * Request DTO for allocating payment
 */
export interface PaymentAllocationRequest {
  paymentId: number;
  tenantUserId: number;
}

/**
 * Details of payment allocation including related entities
 */
export interface PaymentAllocationDetails {
  allocation: PaymentAllocation;
  chargeTypeName?: string; // If allocated to charge
  statementPeriod?: string; // If allocated to statement (YYYY-MM)
  chargeStatus?: string;
  statementStatus?: string;
}

/**
 * Payment reversal request
 */
export interface PaymentReversalRequest {
  paymentId: number;
  reason: string;
  notes?: string;
}

/**
 * Payment filter criteria
 */
export interface PaymentFilter {
  propertyId?: number;
  tenantUserId?: number;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  size?: number;
}

/**
 * Payment statistics
 */
export interface PaymentStatistics {
  totalRecorded: number;
  totalProcessed: number;
  totalFailed: number;
  totalRefunded: number;
  averageAmount: number;
  currency: string;
  period: string;
}

/**
 * Tenant payment summary
 */
export interface TenantPaymentSummary {
  tenantUserId: number;
  propertyId: number;
  totalPaid: number;
  pendingAmount: number;
  allocatedAmount: number;
  remainingBalance: number;
  currency: string;
  lastPaymentDate?: Date;
  paymentMethod?: PaymentMethod;
}


