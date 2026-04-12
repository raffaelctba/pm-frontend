import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GeneratedDocument, DocumentStatus, DocumentGenerationRequest, SendDocumentEmailRequest, Page } from '../models';

@Injectable({
  providedIn: 'root'
})
export class GeneratedDocumentService {
  private apiUrl = '/api/documents/generated';

  constructor(private http: HttpClient) { }

  generateDocument(request: DocumentGenerationRequest): Observable<GeneratedDocument> {
    return this.http.post<GeneratedDocument>(`${this.apiUrl}/generate`, request);
  }

  getDocument(id: number): Observable<GeneratedDocument> {
    return this.http.get<GeneratedDocument>(`${this.apiUrl}/${id}`);
  }

  getDocumentsByProperty(propertyId: number): Observable<GeneratedDocument[]> {
    return this.http.get<GeneratedDocument[]>(`${this.apiUrl}/property/${propertyId}`);
  }

  getDocumentsByPropertyPaginated(propertyId: number, page: number, size: number): Observable<Page<GeneratedDocument>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<GeneratedDocument>>(`${this.apiUrl}/property/${propertyId}/paginated`, { params });
  }

  getDocumentsByLease(leaseId: number): Observable<GeneratedDocument[]> {
    return this.http.get<GeneratedDocument[]>(`${this.apiUrl}/lease/${leaseId}`);
  }

  getDocumentsByStatus(status: DocumentStatus): Observable<GeneratedDocument[]> {
    return this.http.get<GeneratedDocument[]>(`${this.apiUrl}/status/${status}`);
  }

  getGeneratedDocuments(propertyId?: number): Observable<GeneratedDocument[]> {
    if (propertyId) {
      return this.getDocumentsByProperty(propertyId);
    }
    return this.http.get<GeneratedDocument[]>(`${this.apiUrl}`);
  }

  getSentDocuments(): Observable<GeneratedDocument[]> {
    return this.getDocumentsByStatus(DocumentStatus.SENT);
  }

  getSignedDocuments(): Observable<GeneratedDocument[]> {
    return this.getDocumentsByStatus(DocumentStatus.SIGNED);
  }

  markAsSent(id: number): Observable<GeneratedDocument> {
    return this.http.post<GeneratedDocument>(`${this.apiUrl}/${id}/mark-sent`, {});
  }

  markAsSigned(id: number): Observable<GeneratedDocument> {
    return this.http.post<GeneratedDocument>(`${this.apiUrl}/${id}/mark-signed`, {});
  }

  sendDocumentViaEmail(request: SendDocumentEmailRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${request.documentId}/send-email`, request);
  }

  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' });
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

