import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, PaginatedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class UsersService {
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
    return this.api.get<User>(`/users/${username}`);
  }

  search(query: string, page = 1, limit = 20): Observable<PaginatedResponse<User>> {
    return this.api.get<PaginatedResponse<User>>(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  getSuggestedUsers(limit = 5): Observable<PaginatedResponse<User>> {
    return this.api.get<PaginatedResponse<User>>(`/users/suggested?limit=${limit}`);
  }

  follow(userId: string): Observable<any> {
    return this.api.post<any>(`/users/${userId}/follow`, {});
  }

  unfollow(userId: string): Observable<void> {
    return this.api.delete<void>(`/users/${userId}/follow`);
  }

  isFollowing(userId: string): Observable<{ isFollowing: boolean }> {
    return this.api.get<{ isFollowing: boolean }>(`/users/${userId}/follow/status`);
  }

  getFollowers(userId: string, page = 1): Observable<PaginatedResponse<any>> {
    return this.api.get<PaginatedResponse<any>>(`/users/${userId}/followers?page=${page}`);
  }

  getFollowing(userId: string, page = 1): Observable<PaginatedResponse<any>> {
    return this.api.get<PaginatedResponse<any>>(`/users/${userId}/following?page=${page}`);
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
}
