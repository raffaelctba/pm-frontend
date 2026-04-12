import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SmtpEmailConfig,
  EmailNotificationPreferences,
  EmailTemplate,
  SendDocumentEmailRequest
} from '../models/email-config.model';

@Injectable({
  providedIn: 'root'
})
export class EmailConfigService {
  private apiUrl = '/api/email';

  constructor(private http: HttpClient) { }

  /**
   * Get SMTP email configuration
   */
  getSmtpConfig(): Observable<SmtpEmailConfig> {
    return this.http.get<SmtpEmailConfig>(`${this.apiUrl}/config`);
  }

  /**
   * Update SMTP email configuration
   * Note: Password should never be exposed to frontend
   */
  updateSmtpConfig(config: SmtpEmailConfig): Observable<SmtpEmailConfig> {
    return this.http.put<SmtpEmailConfig>(`${this.apiUrl}/config`, config);
  }

  /**
   * Test SMTP configuration by sending a test email
   */
  testSmtpConfiguration(testEmail: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/config/test`, { testEmail });
  }

  /**
   * Get email notification preferences for a property
   */
  getNotificationPreferences(propertyId: number): Observable<EmailNotificationPreferences> {
    return this.http.get<EmailNotificationPreferences>(
      `${this.apiUrl}/preferences/property/${propertyId}`
    );
  }

  /**
   * Update email notification preferences for a property
   */
  updateNotificationPreferences(propertyId: number, preferences: EmailNotificationPreferences): Observable<EmailNotificationPreferences> {
    return this.http.put<EmailNotificationPreferences>(
      `${this.apiUrl}/preferences/property/${propertyId}`,
      preferences
    );
  }

  /**
   * Get all available email templates
   */
  getEmailTemplates(): Observable<EmailTemplate[]> {
    return this.http.get<EmailTemplate[]>(`${this.apiUrl}/templates`);
  }

  /**
   * Get email template by name
   */
  getEmailTemplate(templateName: string): Observable<EmailTemplate> {
    return this.http.get<EmailTemplate>(`${this.apiUrl}/templates/${templateName}`);
  }

  /**
   * Create a new email template
   */
  createEmailTemplate(template: EmailTemplate): Observable<EmailTemplate> {
    return this.http.post<EmailTemplate>(`${this.apiUrl}/templates`, template);
  }

  /**
   * Update an existing email template
   */
  updateEmailTemplate(templateId: number, template: EmailTemplate): Observable<EmailTemplate> {
    return this.http.put<EmailTemplate>(`${this.apiUrl}/templates/${templateId}`, template);
  }

  /**
   * Delete an email template
   */
  deleteEmailTemplate(templateId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/templates/${templateId}`);
  }

  /**
   * Get email templates by language
   */
  getEmailTemplatesByLanguage(language: string): Observable<EmailTemplate[]> {
    return this.http.get<EmailTemplate[]>(`${this.apiUrl}/templates/language/${language}`);
  }

  /**
   * Send a generated document via email
   */
  sendDocumentViaEmail(request: SendDocumentEmailRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/send-document`, request);
  }

  /**
   * Send batch emails for documents
   */
  sendDocumentsBatch(documentIds: number[], recipientEmails: string[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/send-documents-batch`, {
      documentIds,
      recipientEmails
    });
  }

  /**
   * Get email sending history
   */
  getEmailHistory(propertyId?: number, limit: number = 50): Observable<any[]> {
    const params: any = { limit };
    if (propertyId) {
      params.propertyId = propertyId;
    }
    return this.http.get<any[]>(`${this.apiUrl}/history`, { params });
  }

  /**
   * Get email sending statistics
   */
  getEmailStatistics(propertyId?: number): Observable<any> {
    const params: any = {};
    if (propertyId) {
      params.propertyId = propertyId;
    }
    return this.http.get<any>(`${this.apiUrl}/statistics`, { params });
  }

  /**
   * Resend an email
   */
  resendEmail(emailId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/resend/${emailId}`, {});
  }
}

