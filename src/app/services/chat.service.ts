import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatRoom, ChatMessage, ChatMessageDTO } from '../models/chat.model';
import { Page } from '../models/page.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiBaseUrl}/api/chat`;
  private wsUrl = `${environment.wsBaseUrl}/api/ws`;
  private stompClient: Client | null = null;

  constructor(private http: HttpClient) {}

  getMyRooms(): Observable<ChatRoom[]> {
    return this.http.get<ChatRoom[]>(`${this.apiUrl}/rooms`);
  }

  getRoomMessages(roomId: number, page: number = 0, size: number = 50): Observable<Page<ChatMessage>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<ChatMessage>>(`${this.apiUrl}/rooms/${roomId}/messages`, { params });
  }

  sendMessage(message: ChatMessageDTO): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.apiUrl}/messages`, message);
  }

  connectWebSocket(roomId: number, onMessageReceived: (message: any) => void): void {
    const socket = new SockJS(this.wsUrl);
    this.stompClient = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('WebSocket connected');
        this.stompClient?.subscribe(`/topic/room/${roomId}`, (message: IMessage) => {
          onMessageReceived(JSON.parse(message.body));
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      }
    });

    this.stompClient.activate();
  }

  disconnectWebSocket(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }
}
