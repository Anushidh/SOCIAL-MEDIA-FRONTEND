import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostsService } from '../../core/services/posts.service';
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

  constructor(private postsService: PostsService, private toast: ToastService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.postsService.getBookmarks(1).subscribe({
      next: (res) => {
        this.posts = res.data.map((b: any) => ({ ...b.post, isBookmarked: true }));
        this.hasMore = res.meta.hasNext;
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  loadMore(): void {
    this.page++;
    this.loading = true;
    this.postsService.getBookmarks(this.page).subscribe({
      next: (res) => {
        const more = res.data.map((b: any) => ({ ...b.post, isBookmarked: true }));
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
}
