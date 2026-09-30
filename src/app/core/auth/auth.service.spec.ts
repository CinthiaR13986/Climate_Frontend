import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { APP_CONFIG } from '../config/app-config.token';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { RealtimeService } from '../realtime/realtime.service';
import { AuthService } from './auth.service';
import { AuthStore } from './auth.store';
import { TokenStorageService } from './token-storage.service';

describe('audited logout', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(),
      { provide: APP_CONFIG, useValue: { apiUrl: 'http://gateway.test' } },
      { provide: Router, useValue: { navigate: vi.fn() } },
      { provide: RealtimeService, useValue: { stop: vi.fn() } },
      { provide: TokenStorageService, useValue: { read: vi.fn(), write: vi.fn(), clear: vi.fn() } },
    ] });
    TestBed.inject(AuthStore).setSession({ accessToken: 'token', expiresAt: '2999-01-01T00:00:00Z', user: {
      id: 'u1', username: 'admin', email: 'admin@test.local', role: 'Administrator', isActive: true, createdAt: '', updatedAt: '',
    } });
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  for (const failed of [false, true]) {
    it(`sends the JWT before clearing local session (server failure: ${failed})`, () => {
      TestBed.inject(AuthService).logout();
      const request = TestBed.inject(HttpTestingController).expectOne('http://gateway.test/api/auth/logout');
      expect(request.request.method).toBe('POST');
      expect(request.request.headers.get('Authorization')).toBe('Bearer token');
      if (failed) request.flush({}, { status: 503, statusText: 'Unavailable' });
      else request.flush(null);
      expect(TestBed.inject(AuthStore).accessToken()).toBeNull();
    });
  }
});
