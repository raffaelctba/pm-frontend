export type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface BuildingFinanceInvoice {
  id: number;
  buildingId: number;
  unitId?: number | null;
  unitNumber?: string | null;
  userId: number;
  invoiceNumber?: string;
  description?: string | null;
  amount: number;
  dueDate: string;
  status?: InvoiceStatus;
  totalAmount?: number;
  currencyCode?: string;
  referenceMonth?: string | null;
  paidDate?: string | null;
  createdAt?: string;
}

export interface BuildingFinanceInvoiceRequest {
  userId: number;
  unitId?: number | null;
  description?: string | null;
  amount: number;
  dueDate: string;
  referenceMonth?: string | null;
}

export interface BuildingBulkInvoiceGenerationRequest {
  referenceMonth: string;
  dueDate?: string | null;
  description?: string | null;
}

export interface BuildingBulkInvoiceGenerationItem {
  unitId: number;
  unitNumber: string;
  userId?: number | null;
  amount?: number | null;
  status: 'CREATED' | 'SKIPPED';
  reason?: string | null;
  invoiceId?: number | null;
  invoiceNumber?: string | null;
}

export interface BuildingBulkInvoiceGenerationResult {
  buildingId: number;
  referenceMonth: string;
  dueDate?: string | null;
  totalUnits: number;
  createdInvoices: number;
  skippedUnits: number;
  items: BuildingBulkInvoiceGenerationItem[];
}

export interface BuildingFinanceSummary {
  buildingId: number;
  totalInvoices: number;
  pendingInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  pendingAmount: number;
  paidAmount: number;
  overdueAmount: number;
}

