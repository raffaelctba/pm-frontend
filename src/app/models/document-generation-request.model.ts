export interface DocumentGenerationRequest {
  templateId: number;
  language?: string;
  propertyId?: number;
  leaseId?: number;
  variables?: Record<string, unknown>;
  metadata?: string;
  generatePdf?: boolean;
}

