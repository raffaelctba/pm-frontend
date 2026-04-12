import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatConversation, ChatMessage, ChatSendMessageRequest } from '../models';
import { Page } from '../../models/page.model';
import { ChatConversationService } from './chat-conversation.service';
import { ChatMessageService } from './chat-message.service';
import { ChatWebSocketService } from './chat-websocket.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(
    private conversationService: ChatConversationService,
    private messageService: ChatMessageService,
    private webSocketService: ChatWebSocketService
  ) {}

  getMyConversations(): Observable<ChatConversation[]> {
    return this.conversationService.getMyConversations();
  }

  getConversationMessages(conversationId: number, page: number = 0, size: number = 50): Observable<Page<ChatMessage>> {
    return this.messageService.getConversationMessages(conversationId, page, size);
  }

  sendMessage(message: ChatSendMessageRequest): Observable<ChatMessage> {
    return this.messageService.sendMessage(message);
  }

  getOrCreateUnitConversation(unitId: number): Observable<ChatConversation> {
    return this.conversationService.getOrCreateUnitConversation(unitId);
  }

  getOrCreatePropertyConversation(propertyId: number, memberId: number): Observable<ChatConversation> {
    return this.conversationService.getOrCreatePropertyConversation(propertyId, memberId);
  }

  async connectWebSocket(conversationId: number, onMessageReceived: (message: ChatMessage) => void): Promise<void> {
    return this.webSocketService.connectWebSocket(conversationId, onMessageReceived);
  }

  publishMessage(message: ChatSendMessageRequest): void {
    this.webSocketService.publishMessage(message);
  }

  disconnectWebSocket(): void {
    this.webSocketService.disconnectWebSocket();
  }
}



