import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { AuthSession } from './auth-session.model';

const SESSION_KEY = 'climate-monitoring.session';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly platformId = inject(PLATFORM_ID);

  read(): AuthSession | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const serialized = localStorage.getItem(SESSION_KEY);
    if (!serialized) return null;

    try {
      const parsed: unknown = JSON.parse(serialized);
      return this.isSession(parsed) ? parsed : null;
    } catch {
      this.clear();
      return null;
    }
  }

  write(session: AuthSession): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  }

  clear(): void {
    if (isPlatformBrowser(this.platformId)) localStorage.removeItem(SESSION_KEY);
  }

  private isSession(value: unknown): value is AuthSession {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Partial<AuthSession>;
    return typeof candidate.accessToken === 'string'
      && typeof candidate.expiresAt === 'string'
      && !!candidate.user
      && typeof candidate.user.id === 'string';
  }
}
