import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Post } from '../../../core/models';
import { AvatarComponent } from '../avatar/avatar.component';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterLink, AvatarComponent, TimeAgoPipe],
  templateUrl: './post-card.component.html',
})
export class PostCardComponent {
  @Input() post!: Post;
  @Output() liked = new EventEmitter<Post>();
  @Output() bookmarked = new EventEmitter<Post>();
  @Output() reposted = new EventEmitter<Post>();
  @Output() reported = new EventEmitter<Post>();

  onLike(): void { this.liked.emit(this.post); }
  onBookmark(): void { this.bookmarked.emit(this.post); }
  onRepost(): void { this.reposted.emit(this.post); }
  onReport(): void { this.reported.emit(this.post); }
}
