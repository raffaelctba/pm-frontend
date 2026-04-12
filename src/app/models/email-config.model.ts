export interface SmtpEmailConfig {
  id?: number;
  from: string;
  displayName?: string;
  host: string;
  port: number;
  useSSL: boolean;
  username?: string;
  password?: string; // Never exposed from backend
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmailNotificationPreferences {
  id?: number;
  propertyId: number;
  notifyOnDocumentGenerated: boolean;
  notifyOnPaymentReceived: boolean;
  notifyOnInvoiceOverdue: boolean;
  notifyOnMaintenanceRequest: boolean;
  notifyOnLeaseExpiration: boolean;
  notificationEmails: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmailTemplate {
  id?: number;
  templateName: string;
  subject: string;
  body: string;
  variables: string[];
  language: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SendDocumentEmailRequest {
  documentId: number;
  recipientEmail: string;
  subject?: string;
  message?: string;
  includeAttachment: boolean;
}

