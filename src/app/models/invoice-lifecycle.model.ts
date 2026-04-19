/**
 * Invoice Lifecycle Models
 * These models support the full invoice lifecycle including line items,
 * delivery tracking, payment reversals, and void operations.
 */

/**
 * Line item within an invoice
 */
export interface InvoiceLineItem {
  id?: number;
  invoiceId?: number;
  description: string;
  itemCode?: string;
  quantity: number;
  unitPrice: number;
  taxPercentage?: number;
  discountPercentage?: number;
  lineTotal?: number;
  sequenceOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Delivery status for an invoice
 */
export type InvoiceDeliveryStatus = 'NOT_SENT' | 'SENT_EMAIL' | 'SENT_PORTAL' | 'SENT_PRINT' | 'VIEWED' | 'FAILED';

/**
 * Delivery record for an invoice
 */
export interface InvoiceDelivery {
  id?: number;
  invoiceId?: number;
  status: InvoiceDeliveryStatus;
  deliveryMethod: string; // EMAIL, PORTAL, PRINT
  recipientEmail?: string;
  deliveryNotes?: string;
  deliveredAt?: string;
  viewedAt?: string;
  failedReason?: string;
  retryCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Payment reversal record
 */
export interface PaymentReversal {
  id?: number;
  paymentId?: number;
  invoiceId?: number;
  reversalAmount: number;
  reason: string;
  notes?: string;
  reversalDate?: string;
  createdAt?: string;
  createdBy?: number;
  actorKeycloakId?: string;
}

/**
 * DTO for sending an invoice
 */
export interface SendInvoiceDTO {
  deliveryMethod: string; // EMAIL, PORTAL, PRINT
  recipientEmail?: string;
  notes?: string;
}

/**
 * DTO for reversing a payment
 */
export interface PaymentReversalDTO {
  paymentId: number;
  reversalAmount: number;
  reason: string;
  notes?: string;
}

/**
 * DTO for voiding an invoice
 */
export interface VoidInvoiceDTO {
  reason: string;
  notes?: string;
}

/**
 * DTO for creating/updating a line item
 */
export interface InvoiceLineItemDTO {
  id?: number;
  description: string;
  itemCode?: string;
  quantity: number;
  unitPrice: number;
  taxPercentage?: number;
  discountPercentage?: number;
  sequenceOrder?: number;
}


