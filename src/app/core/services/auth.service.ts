import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { AuthResponse, User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private api: ApiService,
    private router: Router,
  ) {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('current_user');
    if (token && user) {
      this.isAuthenticatedSubject.next(true);
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  register(data: { username: string; email: string; password: string; displayName?: string }): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', data).pipe(
      tap((response) => this.handleAuthSuccess(response)),
    );
  }

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', data).pipe(
      tap((response) => this.handleAuthSuccess(response)),
    );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/auth/forgot-password', { email });
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/auth/reset-password', { token, newPassword });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  updateCurrentUser(user: User): void {
    localStorage.setItem('current_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // Called after OAuth redirect
  handleOAuthToken(token: string): void {
    localStorage.setItem('access_token', token);
    this.isAuthenticatedSubject.next(true);
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem('access_token', response.accessToken);
    localStorage.setItem('current_user', JSON.stringify(response.user));
    this.isAuthenticatedSubject.next(true);
    this.currentUserSubject.next(response.user as User);
  }
}
