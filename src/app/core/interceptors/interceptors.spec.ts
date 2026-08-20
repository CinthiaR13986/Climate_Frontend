import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../auth/auth.store';
import { APP_CONFIG } from '../config/app-config.token';
import { ApiError } from '../http/api-error.model';
import { ProblemDetailsService } from '../http/problem-details.service';
import { ToastService } from '../notifications/toast.service';
import { apiErrorInterceptor } from './api-error.interceptor';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let http: HttpTestingController;
  const authStore = { accessToken: vi.fn(() => 'secret') };
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(), { provide: APP_CONFIG, useValue: { apiUrl: 'http://gateway.test' } }, { provide: AuthStore, useValue: authStore }] });
    httpClient = TestBed.inject(HttpClient); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('adds Bearer only to Gateway requests', () => {
    httpClient.get('http://gateway.test/api/sensors').subscribe();
    const request = http.expectOne('http://gateway.test/api/sensors');
    expect(request.request.headers.get('Authorization')).toBe('Bearer secret');
    request.flush([]);
  });

  it('does not leak the token to another origin', () => {
    httpClient.get('https://external.test/data').subscribe();
    const request = http.expectOne('https://external.test/data');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });
});

describe('apiErrorInterceptor', () => {
  let httpClient: HttpClient;
  let http: HttpTestingController;
  const authStore = { accessToken: vi.fn(() => 'secret'), clearSession: vi.fn() };
  const router = { navigate: vi.fn() };
  const toast = { show: vi.fn() };
  const normalized = new ApiError('Acceso denegado.', 403);
  const problems = { fromHttpError: vi.fn(() => normalized) };
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptors([apiErrorInterceptor])), provideHttpClientTesting(), { provide: AuthStore, useValue: authStore }, { provide: Router, useValue: router }, { provide: ToastService, useValue: toast }, { provide: ProblemDetailsService, useValue: problems }] });
    httpClient = TestBed.inject(HttpClient); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('clears the session and redirects on authenticated 401', async () => {
    const result = firstValueFrom(httpClient.get('/private')).catch(error => error as ApiError);
    http.expectOne('/private').flush({}, { status: 401, statusText: 'Unauthorized' });
    await result;
    expect(authStore.clearSession).toHaveBeenCalledOnce();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('keeps the session and shows a toast on 403', async () => {
    const result = firstValueFrom(httpClient.get('/admin')).catch(error => error as ApiError);
    http.expectOne('/admin').flush({}, { status: 403, statusText: 'Forbidden' });
    await result;
    expect(authStore.clearSession).not.toHaveBeenCalled();
    expect(toast.show).toHaveBeenCalledWith('Acceso denegado.', 'error');
  });

  it('rethrows the normalized ApiError', async () => {
    const result = firstValueFrom(httpClient.get('/failed')).catch(error => error as ApiError);
    http.expectOne('/failed').flush({}, { status: 500, statusText: 'Error' });
    expect(await result).toBe(normalized);
  });
});
