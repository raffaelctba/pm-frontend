export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH' | 'CHECK';

export interface ProcessInvoicePaymentRequest {
  amount?: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  redirectCheckout?: boolean;
  successUrl?: string;
  cancelUrl?: string;
}

export interface ProcessInvoicePaymentResponse {
  invoiceId: number;
  paymentId: number | null;
  status: 'APPROVED' | 'PENDING' | 'FAILED';
  gatewayProvider: 'MANUAL_FALLBACK' | 'BRAZIL_PIX' | 'STRIPE_CARD' | 'MERCADOPAGO' | 'ADYEN_CARD' | null;
  transactionId: string | null;
  externalReference: string | null;
  invoiceStatus: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'PARTIALLY_PAID';
  paidDate: string | null;
  message: string;
  providerInstructions: string | null;
  checkoutUrl: string | null;
  webhookReference: string | null;
}

