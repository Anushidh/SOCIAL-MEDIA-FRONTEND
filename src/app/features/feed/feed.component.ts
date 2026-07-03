import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostsService } from '../../core/services/posts.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Post } from '../../core/models';
import { PostCardComponent } from '../../shared/components/post-card/post-card.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { ReportModalComponent } from '../../shared/components/report-modal/report-modal.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PostCardComponent, AvatarComponent, ReportModalComponent],
  templateUrl: './feed.component.html',
})
export class FeedComponent implements OnInit {
  posts: Post[] = [];
  loading = false;
  hasMore = false;
  page = 1;
  activeTab: 'feed' | 'explore' = 'feed';
  showComposer = false;
  newPostContent = '';
  posting = false;
  reportingPost: Post | null = null;

  get currentUser() { return this.authService.currentUser; }

  constructor(
    private postsService: PostsService,
    private authService: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void { this.loadPosts(); }

  loadPosts(): void {
    this.page = 1;
    this.posts = [];
    this.loading = true;

    const obs = this.activeTab === 'feed'
      ? this.postsService.getFeed(1)
      : this.postsService.getExplore(1);

    obs.subscribe({
      next: (res) => {
        this.posts = res.data;
        this.hasMore = res.meta.hasNext;
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  loadMore(): void {
    this.page++;
    this.loading = true;
    const obs = this.activeTab === 'feed'
      ? this.postsService.getFeed(this.page)
      : this.postsService.getExplore(this.page);

    obs.subscribe({
      next: (res) => {
        this.posts.push(...res.data);
        this.hasMore = res.meta.hasNext;
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  createPost(): void {
    if (!this.newPostContent.trim()) return;
    this.posting = true;

    this.postsService.create({ content: this.newPostContent }).subscribe({
      next: (post) => {
        this.posts.unshift(post);
        this.newPostContent = '';
        this.showComposer = false;
        this.posting = false;
        this.toast.success('Post created!');
      },
      error: () => {
        this.posting = false;
        this.toast.error('Failed to create post');
      },
    });
  }

  toggleLike(post: Post): void {
    if (post.isLiked) {
      this.postsService.unlike(post.id).subscribe(() => {
        post.isLiked = false;
        post.likesCount--;
      });
    } else {
      this.postsService.like(post.id).subscribe(() => {
        post.isLiked = true;
        post.likesCount++;
      });
    }
  }

  toggleBookmark(post: Post): void {
    if (post.isBookmarked) {
      this.postsService.removeBookmark(post.id).subscribe(() => {
        post.isBookmarked = false;
        this.toast.info('Removed from bookmarks');
      });
    } else {
      this.postsService.bookmark(post.id).subscribe(() => {
        post.isBookmarked = true;
        this.toast.success('Saved to bookmarks');
      });
    }
  }

  toggleRepost(post: Post): void {
    if (post.isReposted) {
      this.postsService.removeRepost(post.id).subscribe(() => {
        post.isReposted = false;
        post.repostsCount--;
      });
    } else {
      this.postsService.repost(post.id).subscribe(() => {
        post.isReposted = true;
        post.repostsCount++;
        this.toast.success('Reposted!');
      });
    }
  }
}
