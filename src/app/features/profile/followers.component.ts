import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { UsersService } from '../../core/services/users.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-followers',
  standalone: true,
  imports: [CommonModule, RouterLink, AvatarComponent],
  templateUrl: './followers.component.html',
})
export class FollowersComponent implements OnInit, OnDestroy {
  username = '';
  userId = '';
  activeTab: 'followers' | 'following' = 'followers';
  users: any[] = [];
  loading = false;
  hasMore = false;
  page = 1;
  currentUserId: string | undefined;

  private sub = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private authService: AuthService,
    private toast: ToastService,
  ) {
    this.currentUserId = this.authService.currentUser?.id;
  }

  ngOnInit(): void {
    // Initial load
    this.initFromRoute();

    // Re-run whenever Angular completes a navigation (handles same-component reuse)
    this.sub.add(
      this.router.events.pipe(
        filter((e) => e instanceof NavigationEnd),
      ).subscribe(() => {
        this.initFromRoute();
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private initFromRoute(): void {
    const snapshot = this.route.snapshot;
    const username = snapshot.params['username'];
    const url = this.router.url;
    const tab: 'followers' | 'following' = url.endsWith('/following') ? 'following' : 'followers';

    const usernameChanged = username !== this.username;
    const tabChanged = tab !== this.activeTab;

    if (!usernameChanged && !tabChanged) return;

    this.username = username;
    this.activeTab = tab;
    this.page = 1;
    this.users = [];

    if (usernameChanged || !this.userId) {
      this.usersService.getProfile(username).subscribe({
        next: (user) => {
          this.userId = user.id;
          this.load();
        },
      });
    } else {
      this.load();
    }
  }

  switchTab(tab: 'followers' | 'following'): void {
    if (this.activeTab === tab) return;
    this.router.navigate(['/profile', this.username, tab]);
  }

  load(): void {
    if (!this.userId) return;
    this.loading = true;
    const currentTab = this.activeTab;

    const obs = currentTab === 'followers'
      ? this.usersService.getFollowers(this.userId)
      : this.usersService.getFollowing(this.userId);

    obs.subscribe({
      next: (res) => {
        const list = res.data.map((f: any) => ({
          ...(currentTab === 'followers' ? f.follower : f.following),
          isFollowing: currentTab === 'followers' ? (f.follower?.isFollowing ?? false) : (f.following?.isFollowing ?? false),
          isRequested: currentTab === 'followers' ? (f.follower?.isRequested ?? false) : (f.following?.isRequested ?? false),
        }));
        this.users.push(...list);
        this.hasMore = res.meta.hasNext;
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  loadMore(): void { this.page++; this.load(); }

  toggleFollow(user: any): void {
    if (user.isFollowing) {
      this.usersService.unfollow(user.id).subscribe(() => { user.isFollowing = false; });
    } else if (user.isRequested) {
      this.usersService.unfollow(user.id).subscribe(() => { user.isRequested = false; });
    } else {
      this.usersService.follow(user.id).subscribe((res) => {
        if (res.requested) {
          user.isRequested = true;
          this.toast.success(`Follow request sent to @${user.username}`);
        } else {
          user.isFollowing = true;
          this.toast.success(`Following @${user.username}`);
        }
      });
    }
  }
}
