import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../core/services/users.service';
import { PostsService } from '../../core/services/posts.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { MessagesService } from '../../core/services/messages.service';
import { User, Post } from '../../core/models';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { PostCardComponent } from '../../shared/components/post-card/post-card.component';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { ReportModalComponent } from '../../shared/components/report-modal/report-modal.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, AvatarComponent, PostCardComponent, TimeAgoPipe, ReportModalComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  posts: Post[] = [];
  reposts: Post[] = [];
  loading = true;
  postsLoading = false;
  isFollowing = false;
  isRequested = false;
  isBlocked = false;
  isOwnProfile = false;
  hasMorePosts = false;
  hasMoreReposts = false;
  postsPage = 1;
  repostsPage = 1;
  activeTab: 'posts' | 'reposts' = 'posts';
  reportingPost: Post | null = null;

  get currentUserId() { return this.authService.currentUser?.id; }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private postsService: PostsService,
    private authService: AuthService,
    private toast: ToastService,
    private messagesService: MessagesService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.loadProfile(params['username']);
    });
  }

  loadProfile(username: string): void {
    this.loading = true;
    this.usersService.getProfile(username).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
        this.isOwnProfile = this.authService.currentUser?.id === user.id;
        if (!this.isOwnProfile) {
          this.usersService.isFollowing(user.id).subscribe((res) => {
            this.isFollowing = res.isFollowing;
            this.isRequested = res.isRequested;
            // Only load posts if not private or if following
            if (!user.isPrivate || this.isFollowing) {
              this.loadPosts(user.id);
            }
          });
          this.usersService.isBlocked(user.id).subscribe((res) => {
            this.isBlocked = res.isBlocked;
          });
        } else {
          this.loadPosts(user.id);
        }
      },
      error: () => this.loading = false,
    });
  }

  loadPosts(userId: string): void {
    this.postsLoading = true;
    this.postsPage = 1;
    this.postsService.getUserPosts(userId, 1).subscribe({
      next: (res) => {
        this.posts = res.data;
        this.hasMorePosts = res.meta.hasNext;
        this.postsLoading = false;
      },
      error: () => this.postsLoading = false,
    });
  }

  loadReposts(userId: string): void {
    this.postsLoading = true;
    this.repostsPage = 1;
    this.postsService.getUserReposts(userId, 1).subscribe({
      next: (res) => {
        this.reposts = res.data;
        this.hasMoreReposts = res.meta.hasNext;
        this.postsLoading = false;
      },
      error: () => this.postsLoading = false,
    });
  }

  switchTab(tab: 'posts' | 'reposts'): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    if (!this.user) return;
    if (tab === 'reposts' && this.reposts.length === 0) {
      this.loadReposts(this.user.id);
    }
  }

  loadMorePosts(): void {
    if (!this.user || this.postsLoading) return;
    this.postsPage++;
    this.postsLoading = true;
    this.postsService.getUserPosts(this.user.id, this.postsPage).subscribe({
      next: (res) => {
        this.posts.push(...res.data);
        this.hasMorePosts = res.meta.hasNext;
        this.postsLoading = false;
      },
      error: () => this.postsLoading = false,
    });
  }

  loadMoreReposts(): void {
    if (!this.user || this.postsLoading) return;
    this.repostsPage++;
    this.postsLoading = true;
    this.postsService.getUserReposts(this.user.id, this.repostsPage).subscribe({
      next: (res) => {
        this.reposts.push(...res.data);
        this.hasMoreReposts = res.meta.hasNext;
        this.postsLoading = false;
      },
      error: () => this.postsLoading = false,
    });
  }

  toggleFollow(): void {
    if (!this.user) return;
    if (this.isFollowing) {
      this.usersService.unfollow(this.user.id).subscribe(() => {
        this.isFollowing = false;
        if (this.user!.followersCount) this.user!.followersCount--;
      });
    } else if (this.isRequested) {
      this.usersService.unfollow(this.user.id).subscribe(() => {
        this.isRequested = false;
      });
    } else {
      this.usersService.follow(this.user.id).subscribe((res) => {
        if (res.requested) {
          this.isRequested = true;
          this.toast.success(`Follow request sent to @${this.user!.username}`);
        } else {
          this.isFollowing = true;
          if (this.user!.followersCount !== undefined) this.user!.followersCount++;
          this.toast.success(`Following @${this.user!.username}`);
        }
      });
    }
  }

  toggleBlock(): void {
    if (!this.user) return;
    if (this.isBlocked) {
      this.usersService.unblockUser(this.user.id).subscribe(() => {
        this.isBlocked = false;
        this.toast.success(`Unblocked @${this.user!.username}`);
      });
    } else {
      this.usersService.blockUser(this.user.id).subscribe(() => {
        if (this.isFollowing) {
          this.isFollowing = false;
          if (this.user!.followersCount) this.user!.followersCount--;
        }
        this.isBlocked = true;
        this.toast.success(`Blocked @${this.user!.username}`);
      });
    }
  }

  messageUser(): void {
    if (!this.user) return;
    this.messagesService.createConversation(this.user.id).subscribe({
      next: (conv) => {
        this.router.navigate(['/messages'], { queryParams: { conversationId: conv.id } });
      },
      error: () => this.toast.error('Could not open conversation'),
    });
  }

  toggleLike(post: Post): void {
    if (post.isLiked) {
      this.postsService.unlike(post.id).subscribe(() => { post.isLiked = false; post.likesCount--; });
    } else {
      this.postsService.like(post.id).subscribe(() => { post.isLiked = true; post.likesCount++; });
    }
  }

  toggleBookmark(post: Post): void {
    if (post.isBookmarked) {
      this.postsService.removeBookmark(post.id).subscribe(() => { post.isBookmarked = false; });
    } else {
      this.postsService.bookmark(post.id).subscribe(() => { post.isBookmarked = true; this.toast.success('Saved'); });
    }
  }

  toggleRepost(post: Post): void {
    if (post.isReposted) {
      this.postsService.removeRepost(post.id).subscribe(() => { post.isReposted = false; post.repostsCount--; });
    } else {
      this.postsService.repost(post.id).subscribe(() => { post.isReposted = true; post.repostsCount++; });
    }
  }

  handleReported(): void {
    if (this.reportingPost) {
      this.reportingPost.isReported = true;
    }
    this.reportingPost = null;
  }

  deletePost(post: Post): void {
    this.postsService.delete(post.id).subscribe({
      next: () => {
        this.posts = this.posts.filter((p) => p.id !== post.id);
        this.reposts = this.reposts.filter((p) => p.id !== post.id);
        this.toast.success('Post deleted');
        if (this.user) this.user.postsCount = Math.max(0, (this.user.postsCount ?? 1) - 1);
      },
      error: () => this.toast.error('Failed to delete post'),
    });
  }
}
