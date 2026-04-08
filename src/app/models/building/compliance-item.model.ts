export type ComplianceStatus = 'PENDING' | 'PASSED' | 'FAILED' | 'EXPIRED';

export interface ComplianceItem {
  id: number;
  buildingId: number;
  title: string;
  authority: string;
  dueDate: string;
  status: ComplianceStatus;
  passedAt?: string | null;
  failedReason?: string | null;
  reminderDaysBefore?: number | null;
  reminderSentAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ComplianceItemRequest {
  title: string;
  authority: string;
  dueDate: string;
  status: ComplianceStatus;
  passedAt?: string | null;
  failedReason?: string | null;
  reminderDaysBefore?: number | null;
}

