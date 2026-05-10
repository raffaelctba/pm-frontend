import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Page } from '../models/page.model';
import {
  BuildingMaintenanceCreateRequest,
  MaintenanceRequest,
  PrivateUnitMaintenanceCreateRequest
} from '../models/maintenance.model';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/api/maintenance`;

  createBuildingMaintenance(
    buildingId: number,
    payload: BuildingMaintenanceCreateRequest
  ): Observable<MaintenanceRequest> {
    return this.http.post<MaintenanceRequest>(`${this.apiUrl}/building/${buildingId}`, payload);
  }

  listBuildingMaintenance(
    buildingId: number,
    page = 0,
    size = 20
  ): Observable<Page<MaintenanceRequest>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<MaintenanceRequest>>(`${this.apiUrl}/building/${buildingId}/list`, {
      params
    });
  }

  listBuildingMaintenanceForUnit(
    buildingId: number,
    unitId: number,
    page = 0,
    size = 20
  ): Observable<Page<MaintenanceRequest>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<MaintenanceRequest>>(`${this.apiUrl}/building/${buildingId}/unit/${unitId}`, {
      params
    });
  }

  createPrivateUnitMaintenance(
    unitId: number,
    payload: PrivateUnitMaintenanceCreateRequest
  ): Observable<MaintenanceRequest> {
    return this.http.post<MaintenanceRequest>(`${this.apiUrl}/unit/${unitId}/private`, payload);
  }

  listPrivateUnitMaintenance(
    unitId: number,
    page = 0,
    size = 20
  ): Observable<Page<MaintenanceRequest>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<MaintenanceRequest>>(`${this.apiUrl}/unit/${unitId}/private/list`, {
      params
    });
  }
}
