import { DocumentStatus } from './generated-document.model';
import { Metadata } from './billing/billing-common.model';

export type DocumentLanguage = 'EN' | 'PT' | 'ES' | 'FR';
export type DocumentType = 'LEASE_AGREEMENT' | 'LEASE_RENEWAL' | 'RENT_INCREASE_NOTICE' | 'RECEIPT' | 'TAX_STATEMENT';
export type TemplateVariableType = 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'ENUM';

export interface TemplateVariable {
  id?: number;
  variableName: string;
  displayName: string;
  description?: string;
  dataType: TemplateVariableType;
  required: boolean;
  defaultValue?: string | null;
  validationPattern?: string | null;
  enumValues?: string | null;
  createdAt?: Date;
}

export interface DocumentTemplate {
  id: number;
  name: string;
  description?: string;
  documentType: DocumentType | string;
  countryCode?: string | null;
  templateVersion: number;
  status: DocumentStatus;
  content: string;
  language: DocumentLanguage | string;
  createdById?: number | null;
  createdByName?: string | null;
  createdAt: Date;
  updatedAt: Date;
  variables: TemplateVariable[];
  usageCount?: number;
}

export interface DocumentTemplateRequest {
  name: string;
  description?: string;
  documentType: DocumentType | string;
  countryCode?: string | null;
  content: string;
  language?: DocumentLanguage | string;
  variables?: Omit<TemplateVariable, 'id' | 'createdAt'>[];
}

export interface DocumentTemplateResponse extends DocumentTemplate {
  metadata?: Metadata;
}

export interface DocumentTemplateFilter {
  documentType?: string;
  countryCode?: string;
  language?: string;
  keyword?: string;
  status?: DocumentStatus;
}

export interface DocumentTemplatePreviewRequest {
  templateContent: string;
  variables: Record<string, unknown>;
}

export interface DocumentTemplatePreviewResponse {
  renderedContent: string;
  missingVariables: string[];
}

export const DocumentTypeLabels: Record<string, string> = {
  LEASE_AGREEMENT: 'Lease Agreement',
  LEASE_RENEWAL: 'Lease Renewal Letter',
  RENT_INCREASE_NOTICE: 'Rent Increase Notice',
  RECEIPT: 'Receipt',
  TAX_STATEMENT: 'Tax Statement'
};

export const DocumentLanguageLabels: Record<DocumentLanguage, string> = {
  EN: 'English',
  PT: 'Portuguese',
  ES: 'Spanish',
  FR: 'French'
};

