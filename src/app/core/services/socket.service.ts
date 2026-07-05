import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private chatSocket: Socket | null = null;
  private notifSocket: Socket | null = null;

  private chatSubject = new Subject<{ event: string; data: any }>();
  private notifSubject = new Subject<{ event: string; data: any }>();

  chatEvents$ = this.chatSubject.asObservable();
  notifEvents$ = this.notifSubject.asObservable();

  // Typing indicators
  private typingSubject = new Subject<{ userId: string; conversationId: string }>();
  private stoppedTypingSubject = new Subject<{ userId: string; conversationId: string }>();
  typing$ = this.typingSubject.asObservable();
  stoppedTyping$ = this.stoppedTypingSubject.asObservable();

  constructor(private authService: AuthService) {}

  private get wsBase(): string {
    return environment.wsUrl || environment.apiUrl.replace('/api', '');
  }

  private get authToken(): string {
    return this.authService.getToken() ?? '';
  }

  connectChat(): void {
    if (this.chatSocket?.connected) return;

    this.chatSocket = io(`${this.wsBase}/chat`, {
      auth: { token: this.authToken },
      transports: ['websocket'],
      autoConnect: true,
    });

    this.chatSocket.on('newMessage', (data) => this.chatSubject.next({ event: 'newMessage', data }));
    this.chatSocket.on('messageNotification', (data) => this.chatSubject.next({ event: 'messageNotification', data }));
    this.chatSocket.on('messagesRead', (data) => this.chatSubject.next({ event: 'messagesRead', data }));
    this.chatSocket.on('userOnline', (data) => this.chatSubject.next({ event: 'userOnline', data }));
    this.chatSocket.on('userOffline', (data) => this.chatSubject.next({ event: 'userOffline', data }));
    this.chatSocket.on('userTyping', (data) => this.typingSubject.next(data));
    this.chatSocket.on('userStoppedTyping', (data) => this.stoppedTypingSubject.next(data));
    this.chatSocket.on('connect_error', (err) => console.warn('[SocketService] Chat connect error:', err.message));
  }

  connectNotifications(): void {
    if (this.notifSocket?.connected) return;

    this.notifSocket = io(`${this.wsBase}/notifications`, {
      auth: { token: this.authToken },
      transports: ['websocket'],
      autoConnect: true,
    });

    this.notifSocket.on('newNotification', (data) => this.notifSubject.next({ event: 'newNotification', data }));
    this.notifSocket.on('unreadCount', (data) => this.notifSubject.next({ event: 'unreadCount', data }));
    this.notifSocket.on('connect_error', (err) => console.warn('[SocketService] Notif connect error:', err.message));
  }

  // ─── Chat actions ─────────────────────────────────────────────────────────

  joinConversation(conversationId: string): void {
    this.chatSocket?.emit('joinConversation', { conversationId });
  }

  leaveConversation(conversationId: string): void {
    this.chatSocket?.emit('leaveConversation', { conversationId });
  }

  sendMessage(conversationId: string, content: string): Promise<any> {
    return new Promise((resolve) => {
      if (!this.chatSocket) {
        resolve({ success: false, error: 'Not connected' });
        return;
      }
      this.chatSocket.emit('sendMessage', { conversationId, content }, (response: any) => {
        resolve(response);
      });
    });
  }

  sendTyping(conversationId: string): void {
    this.chatSocket?.emit('typing', { conversationId });
  }

  sendStopTyping(conversationId: string): void {
    this.chatSocket?.emit('stopTyping', { conversationId });
  }

  markRead(conversationId: string): void {
    this.chatSocket?.emit('markRead', { conversationId });
  }

  // ─── Observable filters ───────────────────────────────────────────────────

  onChat<T = any>(eventName: string): Observable<T> {
    return this.chatSubject.pipe(
      filter((e) => e.event === eventName),
      map((e) => e.data as T),
    );
  }

  onNotif<T = any>(eventName: string): Observable<T> {
    return this.notifSubject.pipe(
      filter((e) => e.event === eventName),
      map((e) => e.data as T),
    );
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  disconnect(): void {
    this.chatSocket?.disconnect();
    this.notifSocket?.disconnect();
    this.chatSocket = null;
    this.notifSocket = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
