/**
 * Service for managing charge types
 * Charge types are templates for charges with predefined properties
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChargeTypeRequest, ChargeTypeResponse, ChargeCategory } from '../../models/billing';

@Injectable({
  providedIn: 'root'
})
export class ChargeTypeService {
  private readonly apiUrl = '/api/billing/charge-types';

  constructor(private http: HttpClient) {}

  /**
   * Get all charge types
   */
  listAll(): Observable<ChargeTypeResponse[]> {
    return this.http.get<ChargeTypeResponse[]>(this.apiUrl);
  }

  /**
   * Get charge types by category
   */
  listByCategory(category: ChargeCategory): Observable<ChargeTypeResponse[]> {
    const params = new HttpParams().set('category', category);
    return this.http.get<ChargeTypeResponse[]>(this.apiUrl, { params });
  }

  /**
   * Search charge types by name or description
   */

  /**
   * Get a specific charge type by ID
   */
  getById(id: number): Observable<ChargeTypeResponse> {
    return this.http.get<ChargeTypeResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new charge type
   */
  create(request: ChargeTypeRequest): Observable<ChargeTypeResponse> {
    return this.http.post<ChargeTypeResponse>(this.apiUrl, request);
  }

  /**
   * Update an existing charge type
   */
  update(id: number, request: ChargeTypeRequest): Observable<ChargeTypeResponse> {
    return this.http.put<ChargeTypeResponse>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Delete a charge type
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}


