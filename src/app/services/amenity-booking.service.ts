import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AmenityBooking, BookingStatus } from '../models/amenity.model';
import { Page } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class AmenityBookingService {
  private readonly apiUrl = '/api/amenities';

  constructor(private http: HttpClient) {}

  /**
   * Get all bookings for an amenity with pagination
   */
  getAmenityBookings(amenityId: number, page: number = 0, size: number = 20): Observable<Page<AmenityBooking>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<AmenityBooking>>(
      `${this.apiUrl}/${amenityId}/bookings`,
      { params }
    );
  }

  /**
   * Get a specific booking
   */
  getBooking(amenityId: number, bookingId: number): Observable<AmenityBooking> {
    return this.http.get<AmenityBooking>(
      `${this.apiUrl}/${amenityId}/bookings/${bookingId}`
    );
  }

  /**
   * Create a new amenity booking
   */
  createBooking(amenityId: number, booking: AmenityBooking): Observable<AmenityBooking> {
    return this.http.post<AmenityBooking>(
      `${this.apiUrl}/${amenityId}/bookings`,
      booking
    );
  }

  /**
   * Update a booking
   */
  updateBooking(amenityId: number, bookingId: number, booking: AmenityBooking): Observable<AmenityBooking> {
    return this.http.put<AmenityBooking>(
      `${this.apiUrl}/${amenityId}/bookings/${bookingId}`,
      booking
    );
  }

  /**
   * Mark a booking as paid
   */
  markAsPaid(amenityId: number, bookingId: number): Observable<AmenityBooking> {
    return this.http.post<AmenityBooking>(
      `${this.apiUrl}/${amenityId}/bookings/${bookingId}/mark-paid`,
      {}
    );
  }

  /**
   * Approve a booking
   */
  approveBooking(amenityId: number, bookingId: number): Observable<AmenityBooking> {
    return this.http.post<AmenityBooking>(
      `${this.apiUrl}/${amenityId}/bookings/${bookingId}/approve`,
      {}
    );
  }

  /**
   * Cancel a booking
   */
  cancelBooking(amenityId: number, bookingId: number, reason?: string): Observable<AmenityBooking> {
    const params = reason ? new HttpParams().set('reason', reason) : undefined;

    return this.http.post<AmenityBooking>(
      `${this.apiUrl}/${amenityId}/bookings/${bookingId}/cancel`,
      {},
      { params }
    );
  }

  /**
   * Delete a booking
   */
  deleteBooking(amenityId: number, bookingId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${amenityId}/bookings/${bookingId}`
    );
  }

  /**
   * Get current user's amenity bookings
   */
  getMyBookings(page: number = 0, size: number = 20): Observable<Page<AmenityBooking>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // Note: The endpoint path might need adjustment based on actual backend route
    return this.http.get<Page<AmenityBooking>>(
      '/api/amenity-bookings/my-bookings',
      { params }
    );
  }

  /**
   * Get current user's bookings with specific status
   */
  getMyBookingsByStatus(status: BookingStatus): Observable<AmenityBooking[]> {
    return this.http.get<AmenityBooking[]>(
      `/api/amenity-bookings/my-bookings/${status}`
    );
  }

  /**
   * Get bookings in a time range
   */
  getBookingsInTimeRange(amenityId: number, startTime: string, endTime: string): Observable<any> {
    const params = new HttpParams()
      .set('startTime', startTime)
      .set('endTime', endTime);

    return this.http.get<any>(
      `${this.apiUrl}/${amenityId}/bookings/time-range`,
      { params }
    );
  }
}
