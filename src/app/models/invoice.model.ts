import { InvoiceDeliveryStatus } from './invoice-lifecycle.model';

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
  deliveryStatus?: InvoiceDeliveryStatus;
  sentDate?: string;
  isLocked?: boolean;
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
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  VOIDED = 'VOIDED',
  PARTIALLY_PAID = 'PARTIALLY_PAID'
}
