export type MaintenanceRequestStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
export type MaintenanceScope = 'BUILDING' | 'UNIT_PRIVATE';

export interface MaintenanceRequest {
  id: number;
  propertyId: number;
  unitId?: number | null;
  createdByUserId: number;
  assignedToUserId?: number | null;
  status: MaintenanceRequestStatus;
  scope: MaintenanceScope;
  title?: string | null;
  description?: string | null;
  createdAt: string;
  conversationId?: number | null;
}

export interface BuildingMaintenanceCreateRequest {
  title: string;
  description?: string;
  unitId?: number | null;
  assignedToUserId?: number | null;
}

export interface PrivateUnitMaintenanceCreateRequest {
  title: string;
  description?: string;
}
