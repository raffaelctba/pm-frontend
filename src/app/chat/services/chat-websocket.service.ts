import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage, ChatSendMessageRequest } from '../models';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatWebSocketService {
  private wsUrl = `${environment.wsBaseUrl}/api/ws`;
  private stompClient: Client | null = null;

  constructor(private authService: AuthService) {}

  async connectWebSocket(conversationId: number, onMessageReceived: (message: ChatMessage) => void): Promise<void> {
    const token = await this.authService.getToken();
    const socket = new SockJS(this.wsUrl);
    this.stompClient = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        this.stompClient?.subscribe(`/topic/conversations/${conversationId}`, (message: IMessage) => {
          onMessageReceived(JSON.parse(message.body));
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      }
    });

    this.stompClient.activate();
  }

  publishMessage(message: ChatSendMessageRequest): void {
    if (!this.stompClient || !this.stompClient.connected) {
      return;
    }
    this.stompClient.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(message)
    });
  }

  disconnectWebSocket(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }
}

