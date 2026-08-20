import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthStore } from '../auth/auth.store';
import { authGuard } from './auth.guard';
import { guestGuard } from './guest.guard';
import { roleGuard } from './role.guard';

describe('route guards', () => {
  const urlTree = { redirected: true };
  const authStore = { isAuthenticated: vi.fn(), hasAnyRole: vi.fn() };
  const router = { createUrlTree: vi.fn(() => urlTree) };
  const state = { url: '/monitoring' } as RouterStateSnapshot;
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({ providers: [{ provide: AuthStore, useValue: authStore }, { provide: Router, useValue: router }] });
  });
  const run = (guard: typeof authGuard, route = { data: {} } as ActivatedRouteSnapshot) => TestBed.runInInjectionContext(() => guard(route, state));

  it('allows authenticated users', () => { authStore.isAuthenticated.mockReturnValue(true); expect(run(authGuard)).toBe(true); });
  it('redirects guests to login preserving returnUrl', () => { authStore.isAuthenticated.mockReturnValue(false); expect(run(authGuard)).toBe(urlTree); expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/monitoring' } }); });
  it('allows guests on guest routes', () => { authStore.isAuthenticated.mockReturnValue(false); expect(run(guestGuard)).toBe(true); });
  it('redirects authenticated users away from login', () => { authStore.isAuthenticated.mockReturnValue(true); expect(run(guestGuard)).toBe(urlTree); expect(router.createUrlTree).toHaveBeenCalledWith(['/dashboard']); });
  it('allows a matching role', () => { authStore.hasAnyRole.mockReturnValue(true); expect(run(roleGuard, { data: { roles: ['Administrator'] } } as unknown as ActivatedRouteSnapshot)).toBe(true); });
  it('redirects a mismatched role to forbidden', () => { authStore.hasAnyRole.mockReturnValue(false); expect(run(roleGuard, { data: { roles: ['Administrator'] } } as unknown as ActivatedRouteSnapshot)).toBe(urlTree); expect(router.createUrlTree).toHaveBeenCalledWith(['/forbidden']); });
});
