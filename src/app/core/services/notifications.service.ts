import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Notification, PaginatedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private api: ApiService) {}

  getNotifications(page = 1, limit = 20): Observable<PaginatedResponse<Notification>> {
    return this.api.get<PaginatedResponse<Notification>>(`/notifications?page=${page}&limit=${limit}`);
  }

  getUnreadCount(): Observable<number> {
    return this.api.get<number>('/notifications/unread-count').pipe(
      tap((count) => this.unreadCountSubject.next(count)),
    );
  }

  markAsRead(id: string): Observable<void> {
    return this.api.patch<void>(`/notifications/${id}/read`, {}).pipe(
      tap(() => {
        const current = this.unreadCountSubject.value;
        if (current > 0) this.unreadCountSubject.next(current - 1);
      }),
    );
  }

  markAllAsRead(): Observable<void> {
    return this.api.patch<void>('/notifications/read-all', {}).pipe(
      tap(() => this.unreadCountSubject.next(0)),
    );
  }

  deleteNotification(id: string): Observable<void> {
    return this.api.delete<void>(`/notifications/${id}`);
  }

  setUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }
}
