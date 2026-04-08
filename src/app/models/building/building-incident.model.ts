export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface BuildingIncident {
  id: number;
  buildingId: number;
  unitId?: number | null;
  title: string;
  description?: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location?: string | null;
  resolutionNotes?: string | null;
  occurredAt?: string;
  resolvedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BuildingIncidentRequest {
  unitId?: number | null;
  title: string;
  description?: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location?: string | null;
  resolutionNotes?: string | null;
  occurredAt?: string | null;
}

