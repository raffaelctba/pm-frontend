export type BuildingDocumentType = 'CONTRACT' | 'INVOICE' | 'RECEIPT' | 'REPORT' | 'PHOTO' | 'OTHER';

export interface BuildingDocument {
  id: number;
  buildingId: number;
  documentType: BuildingDocumentType;
  title: string;
  description?: string | null;
  fileName: string;
  filePath: string;
  fileSize?: number | null;
  mimeType?: string | null;
  uploadedBy?: string | null;
  uploadedAt?: string;
}

export interface BuildingDocumentRequest {
  documentType: BuildingDocumentType;
  title: string;
  description?: string | null;
  fileName: string;
  filePath: string;
  fileSize?: number | null;
  mimeType?: string | null;
}

