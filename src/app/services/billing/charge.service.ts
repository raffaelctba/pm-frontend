/**
 * Service for managing individual charges
 * Charges are specific billings applied to tenants/units
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ChargeRequest,
  ChargeApprovalRequest,
  ChargeResponse,
  ChargeFilter,
  BulkChargeRequest,
  BillingPage
} from '../../models/billing';

@Injectable({
  providedIn: 'root'
})
export class ChargeService {
  private readonly apiUrl = '/api/billing/charges';

  constructor(private http: HttpClient) {}

  /**
   * Get all charges with optional filtering and pagination
   */
  list(filter?: ChargeFilter): Observable<BillingPage<ChargeResponse>> {
    let params = new HttpParams();
    if (filter) {
      if (filter.propertyId) params = params.set('propertyId', filter.propertyId.toString());
      if (filter.tenantUserId) params = params.set('tenantUserId', filter.tenantUserId.toString());
      if (filter.chargeTypeId) params = params.set('chargeTypeId', filter.chargeTypeId.toString());
      if (filter.chargeStatus) params = params.set('chargeStatus', filter.chargeStatus);
      if (filter.approvalStatus) params = params.set('approvalStatus', filter.approvalStatus);
      if (filter.startDate) params = params.set('startDate', filter.startDate.toISOString());
      if (filter.endDate) params = params.set('endDate', filter.endDate.toISOString());
      if (filter.page !== undefined) params = params.set('page', filter.page.toString());
      if (filter.size !== undefined) params = params.set('size', filter.size.toString());
    }
    return this.http.get<BillingPage<ChargeResponse>>(this.apiUrl, { params });
  }

  /**
   * Get charges by property
   */
  getByProperty(propertyId: number): Observable<BillingPage<ChargeResponse>> {
    const params = new HttpParams().set('propertyId', propertyId.toString());
    return this.http.get<BillingPage<ChargeResponse>>(this.apiUrl, { params });
  }

  /**
   * Get a specific charge by ID
   */
  getById(id: number): Observable<ChargeResponse> {
    return this.http.get<ChargeResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new charge
   */
  create(request: ChargeRequest): Observable<ChargeResponse> {
    return this.http.post<ChargeResponse>(this.apiUrl, request);
  }

  /**
   * Update an existing charge
   */
  update(id: number, request: ChargeRequest): Observable<ChargeResponse> {
    return this.http.put<ChargeResponse>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Delete a charge
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Approve a charge
   */
  approve(id: number, request: ChargeApprovalRequest): Observable<ChargeResponse> {
    return this.http.post<ChargeResponse>(`${this.apiUrl}/${id}/approve`, request);
  }

  /**
   * Reject a charge
   */
  reject(id: number, request: ChargeApprovalRequest): Observable<ChargeResponse> {
    return this.http.post<ChargeResponse>(`${this.apiUrl}/${id}/reject`, request);
  }

  /**
   * Create multiple charges for multiple tenants
   */
  createBulk(request: BulkChargeRequest): Observable<ChargeResponse[]> {
    return this.http.post<ChargeResponse[]>(`${this.apiUrl}/bulk`, request);
  }

  /**
   * Get pending approvals for a property
   */
  getPendingApprovals(propertyId: number): Observable<BillingPage<ChargeResponse>> {
    const params = new HttpParams().set('propertyId', propertyId.toString());
    return this.http.get<BillingPage<ChargeResponse>>('/api/admin/charges/approvals', { params });
  }
}



