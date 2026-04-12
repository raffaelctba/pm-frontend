import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Lease, LeaseRequest } from '../models/lease.model';

@Injectable({
  providedIn: 'root'
})
export class LeaseService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/leases`;

  constructor(private http: HttpClient) {}

  getByUnit(unitId: number, date?: string): Observable<Lease[]> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }
    return this.http.get<Lease[]>(`${this.apiUrl}/units/${unitId}`, { params });
  }

  getHistoryByUnit(unitId: number): Observable<Lease[]> {
    return this.http.get<Lease[]>(`${this.apiUrl}/units/${unitId}/history`);
  }

  getById(id: number): Observable<Lease> {
    return this.http.get<Lease>(`${this.apiUrl}/${id}`);
  }

  createOrUpdate(payload: LeaseRequest): Observable<Lease> {
    return this.http.post<Lease>(this.apiUrl, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}


