import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentTemplate, DocumentTemplateRequest, DocumentTemplateFilter } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DocumentTemplateService {
  private apiUrl = '/api/documents/templates';

  constructor(private http: HttpClient) { }

  getTemplate(id: number): Observable<DocumentTemplate> {
    return this.http.get<DocumentTemplate>(`${this.apiUrl}/${id}`);
  }

  getTemplatesByType(documentType: string): Observable<DocumentTemplate[]> {
    return this.http.get<DocumentTemplate[]>(`${this.apiUrl}/type/${documentType}`);
  }

  getTemplatesByTypeAndCountry(documentType: string, countryCode: string): Observable<DocumentTemplate[]> {
    return this.http.get<DocumentTemplate[]>(`${this.apiUrl}/type/${documentType}/country/${countryCode}`);
  }

  getTemplatesByLanguage(documentType: string, language: string): Observable<DocumentTemplate[]> {
    return this.http.get<DocumentTemplate[]>(`${this.apiUrl}/language/${documentType}/${language}`);
  }

  getAllActiveTemplates(): Observable<DocumentTemplate[]> {
    return this.http.get<DocumentTemplate[]>(this.apiUrl);
  }

  createTemplate(template: DocumentTemplateRequest): Observable<DocumentTemplate> {
    return this.http.post<DocumentTemplate>(this.apiUrl, template);
  }

  updateTemplate(id: number, template: DocumentTemplateRequest): Observable<DocumentTemplate> {
    return this.http.put<DocumentTemplate>(`${this.apiUrl}/${id}`, template);
  }

  publishTemplate(id: number): Observable<DocumentTemplate> {
    return this.http.post<DocumentTemplate>(`${this.apiUrl}/${id}/publish`, {});
  }

  archiveTemplate(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/archive`, {});
  }

  deleteTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchTemplates(keyword: string, filter?: Omit<DocumentTemplateFilter, 'keyword'>): Observable<DocumentTemplate[]> {
    let params = new HttpParams().set('keyword', keyword);
    if (filter?.documentType) params = params.set('documentType', filter.documentType);
    if (filter?.countryCode) params = params.set('countryCode', filter.countryCode);
    if (filter?.language) params = params.set('language', filter.language);
    return this.http.get<DocumentTemplate[]>(`${this.apiUrl}/search`, { params });
  }
}

