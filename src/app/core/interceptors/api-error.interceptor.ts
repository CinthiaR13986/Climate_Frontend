import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../auth/auth.store';
import { ProblemDetailsService } from '../http/problem-details.service';
import { ToastService } from '../notifications/toast.service';

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const authStore = inject(AuthStore);
  const problemDetails = inject(ProblemDetailsService);
  const router = inject(Router);
  const toast = inject(ToastService);
  return next(request).pipe(catchError((error: unknown) => {
    if (!(error instanceof HttpErrorResponse)) return throwError(() => error);
    const apiError = problemDetails.fromHttpError(error);
    if (error.status === 401 && authStore.accessToken()) {
      authStore.clearSession();
      void router.navigate(['/login']);
    } else if (error.status === 403) toast.show(apiError.message, 'error');
    return throwError(() => apiError);
  }));
};
