import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AmenityMaintenanceBlock } from '../models/amenity.model';

@Injectable({
  providedIn: 'root'
})
export class AmenityMaintenanceBlockService {
  private readonly apiUrl = '/api/amenities';

  constructor(private readonly http: HttpClient) {}

  getByAmenity(amenityId: number): Observable<AmenityMaintenanceBlock[]> {
    return this.http.get<AmenityMaintenanceBlock[]>(`${this.apiUrl}/${amenityId}/maintenance-blocks`);
  }

  create(amenityId: number, block: AmenityMaintenanceBlock): Observable<AmenityMaintenanceBlock> {
    return this.http.post<AmenityMaintenanceBlock>(`${this.apiUrl}/${amenityId}/maintenance-blocks`, block);
  }

  delete(amenityId: number, blockId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${amenityId}/maintenance-blocks/${blockId}`);
  }
}

