export type UnitStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';

export interface BuildingUnit {
  id: number;
  buildingId: number;
  unitNumber: string;
  unitType: string;
  status: UnitStatus;
  floorNumber?: number;
  areaSize?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpot?: string;
  storageUnit?: string;
  monthlyFeeOverride?: number | null;
  lateFeePercentageOverride?: number | null;
  interestRateMonthlyOverride?: number | null;
  gracePeriodDaysOverride?: number | null;
  occupied: boolean;
  ownerId?: number;
  ownerName?: string;
  ownerEmail?: string;
  tenantId?: number;
  tenantIds?: number[];
  tenantName?: string;
  tenantEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UnitVisibilityOptions {
  elevatedVisibility?: boolean;
}

export interface BuildingUnitRequest {
  unitNumber: string;
  unitType: string;
  status: UnitStatus;
  floorNumber?: number | null;
  areaSize?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parkingSpot?: string | null;
  storageUnit?: string | null;
  monthlyFeeOverride?: number | null;
  lateFeePercentageOverride?: number | null;
  interestRateMonthlyOverride?: number | null;
  gracePeriodDaysOverride?: number | null;
  occupied: boolean;
  ownerId?: number | null;
  ownerName?: string | null;
  ownerEmail?: string | null;
  tenantId?: number | null;
  tenantName?: string | null;
  tenantEmail?: string | null;
}

export interface UnitAssignee {
  id: number;
  name?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  keycloakId?: string;
}

export interface UnitAssigneeOptions {
  owners: UnitAssignee[];
  tenants: UnitAssignee[];
}

export type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'PARTIALLY_PAID';

export type UnitInvitationRole = 'OWNER' | 'TENANT';
export type UnitInvitationStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';

export interface UnitPaymentHistoryItem {
  invoiceId: number;
  invoiceNumber: string;
  userId?: number;
  payerName?: string;
  payerEmail?: string;
  amount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: InvoiceStatus;
  dueDate: string;
  paidDate?: string;
  referenceMonth?: string;
  lastPaymentDate?: string;
  currencyCode?: string;
}

export interface BuildingUnitDetails {
  buildingId: number;
  unitId: number;
  unitNumber: string;
  unitType: string;
  status: UnitStatus;
  occupied: boolean;
  ownerName?: string;
  ownerEmail?: string;
  tenantName?: string;
  tenantEmail?: string;
  tenants?: UnitTenantContact[];
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  outstandingAmount: number;
  paidAmount: number;
  currencyCode?: string;
  paymentHistory: UnitPaymentHistoryItem[];
  recentActivity: UnitActivityItem[];
  pendingInvitations?: UnitInvitationSummary[];
}

export interface UnitTenantContact {
  userId?: number;
  name?: string;
  email?: string;
}

export type UnitActivityType = 'INVOICE_STATUS' | 'PAYMENT' | 'INCIDENT';

export interface UnitActivityItem {
  type: UnitActivityType;
  title: string;
  description?: string;
  status?: string;
  eventAt: string;
}

export interface UnitInvitationSummary {
  invitationId: number;
  invitationRole: UnitInvitationRole;
  inviteeName?: string;
  inviteeEmail?: string;
  status: UnitInvitationStatus;
  expiresAt?: string;
}

