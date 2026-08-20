import { computed, inject, Injectable, signal } from '@angular/core';
import { SystemRole, UserResponse } from '../../shared/models/api/auth.models';
import { AuthSession } from './auth-session.model';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly storage = inject(TokenStorageService);
  private readonly sessionState = signal<AuthSession | null>(null);

  readonly session = this.sessionState.asReadonly();
  readonly accessToken = computed(() => this.sessionState()?.accessToken ?? null);
  readonly currentUser = computed(() => this.sessionState()?.user ?? null);
  readonly isAuthenticated = computed(() => this.hasValidSession(this.sessionState()));
  readonly role = computed(() => this.toSystemRole(this.currentUser()?.role));
  readonly isAdministrator = computed(() => this.role() === 'Administrator');
  readonly canOperate = computed(() => this.role() === 'Administrator' || this.role() === 'Operator');

  restoreSession(): void {
    const session = this.storage.read();
    if (this.hasValidSession(session)) this.sessionState.set(session);
    else this.clearSession();
  }

  setSession(session: AuthSession): void {
    this.storage.write(session);
    this.sessionState.set(session);
  }

  updateUser(user: UserResponse): void {
    const current = this.sessionState();
    if (current) this.setSession({ ...current, user });
  }

  clearSession(): void {
    this.storage.clear();
    this.sessionState.set(null);
  }

  hasAnyRole(roles: readonly SystemRole[]): boolean {
    const currentRole = this.role();
    return currentRole !== null && roles.includes(currentRole);
  }

  private hasValidSession(session: AuthSession | null): session is AuthSession {
    return !!session?.accessToken && Date.parse(session.expiresAt) > Date.now() && session.user.isActive;
  }

  private toSystemRole(role: string | null | undefined): SystemRole | null {
    return role === 'Administrator' || role === 'Operator' || role === 'Viewer' ? role : null;
  }
}
