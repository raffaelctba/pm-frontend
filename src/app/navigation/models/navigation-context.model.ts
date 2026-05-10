import { PropertyCapabilities } from '../../models/property.model';

export type NavigationContextKind = 'building' | 'unit' | 'none';

export interface BreadcrumbItem {
  label: string;
  link?: any[];
  current?: boolean;
}

export interface BuildingContext {
  buildingId: number;
  buildingName: string;
  capabilities: PropertyCapabilities;
  currentUserRoles?: string[];
}

export interface UnitContext extends BuildingContext {
  unitId: number;
  unitNumber: string;
  currentUserIsUnitOwnerOrTenant?: boolean;
}

export interface NavigationContext {
  kind: NavigationContextKind;
  building?: BuildingContext;
  unit?: UnitContext;
}

export interface MenuItem {
  id: string;
  labelKey: string;
  fallbackLabel: string;
  link: any[];
  exact?: boolean;
  capability?: keyof PropertyCapabilities;
  visibility?: 'unitTenancy';
}
