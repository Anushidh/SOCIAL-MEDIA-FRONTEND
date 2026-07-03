import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SocketEvent {
  event: string;
  data: any;
}

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private chatSocket: WebSocket | null = null;
  private notifSocket: WebSocket | null = null;

  private chatSubject = new Subject<SocketEvent>();
  private notifSubject = new Subject<SocketEvent>();

  chatEvents$ = this.chatSubject.asObservable();
  notifEvents$ = this.notifSubject.asObservable();

  connectChat(userId: string): void {
    if (this.chatSocket?.readyState === WebSocket.OPEN) return;
    const wsBase = environment.wsUrl || environment.apiUrl.replace('/api', '').replace('http', 'ws');
    this.chatSocket = new WebSocket(`${wsBase}/chat?userId=${userId}`);
    this.chatSocket.onmessage = (event) => {
      try {
        const msg: SocketEvent = JSON.parse(event.data);
        this.chatSubject.next(msg);
      } catch { /* ignore malformed frames */ }
    };
    this.chatSocket.onerror = () => console.warn('[SocketService] Chat socket error');
  }

  connectNotifications(userId: string): void {
    if (this.notifSocket?.readyState === WebSocket.OPEN) return;
    const wsBase = environment.wsUrl || environment.apiUrl.replace('/api', '').replace('http', 'ws');
    this.notifSocket = new WebSocket(`${wsBase}/notifications?userId=${userId}`);
    this.notifSocket.onmessage = (event) => {
      try {
        const msg: SocketEvent = JSON.parse(event.data);
        this.notifSubject.next(msg);
      } catch { /* ignore malformed frames */ }
    };
    this.notifSocket.onerror = () => console.warn('[SocketService] Notification socket error');
  }

  /** Send a message on the chat socket */
  emitToChat(event: string, data: object): void {
    if (this.chatSocket?.readyState === WebSocket.OPEN) {
      this.chatSocket.send(JSON.stringify({ event, data }));
    }
  }

  /** Filter chat events by event name */
  onChat<T = any>(eventName: string): Observable<T> {
    return this.chatSubject.pipe(
      filter((e) => e.event === eventName),
      map((e) => e.data as T),
    );
  }

  /** Filter notification events by event name */
  onNotif<T = any>(eventName: string): Observable<T> {
    return this.notifSubject.pipe(
      filter((e) => e.event === eventName),
      map((e) => e.data as T),
    );
  }

  disconnect(): void {
    this.chatSocket?.close();
    this.notifSocket?.close();
    this.chatSocket = null;
    this.notifSocket = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
