import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { UsersService } from '../../../core/services/users.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { AvatarComponent } from '../avatar/avatar.component';
import { User } from '../../../core/models';

@Component({
  selector: 'app-right-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AvatarComponent],
  templateUrl: './right-sidebar.component.html',
})
export class RightSidebarComponent implements OnInit {
  trendingHashtags: { id: string; name: string; postsCount: number }[] = [];
  suggestedUsers: (User & { isFollowing?: boolean })[] = [];
  searchQuery = '';

  get currentUser() { return this.authService.currentUser; }

  constructor(
    private api: ApiService,
    private usersService: UsersService,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadTrending();
    this.loadSuggested();
  }

  loadTrending(): void {
    this.api.get<any[]>('/hashtags/trending?limit=5').subscribe({
      next: (tags) => (this.trendingHashtags = tags),
      error: () => {},
    });
  }

  loadSuggested(): void {
    // Get users the current user is NOT already following
    this.usersService.getSuggestedUsers().subscribe({
      next: (res) => {
        this.suggestedUsers = res.data
          .filter((u) => u.id !== this.currentUser?.id)
          .slice(0, 4)
          .map((u) => ({ ...u, isFollowing: false }));
      },
      error: () => {},
    });
  }

  onSearch(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.searchQuery.trim()) {
      this.router.navigate(['/search'], {
        queryParams: { q: this.searchQuery.trim() },
      });
      this.searchQuery = '';
    }
  }

  follow(user: User & { isFollowing?: boolean }): void {
    this.usersService.follow(user.id).subscribe({
      next: () => {
        user.isFollowing = true;
        this.toast.success(`Following @${user.username}`);
      },
      error: () => {},
    });
  }
}
