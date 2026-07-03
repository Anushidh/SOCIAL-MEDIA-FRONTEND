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
  loading = true;
  postsLoading = false;
  isFollowing = false;
  isOwnProfile = false;
  hasMorePosts = false;
  postsPage = 1;
  reportingPost: Post | null = null;

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
          });
        }
        this.loadPosts(user.id);
      },
      error: () => this.loading = false,
    });
  }

  loadPosts(userId: string): void {
    this.postsLoading = true;
    this.postsService.getUserPosts(userId, 1).subscribe({
      next: (res) => {
        this.posts = res.data;
        this.hasMorePosts = res.meta.hasNext;
        this.postsLoading = false;
      },
      error: () => this.postsLoading = false,
    });
  }

  loadMorePosts(): void {
    if (!this.user) return;
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

  toggleFollow(): void {
    if (!this.user) return;
    if (this.isFollowing) {
      this.usersService.unfollow(this.user.id).subscribe(() => {
        this.isFollowing = false;
        if (this.user!.followersCount) this.user!.followersCount--;
      });
    } else {
      this.usersService.follow(this.user.id).subscribe(() => {
        this.isFollowing = true;
        if (this.user!.followersCount !== undefined) this.user!.followersCount++;
        this.toast.success(`Following @${this.user!.username}`);
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
}
