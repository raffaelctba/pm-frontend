import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatMessage, ChatSendMessageRequest } from '../models';
import { Page } from '../../models/page.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatMessageService {
  private apiUrl = `${environment.apiBaseUrl}/api/conversations`;

  constructor(private http: HttpClient) {}

  getConversationMessages(conversationId: number, page: number = 0, size: number = 50): Observable<Page<ChatMessage>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<ChatMessage>>(`${this.apiUrl}/${conversationId}/messages`, { params });
  }

  sendMessage(message: ChatSendMessageRequest): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.apiUrl}/messages`, message);
  }
}

