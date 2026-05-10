export interface Address {
  id?: number;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode?: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
}

export interface Property {
  id: number;
  name: string;
  description?: string;
  propertyType: PropertyType;
  usageType?: PropertyUsageType;
  status: PropertyStatus;
  address?: Address;
  areaSize?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  totalUnits?: number;
  currentUserRole?: string;
  currentUserRoles?: string[];
  currentUserPermissions?: string[];
  primaryImageUrl?: string;
  primaryImageId?: number;
  monthlyFee?: number;
  currencyCode?: string;
  dueDay?: number;
  lateFeePercentage?: number;
  interestRateMonthly?: number;
  billing?: PropertyBilling;
  leaseManagementEnabled?: boolean | null;
  condoManagementEnabled?: boolean | null;
  amenitiesEnabled?: boolean | null;
  capabilities?: PropertyCapabilities;
}

export interface PropertyDTO {
  name: string;
  description?: string;
  propertyType: PropertyType;
  usageType?: PropertyUsageType;
  status: PropertyStatus;
  address?: Address;
  areaSize?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  totalUnits?: number;
  primaryImageUrl?: string;
  monthlyFee?: number;
  currencyCode?: string;
  dueDay?: number;
  lateFeePercentage?: number;
  interestRateMonthly?: number;
  billing?: PropertyBilling;
  leaseManagementEnabled?: boolean | null;
  condoManagementEnabled?: boolean | null;
  amenitiesEnabled?: boolean | null;
}

export interface PropertyCapabilities {
  leaseManagement: boolean;
  rentalPayments: boolean;
  condoManagement: boolean;
  buildingUnits: boolean;
  amenities: boolean;
  leaseManagementOverride?: boolean | null;
  condoManagementOverride?: boolean | null;
  amenitiesOverride?: boolean | null;
}

export interface PropertyBilling {
  id?: number;
  propertyId?: number;
  monthlyFee?: number;
  currencyCode?: string;
  dueDay?: number;
  lateFeePercentage?: number;
  interestRateMonthly?: number;
  gracePeriodDays?: number;
  autoGenerateInvoices?: boolean;
    autoSendReminders?: boolean;
    reminderDaysBeforeDue?: number;
  isActive?: boolean;
  notes?: string;
}

export interface PropertyLinkedUser {
  userId: number;
  fullName: string;
  email: string;
  role?: string;
}

export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  BUILDING = 'BUILDING',
  COMMERCIAL_UNIT = 'COMMERCIAL_UNIT',
  COMMERCIAL_BUILDING = 'COMMERCIAL_BUILDING'
}

export enum PropertyUsageType {
  RENTAL = 'RENTAL',
  OWNER_OCCUPIED = 'OWNER_OCCUPIED',
  VACATION_HOME = 'VACATION_HOME',
  COMMERCIAL_OWNER_USE = 'COMMERCIAL_OWNER_USE',
  FOR_SALE = 'FOR_SALE'
}


export enum PropertyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  SOLD = 'SOLD'
}
