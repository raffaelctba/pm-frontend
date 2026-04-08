import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, finalize, tap } from 'rxjs';
import { Property, PropertyDTO, PropertyLinkedUser } from '../models/property.model';
import { Page } from '../models/page.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/properties`;

  constructor(private http: HttpClient) {}

  getAllProperties(page: number = 0, size: number = 10): Observable<Page<Property>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Property>>(this.apiUrl, { params }).pipe(
      tap((response) => {
        console.info(
          '[PropertyService] Retrieved properties:',
          response.content.length,
          'total:',
          response.totalElements,
          'page:',
          response.pageable.pageNumber
        );
      })
    );
  }

  getPropertyById(id: number): Observable<Property> {
    const url = `${this.apiUrl}/${id}`;
    const startedAt = Date.now();
    const debugEnabled = !environment.production;

    if (debugEnabled) {
      console.info('[PropertyService] getPropertyById:start', { id, url });
    }

    return this.http.get<Property>(url).pipe(
      tap({
        next: (property) => {
          if (debugEnabled) {
            console.info('[PropertyService] getPropertyById:success', {
              id,
              propertyId: property?.id,
              name: property?.name,
              elapsedMs: Date.now() - startedAt
            });
          }
        },
        error: (error) => {
          if (debugEnabled) {
            console.error('[PropertyService] getPropertyById:error', {
              id,
              status: error?.status,
              statusText: error?.statusText,
              message: error?.message,
              elapsedMs: Date.now() - startedAt
            });
          }
        }
      }),
      finalize(() => {
        if (debugEnabled) {
          console.info('[PropertyService] getPropertyById:finalize', {
            id,
            elapsedMs: Date.now() - startedAt
          });
        }
      })
    );
  }

  getMyProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/my-properties`).pipe(
      tap((properties) => {
        console.info('[PropertyService] Retrieved user properties:', properties.length);
      })
    );
  }

  getPropertyLinkedUsers(id: number): Observable<PropertyLinkedUser[]> {
    return this.http.get<PropertyLinkedUser[]>(`${this.apiUrl}/${id}/linked-users`);
  }

  createProperty(property: PropertyDTO): Observable<Property> {
    return this.http.post<Property>(this.apiUrl, property);
  }

  updateProperty(id: number, property: PropertyDTO): Observable<Property> {
    return this.http.put<Property>(`${this.apiUrl}/${id}`, property);
  }

  deleteProperty(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
