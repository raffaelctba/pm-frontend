import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Amenity, AmenityAvailability } from '../models/amenity.model';
import { Page } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class AmenityService {
  private readonly apiUrl = '/api/properties';

  constructor(private http: HttpClient) {}

  /**
   * Get all amenities for a property with pagination
   */
  getAmenitiesByProperty(propertyId: number, page: number = 0, size: number = 20): Observable<Page<Amenity>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Amenity>>(
      `${this.apiUrl}/${propertyId}/amenities`,
      { params }
    );
  }

  /**
   * Get all active amenities for a property
   */
  getActiveAmenities(propertyId: number): Observable<Amenity[]> {
    return this.http.get<Amenity[]>(
      `${this.apiUrl}/${propertyId}/amenities/active`
    );
  }

  /**
   * Get a specific amenity
   */
  getAmenity(propertyId: number, amenityId: number): Observable<Amenity> {
    return this.http.get<Amenity>(
      `${this.apiUrl}/${propertyId}/amenities/${amenityId}`
    );
  }

  /**
   * Create a new amenity
   */
  createAmenity(propertyId: number, amenity: Amenity): Observable<Amenity> {
    return this.http.post<Amenity>(
      `${this.apiUrl}/${propertyId}/amenities`,
      amenity
    );
  }

  /**
   * Update an amenity
   */
  updateAmenity(propertyId: number, amenityId: number, amenity: Amenity): Observable<Amenity> {
    return this.http.put<Amenity>(
      `${this.apiUrl}/${propertyId}/amenities/${amenityId}`,
      amenity
    );
  }

  /**
   * Delete an amenity
   */
  deleteAmenity(propertyId: number, amenityId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${propertyId}/amenities/${amenityId}`
    );
  }

  /**
   * Activate an amenity
   */
  activateAmenity(propertyId: number, amenityId: number): Observable<Amenity> {
    return this.http.post<Amenity>(
      `${this.apiUrl}/${propertyId}/amenities/${amenityId}/activate`,
      {}
    );
  }

  /**
   * Deactivate an amenity
   */
  deactivateAmenity(propertyId: number, amenityId: number): Observable<Amenity> {
    return this.http.post<Amenity>(
      `${this.apiUrl}/${propertyId}/amenities/${amenityId}/deactivate`,
      {}
    );
  }

  /**
   * Search amenities by name
   */
  searchAmenities(propertyId: number, name: string): Observable<Amenity[]> {
    const params = new HttpParams().set('name', name);

    return this.http.get<Amenity[]>(
      `${this.apiUrl}/${propertyId}/amenities/search`,
      { params }
    );
  }

  /**
   * Check amenity availability for a time slot
   */
  checkAvailability(propertyId: number, amenityId: number, startTime: string, endTime: string): Observable<AmenityAvailability> {
    const params = new HttpParams()
      .set('startTime', startTime)
      .set('endTime', endTime);

    return this.http.get<AmenityAvailability>(
      `${this.apiUrl}/${propertyId}/amenities/${amenityId}/availability`,
      { params }
    );
  }

  getAmenitiesAnalytics(propertyId: number): Observable<{
    propertyId: number;
    totalReservations: number;
    pendingReservations: number;
    confirmedReservations: number;
    cancelledReservations: number;
    completedReservations: number;
  }> {
    return this.http.get<{
      propertyId: number;
      totalReservations: number;
      pendingReservations: number;
      confirmedReservations: number;
      cancelledReservations: number;
      completedReservations: number;
    }>(`${this.apiUrl}/${propertyId}/amenities/analytics`);
  }
}
