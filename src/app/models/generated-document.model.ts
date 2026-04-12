export interface GeneratedDocument {
  id: number;
  templateId: number;
  templateName: string;
  templateVersion: number;
  documentType: string;
  propertyId?: number;
  leaseId?: number;
  generatedById: number;
  generatedByName: string;
  status: DocumentStatus;
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  language: string;
  variables?: Record<string, unknown>;
  metadata?: string;
  generatedAt: Date;
  sentAt?: Date;
  signedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  GENERATED = 'GENERATED',
  SENT = 'SENT',
  SIGNED = 'SIGNED',
  EXPIRED = 'EXPIRED'
}

export const DocumentStatusLabels: Record<DocumentStatus, string> = {
  [DocumentStatus.DRAFT]: 'Draft',
  [DocumentStatus.PUBLISHED]: 'Published',
  [DocumentStatus.ARCHIVED]: 'Archived',
  [DocumentStatus.GENERATED]: 'Generated',
  [DocumentStatus.SENT]: 'Sent',
  [DocumentStatus.SIGNED]: 'Signed',
  [DocumentStatus.EXPIRED]: 'Expired'
};

export const DocumentStatusDescriptions: Record<DocumentStatus, string> = {
  [DocumentStatus.DRAFT]: 'Draft - Not yet published',
  [DocumentStatus.PUBLISHED]: 'Published - Available for use',
  [DocumentStatus.ARCHIVED]: 'Archived - No longer in use',
  [DocumentStatus.GENERATED]: 'Generated - Document created',
  [DocumentStatus.SENT]: 'Sent - Delivered to recipient',
  [DocumentStatus.SIGNED]: 'Signed - Digitally signed',
  [DocumentStatus.EXPIRED]: 'Expired - No longer valid'
};

