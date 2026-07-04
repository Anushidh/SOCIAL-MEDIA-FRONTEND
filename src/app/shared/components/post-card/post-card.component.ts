import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Post } from '../../../core/models';
import { AvatarComponent } from '../avatar/avatar.component';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterLink, AvatarComponent, TimeAgoPipe, NgOptimizedImage, ConfirmModalComponent],
  templateUrl: './post-card.component.html',
})
export class PostCardComponent {
  @Input() post!: Post;
  /** The logged-in user's id — used to hide own-post actions */
  @Input() currentUserId?: string;
  @Output() liked = new EventEmitter<Post>();
  @Output() bookmarked = new EventEmitter<Post>();
  @Output() reposted = new EventEmitter<Post>();
  @Output() reported = new EventEmitter<Post>();
  @Output() deleted = new EventEmitter<Post>();

  menuOpen = false;
  showDeleteConfirm = false;

  get isOwnPost(): boolean {
    return !!this.currentUserId && this.post.authorId === this.currentUserId;
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.menuOpen = false;
  }

  onLike(): void { this.liked.emit(this.post); }
  onBookmark(): void { this.bookmarked.emit(this.post); }
  onRepost(): void { this.reposted.emit(this.post); }

  onReport(): void {
    if (this.isOwnPost || this.post.isReported) return;
    this.reported.emit(this.post);
  }

  onDelete(): void {
    this.menuOpen = false;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    this.showDeleteConfirm = false;
    this.deleted.emit(this.post);
  }
}
