import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../../models/page.model';
import {
  ComplianceItem,
  ComplianceItemRequest,
  ComplianceStatus
} from '../../models/building/compliance-item.model';

@Injectable({
  providedIn: 'root'
})
export class ComplianceItemService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/api/buildings`;

  getComplianceItems(buildingId: number, page: number, size: number, status?: ComplianceStatus): Observable<Page<ComplianceItem>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<Page<ComplianceItem>>(`${this.apiUrl}/${buildingId}/compliance-items`, { params }).pipe(
      tap((response) => {
        console.info('[ComplianceItemService] Retrieved compliance items:', response.content.length, 'for building:', buildingId);
      })
    );
  }

  createComplianceItem(buildingId: number, payload: ComplianceItemRequest): Observable<ComplianceItem> {
    return this.http.post<ComplianceItem>(`${this.apiUrl}/${buildingId}/compliance-items`, {
      ...payload,
      buildingId
    });
  }

  updateComplianceItem(buildingId: number, complianceItemId: number, payload: ComplianceItemRequest): Observable<ComplianceItem> {
    return this.http.put<ComplianceItem>(`${this.apiUrl}/${buildingId}/compliance-items/${complianceItemId}`, {
      ...payload,
      buildingId
    });
  }

  deleteComplianceItem(buildingId: number, complianceItemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${buildingId}/compliance-items/${complianceItemId}`);
  }
}

