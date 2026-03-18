import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice, InvoiceDTO } from '../models/invoice.model';
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

  markAsPaid(id: number): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.apiUrl}/${id}/pay`, {});
  }
}
