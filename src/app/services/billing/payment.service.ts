/**
 * Service for managing payments and payment allocations
 * Payments are recorded tenant/payer contributions towards charges
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PaymentRecordRequest,
  PaymentResponse,
  PaymentAllocationRequest,
  PaymentFilter,
  BillingPage
} from '../../models/billing';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly apiUrl = '/api/payments';

  constructor(private http: HttpClient) {}

  /**
   * Record a new payment
   */
  recordPayment(request: PaymentRecordRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(this.apiUrl, request);
  }

  /**
   * Get all payments with optional filtering
   */
  list(filter?: PaymentFilter): Observable<BillingPage<PaymentResponse>> {
    let params = new HttpParams();
    if (filter) {
      if (filter.propertyId) params = params.set('propertyId', filter.propertyId.toString());
      if (filter.tenantUserId) params = params.set('tenantUserId', filter.tenantUserId.toString());
      if (filter.paymentStatus) params = params.set('paymentStatus', filter.paymentStatus);
      if (filter.paymentMethod) params = params.set('paymentMethod', filter.paymentMethod);
      if (filter.startDate) params = params.set('startDate', filter.startDate.toISOString());
      if (filter.endDate) params = params.set('endDate', filter.endDate.toISOString());
      if (filter.page !== undefined) params = params.set('page', filter.page.toString());
      if (filter.size !== undefined) params = params.set('size', filter.size.toString());
    }
    return this.http.get<BillingPage<PaymentResponse>>(this.apiUrl, { params });
  }

  /**
   * Get payments by property
   */
  getByProperty(propertyId: number): Observable<BillingPage<PaymentResponse>> {
    const params = new HttpParams().set('propertyId', propertyId.toString());
    return this.http.get<BillingPage<PaymentResponse>>(this.apiUrl, { params });
  }

  /**
   * Get a specific payment by ID
   */
  getById(id: number): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Allocate a payment to charges/statements
   */
  allocatePayment(request: PaymentAllocationRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/${request.paymentId}/allocate`, request);
  }

  /**
   * Get allocation details for a payment
   */
  reversePayment(paymentId: number): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/${paymentId}/reverse`, {});
  }
}


