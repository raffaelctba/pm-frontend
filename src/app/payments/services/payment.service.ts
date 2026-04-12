import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProcessInvoicePaymentRequest, ProcessInvoicePaymentResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiBaseUrl}/api/payments`;

  constructor(private http: HttpClient) {}

  processInvoicePayment(invoiceId: number, request: ProcessInvoicePaymentRequest): Observable<ProcessInvoicePaymentResponse> {
    return this.http.post<ProcessInvoicePaymentResponse>(`${this.apiUrl}/invoices/${invoiceId}/process`, request);
  }
}

