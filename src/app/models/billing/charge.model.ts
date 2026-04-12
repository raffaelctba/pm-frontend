/**
 * Charge-related models for charge types and individual charges
 */

import { ChargeStatus, ApprovalStatus, ChargeFrequency, ChargeCategory } from './charge-status.model';
import { AuditFields, Metadata } from './billing-common.model';

/**
 * Represents a charge type template
 * Charge types define the structure and default values for charges
 */
export interface ChargeType {
  id: number;
  name: string;
  description: string;
  category: ChargeCategory;
  chargeFrequency: ChargeFrequency;
  baseAmount: number;
  currency: string;
  isTaxable: boolean;
  isDiscountable: boolean;
  requiresApproval: boolean;
  allowMultipleAssignments: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Request DTO for creating/updating charge types
 */
export interface ChargeTypeRequest {
  name: string;
  description: string;
  category: ChargeCategory;
  chargeFrequency: ChargeFrequency;
  baseAmount: number;
  currency: string;
  isTaxable: boolean;
  isDiscountable: boolean;
  requiresApproval: boolean;
  allowMultipleAssignments: boolean;
}

/**
 * Response DTO for charge type operations
 */
export interface ChargeTypeResponse {
  id: number;
  name: string;
  description: string;
  category: ChargeCategory;
  chargeFrequency: ChargeFrequency;
  baseAmount: number;
  currency: string;
  isTaxable: boolean;
  isDiscountable: boolean;
  requiresApproval: boolean;
  allowMultipleAssignments: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents an individual charge applied to a tenant/unit
 */
export interface Charge {
  id: number;
  chargeTypeId: number;
  chargeTypeName: string;
  propertyId: number;
  tenantUserId: number;
  unitId?: number;
  amount: number;
  currency: string;
  chargeStatus: ChargeStatus;
  approvalStatus: ApprovalStatus;
  startDate: Date;
  endDate?: Date;
  description?: string;
  metadata?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Request DTO for creating a charge
 */
export interface ChargeRequest {
  chargeTypeId: number;
  propertyId: number;
  tenantUserId: number;
  createdByUserId: number;
  unitId?: number;
  amount: number;
  currency: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  metadata?: string;
}

/**
 * Request DTO for charge approval
 */
export interface ChargeApprovalRequest {
  approverUserId: number;
  notes: string;
}

/**
 * Response DTO for charge operations
 */
export interface ChargeResponse {
  id: number;
  chargeTypeId: number;
  chargeTypeName: string;
  propertyId: number;
  tenantUserId: number;
  unitId?: number;
  amount: number;
  currency: string;
  chargeStatus: ChargeStatus;
  approvalStatus: ApprovalStatus;
  startDate: Date;
  endDate?: Date;
  description?: string;
  metadata?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Bulk charge creation request
 */
export interface BulkChargeRequest {
  chargeTypeId: number;
  propertyId: number;
  tenantUserIds: number[]; // Multiple tenants
  amount?: number;
  currency?: string;
  startDate: Date;
  endDate?: Date;
  dueDate?: Date;
}

/**
 * Charge filter criteria
 */
export interface ChargeFilter {
  propertyId?: number;
  tenantUserId?: number;
  chargeTypeId?: number;
  chargeStatus?: ChargeStatus;
  approvalStatus?: ApprovalStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  size?: number;
}

/**
 * Charge approval filter for admin
 */
export interface ChargeApprovalFilter {
  propertyId?: number;
  approvalStatus?: ApprovalStatus;
  page?: number;
  size?: number;
}

