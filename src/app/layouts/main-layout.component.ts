import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../core/services/auth.service';
import { NotificationsService } from '../core/services/notifications.service';
import { MessagesService } from '../core/services/messages.service';
import { SocketService } from '../core/services/socket.service';
import { ToastContainerComponent } from '../shared/components/toast-container/toast-container.component';
import { RightSidebarComponent } from '../shared/components/right-sidebar/right-sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, ToastContainerComponent, RightSidebarComponent],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  notifUnread$;
  msgUnread$;
  isFullWidthRoute = false;

  // Routes where right sidebar should be hidden
  private readonly FULL_WIDTH_ROUTES = ['/messages'];

  constructor(
    private authService: AuthService,
    private notificationsService: NotificationsService,
    private messagesService: MessagesService,
    private socketService: SocketService,
    private router: Router,
  ) {
    this.currentUser = this.authService.currentUser;
    this.notifUnread$ = this.notificationsService.unreadCount$;
    this.msgUnread$ = this.messagesService.unreadCount$;
  }

  ngOnInit(): void {
    this.notificationsService.getUnreadCount().subscribe();
    this.messagesService.getUnreadCount().subscribe();
    this.authService.currentUser$.subscribe((u) => (this.currentUser = u));

    // Track route changes for full-width pages
    this.isFullWidthRoute = this.FULL_WIDTH_ROUTES.some((r) =>
      this.router.url.startsWith(r),
    );
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.isFullWidthRoute = this.FULL_WIDTH_ROUTES.some((r) =>
          e.urlAfterRedirects.startsWith(r),
        );
      });

    // Connect WebSockets
    const userId = this.authService.currentUser?.id;
    if (userId) {
      this.socketService.connectNotifications(userId);
      this.socketService.connectChat(userId);

      // Listen for real-time notification badge updates
      this.socketService.notifEvents$.subscribe((msg: any) => {
        if (msg.event === 'unreadCount') {
          this.notificationsService.setUnreadCount(msg.data.count);
        }
      });

      // Listen for real-time message unread count
      this.socketService.chatEvents$.subscribe((msg: any) => {
        if (msg.event === 'messageNotification') {
          this.messagesService.getUnreadCount().subscribe();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

  logout(): void {
    this.authService.logout();
  }
}
