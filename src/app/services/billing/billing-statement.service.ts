/**
 * Service for managing billing statements
 * Statements aggregate charges for a tenant/unit in a billing period
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BillingStatementGenerateRequest,
  BillingStatementResponse,
  BillingStatementFilter,
  IssueStatementRequest,
  ExportStatementRequest,
  BulkStatementRequest,
  BatchProcessingResult,
  ReconciliationRequest,
  ReconciliationResult,
  BillingPage
} from '../../models/billing';

@Injectable({
  providedIn: 'root'
})
export class BillingStatementService {
  private readonly apiUrl = '/api/billing/statements';

  constructor(private http: HttpClient) {}

  /**
   * Generate a new billing statement for a tenant in a period
   */
  generate(request: BillingStatementGenerateRequest): Observable<BillingStatementResponse> {
    return this.http.post<BillingStatementResponse>(`${this.apiUrl}/generate`, request);
  }

  /**
   * Get all billing statements with optional filtering
   */
  list(filter?: BillingStatementFilter): Observable<BillingPage<BillingStatementResponse>> {
    let params = new HttpParams();
    if (filter) {
      if (filter.propertyId) params = params.set('propertyId', filter.propertyId.toString());
      if (filter.tenantUserId) params = params.set('tenantUserId', filter.tenantUserId.toString());
      if (filter.statementStatus) params = params.set('statementStatus', filter.statementStatus);
      if (filter.year) params = params.set('year', filter.year.toString());
      if (filter.month) params = params.set('month', filter.month.toString());
      if (filter.startPeriod) params = params.set('startPeriod', filter.startPeriod);
      if (filter.endPeriod) params = params.set('endPeriod', filter.endPeriod);
      if (filter.page !== undefined) params = params.set('page', filter.page.toString());
      if (filter.size !== undefined) params = params.set('size', filter.size.toString());
    }
    return this.http.get<BillingPage<BillingStatementResponse>>(this.apiUrl, { params });
  }

  /**
   * Get statements by property
   */
  getByProperty(propertyId: number): Observable<BillingPage<BillingStatementResponse>> {
    const params = new HttpParams().set('propertyId', propertyId.toString());
    return this.http.get<BillingPage<BillingStatementResponse>>(this.apiUrl, { params });
  }

  /**
   * Get a specific statement by ID
   */
  getById(id: number): Observable<BillingStatementResponse> {
    return this.http.get<BillingStatementResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Issue a statement (make it official and due)
   */
  issue(request: IssueStatementRequest): Observable<BillingStatementResponse> {
    return this.http.post<BillingStatementResponse>(`${this.apiUrl}/${request.statementId}/issue`, {});
  }

  /**
   * Export a statement (PDF, Excel, etc.)
   */
  export(request: ExportStatementRequest): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${request.statementId}/pdf`, {
      responseType: 'blob'
    });
  }

  /**
   * Generate statements in bulk
   */
  generateBulk(request: BulkStatementRequest): Observable<BatchProcessingResult> {
    return this.http.post<BatchProcessingResult>(`${this.apiUrl}/generate/bulk`, request);
  }

  /**
   * Reconcile statements for a property and period
   */
  reconcile(request: ReconciliationRequest): Observable<ReconciliationResult> {
    return this.http.post<ReconciliationResult>(`${this.apiUrl}/reconcile`, request);
  }
}


