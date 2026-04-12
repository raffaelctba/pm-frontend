export interface Lease {
  id: number;
  propertyId: number;
  buildingUnitId: number;
  tenantUserId?: number | null;
  landlordUserId?: number | null;
  startDate: string;
  endDate?: string | null;
  monthlyRent?: number | null;
  lateFeePercentageOverride?: number | null;
  interestRateMonthlyOverride?: number | null;
  gracePeriodDaysOverride?: number | null;
  isActive?: boolean;
  notes?: string | null;
}

export interface LeaseRequest {
  id?: number;
  propertyId: number;
  buildingUnitId: number;
  tenantUserId?: number | null;
  landlordUserId?: number | null;
  startDate: string;
  endDate?: string | null;
  monthlyRent?: number | null;
  lateFeePercentageOverride?: number | null;
  interestRateMonthlyOverride?: number | null;
  gracePeriodDaysOverride?: number | null;
  isActive?: boolean;
  notes?: string | null;
}

