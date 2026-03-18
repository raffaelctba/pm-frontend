import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Address } from '../models/property.model';
import { AddressConfig } from '../models/address.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = `${environment.apiBaseUrl}/api/addresses`;

  constructor(private http: HttpClient) {}

  /**
   * Auto-fill address by ZIP/Postal code
   */
  autoFillAddress(zipCode: string, countryCode: string): Observable<Address> {
    const params = new HttpParams()
      .set('zipCode', zipCode)
      .set('countryCode', countryCode);
    return this.http.get<Address>(`${this.apiUrl}/auto-fill`, { params });
  }

  /**
   * Validate ZIP/Postal code format
   */
  validateZipCode(zipCode: string, countryCode: string): Observable<{valid: boolean}> {
    const params = new HttpParams()
      .set('zipCode', zipCode)
      .set('countryCode', countryCode);
    return this.http.get<{valid: boolean}>(`${this.apiUrl}/validate-zip`, { params });
  }

  /**
   * Get all supported countries
   */
  getSupportedCountries(): Observable<{[key: string]: string}> {
    return this.http.get<{[key: string]: string}>(`${this.apiUrl}/countries`);
  }

  /**
   * Get country configuration (labels, patterns, etc.)
   */
  getCountryConfig(countryCode: string): Observable<AddressConfig> {
    return this.http.get<AddressConfig>(`${this.apiUrl}/countries/${countryCode}/config`);
  }

  /**
   * Check if auto-fill is supported for country
   */
  checkAutoFillSupport(countryCode: string): Observable<{supported: boolean}> {
    const params = new HttpParams().set('countryCode', countryCode);
    return this.http.get<{supported: boolean}>(`${this.apiUrl}/auto-fill-support`, { params });
  }
}
