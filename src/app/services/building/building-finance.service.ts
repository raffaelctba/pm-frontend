import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../../models/page.model';
import {
  BuildingBulkInvoiceGenerationRequest,
  BuildingBulkInvoicePreviewResult,
  BuildingBulkInvoiceGenerationResult,
  BuildingFinanceInvoice,
  BuildingFinanceInvoiceRequest,
  BuildingFinanceSummary,
  InvoiceStatus
} from '../../models/building/building-finance.model';

@Injectable({
  providedIn: 'root'
})
export class BuildingFinanceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/api/buildings`;

  getInvoices(buildingId: number, page: number, size: number, status?: InvoiceStatus): Observable<Page<BuildingFinanceInvoice>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<Page<BuildingFinanceInvoice>>(`${this.apiUrl}/${buildingId}/finances/invoices`, { params }).pipe(
      tap((response) => {
        console.info('[BuildingFinanceService] Retrieved invoices:', response.content.length, 'for building:', buildingId);
      })
    );
  }

  getSummary(buildingId: number): Observable<BuildingFinanceSummary> {
    return this.http.get<BuildingFinanceSummary>(`${this.apiUrl}/${buildingId}/finances/summary`);
  }

  createInvoice(buildingId: number, payload: BuildingFinanceInvoiceRequest): Observable<BuildingFinanceInvoice> {
    return this.http.post<BuildingFinanceInvoice>(`${this.apiUrl}/${buildingId}/finances/invoices`, {
      ...payload,
      buildingId
    });
  }

  generateInvoicesForAllUnits(buildingId: number, payload: BuildingBulkInvoiceGenerationRequest): Observable<BuildingBulkInvoiceGenerationResult> {
    return this.http.post<BuildingBulkInvoiceGenerationResult>(`${this.apiUrl}/${buildingId}/finances/invoices/generate`, payload);
  }

  previewInvoicesForAllUnits(buildingId: number, payload: BuildingBulkInvoiceGenerationRequest): Observable<BuildingBulkInvoicePreviewResult> {
    return this.http.post<BuildingBulkInvoicePreviewResult>(`${this.apiUrl}/${buildingId}/finances/invoices/preview`, payload);
  }

  markAsPaid(buildingId: number, invoiceId: number): Observable<BuildingFinanceInvoice> {
    return this.http.patch<BuildingFinanceInvoice>(`${this.apiUrl}/${buildingId}/finances/invoices/${invoiceId}/pay`, {});
  }
}

