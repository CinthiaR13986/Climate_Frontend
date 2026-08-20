import { TestBed } from '@angular/core/testing';
import { UserResponse } from '../../shared/models/api/auth.models';
import { AuthSession } from './auth-session.model';
import { AuthStore } from './auth.store';
import { TokenStorageService } from './token-storage.service';

const user: UserResponse = { id: 'u1', username: 'admin', email: 'admin@test.local', role: 'Administrator', isActive: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' };
const validSession: AuthSession = { accessToken: 'token', expiresAt: '2999-01-01T00:00:00Z', user };

describe('AuthStore', () => {
  const storage = { read: vi.fn(), write: vi.fn(), clear: vi.fn() };
  let store: AuthStore;
  beforeEach(() => {
    vi.clearAllMocks();
    storage.read.mockReturnValue(null);
    TestBed.configureTestingModule({ providers: [AuthStore, { provide: TokenStorageService, useValue: storage }] });
    store = TestBed.inject(AuthStore);
  });

  it('persists a valid session and exposes its user', () => {
    store.setSession(validSession);
    expect(storage.write).toHaveBeenCalledWith(validSession);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.currentUser()).toEqual(user);
  });

  it('derives administrator and operator permissions', () => {
    store.setSession(validSession);
    expect(store.isAdministrator()).toBe(true);
    expect(store.canOperate()).toBe(true);
    expect(store.hasAnyRole(['Administrator'])).toBe(true);
  });

  it('does not grant operation permissions to Viewer', () => {
    store.setSession({ ...validSession, user: { ...user, role: 'Viewer' } });
    expect(store.isAdministrator()).toBe(false);
    expect(store.canOperate()).toBe(false);
  });

  it('restores a valid stored session', () => {
    storage.read.mockReturnValue(validSession);
    store.restoreSession();
    expect(store.accessToken()).toBe('token');
  });

  it('clears an expired stored session', () => {
    storage.read.mockReturnValue({ ...validSession, expiresAt: '2000-01-01T00:00:00Z' });
    store.restoreSession();
    expect(storage.clear).toHaveBeenCalled();
    expect(store.isAuthenticated()).toBe(false);
  });

  it('updates the current user while preserving the token', () => {
    store.setSession(validSession);
    store.updateUser({ ...user, username: 'updated' });
    expect(store.accessToken()).toBe('token');
    expect(store.currentUser()?.username).toBe('updated');
  });
});
