import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostsService } from '../../core/services/posts.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Post } from '../../core/models';
import { PostCardComponent } from '../../shared/components/post-card/post-card.component';
import { ReportModalComponent } from '../../shared/components/report-modal/report-modal.component';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [CommonModule, PostCardComponent, ReportModalComponent],
  templateUrl: './bookmarks.component.html',
})
export class BookmarksComponent implements OnInit {
  posts: Post[] = [];
  loading = false;
  hasMore = false;
  page = 1;
  reportingPost: Post | null = null;

  get currentUserId() { return this.authService.currentUser?.id; }

  constructor(
    private postsService: PostsService,
    private authService: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.postsService.getBookmarks(1).subscribe({
      next: (res) => {
        // Backend returns Post[] directly (already mapped from bookmarks)
        this.posts = (res.data as any[]).map((item) => {
          // Handle both shapes: direct Post or { post: Post } wrapper
          const post = item.post ?? item;
          return { ...post, isBookmarked: true };
        });
        this.hasMore = res.meta.hasNext;
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  loadMore(): void {
    if (this.loading || !this.hasMore) return;
    this.page++;
    this.loading = true;
    this.postsService.getBookmarks(this.page).subscribe({
      next: (res) => {
        const more = (res.data as any[]).map((item) => {
          const post = item.post ?? item;
          return { ...post, isBookmarked: true };
        });
        this.posts.push(...more);
        this.hasMore = res.meta.hasNext;
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  toggleLike(post: Post): void {
    if (post.isLiked) {
      this.postsService.unlike(post.id).subscribe(() => { post.isLiked = false; post.likesCount--; });
    } else {
      this.postsService.like(post.id).subscribe(() => { post.isLiked = true; post.likesCount++; });
    }
  }

  removeBookmark(post: Post): void {
    this.postsService.removeBookmark(post.id).subscribe(() => {
      this.posts = this.posts.filter((p) => p.id !== post.id);
      this.toast.info('Removed from saved');
    });
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
        this.toast.success('Post deleted');
      },
      error: () => this.toast.error('Failed to delete post'),
    });
  }
}
