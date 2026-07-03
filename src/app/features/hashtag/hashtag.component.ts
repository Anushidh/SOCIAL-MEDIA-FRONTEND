import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { PostsService } from '../../core/services/posts.service';
import { ToastService } from '../../core/services/toast.service';
import { Post } from '../../core/models';
import { PostCardComponent } from '../../shared/components/post-card/post-card.component';
import { ReportModalComponent } from '../../shared/components/report-modal/report-modal.component';

@Component({
  selector: 'app-hashtag',
  standalone: true,
  imports: [CommonModule, RouterLink, PostCardComponent, ReportModalComponent],
  templateUrl: './hashtag.component.html',
})
export class HashtagComponent implements OnInit {
  tagName = '';
  posts: Post[] = [];
  loading = false;
  hasMore = false;
  total = 0;
  page = 1;
  reportingPost: Post | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private postsService: PostsService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(({ name }) => {
      this.tagName = name;
      this.page = 1;
      this.posts = [];
      this.load();
    });
  }

  load(): void {
    this.loading = true;
    this.api.get<any>(`/hashtags/${this.tagName}/posts?page=${this.page}`).subscribe({
      next: (res) => {
        this.posts.push(...res.data);
        this.hasMore = res.meta.hasNext;
        this.total = res.meta.total;
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  loadMore(): void {
    this.page++;
    this.load();
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
