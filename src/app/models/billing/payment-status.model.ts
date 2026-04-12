/**
 * Payment status enums and label mappings for UI display
 */

// Payment processing status
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

// Payment method enum
export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PIX = 'PIX',
  CHECK = 'CHECK'
}

// Allocation status
export enum AllocationStatus {
  PENDING = 'PENDING',
  ALLOCATED = 'ALLOCATED',
  REVERSED = 'REVERSED'
}

// UI Labels for payment status
export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Pending',
  [PaymentStatus.PROCESSED]: 'Processed',
  [PaymentStatus.FAILED]: 'Failed',
  [PaymentStatus.REFUNDED]: 'Refunded'
};

// UI Labels for payment method
export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Cash',
  [PaymentMethod.CREDIT_CARD]: 'Credit Card',
  [PaymentMethod.DEBIT_CARD]: 'Debit Card',
  [PaymentMethod.BANK_TRANSFER]: 'Bank Transfer',
  [PaymentMethod.PIX]: 'PIX',
  [PaymentMethod.CHECK]: 'Check'
};

// UI Labels for allocation status
export const AllocationStatusLabels: Record<AllocationStatus, string> = {
  [AllocationStatus.PENDING]: 'Pending',
  [AllocationStatus.ALLOCATED]: 'Allocated',
  [AllocationStatus.REVERSED]: 'Reversed'
};

// Color coding for UI
export const PaymentStatusColors: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'warning',    // yellow/orange
  [PaymentStatus.PROCESSED]: 'success',  // green
  [PaymentStatus.FAILED]: 'danger',      // red
  [PaymentStatus.REFUNDED]: 'secondary'  // gray
};

// Color coding for allocation status
export const AllocationStatusColors: Record<AllocationStatus, string> = {
  [AllocationStatus.PENDING]: 'warning',   // yellow/orange
  [AllocationStatus.ALLOCATED]: 'success', // green
  [AllocationStatus.REVERSED]: 'secondary' // gray
};

