import { User } from './user.model';

export interface Message {
  id: string;
  content: string;
  sender: User;
  senderId: string;
  conversationId: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}
