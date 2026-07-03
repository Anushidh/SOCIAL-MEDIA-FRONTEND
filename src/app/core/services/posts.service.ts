import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Post, PaginatedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class PostsService {
  constructor(private api: ApiService) {}

  getFeed(page = 1, limit = 20): Observable<PaginatedResponse<Post>> {
    return this.api.get<PaginatedResponse<Post>>(`/posts/feed?page=${page}&limit=${limit}`);
  }

  getExplore(page = 1, limit = 20): Observable<PaginatedResponse<Post>> {
    return this.api.get<PaginatedResponse<Post>>(`/posts/explore?page=${page}&limit=${limit}`);
  }

  getById(id: string): Observable<Post> {
    return this.api.get<Post>(`/posts/${id}`);
  }

  getUserPosts(userId: string, page = 1, limit = 20): Observable<PaginatedResponse<Post>> {
    return this.api.get<PaginatedResponse<Post>>(`/posts/user/${userId}?page=${page}&limit=${limit}`);
  }

  create(data: { content: string; imageUrls?: string[] }): Observable<Post> {
    return this.api.post<Post>('/posts', data);
  }

  createWithImages(formData: FormData): Observable<Post> {
    return this.api.postFormData<Post>('/posts/with-images', formData);
  }

  update(id: string, data: { content: string }): Observable<Post> {
    return this.api.patch<Post>(`/posts/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/posts/${id}`);
  }

  like(postId: string): Observable<any> {
    return this.api.post<any>(`/posts/${postId}/likes`, {});
  }

  unlike(postId: string): Observable<void> {
    return this.api.delete<void>(`/posts/${postId}/likes`);
  }

  isLiked(postId: string): Observable<{ liked: boolean }> {
    return this.api.get<{ liked: boolean }>(`/posts/${postId}/likes/status`);
  }

  bookmark(postId: string): Observable<any> {
    return this.api.post<any>(`/posts/${postId}/bookmark`, {});
  }

  removeBookmark(postId: string): Observable<void> {
    return this.api.delete<void>(`/posts/${postId}/bookmark`);
  }

  getBookmarks(page = 1, limit = 20): Observable<PaginatedResponse<any>> {
    return this.api.get<PaginatedResponse<any>>(`/posts/bookmarks?page=${page}&limit=${limit}`);
  }

  repost(postId: string): Observable<any> {
    return this.api.post<any>(`/posts/${postId}/reposts`, {});
  }

  removeRepost(postId: string): Observable<void> {
    return this.api.delete<void>(`/posts/${postId}/reposts`);
  }

  reportPost(entityId: string, entityType: string, reason: string, description?: string): Observable<any> {
    return this.api.post<any>('/reports', { entityId, entityType, reason, description });
  }

  getPostsByHashtag(name: string, page = 1, limit = 20): Observable<PaginatedResponse<Post>> {
    return this.api.get<PaginatedResponse<Post>>(`/hashtags/${name}/posts?page=${page}&limit=${limit}`);
  }
}
