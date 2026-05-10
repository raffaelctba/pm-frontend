import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../../models/page.model';
import {
  BuildingUnit,
  BuildingUnitDetails,
  BuildingUnitRequest,
  UnitAssigneeOptions,
  UnitVisibilityOptions
} from '../../models/building/building-unit.model';

@Injectable({
  providedIn: 'root'
})
export class BuildingUnitService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/api/buildings`;

  getUnits(buildingId: number, page: number, size: number): Observable<Page<BuildingUnit>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<Page<BuildingUnit>>(`${this.apiUrl}/${buildingId}/units`, { params }).pipe(
      tap((response) => {
        console.info('[BuildingUnitService] Retrieved units:', response.content.length, 'for building:', buildingId);
      })
    );
  }

  getUnit(buildingId: number, unitId: number, options?: UnitVisibilityOptions): Observable<BuildingUnit> {
    return this.http.get<BuildingUnit>(`${this.apiUrl}/${buildingId}/units/${unitId}`, {
      params: this.buildVisibilityParams(options)
    });
  }

  getUnitDetails(buildingId: number, unitId: number, options?: UnitVisibilityOptions): Observable<BuildingUnitDetails> {
    return this.http.get<BuildingUnitDetails>(`${this.apiUrl}/${buildingId}/units/${unitId}/details`, {
      params: this.buildVisibilityParams(options)
    });
  }

  createUnit(buildingId: number, payload: BuildingUnitRequest): Observable<BuildingUnit> {
    return this.http.post<BuildingUnit>(`${this.apiUrl}/${buildingId}/units`, payload);
  }

  updateUnit(buildingId: number, unitId: number, payload: BuildingUnitRequest): Observable<BuildingUnit> {
    return this.http.put<BuildingUnit>(`${this.apiUrl}/${buildingId}/units/${unitId}`, payload);
  }

  deleteUnit(buildingId: number, unitId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${buildingId}/units/${unitId}`);
  }

  getAssignableUsers(buildingId: number): Observable<UnitAssigneeOptions> {
    return this.http.get<UnitAssigneeOptions>(`${this.apiUrl}/${buildingId}/assignable-users`);
  }

  private buildVisibilityParams(options?: UnitVisibilityOptions): HttpParams | undefined {
    if (!options || options.elevatedVisibility === undefined) {
      return undefined;
    }

    return new HttpParams().set('elevatedVisibility', String(options.elevatedVisibility));
  }
}


