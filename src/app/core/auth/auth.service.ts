import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { LoginRequest, UserResponse } from '../../shared/models/api/auth.models';
import { AuthApiService } from './auth-api.service';
import { AuthStore } from './auth.store';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(AuthApiService);
  private readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly realtime = inject(RealtimeService);

  login(request: LoginRequest): Observable<UserResponse> {
    return this.api.login(request).pipe(
      tap(response => {
        if (!response.accessToken) throw new Error('La respuesta de autenticación no contiene un token.');
        this.store.setSession({ accessToken: response.accessToken, expiresAt: response.expiresAt, user: response.user });
      }),
      map(response => response.user),
    );
  }

  logout(redirect = true): void {
    this.realtime.stop();
    this.store.clearSession();
    if (redirect) void this.router.navigate(['/login']);
  }
}
