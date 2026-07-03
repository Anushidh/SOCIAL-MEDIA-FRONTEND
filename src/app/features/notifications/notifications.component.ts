import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationsService } from '../../core/services/notifications.service';
import { SocketService } from '../../core/services/socket.service';
import { Notification, NotificationType } from '../../core/models';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink, AvatarComponent, TimeAgoPipe],
  templateUrl: './notifications.component.html',
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  loading = false;
  hasMore = false;
  page = 1;
  private sub = new Subscription();

  get hasUnread(): boolean {
    return this.notifications.some((n) => !n.isRead);
  }

  constructor(
    private notificationsService: NotificationsService,
    private socketService: SocketService,
  ) {}

  ngOnInit(): void {
    this.load();

    // Real-time: prepend new notifications as they arrive
    this.sub.add(
      this.socketService.onNotif<Notification>('newNotification').subscribe((notif) => {
        this.notifications.unshift(notif);
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  load(): void {
    this.loading = true;
    this.notificationsService.getNotifications(1).subscribe({
      next: (res) => {
        this.notifications = res.data;
        this.hasMore = res.meta.hasNext;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  loadMore(): void {
    this.page++;
    this.loading = true;
    this.notificationsService.getNotifications(this.page).subscribe({
      next: (res) => {
        this.notifications.push(...res.data);
        this.hasMore = res.meta.hasNext;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  markRead(notif: Notification): void {
    if (notif.isRead) return;
    this.notificationsService.markAsRead(notif.id).subscribe(() => {
      notif.isRead = true;
    });
  }

  markAllRead(): void {
    this.notificationsService.markAllAsRead().subscribe(() => {
      this.notifications.forEach((n) => (n.isRead = true));
    });
  }

  deleteNotification(notif: Notification, event: MouseEvent): void {
    event.stopPropagation();
    this.notificationsService.deleteNotification(notif.id).subscribe(() => {
      this.notifications = this.notifications.filter((n) => n.id !== notif.id);
    });
  }

  getNotificationText(type: NotificationType): string {
    const map: Record<NotificationType, string> = {
      [NotificationType.LIKE]: 'liked your post',
      [NotificationType.COMMENT]: 'commented on your post',
      [NotificationType.FOLLOW]: 'started following you',
      [NotificationType.MESSAGE]: 'sent you a message',
      [NotificationType.MENTION]: 'mentioned you in a post',
    };
    return map[type] ?? '';
  }
}
