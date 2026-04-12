/**
 * Payment allocation detailed model and related DTOs
 */

import { AllocationStatus, AllocationStatusLabels, AllocationStatusColors } from './payment-status.model';

/**
 * Details of how a payment was allocated to charges or statements
 */
export interface AllocationDetail {
  allocationId: number;
  paymentId: number;
  targetId: number; // chargeId or statementId
  targetType: 'CHARGE' | 'STATEMENT';
  amount: number;
  currency: string;
  allocationStatus: AllocationStatus;
  allocationOrder: number;
  allocatedAt: Date;
  targetDetails?: {
    name?: string; // Charge type name or statement period
    dueDate?: Date;
    originalAmount?: number;
    remainingAmount?: number;
  };
}

/**
 * Allocation summary for payment
 */
export interface AllocationSummary {
  paymentId: number;
  totalAllocated: number;
  totalReversed: number;
  netAllocated: number;
  currency: string;
  allocations: AllocationDetail[];
  allocatedToCharges: number;
  allocatedToStatements: number;
  unallocatedAmount: number;
}

/**
 * Allocation transaction for audit trail
 */
export interface AllocationTransaction {
  id: number;
  paymentId: number;
  allocationId: number;
  transactionType: 'ALLOCATION' | 'REVERSAL';
  amount: number;
  currency: string;
  reason: string;
  performedBy: string;
  performedAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Reverse allocation request
 */
export interface ReverseAllocationRequest {
  allocationId: number;
  reason: string;
  notes?: string;
}

/**
 * Allocation filter for searches
 */
export interface AllocationFilter {
  paymentId?: number;
  targetId?: number;
  targetType?: 'CHARGE' | 'STATEMENT';
  allocationStatus?: AllocationStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  size?: number;
}

/**
 * Helper to get allocation status label
 */
export function getAllocationStatusLabel(status: AllocationStatus): string {
  return AllocationStatusLabels[status] || status;
}

/**
 * Helper to get allocation status color
 */
export function getAllocationStatusColor(status: AllocationStatus): string {
  return AllocationStatusColors[status] || 'secondary';
}

/**
 * Calculate allocation summary
 */
export function calculateAllocationSummary(allocations: AllocationDetail[]): AllocationSummary {
  const successful = allocations.filter(a => a.allocationStatus === AllocationStatus.ALLOCATED);
  const reversed = allocations.filter(a => a.allocationStatus === AllocationStatus.REVERSED);

  const totalAllocated = successful.reduce((sum, a) => sum + a.amount, 0);
  const totalReversed = reversed.reduce((sum, a) => sum + a.amount, 0);
  const netAllocated = totalAllocated - totalReversed;

  const allocatedToCharges = successful.filter(a => a.targetType === 'CHARGE').length;
  const allocatedToStatements = successful.filter(a => a.targetType === 'STATEMENT').length;

  return {
    paymentId: allocations[0]?.paymentId || 0,
    totalAllocated,
    totalReversed,
    netAllocated,
    currency: allocations[0]?.currency || 'USD',
    allocations,
    allocatedToCharges,
    allocatedToStatements,
    unallocatedAmount: 0 // Calculated by service
  };
}

