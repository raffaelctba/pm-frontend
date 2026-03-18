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
  status: PropertyStatus;
  address?: Address;
  areaSize?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  isBuilding: boolean;
  totalUnits?: number;
  monthlyFee?: number;
  currencyCode?: string;
  dueDay?: number;
  lateFeePercentage?: number;
  interestRateMonthly?: number;
}

export interface PropertyDTO {
  name: string;
  description?: string;
  propertyType: PropertyType;
  status: PropertyStatus;
  address?: Address;
  areaSize?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  isBuilding: boolean;
  totalUnits?: number;
  monthlyFee?: number;
  currencyCode?: string;
  dueDay?: number;
  lateFeePercentage?: number;
  interestRateMonthly?: number;
}

export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  BUILDING = 'BUILDING',
  COMMERCIAL = 'COMMERCIAL',
  LAND = 'LAND'
}

export enum PropertyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  SOLD = 'SOLD'
}
