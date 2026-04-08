import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { SessionNotificationService } from '../services/session-notification.service';
import { environment } from '../../environments/environment';

let handlingAuthRedirect = false;

export const sessionAuthInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const sessionNotification = inject(SessionNotificationService);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        shouldHandleRequest(request.url)
      ) {
        if (!handlingAuthRedirect) {
          handlingAuthRedirect = true;
          sessionNotification.notifySessionExpired();
          const returnPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

          // Trigger a single login redirect preserving the current deep-link URL.
          window.setTimeout(() => {
            authService.login(returnPath);
          }, 700);

          // Safety reset for edge cases where redirect cannot be completed.
          window.setTimeout(() => {
            handlingAuthRedirect = false;
            sessionNotification.clear();
          }, 8000);
        }
      }

      return throwError(() => error);
    })
  );
};

function shouldHandleRequest(url: string): boolean {
  const apiPrefix = `${environment.apiBaseUrl}/api/`;
  if (!url.startsWith(apiPrefix)) {
    return false;
  }

  // Keep signup endpoint public and avoid auth redirect loops there.
  return !url.includes('/api/auth/signup');
}


