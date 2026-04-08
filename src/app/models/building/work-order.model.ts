export type WorkOrderStatus = 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type WorkOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface WorkOrder {
  id: number;
  buildingId: number;
  unitId?: number | null;
  title: string;
  description?: string | null;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  requestedAt?: string;
  scheduledAt?: string | null;
  completedAt?: string | null;
  estimatedCost?: number | null;
  actualCost?: number | null;
  assignedTo?: string | null;
  vendorName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkOrderRequest {
  unitId?: number | null;
  title: string;
  description?: string | null;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  scheduledAt?: string | null;
  estimatedCost?: number | null;
  actualCost?: number | null;
  assignedTo?: string | null;
  vendorName?: string | null;
}

export interface WorkOrderStatusUpdateRequest {
  status: WorkOrderStatus;
  note?: string | null;
}

