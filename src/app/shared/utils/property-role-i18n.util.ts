const PROPERTY_ROLE_LABEL_KEYS: Record<string, string> = {
  PROPERTY_OWNER: 'property.role.propertyOwner',
  PROPERTY_ADMIN: 'property.role.propertyAdmin',
  BUILDING_MANAGER: 'property.role.buildingManager',
  PROPERTY_LANDLORD: 'property.role.propertyLandlord',
  BUILDING_SYNDIC: 'property.role.buildingSyndic',
  BUILDING_SECURITY: 'property.role.buildingSecurity',
  PROPERTY_TENANT: 'property.role.propertyTenant'
};

export function getPropertyRoleLabelKey(role?: string): string {
  if (!role) {
    return 'property.role.none';
  }

  return PROPERTY_ROLE_LABEL_KEYS[role] ?? 'property.role.none';
}

