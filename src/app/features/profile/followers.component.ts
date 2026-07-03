import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
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
export class FollowersComponent implements OnInit {
  username = '';
  userId = '';
  activeTab: 'followers' | 'following' = 'followers';
  users: any[] = [];
  loading = false;
  hasMore = false;
  page = 1;
  currentUserId: string | undefined;

  constructor(
    private route: ActivatedRoute,
    private usersService: UsersService,
    private authService: AuthService,
    private toast: ToastService,
  ) {
    this.currentUserId = this.authService.currentUser?.id;
  }

  ngOnInit(): void {
    this.route.params.subscribe(({ username, tab }) => {
      this.username = username;
      this.activeTab = tab === 'following' ? 'following' : 'followers';
      this.page = 1;
      this.users = [];
      // Resolve username → userId first, then load
      this.usersService.getProfile(username).subscribe((user) => {
        this.userId = user.id;
        this.load();
      });
    });
  }

  load(): void {
    if (!this.userId) return;
    this.loading = true;
    const obs = this.activeTab === 'followers'
      ? this.usersService.getFollowers(this.userId)
      : this.usersService.getFollowing(this.userId);

    obs.subscribe({
      next: (res) => {
        const list = res.data.map((f: any) => ({
          ...(this.activeTab === 'followers' ? f.follower : f.following),
          isFollowing: false,
        }));
        this.users.push(...list);
        this.hasMore = res.meta.hasNext;
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  loadMore(): void { this.page++; this.load(); }

  getUserId(): string { return this.userId; }

  toggleFollow(user: any): void {
    if (user.isFollowing) {
      this.usersService.unfollow(user.id).subscribe(() => { user.isFollowing = false; });
    } else {
      this.usersService.follow(user.id).subscribe(() => {
        user.isFollowing = true;
        this.toast.success(`Following @${user.username}`);
      });
    }
  }
}
