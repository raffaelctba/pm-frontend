export type ChatConversationType = 'UNIT' | 'MAINTENANCE' | 'MANAGER_CHANNEL' | 'DIRECT';

export interface ChatConversation {
  id: number;
  propertyId: number;
  conversationType: ChatConversationType;
  contextId?: number | null;
  name: string;
  description?: string;
  isGroup: boolean;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  roomId: number;
  senderId: number;
  senderKeycloakId?: string;
  senderName: string;
  content?: string;
  message: string;
  sentAt: string;
  status?: 'SENT' | 'DELIVERED' | 'READ';
  isRead: boolean;
}

export interface ChatSendMessageRequest {
  conversationId: number;
  content: string;
}


