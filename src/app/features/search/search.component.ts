import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, forkJoin } from 'rxjs';
import { UsersService } from '../../core/services/users.service';
import { PostsService } from '../../core/services/posts.service';
import { ToastService } from '../../core/services/toast.service';
import { User, Post } from '../../core/models';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { PostCardComponent } from '../../shared/components/post-card/post-card.component';
import { ReportModalComponent } from '../../shared/components/report-modal/report-modal.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AvatarComponent, PostCardComponent, ReportModalComponent],
  templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit {
  query = '';
  users: User[] = [];
  posts: Post[] = [];
  loading = false;
  activeTab: 'users' | 'posts' = 'users';
  reportingPost: Post | null = null;

  tabs = [
    { key: 'users' as const, label: 'People' },
    { key: 'posts' as const, label: 'Posts' },
  ];

  private searchSubject = new Subject<string>();

  constructor(
    private usersService: UsersService,
    private postsService: PostsService,
    private toast: ToastService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe((q) => this.doSearch(q));

    // Support ?q= and ?tag= query params
    this.route.queryParams.subscribe((params) => {
      if (params['q']) {
        this.query = params['q'];
        this.doSearch(this.query);
      } else if (params['tag']) {
        this.query = '#' + params['tag'];
        this.activeTab = 'posts';
        this.doSearch(this.query);
      }
    });
  }

  onSearch(value: string): void {
    if (value.trim().length >= 2) {
      this.searchSubject.next(value.trim());
    } else {
      this.users = [];
      this.posts = [];
    }
  }

  clearSearch(): void {
    this.query = '';
    this.users = [];
    this.posts = [];
  }

  doSearch(q: string): void {
    if (!q || q.trim().length < 2) return;
    this.loading = true;

    const trimmed = q.trim();
    const isHashtag = trimmed.startsWith('#');
    const hashtagName = isHashtag ? trimmed.slice(1) : null;

    if (isHashtag && hashtagName) {
      // Hashtag search — only show posts
      this.activeTab = 'posts';
      this.users = [];
      this.postsService.getPostsByHashtag(hashtagName).subscribe({
        next: (res) => { this.posts = res.data; this.loading = false; },
        error: () => { this.loading = false; },
      });
    } else {
      // General search — fetch users and posts in parallel
      forkJoin({
        users: this.usersService.search(trimmed),
        posts: this.postsService.getExplore(1, 20),
      }).subscribe({
        next: ({ users, posts }) => {
          this.users = users.data;
          // Client-side filter posts by content
          this.posts = posts.data.filter((p) =>
            p.content?.toLowerCase().includes(trimmed.toLowerCase()),
          );
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
    }
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
      this.postsService.bookmark(post.id).subscribe(() => {
        post.isBookmarked = true;
        this.toast.success('Saved');
      });
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
