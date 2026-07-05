import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Message, Conversation } from '../models';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private api: ApiService) {}

  getConversations(): Observable<Conversation[]> {
    return this.api.get<Conversation[]>('/messages/conversations');
  }

  getMessages(conversationId: string, page = 1): Observable<any> {
    return this.api.get<any>(`/messages/conversations/${conversationId}?page=${page}&limit=50`);
  }

  createConversation(participantId: string): Observable<Conversation> {
    return this.api.post<Conversation>('/messages/conversations', { participantId });
  }

  sendMessage(conversationId: string, content: string): Observable<Message> {
    return this.api.post<Message>('/messages', { conversationId, content });
  }

  uploadMedia(formData: FormData): Observable<{ mediaUrl: string; mediaType: string }> {
    return this.api.post<{ mediaUrl: string; mediaType: string }>('/messages/media', formData);
  }

  markAsRead(conversationId: string): Observable<void> {
    return this.api.patch<void>(`/messages/conversations/${conversationId}/read`, {});
  }

  deleteMessage(messageId: string): Observable<void> {
    return this.api.delete<void>(`/messages/${messageId}`);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.api.get<{ count: number }>('/messages/unread-count').pipe(
      tap(({ count }) => this.unreadCountSubject.next(count)),
    );
  }

  setUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }
}
