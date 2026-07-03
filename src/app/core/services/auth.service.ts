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
    // Rehydrate state on page reload
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

  // ─── Registration & OTP ───────────────────────────────────────────────────

  register(data: { username: string; email: string; password: string; displayName?: string }): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/auth/register', data);
  }

  verifyEmail(email: string, otp: string): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/verify-email', { email, otp }).pipe(
      tap((response) => this.handleAuthSuccess(response)),
    );
  }

  resendOtp(email: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/auth/resend-otp', { email });
  }

  // ─── Login & Tokens ───────────────────────────────────────────────────────

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', data).pipe(
      tap((response) => this.handleAuthSuccess(response)),
    );
  }

  /**
   * Called by the auth interceptor when a 401 is received.
   * The HttpOnly cookie is sent automatically by the browser.
   * Returns the new access token on success.
   */
  refreshAccessToken(): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/refresh', {}).pipe(
      tap((response) => {
        localStorage.setItem('access_token', response.accessToken);
      }),
    );
  }

  logout(): void {
    // Tell backend to revoke the refresh token + clear the cookie
    this.api.post<void>('/auth/logout', {}).subscribe({ error: () => {} });
    this.clearLocalState();
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  updateCurrentUser(user: User): void {
    localStorage.setItem('current_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  clearLocalState(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  // Called after OAuth redirect — only access token comes via URL
  handleOAuthToken(token: string): void {
    localStorage.setItem('access_token', token);
    this.isAuthenticatedSubject.next(true);
  }

  // ─── Password Reset ───────────────────────────────────────────────────────

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/auth/forgot-password', { email });
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/auth/reset-password', { token, newPassword });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem('access_token', response.accessToken);
    localStorage.setItem('current_user', JSON.stringify(response.user));
    this.isAuthenticatedSubject.next(true);
    this.currentUserSubject.next(response.user as User);
  }
}
