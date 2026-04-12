import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatConversation } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatConversationService {
  private apiUrl = `${environment.apiBaseUrl}/api/conversations`;
  private unitApiUrl = `${environment.apiBaseUrl}/api/units`;

  constructor(private http: HttpClient) {}

  getMyConversations(): Observable<ChatConversation[]> {
    return this.http.get<ChatConversation[]>(this.apiUrl);
  }

  getOrCreateUnitConversation(unitId: number): Observable<ChatConversation> {
    return this.http.get<ChatConversation>(`${this.unitApiUrl}/${unitId}/conversation`);
  }

  getOrCreatePropertyConversation(propertyId: number, memberId: number): Observable<ChatConversation> {
    return this.http.get<ChatConversation>(`${this.apiUrl}/properties/${propertyId}/members/${memberId}`);
  }
}

