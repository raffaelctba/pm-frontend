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

const PRIVATE_PROPERTY_TENANT_ROLE = 'PROPERTY_TENANT';

export function canManageBuildingOperations(role?: string): boolean {
  return !!role && BUILDING_OPERATION_ROLES.has(role);
}

export function canEditPropertyByRole(isBuilding: boolean, role?: string): boolean {
  if (!role) {
    return false;
  }

  return isBuilding ? BUILDING_OPERATION_ROLES.has(role) : PRIVATE_PROPERTY_EDIT_ROLES.has(role);
}

export function canManagePrivatePropertyOperations(role?: string): boolean {
  return !!role && PRIVATE_PROPERTY_EDIT_ROLES.has(role);
}

export function isTenantRole(role?: string): boolean {
  return role === PRIVATE_PROPERTY_TENANT_ROLE;
}

