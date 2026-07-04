import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User, PaginatedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private profileCache = new Map<string, Observable<User>>();
  private suggestedUsersCache$: Observable<PaginatedResponse<User>> | null = null;

  constructor(private api: ApiService) {}

  getMe(): Observable<User> {
    return this.api.get<User>('/users/me');
  }

  updateMe(data: Partial<User>): Observable<User> {
    return this.api.patch<User>('/users/me', data);
  }

  uploadAvatar(formData: FormData): Observable<{ avatarUrl: string }> {
    return this.api.postFormData<{ avatarUrl: string }>('/users/me/avatar', formData);
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<void> {
    return this.api.post<void>('/users/me/change-password', data);
  }

  getProfile(username: string): Observable<User> {
    if (!this.profileCache.has(username)) {
      const request = this.api.get<User>(`/users/${username}`).pipe(shareReplay(1));
      this.profileCache.set(username, request);
    }
    return this.profileCache.get(username)!;
  }

  search(query: string, page = 1, limit = 20): Observable<PaginatedResponse<User>> {
    return this.api.get<PaginatedResponse<User>>(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  getSuggestedUsers(limit = 5): Observable<PaginatedResponse<User>> {
    if (!this.suggestedUsersCache$) {
      this.suggestedUsersCache$ = this.api.get<PaginatedResponse<User>>(`/users/suggested?limit=${limit}`).pipe(
        shareReplay(1)
      );
    }
    return this.suggestedUsersCache$;
  }

  follow(userId: string): Observable<any> {
    return this.api.post<any>(`/users/${userId}/follow`, {});
  }

  unfollow(userId: string): Observable<void> {
    return this.api.delete<void>(`/users/${userId}/follow`);
  }

  isFollowing(userId: string): Observable<{ isFollowing: boolean; isRequested: boolean }> {
    return this.api.get<{ isFollowing: boolean; isRequested: boolean }>(`/users/${userId}/follow/status`);
  }

  isBlocked(userId: string): Observable<{ isBlocked: boolean }> {
    return this.api.get<{ isBlocked: boolean }>(`/users/${userId}/block/status`);
  }

  getFollowers(userId: string, page = 1): Observable<PaginatedResponse<any>> {
    return this.api.get<PaginatedResponse<any>>(`/users/${userId}/followers?page=${page}`);
  }

  getFollowing(userId: string, page = 1): Observable<PaginatedResponse<any>> {
    return this.api.get<PaginatedResponse<any>>(`/users/${userId}/following?page=${page}`);
  }

  getFollowRequests(page = 1, limit = 20): Observable<PaginatedResponse<any>> {
    return this.api.get<PaginatedResponse<any>>(`/users/me/follow-requests?page=${page}&limit=${limit}`);
  }

  acceptFollowRequest(requestId: string): Observable<any> {
    return this.api.post<any>(`/users/follow-requests/${requestId}/accept`, {});
  }

  denyFollowRequest(requestId: string): Observable<void> {
    return this.api.post<void>(`/users/follow-requests/${requestId}/deny`, {});
  }

  deactivateMe(): Observable<void> {
    return this.api.delete<void>('/users/me');
  }

  blockUser(userId: string): Observable<any> {
    return this.api.post<any>(`/users/${userId}/block`, {});
  }

  unblockUser(userId: string): Observable<void> {
    return this.api.delete<void>(`/users/${userId}/block`);
  }

  getBlockedUsers(page = 1, limit = 20): Observable<PaginatedResponse<any>> {
    return this.api.get<PaginatedResponse<any>>(`/users/me/blocked?page=${page}&limit=${limit}`);
  }
}
