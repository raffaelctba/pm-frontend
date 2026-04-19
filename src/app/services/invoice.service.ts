import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice, InvoiceDTO } from '../models/invoice.model';
import { InvoiceAuditLog, InvoiceAdjustmentDTO, InvoiceVoidReissueDTO, InvoiceVoidReissueResultDTO } from '../models/invoice-audit.model';
import {
  InvoiceLineItem,
  InvoiceLineItemDTO,
  InvoiceDelivery,
  SendInvoiceDTO,
  PaymentReversal,
  PaymentReversalDTO,
  VoidInvoiceDTO
} from '../models/invoice-lifecycle.model';
import { Page } from '../models/page.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = `${environment.apiBaseUrl}/api/invoices`;

  constructor(private http: HttpClient) {}

  getAllInvoices(page: number = 0, size: number = 10): Observable<Page<Invoice>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Invoice>>(this.apiUrl, { params });
  }

  getInvoiceById(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  getInvoicesByProperty(propertyId: number, page: number = 0, size: number = 10): Observable<Page<Invoice>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Invoice>>(`${this.apiUrl}/property/${propertyId}`, { params });
  }

  getInvoicesByUser(userId: number, page: number = 0, size: number = 10): Observable<Page<Invoice>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Invoice>>(`${this.apiUrl}/user/${userId}`, { params });
  }

  createInvoice(invoice: InvoiceDTO): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, invoice);
  }

  createDraftInvoice(invoice: InvoiceDTO): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/draft`, invoice);
  }

  updateDraftInvoice(id: number, invoice: InvoiceDTO): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}`, invoice);
  }

  finalizeDraftInvoice(id: number): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/${id}/finalize`, {});
  }

  markAsPaid(id: number): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.apiUrl}/${id}/pay`, {});
  }

  createCreditNote(id: number, adjustment: InvoiceAdjustmentDTO): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/${id}/credit-note`, adjustment);
  }

  createDebitNote(id: number, adjustment: InvoiceAdjustmentDTO): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/${id}/debit-note`, adjustment);
  }

  voidAndReissue(id: number, request: InvoiceVoidReissueDTO): Observable<InvoiceVoidReissueResultDTO> {
    return this.http.post<InvoiceVoidReissueResultDTO>(`${this.apiUrl}/${id}/void-reissue`, request);
  }

  getAuditTrail(id: number): Observable<InvoiceAuditLog[]> {
    return this.http.get<InvoiceAuditLog[]>(`${this.apiUrl}/${id}/audit`);
  }

  addLineItem(invoiceId: number, itemDto: InvoiceLineItemDTO): Observable<InvoiceLineItem> {
    return this.http.post<InvoiceLineItem>(`${this.apiUrl}/${invoiceId}/line-items`, itemDto);
  }

  updateLineItem(invoiceId: number, itemId: number, itemDto: InvoiceLineItemDTO): Observable<InvoiceLineItem> {
    return this.http.put<InvoiceLineItem>(`${this.apiUrl}/${invoiceId}/line-items/${itemId}`, itemDto);
  }

  deleteLineItem(invoiceId: number, itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${invoiceId}/line-items/${itemId}`);
  }

  getLineItems(invoiceId: number): Observable<InvoiceLineItem[]> {
    return this.http.get<InvoiceLineItem[]>(`${this.apiUrl}/${invoiceId}/line-items`);
  }

  sendInvoice(invoiceId: number, sendDto: SendInvoiceDTO): Observable<InvoiceDelivery> {
    return this.http.post<InvoiceDelivery>(`${this.apiUrl}/${invoiceId}/send`, sendDto);
  }

  getDeliveryHistory(invoiceId: number): Observable<InvoiceDelivery[]> {
    return this.http.get<InvoiceDelivery[]>(`${this.apiUrl}/${invoiceId}/deliveries`);
  }

  markDeliveryAsViewed(invoiceId: number, deliveryId: number): Observable<InvoiceDelivery> {
    return this.http.put<InvoiceDelivery>(`${this.apiUrl}/${invoiceId}/deliveries/${deliveryId}/viewed`, {});
  }

  reversePayment(invoiceId: number, reversalDto: PaymentReversalDTO): Observable<PaymentReversal> {
    return this.http.post<PaymentReversal>(`${this.apiUrl}/${invoiceId}/reverse-payment`, reversalDto);
  }

  getPaymentReversals(invoiceId: number): Observable<PaymentReversal[]> {
    return this.http.get<PaymentReversal[]>(`${this.apiUrl}/${invoiceId}/reversals`);
  }

  voidInvoice(invoiceId: number, voidDto: VoidInvoiceDTO): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/${invoiceId}/void`, voidDto);
  }

  deleteDraftInvoice(invoiceId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${invoiceId}`);
  }
}
