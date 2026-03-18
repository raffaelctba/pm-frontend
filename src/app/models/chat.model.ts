export interface ChatRoom {
  id: number;
  propertyId: number;
  name: string;
  description?: string;
  isGroup: boolean;
}

export interface ChatMessage {
  id: number;
  roomId: number;
  senderId: number;
  senderName: string;
  message: string;
  sentAt: string;
  isRead: boolean;
}

export interface ChatMessageDTO {
  roomId: number;
  senderId: number;
  message: string;
}
