import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../auth/auth.store';
import { APP_CONFIG } from '../config/app-config.token';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const config = inject(APP_CONFIG);
  const token = inject(AuthStore).accessToken();
  const targetsGateway = request.url === config.apiUrl || request.url.startsWith(`${config.apiUrl}/`);
  return !token || !targetsGateway
    ? next(request)
    : next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
