import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { ChatRoom, ChatMessage, ChatMessageDTO } from '../../models/chat.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="px-4 py-6 h-[calc(100vh-12rem)]">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Chat</h1>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        <!-- Rooms List -->
        <div class="lg:col-span-1 card h-full overflow-y-auto">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Conversas</h2>

          <div *ngIf="loadingRooms" class="text-center py-4">
            <p class="text-gray-500">Carregando...</p>
          </div>

          <div *ngIf="!loadingRooms && rooms.length === 0" class="text-center py-4">
            <p class="text-gray-500">Nenhuma conversa disponível</p>
          </div>

          <div *ngIf="!loadingRooms && rooms.length > 0" class="space-y-2">
            <button *ngFor="let room of rooms"
                    (click)="selectRoom(room)"
                    [class.bg-primary-50]="selectedRoom?.id === room.id"
                    [class.border-primary-500]="selectedRoom?.id === room.id"
                    class="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <p class="font-semibold text-gray-900">{{ room.name }}</p>
              <p class="text-sm text-gray-500">{{ room.description }}</p>
            </button>
          </div>
        </div>

        <!-- Chat Area -->
        <div class="lg:col-span-3 card h-full flex flex-col">
          <div *ngIf="!selectedRoom" class="flex-1 flex items-center justify-center">
            <p class="text-gray-500">Selecione uma conversa para começar</p>
          </div>

          <div *ngIf="selectedRoom" class="flex-1 flex flex-col h-full">
            <!-- Chat Header -->
            <div class="pb-4 border-b mb-4">
              <h2 class="text-xl font-semibold text-gray-900">{{ selectedRoom.name }}</h2>
              <p class="text-sm text-gray-500">{{ selectedRoom.description }}</p>
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
                  <p class="text-sm break-words">{{ message.message }}</p>
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
  rooms: ChatRoom[] = [];
  selectedRoom?: ChatRoom;
  messages: ChatMessage[] = [];
  newMessage = '';
  loadingRooms = true;
  loadingMessages = false;
  sending = false;
  currentUserId?: number;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRooms();
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

  loadRooms(): void {
    this.chatService.getMyRooms().subscribe({
      next: (data) => {
        this.rooms = data;
        this.loadingRooms = false;
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        this.loadingRooms = false;
      }
    });
  }

  selectRoom(room: ChatRoom): void {
    this.selectedRoom = room;
    this.loadMessages();
    this.connectWebSocket();
  }

  loadMessages(): void {
    if (!this.selectedRoom) return;

    this.loadingMessages = true;
    this.chatService.getRoomMessages(this.selectedRoom.id, 0, 50).subscribe({
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

  connectWebSocket(): void {
    if (!this.selectedRoom) return;

    this.chatService.disconnectWebSocket();
    this.chatService.connectWebSocket(this.selectedRoom.id, (message) => {
      this.messages.push(message);
    });
  }

  sendMessage(): void {
    if (!this.selectedRoom || !this.newMessage.trim() || !this.currentUserId) return;

    this.sending = true;
    const messageDTO: ChatMessageDTO = {
      roomId: this.selectedRoom.id,
      senderId: this.currentUserId,
      message: this.newMessage.trim()
    };

    this.chatService.sendMessage(messageDTO).subscribe({
      next: () => {
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
    return message.senderId === this.currentUserId;
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}
