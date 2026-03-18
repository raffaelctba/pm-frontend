export interface Invoice {
  id: number;
  propertyId: number;
  userId: number;
  invoiceNumber: string;
  description?: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: InvoiceStatus;
  lateFee: number;
  interest: number;
  totalAmount: number;
  referenceMonth?: string;
}

export interface InvoiceDTO {
  propertyId: number;
  userId: number;
  description?: string;
  amount: number;
  dueDate: string;
  referenceMonth?: string;
}

export enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  PARTIALLY_PAID = 'PARTIALLY_PAID'
}
