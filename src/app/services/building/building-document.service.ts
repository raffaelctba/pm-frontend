import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../../models/page.model';
import {
  BuildingDocument,
  BuildingDocumentRequest,
  BuildingDocumentType
} from '../../models/building/building-document.model';

@Injectable({
  providedIn: 'root'
})
export class BuildingDocumentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/api/buildings`;

  getDocuments(buildingId: number, page: number, size: number, type?: BuildingDocumentType): Observable<Page<BuildingDocument>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (type) {
      params = params.set('type', type);
    }

    return this.http.get<Page<BuildingDocument>>(`${this.apiUrl}/${buildingId}/documents`, { params }).pipe(
      tap((response) => {
        console.info('[BuildingDocumentService] Retrieved documents:', response.content.length, 'for building:', buildingId);
      })
    );
  }

  createDocument(buildingId: number, payload: BuildingDocumentRequest): Observable<BuildingDocument> {
    return this.http.post<BuildingDocument>(`${this.apiUrl}/${buildingId}/documents`, payload);
  }

  deleteDocument(buildingId: number, documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${buildingId}/documents/${documentId}`);
  }
}

