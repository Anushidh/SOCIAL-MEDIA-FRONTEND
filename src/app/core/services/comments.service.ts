import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Comment, PaginatedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  constructor(private api: ApiService) {}

  getComments(postId: string, page = 1): Observable<PaginatedResponse<Comment>> {
    return this.api.get<PaginatedResponse<Comment>>(`/posts/${postId}/comments?page=${page}`);
  }

  addComment(postId: string, content: string, parentId?: string): Observable<Comment> {
    return this.api.post<Comment>(`/posts/${postId}/comments`, { content, parentId });
  }

  updateComment(postId: string, commentId: string, content: string): Observable<Comment> {
    return this.api.patch<Comment>(`/posts/${postId}/comments/${commentId}`, { content });
  }

  deleteComment(postId: string, commentId: string): Observable<void> {
    return this.api.delete<void>(`/posts/${postId}/comments/${commentId}`);
  }

  getReplies(postId: string, commentId: string, page = 1): Observable<PaginatedResponse<Comment>> {
    return this.api.get<PaginatedResponse<Comment>>(`/posts/${postId}/comments/${commentId}/replies?page=${page}`);
  }
}
