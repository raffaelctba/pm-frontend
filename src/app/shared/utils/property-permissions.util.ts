import { PropertyType } from '../../models/property.model';

const BUILDING_OPERATION_ROLES = new Set<string>([
  'PROPERTY_OWNER',
  'PROPERTY_ADMIN',
  'BUILDING_MANAGER',
  'BUILDING_SYNDIC',
  'BUILDING_SECURITY'
]);

const PRIVATE_PROPERTY_EDIT_ROLES = new Set<string>([
  'PROPERTY_OWNER',
  'PROPERTY_ADMIN',
  'PROPERTY_LANDLORD'
]);

export function canManageBuildingOperations(role?: string): boolean {
  return !!role && BUILDING_OPERATION_ROLES.has(role);
}

export function isMultiUnitProperty(propertyType?: PropertyType): boolean {
  return propertyType === PropertyType.BUILDING || propertyType === PropertyType.COMMERCIAL_BUILDING;
}

export function canEditPropertyByRole(propertyType?: PropertyType, role?: string): boolean {
  if (!role) {
    return false;
  }

  return isMultiUnitProperty(propertyType)
    ? BUILDING_OPERATION_ROLES.has(role)
    : PRIVATE_PROPERTY_EDIT_ROLES.has(role);
}

