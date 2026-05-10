export type UnitMembership = 'OWNER' | 'PRIMARY_TENANT' | 'TENANT' | 'UNIT_MANAGER';
export type UnitRoleAssignment = 'OWNER' | 'TENANT' | 'UNIT_MANAGER' | 'SUBTENANT';

export type PropertyRoleName =
  | 'PROPERTY_OWNER'
  | 'PROPERTY_TENANT'
  | 'TENANT_MANAGER'
  | 'PROPERTY_LANDLORD'
  | 'PROPERTY_ADMIN'
  | 'BUILDING_MANAGER'
  | 'BUILDING_SYNDIC'
  | 'BUILDING_SECURITY';

export interface UnitMembershipSummary {
  unitId: number;
  unitNumber: string;
  memberships: UnitMembership[];
}

export interface BuildingUser {
  userId: number;
  fullName: string;
  email: string;
  buildingRoles: PropertyRoleName[];
  units: UnitMembershipSummary[];
}

export interface UnitUser {
  userId: number;
  fullName: string;
  email: string;
  memberships: UnitMembership[];
}

export interface UnitUserAssignmentRequest {
  userId?: number;
  email?: string;
  primary?: boolean;
}

export interface UnitRoleAssignmentRequest {
  userId?: number;
  email?: string;
  role: UnitRoleAssignment;
}
