/**
 * Charge status enums and label mappings for UI display
 */

// Charge lifecycle status
export enum ChargeStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  WAIVED = 'WAIVED',
  CANCELLED = 'CANCELLED'
}

// Charge approval workflow status
export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED'
}

// Charge frequency
export enum ChargeFrequency {
  ONE_TIME = 'ONE_TIME',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  YEARLY = 'YEARLY'
}

// Category of charge
export enum ChargeCategory {
  RENT = 'RENT',
  DEPOSIT = 'DEPOSIT',
  UTILITY = 'UTILITY',
  MAINTENANCE = 'MAINTENANCE',
  SERVICE_FEE = 'SERVICE_FEE',
  PENALTY = 'PENALTY',
  AMENITY = 'AMENITY',
  OTHER = 'OTHER'
}

// UI Labels for charge status
export const ChargeStatusLabels: Record<ChargeStatus, string> = {
  [ChargeStatus.PENDING]: 'Pending',
  [ChargeStatus.APPROVED]: 'Approved',
  [ChargeStatus.ACTIVE]: 'Active',
  [ChargeStatus.COMPLETED]: 'Completed',
  [ChargeStatus.WAIVED]: 'Waived',
  [ChargeStatus.CANCELLED]: 'Cancelled'
};

// UI Labels for approval status
export const ApprovalStatusLabels: Record<ApprovalStatus, string> = {
  [ApprovalStatus.PENDING]: 'Pending',
  [ApprovalStatus.APPROVED]: 'Approved',
  [ApprovalStatus.REJECTED]: 'Rejected',
  [ApprovalStatus.ESCALATED]: 'Escalated'
};

// UI Labels for charge frequency
export const ChargeFrequencyLabels: Record<ChargeFrequency, string> = {
  [ChargeFrequency.ONE_TIME]: 'One Time',
  [ChargeFrequency.MONTHLY]: 'Monthly',
  [ChargeFrequency.QUARTERLY]: 'Quarterly',
  [ChargeFrequency.SEMI_ANNUAL]: 'Semi-Annual',
  [ChargeFrequency.YEARLY]: 'Yearly'
};

// UI Labels for charge category
export const ChargeCategoryLabels: Record<ChargeCategory, string> = {
  [ChargeCategory.RENT]: 'Rent',
  [ChargeCategory.DEPOSIT]: 'Deposit',
  [ChargeCategory.UTILITY]: 'Utility',
  [ChargeCategory.MAINTENANCE]: 'Maintenance',
  [ChargeCategory.SERVICE_FEE]: 'Service Fee',
  [ChargeCategory.PENALTY]: 'Penalty',
  [ChargeCategory.AMENITY]: 'Amenity',
  [ChargeCategory.OTHER]: 'Other'
};

// Color coding for UI
export const ChargeStatusColors: Record<ChargeStatus, string> = {
  [ChargeStatus.PENDING]: 'warning',     // yellow/orange
  [ChargeStatus.APPROVED]: 'success',    // green
  [ChargeStatus.ACTIVE]: 'info',         // blue
  [ChargeStatus.COMPLETED]: 'success',   // green
  [ChargeStatus.WAIVED]: 'secondary',    // gray
  [ChargeStatus.CANCELLED]: 'danger'     // red
};

// Color coding for approval status
export const ApprovalStatusColors: Record<ApprovalStatus, string> = {
  [ApprovalStatus.PENDING]: 'warning',   // yellow/orange
  [ApprovalStatus.APPROVED]: 'success',  // green
  [ApprovalStatus.REJECTED]: 'danger',   // red
  [ApprovalStatus.ESCALATED]: 'danger'   // red
};

