import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PropertyImage } from '../models/property-image.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PropertyImageService {
  private readonly apiBaseUrl = `${environment.apiBaseUrl}/api/properties`;

  constructor(private http: HttpClient) {}

  uploadImage(
    propertyId: number,
    file: File,
    description?: string,
    isPrimary?: boolean
  ): Observable<PropertyImage> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    if (isPrimary !== undefined) {
      formData.append('isPrimary', isPrimary.toString());
    }

    const url = `${this.apiBaseUrl}/${propertyId}/images/upload`;
    console.info('[PropertyImageService] Uploading image for property:', propertyId);
    return this.http.post<PropertyImage>(url, formData);
  }

  getPropertyImages(propertyId: number): Observable<PropertyImage[]> {
    const url = `${this.apiBaseUrl}/${propertyId}/images`;
    return this.http.get<PropertyImage[]>(url);
  }

  getPrimaryImage(propertyId: number): Observable<PropertyImage> {
    const url = `${this.apiBaseUrl}/${propertyId}/images/primary`;
    return this.http.get<PropertyImage>(url);
  }

  setPrimaryImage(propertyId: number, imageId: number): Observable<PropertyImage> {
    const url = `${this.apiBaseUrl}/${propertyId}/images/${imageId}/primary`;
    console.info('[PropertyImageService] Setting primary image:', imageId, 'for property:', propertyId);
    return this.http.put<PropertyImage>(url, {});
  }

  deleteImage(propertyId: number, imageId: number): Observable<void> {
    const url = `${this.apiBaseUrl}/${propertyId}/images/${imageId}`;
    console.info('[PropertyImageService] Deleting image:', imageId, 'from property:', propertyId);
    return this.http.delete<void>(url);
  }

  updateImageOrder(propertyId: number, imageId: number, displayOrder: number): Observable<PropertyImage> {
    const url = `${this.apiBaseUrl}/${propertyId}/images/${imageId}/order`;
    console.info('[PropertyImageService] Updating image order:', imageId);
    return this.http.put<PropertyImage>(url, {}, {
      params: { displayOrder: displayOrder.toString() }
    });
  }

  getImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) {
      return '';
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    return `${environment.apiBaseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }
}


