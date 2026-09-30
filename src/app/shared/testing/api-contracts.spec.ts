import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../../core/config/app-config.token';
import { AlertsApiService } from '../../features/alerts/services/alerts-api.service';
import { AuditApiService } from '../../features/audit/services/audit-api.service';
import { CommunitiesApiService } from '../../features/communities/services/communities-api.service';
import { EventsApiService } from '../../features/events/services/events-api.service';
import { MonitoringApiService } from '../../features/monitoring/services/monitoring-api.service';
import { SensorsApiService } from '../../features/sensors/services/sensors-api.service';
import { UsersApiService } from '../../features/users/services/users-api.service';

describe('API service contracts', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), { provide: APP_CONFIG, useValue: { production: false, apiUrl: 'http://gateway.test', realtime: { enabled: false, hubUrl: '' } } }] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('sends sensor filters to Gateway including false status', () => {
    TestBed.inject(SensorsApiService).getAll({ communityId: 'c1', type: 'Smoke', isActive: false, code: 'SM', search: 'station' }).subscribe();
    const request = http.expectOne(req => req.url === 'http://gateway.test/api/sensors');
    expect(request.request.params.get('communityId')).toBe('c1');
    expect(request.request.params.get('type')).toBe('Smoke');
    expect(request.request.params.get('isActive')).toBe('false');
    expect(request.request.params.get('code')).toBe('SM');
    expect(request.request.params.get('search')).toBe('station');
    request.flush([]);
  });

  it('sends community geography and status filters to Gateway', () => {
    TestBed.inject(CommunitiesApiService).getAll({ municipality: 'Town', department: 'Region', isActive: true, search: 'North' }).subscribe();
    const request = http.expectOne(req => req.url === 'http://gateway.test/api/communities');
    expect(request.request.params.get('municipality')).toBe('Town');
    expect(request.request.params.get('department')).toBe('Region');
    expect(request.request.params.get('search')).toBe('North');
    expect(request.request.params.get('isActive')).toBe('true');
    request.flush([]);
  });

  it('sends user search and role filters without empty values', () => {
    TestBed.inject(UsersApiService).getAll({ search: '', role: 'Operator', isActive: false }).subscribe();
    const request = http.expectOne(req => req.url === 'http://gateway.test/api/users');
    expect(request.request.params.get('role')).toBe('Operator');
    expect(request.request.params.get('isActive')).toBe('false');
    expect(request.request.params.has('search')).toBe(false);
    request.flush([]);
  });

  it('builds all supported alert filters', () => {
    TestBed.inject(AlertsApiService).getAll({ riskType: 'Flood', alertLevel: 'Red', sensorId: 's1', communityId: 'c1', isActive: false }).subscribe();
    const request = http.expectOne(req => req.url === 'http://gateway.test/api/alerts');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('riskType')).toBe('Flood');
    expect(request.request.params.get('alertLevel')).toBe('Red');
    expect(request.request.params.get('sensorId')).toBe('s1');
    expect(request.request.params.get('communityId')).toBe('c1');
    expect(request.request.params.get('isActive')).toBe('false');
    request.flush([]);
  });

  it('resolves an alert with PATCH and no invented body', () => {
    TestBed.inject(AlertsApiService).resolve('a1').subscribe();
    const request = http.expectOne('http://gateway.test/api/alerts/a1/resolve');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toBeNull();
    request.flush(null);
  });

  it('sends event date filters as query parameters', () => {
    TestBed.inject(EventsApiService).getAll({ from: '2026-01-01T00:00:00Z', to: '2026-02-01T00:00:00Z', riskType: 'Storm' }).subscribe();
    const request = http.expectOne(req => req.url === 'http://gateway.test/api/events');
    expect(request.request.params.get('from')).toBe('2026-01-01T00:00:00Z');
    expect(request.request.params.get('to')).toBe('2026-02-01T00:00:00Z');
    expect(request.request.params.get('riskType')).toBe('Storm');
    request.flush([]);
  });

  it('sends audit filters without undefined values', () => {
    TestBed.inject(AuditApiService).getAll({ userId: 'u1', action: 'Update' }).subscribe();
    const request = http.expectOne(req => req.url === 'http://gateway.test/api/audit');
    expect(request.request.params.get('userId')).toBe('u1');
    expect(request.request.params.get('action')).toBe('Update');
    expect(request.request.params.has('resource')).toBe(false);
    request.flush([]);
  });

  it('creates and updates communities with their exact methods', () => {
    const api = TestBed.inject(CommunitiesApiService);
    const create = { name: 'Centro', description: null, latitude: 10, longitude: -90 };
    api.create(create).subscribe();
    const post = http.expectOne('http://gateway.test/api/communities');
    expect(post.request.method).toBe('POST'); expect(post.request.body).toEqual(create); post.flush({});
    api.update('c1', { ...create, isActive: false }).subscribe();
    const put = http.expectOne('http://gateway.test/api/communities/c1');
    expect(put.request.method).toBe('PUT'); expect(put.request.body.isActive).toBe(false); put.flush({});
  });

  it('uses the sensor lifecycle endpoints', () => {
    const api = TestBed.inject(SensorsApiService);
    api.activate('s1').subscribe();
    const activate = http.expectOne('http://gateway.test/api/sensors/s1/activate'); expect(activate.request.method).toBe('PATCH'); activate.flush(null);
    api.deactivate('s1').subscribe();
    const deactivate = http.expectOne('http://gateway.test/api/sensors/s1/deactivate'); expect(deactivate.request.method).toBe('PATCH'); deactivate.flush(null);
    api.delete('s1').subscribe();
    const remove = http.expectOne('http://gateway.test/api/sensors/s1'); expect(remove.request.method).toBe('DELETE'); remove.flush(null);
  });

  it('builds monitoring history and chart queries', () => {
    const api = TestBed.inject(MonitoringApiService);
    api.getHistory('s1', { communityId: 'c1', from: 'from', to: 'to' }).subscribe();
    const history = http.expectOne(req => req.url === 'http://gateway.test/api/monitoring/sensors/s1/history');
    expect(history.request.params.get('communityId')).toBe('c1'); expect(history.request.params.get('from')).toBe('from'); history.flush([]);
    api.getChart('s1', { interval: '15m' }).subscribe();
    const chart = http.expectOne(req => req.url === 'http://gateway.test/api/monitoring/sensors/s1/chart');
    expect(chart.request.params.get('interval')).toBe('15m'); chart.flush({});
  });

  it('posts simulation operations to exact endpoints', () => {
    const api = TestBed.inject(MonitoringApiService);
    api.startSimulation().subscribe();
    const start = http.expectOne('http://gateway.test/api/monitoring/simulation/start'); expect(start.request.method).toBe('POST'); start.flush({ isRunning: true });
    api.stopSimulation().subscribe();
    const stop = http.expectOne('http://gateway.test/api/monitoring/simulation/stop'); expect(stop.request.method).toBe('POST'); stop.flush({ isRunning: false });
    api.resetSimulation().subscribe();
    const reset = http.expectOne('http://gateway.test/api/monitoring/simulation/reset'); expect(reset.request.method).toBe('POST'); reset.flush({ isRunning: false });
  });

  it('updates user identity and status with separate endpoints', () => {
    const api = TestBed.inject(UsersApiService);
    api.update('u1', { username: 'operator', email: 'op@test.local', role: 'Operator' }).subscribe();
    const update = http.expectOne('http://gateway.test/api/users/u1'); expect(update.request.method).toBe('PUT'); expect(update.request.body.role).toBe('Operator'); update.flush({});
    api.updateStatus('u1', { isActive: false }).subscribe();
    const status = http.expectOne('http://gateway.test/api/users/u1/status'); expect(status.request.method).toBe('PATCH'); expect(status.request.body).toEqual({ isActive: false }); status.flush(null);
  });
});
