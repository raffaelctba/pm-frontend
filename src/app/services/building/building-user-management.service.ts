import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BuildingUser,
  UnitRoleAssignmentRequest,
  UnitUser,
  UnitUserAssignmentRequest
} from '../../models/building-user.model';

@Injectable({ providedIn: 'root' })
export class BuildingUserManagementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/api/buildings`;

  listBuildingUsers(buildingId: number): Observable<BuildingUser[]> {
    return this.http.get<BuildingUser[]>(`${this.apiUrl}/${buildingId}/users`);
  }

  listUnitUsers(buildingId: number, unitId: number): Observable<UnitUser[]> {
    return this.http.get<UnitUser[]>(`${this.apiUrl}/${buildingId}/units/${unitId}/users`);
  }

  addTenant(buildingId: number, unitId: number, payload: UnitUserAssignmentRequest): Observable<UnitUser> {
    return this.http.post<UnitUser>(
      `${this.apiUrl}/${buildingId}/units/${unitId}/tenant/add`,
      payload
    );
  }

  removeTenant(
    buildingId: number,
    unitId: number,
    payload: UnitUserAssignmentRequest
  ): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/${buildingId}/units/${unitId}/tenant/remove`,
      payload
    );
  }

  addOwner(buildingId: number, unitId: number, payload: UnitUserAssignmentRequest): Observable<UnitUser> {
    return this.http.post<UnitUser>(
      `${this.apiUrl}/${buildingId}/units/${unitId}/owner/add`,
      payload
    );
  }

  removeOwner(
    buildingId: number,
    unitId: number,
    payload: UnitUserAssignmentRequest,
    allowPrimaryRemoval = false
  ): Observable<void> {
    const params = new HttpParams().set('allowPrimaryRemoval', String(allowPrimaryRemoval));
    return this.http.post<void>(
      `${this.apiUrl}/${buildingId}/units/${unitId}/owner/remove`,
      payload,
      { params }
    );
  }

  assignRole(
    buildingId: number,
    unitId: number,
    payload: UnitRoleAssignmentRequest
  ): Observable<UnitUser> {
    return this.http.post<UnitUser>(
      `${this.apiUrl}/${buildingId}/units/${unitId}/role/assign`,
      payload
    );
  }
}
