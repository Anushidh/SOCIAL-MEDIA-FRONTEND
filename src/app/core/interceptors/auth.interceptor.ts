import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// URLs that should never trigger a refresh attempt
const SKIP_REFRESH_URLS = ['/auth/login', '/auth/refresh', '/auth/register', '/auth/verify-email'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const authedReq = attachToken(req, authService.getToken());

  return next(authedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isSkipped = SKIP_REFRESH_URLS.some((url) => req.url.includes(url));

      if (error.status === 401 && !isSkipped) {
        return handle401(authedReq, next, authService);
      }

      return throwError(() => error);
    }),
  );
};

function attachToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  if (!token) return req;
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
) {
  // Ask backend to rotate the refresh token (cookie sent automatically)
  return authService.refreshAccessToken().pipe(
    switchMap((response) => {
      // Retry the original request with the new access token
      return next(attachToken(req, response.accessToken));
    }),
    catchError((refreshError) => {
      // Refresh failed — token is expired or revoked, force logout
      authService.clearLocalState();
      return throwError(() => refreshError);
    }),
  );
}
