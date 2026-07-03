import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostsService } from '../../../core/services/posts.service';
import { CommentsService } from '../../../core/services/comments.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Post, Comment } from '../../../core/models';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AvatarComponent, TimeAgoPipe],
  templateUrl: './post-detail.component.html',
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null;
  comments: Comment[] = [];
  commentInput = '';
  replyInput = '';
  replyingTo: Comment | null = null;
  submitting = false;

  get currentUser() { return this.authService.currentUser; }

  constructor(
    private route: ActivatedRoute,
    private postsService: PostsService,
    private commentsService: CommentsService,
    private authService: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(({ id }) => {
      this.postsService.getById(id).subscribe((post) => {
        this.post = post;
        this.comments = post.comments ?? [];
      });
    });
  }

  toggleLike(): void {
    if (!this.post) return;
    if (this.post.isLiked) {
      this.postsService.unlike(this.post.id).subscribe(() => { this.post!.isLiked = false; this.post!.likesCount--; });
    } else {
      this.postsService.like(this.post.id).subscribe(() => { this.post!.isLiked = true; this.post!.likesCount++; });
    }
  }

  addComment(): void {
    if (!this.post || !this.commentInput.trim()) return;
    this.submitting = true;
    this.commentsService.addComment(this.post.id, this.commentInput).subscribe({
      next: (comment) => {
        this.comments.unshift(comment);
        this.commentInput = '';
        this.submitting = false;
        this.post!.commentsCount++;
      },
      error: () => this.submitting = false,
    });
  }

  addReply(): void {
    if (!this.post || !this.replyingTo || !this.replyInput.trim()) return;
    this.commentsService.addComment(this.post.id, this.replyInput, this.replyingTo.id).subscribe({
      next: (reply) => {
        const parent = this.comments.find((c) => c.id === this.replyingTo!.id);
        if (parent) {
          parent.replies = parent.replies ?? [];
          parent.replies.push(reply);
        }
        this.replyInput = '';
        this.replyingTo = null;
        this.post!.commentsCount++;
      },
    });
  }

  deleteComment(comment: Comment): void {
    if (!this.post) return;
    this.commentsService.deleteComment(this.post.id, comment.id).subscribe(() => {
      this.comments = this.comments.filter((c) => c.id !== comment.id);
      this.post!.commentsCount--;
    });
  }
}
