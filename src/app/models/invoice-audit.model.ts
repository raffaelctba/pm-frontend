export interface InvoiceAuditLog {
  id: number;
  invoiceId: number;
  action: string;
  details?: string;
  sourceInvoiceId?: number;
  targetInvoiceId?: number;
  actorKeycloakId?: string;
  createdAt: string;
}

export interface InvoiceAdjustmentDTO {
  amount: number;
  description?: string;
  dueDate: string;
}

export interface InvoiceVoidReissueDTO {
  reason: string;
  newDueDate: string;
}

export interface InvoiceVoidReissueResultDTO {
  voidedInvoice: any;
  reissuedInvoice: any;
}

