import { Injectable, Signal, signal } from '@angular/core';
import { GeneratedDocumentService } from './generated-document.service';
import { EmailConfigService } from './email-config.service';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap, tap, catchError, finalize, map } from 'rxjs/operators';
import { GeneratedDocument, DocumentStatus, DocumentStatusLabels, SendDocumentEmailRequest, Page } from '../models';

type DocumentPageResult = GeneratedDocument[] | Page<GeneratedDocument>;

@Injectable({
  providedIn: 'root'
})
export class DocumentManagementService {
  private isLoading = signal(false);
  private error = signal<string | null>(null);

  constructor(
    private generatedDocumentService: GeneratedDocumentService,
    private emailConfigService: EmailConfigService
  ) { }

  /**
   * Get loading state
   */
  getLoadingState(): Signal<boolean> {
    return this.isLoading;
  }

  /**
   * Get error state
   */
  getErrorState(): Signal<string | null> {
    return this.error;
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.error.set(null);
  }

  /**
   * Get all documents for a property with status filtering
   */
  getPropertyDocuments(
    propertyId: number,
    statusFilter?: DocumentStatus,
    page: number = 0,
    size: number = 20
  ): Observable<GeneratedDocument[]> {
    this.isLoading.set(true);
    this.error.set(null);

    let request$: Observable<DocumentPageResult>;

    if (page !== 0 || size !== 20) {
      request$ = this.generatedDocumentService.getDocumentsByPropertyPaginated(
        propertyId,
        page,
        size
      );
    } else {
      request$ = this.generatedDocumentService.getDocumentsByProperty(propertyId);
    }

    return request$.pipe(
      map((result) => Array.isArray(result) ? result : result.content),
      map((documents) => statusFilter ? documents.filter(doc => doc.status === statusFilter) : documents),
      finalize(() => this.isLoading.set(false)),
      catchError((err) => {
        this.error.set('Failed to fetch documents');
        throw err;
      })
    );
  }

  /**
   * Get documents by status across all properties
   */
  getDocumentsByStatus(status: DocumentStatus): Observable<GeneratedDocument[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.generatedDocumentService.getDocumentsByStatus(status).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError((err) => {
        this.error.set(`Failed to fetch ${status} documents`);
        throw err;
      })
    );
  }

  /**
   * Get pending documents (GENERATED or SENT but not SIGNED)
   */
  getPendingDocuments(): Observable<GeneratedDocument[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return forkJoin([
      this.generatedDocumentService.getDocumentsByStatus(DocumentStatus.GENERATED).pipe(catchError(() => of([]))),
      this.generatedDocumentService.getDocumentsByStatus(DocumentStatus.SENT).pipe(catchError(() => of([])))
    ]).pipe(
      switchMap(([generated, sent]) => {
        return of([...generated, ...sent]);
      }),
      finalize(() => this.isLoading.set(false)),
      catchError((err) => {
        this.error.set('Failed to fetch pending documents');
        throw err;
      })
    );
  }

  /**
   * Send a document via email
   */
  sendDocumentViaEmail(
    documentId: number,
    recipientEmail: string,
    subject?: string,
    message?: string,
    includeAttachment: boolean = true
  ): Observable<any> {
    this.isLoading.set(true);
    this.error.set(null);

    const request: SendDocumentEmailRequest = {
      documentId,
      recipientEmail,
      subject,
      message,
      includeAttachment
    };

    return this.emailConfigService.sendDocumentViaEmail(request).pipe(
      switchMap((response) => this.generatedDocumentService.markAsSent(documentId).pipe(map(() => response))),
      finalize(() => this.isLoading.set(false)),
      catchError((err) => {
        this.error.set('Failed to send document via email');
        throw err;
      })
    );
  }

  /**
   * Send multiple documents via email (batch operation)
   */
  sendDocumentsBatch(documentIds: number[], recipientEmails: string[]): Observable<any> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.emailConfigService.sendDocumentsBatch(documentIds, recipientEmails).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError((err) => {
        this.error.set('Failed to send documents batch');
        throw err;
      })
    );
  }

  /**
   * Mark document as sent
   */
  markDocumentAsSent(documentId: number): Observable<GeneratedDocument> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.generatedDocumentService.markAsSent(documentId).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError((err) => {
        this.error.set('Failed to mark document as sent');
        throw err;
      })
    );
  }

  /**
   * Mark document as signed
   */
  markDocumentAsSigned(documentId: number): Observable<GeneratedDocument> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.generatedDocumentService.markAsSigned(documentId).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError((err) => {
        this.error.set('Failed to mark document as signed');
        throw err;
      })
    );
  }

  /**
   * Download a document
   */
  downloadDocument(documentId: number, fileName: string): Observable<Blob> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.generatedDocumentService.downloadDocument(documentId).pipe(
      tap((blob) => {
        // Trigger browser download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      }),
      finalize(() => this.isLoading.set(false)),
      catchError((err) => {
        this.error.set('Failed to download document');
        throw err;
      })
    );
  }

  /**
   * Delete a document
   */
  deleteDocument(documentId: number): Observable<void> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.generatedDocumentService.deleteDocument(documentId).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError((err) => {
        this.error.set('Failed to delete document');
        throw err;
      })
    );
  }

  /**
   * Get document status label
   */
  getStatusLabel(status: DocumentStatus): string {
    return DocumentStatusLabels[status] || status;
  }

  /**
   * Get document status color for UI
   */
  getStatusColor(status: DocumentStatus): string {
    const colors: Record<DocumentStatus, string> = {
      [DocumentStatus.DRAFT]: '#FFA500',       // Orange
      [DocumentStatus.PUBLISHED]: '#4CAF50',   // Green
      [DocumentStatus.ARCHIVED]: '#9E9E9E',    // Gray
      [DocumentStatus.GENERATED]: '#2196F3',   // Blue
      [DocumentStatus.SENT]: '#FF9800',        // Amber
      [DocumentStatus.SIGNED]: '#8BC34A',      // Light Green
      [DocumentStatus.EXPIRED]: '#F44336'      // Red
    };
    return colors[status] || '#757575';
  }

  /**
   * Check if document can be sent
   */
  canSendDocument(document: GeneratedDocument): boolean {
    return document.status === DocumentStatus.GENERATED || document.status === DocumentStatus.SENT;
  }

  /**
   * Check if document can be signed
   */
  canSignDocument(document: GeneratedDocument): boolean {
    return document.status === DocumentStatus.SENT || document.status === DocumentStatus.GENERATED;
  }

  /**
   * Check if document can be deleted
   */
  canDeleteDocument(document: GeneratedDocument): boolean {
    return document.status !== DocumentStatus.SIGNED && document.status !== DocumentStatus.EXPIRED;
  }
}

