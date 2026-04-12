import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../services';
import { ChatConversation, ChatConversationType, ChatMessage, ChatSendMessageRequest } from '../models';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="px-4 py-6 h-[calc(100vh-12rem)]">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Chat</h1>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        <!-- Conversations List -->
        <div class="lg:col-span-1 card h-full overflow-y-auto">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Conversas</h2>

          <div *ngIf="loadingRooms" class="text-center py-4">
            <p class="text-gray-500">Carregando...</p>
          </div>

          <div *ngIf="!loadingRooms && conversations.length === 0" class="text-center py-4">
            <p class="text-gray-500">Nenhuma conversa disponível</p>
          </div>

          <div *ngIf="!loadingRooms && conversations.length > 0" class="space-y-4">
            <div *ngFor="let group of groupedConversations">
              <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{{ group.label }}</p>
              <div class="space-y-2">
                <button *ngFor="let conversation of group.items"
                    (click)="selectConversation(conversation)"
                    [class.bg-primary-50]="selectedConversation?.id === conversation.id"
                    [class.border-primary-500]="selectedConversation?.id === conversation.id"
                    class="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <p class="font-semibold text-gray-900">{{ conversation.name }}</p>
                  <p class="text-sm text-gray-500">{{ conversation.description }}</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Area -->
        <div class="lg:col-span-3 card h-full flex flex-col">
          <div *ngIf="!selectedConversation" class="flex-1 flex items-center justify-center">
            <p class="text-gray-500">Selecione uma conversa para começar</p>
          </div>

          <div *ngIf="selectedConversation" class="flex-1 flex flex-col h-full">
            <!-- Chat Header -->
            <div class="pb-4 border-b mb-4">
              <h2 class="text-xl font-semibold text-gray-900">{{ selectedConversation.name }}</h2>
              <p class="text-sm text-gray-500">{{ selectedConversation.description }}</p>
            </div>

            <!-- Messages -->
            <div #messagesContainer class="flex-1 overflow-y-auto mb-4 space-y-4">
              <div *ngIf="loadingMessages" class="text-center py-4">
                <p class="text-gray-500">Carregando mensagens...</p>
              </div>

              <div *ngIf="!loadingMessages && messages.length === 0" class="text-center py-4">
                <p class="text-gray-500">Nenhuma mensagem ainda. Seja o primeiro a enviar!</p>
              </div>

              <div *ngFor="let message of messages"
                   [class.justify-end]="isMyMessage(message)"
                   class="flex">
                <div [class.bg-primary-600]="isMyMessage(message)"
                     [class.text-white]="isMyMessage(message)"
                     [class.bg-gray-100]="!isMyMessage(message)"
                     class="max-w-[70%] rounded-lg p-3">
                  <p *ngIf="!isMyMessage(message)" class="text-xs font-semibold mb-1">
                    {{ message.senderName }}
                  </p>
                  <p class="text-sm break-words">{{ message.content || message.message }}</p>
                  <p [class.text-gray-100]="isMyMessage(message)"
                     class="text-xs text-gray-500 mt-1">
                    {{ formatTime(message.sentAt) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Input Area -->
            <div class="border-t pt-4">
              <form (ngSubmit)="sendMessage()" class="flex gap-2">
                <input type="text"
                       [(ngModel)]="newMessage"
                       name="message"
                       placeholder="Digite sua mensagem..."
                       class="flex-1 input"
                       [disabled]="sending">
                <button type="submit"
                        [disabled]="!newMessage.trim() || sending"
                        class="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                  {{ sending ? 'Enviando...' : 'Enviar' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ChatComponent implements OnInit, OnDestroy {
  conversations: ChatConversation[] = [];
  selectedConversation?: ChatConversation;
  messages: ChatMessage[] = [];
  newMessage = '';
  loadingRooms = true;
  loadingMessages = false;
  sending = false;
  currentUserKeycloakId = '';
  groupedConversations: Array<{ label: string; items: ChatConversation[] }> = [];
  preferredPropertyId: number | null = null;
  preferredMemberId: number | null = null;
  private activeConversationRequestKey: string | null = null;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private i18n: I18nService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentUserKeycloakId = this.authService.getSubject();
    this.route.queryParamMap.subscribe((params) => {
      const property = Number(params.get('property'));
      const member = Number(params.get('member'));
      this.preferredPropertyId = Number.isFinite(property) && property > 0 ? property : null;
      this.preferredMemberId = Number.isFinite(member) && member > 0 ? member : null;
      this.tryResolvePreferredConversation();
    });
    this.loadConversations();
    this.loadCurrentUser();
  }

  ngOnDestroy(): void {
    this.chatService.disconnectWebSocket();
  }

  loadCurrentUser(): void {
    this.authService.getUserProfile().subscribe({
      next: (profile) => {
        // Assuming the profile contains the user ID
        // You may need to adjust this based on your actual user profile structure
        console.log('User profile:', profile);
      }
    });
  }

  loadConversations(): void {
    this.chatService.getMyConversations().subscribe({
      next: (data) => {
        this.conversations = data;
        this.groupConversations();
        this.tryResolvePreferredConversation();
        this.loadingRooms = false;
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
        this.loadingRooms = false;
      }
    });
  }

  selectConversation(conversation: ChatConversation): void {
    if (this.selectedConversation?.id === conversation.id) {
      return;
    }

    this.selectedConversation = conversation;
    this.loadMessages();
    void this.connectWebSocket();
  }

  loadMessages(): void {
    if (!this.selectedConversation) return;

    this.loadingMessages = true;
    this.chatService.getConversationMessages(this.selectedConversation.id, 0, 50).subscribe({
      next: (data) => {
        this.messages = data.content.reverse();
        this.loadingMessages = false;
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.loadingMessages = false;
      }
    });
  }

  async connectWebSocket(): Promise<void> {
    if (!this.selectedConversation) return;

    this.chatService.disconnectWebSocket();
    await this.chatService.connectWebSocket(this.selectedConversation.id, (message) => {
      this.messages.push(message);
    });
  }

  sendMessage(): void {
    if (!this.selectedConversation || !this.newMessage.trim()) return;

    this.sending = true;
    const messageDTO: ChatSendMessageRequest = {
      conversationId: this.selectedConversation.id,
      content: this.newMessage.trim()
    };

    this.chatService.sendMessage(messageDTO).subscribe({
      next: (created) => {
        this.messages.push(created);
        this.newMessage = '';
        this.sending = false;
      },
      error: (error) => {
        console.error('Error sending message:', error);
        alert('Erro ao enviar mensagem');
        this.sending = false;
      }
    });
  }

  isMyMessage(message: ChatMessage): boolean {
    return !!message.senderKeycloakId && message.senderKeycloakId === this.currentUserKeycloakId;
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  private groupConversations(): void {
    const order: ChatConversationType[] = ['DIRECT', 'UNIT', 'MAINTENANCE', 'MANAGER_CHANNEL'];
    const labelKeys: Record<ChatConversationType, string> = {
      DIRECT: 'chat.group.direct',
      UNIT: 'chat.group.unit',
      MAINTENANCE: 'chat.group.maintenance',
      MANAGER_CHANNEL: 'chat.group.managerChannel'
    };

    this.groupedConversations = order
      .map((type) => ({
        label: this.i18n.translate(labelKeys[type]),
        items: this.conversations.filter((conversation) => conversation.conversationType === type)
      }))
      .filter((group) => group.items.length > 0);
  }

  private tryResolvePreferredConversation(): void {
    if (!this.preferredPropertyId) {
      return;
    }

    if (this.preferredMemberId) {
      const requestKey = `${this.preferredPropertyId}-${this.preferredMemberId}`;
      if (this.activeConversationRequestKey === requestKey) {
        return;
      }

      this.activeConversationRequestKey = requestKey;
      this.chatService.getOrCreatePropertyConversation(this.preferredPropertyId, this.preferredMemberId).subscribe({
        next: (conversation) => {
          this.activeConversationRequestKey = requestKey;
          this.upsertConversation(conversation);
          this.selectConversation(conversation);
        },
        error: (error) => {
          this.activeConversationRequestKey = null;
          console.error('Error opening direct conversation:', error);
        }
      });
      return;
    }

    if (this.selectedConversation || this.conversations.length === 0) {
      return;
    }

    const managerChannel = this.conversations.find(
      (conversation) => conversation.propertyId === this.preferredPropertyId && conversation.conversationType === 'MANAGER_CHANNEL'
    );

    if (managerChannel) {
      this.selectConversation(managerChannel);
    }
  }

  private upsertConversation(conversation: ChatConversation): void {
    const existingIndex = this.conversations.findIndex((item) => item.id === conversation.id);
    if (existingIndex >= 0) {
      this.conversations[existingIndex] = conversation;
    } else {
      this.conversations = [conversation, ...this.conversations];
    }

    this.groupConversations();
  }
}



