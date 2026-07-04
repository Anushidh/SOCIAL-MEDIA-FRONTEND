import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { NotificationsService } from '../core/services/notifications.service';
import { MessagesService } from '../core/services/messages.service';
import { SocketService } from '../core/services/socket.service';
import { RightSidebarComponent } from '../shared/components/right-sidebar/right-sidebar.component';
import { ConfirmModalComponent } from '../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, RightSidebarComponent, ConfirmModalComponent],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private subs = new Subscription();
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
    this.subs.add(this.authService.currentUser$.subscribe((u) => (this.currentUser = u)));

    // Track route changes for full-width pages
    this.isFullWidthRoute = this.FULL_WIDTH_ROUTES.some((r) =>
      this.router.url.startsWith(r),
    );
    this.subs.add(
      this.router.events
        .pipe(filter((e) => e instanceof NavigationEnd))
        .subscribe((e: any) => {
          this.isFullWidthRoute = this.FULL_WIDTH_ROUTES.some((r) =>
            e.urlAfterRedirects.startsWith(r),
          );
        })
    );

    // Connect WebSockets
    const userId = this.authService.currentUser?.id;
    if (userId) {
      this.socketService.connectNotifications();
      this.socketService.connectChat();

      // Listen for real-time notification badge updates
      this.subs.add(
        this.socketService.onNotif<{ count: number }>('unreadCount').subscribe((data) => {
          this.notificationsService.setUnreadCount(data.count);
        })
      );

      // Listen for real-time message unread count
      this.subs.add(
        this.socketService.onChat('messageNotification').subscribe(() => {
          this.messagesService.getUnreadCount().subscribe();
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.socketService.disconnect();
  }

  showLogoutConfirm = false;

  logout(): void {
    this.authService.logout();
  }
}
