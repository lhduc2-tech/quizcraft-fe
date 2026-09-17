import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

const TOKEN_KEY = 'quizcraft_token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);
  const toast = inject(ToastService);

  // Directly read token from localStorage to break NG0200 circular dependency during app init
  const token = localStorage.getItem(TOKEN_KEY);

  let modifiedReq = req;
  if (token) {
    modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Don't auto-logout for auth endpoints themselves (e.g. login failed with 401)
      if (
        error.status === 401 && 
        !req.url.includes('/api/auth/login') && 
        !req.url.includes('/api/auth/register') &&
        !req.url.includes('/api/auth/config')
      ) {
        try {
          const authService = injector.get(AuthService);
          authService.clearSession();
          toast.show('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!', 'warning');
          authService.openAuthModal();
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('quizcraft_user');
        }
      }
      return throwError(() => error);
    })
  );
};
