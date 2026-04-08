import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../../models/page.model';
import {
  BuildingIncident,
  BuildingIncidentRequest,
  IncidentStatus
} from '../../models/building/building-incident.model';

@Injectable({
  providedIn: 'root'
})
export class BuildingIncidentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/api/buildings`;

  getIncidents(buildingId: number, page: number, size: number, status?: IncidentStatus): Observable<Page<BuildingIncident>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<Page<BuildingIncident>>(`${this.apiUrl}/${buildingId}/incidents`, { params }).pipe(
      tap((response) => {
        console.info('[BuildingIncidentService] Retrieved incidents:', response.content.length, 'for building:', buildingId);
      })
    );
  }

  createIncident(buildingId: number, payload: BuildingIncidentRequest): Observable<BuildingIncident> {
    return this.http.post<BuildingIncident>(`${this.apiUrl}/${buildingId}/incidents`, {
      ...payload,
      buildingId
    });
  }

  deleteIncident(buildingId: number, incidentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${buildingId}/incidents/${incidentId}`);
  }
}

