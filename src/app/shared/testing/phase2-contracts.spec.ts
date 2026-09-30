import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../../core/config/app-config.token';
import { AlertRulesApiService } from '../../features/alert-rules/alert-rules-api.service';
import { AlertsApiService } from '../../features/alerts/services/alerts-api.service';
import { DashboardApiService } from '../../features/dashboard/dashboard-api.service';
import { EventsApiService } from '../../features/events/services/events-api.service';
import { MonitoringApiService } from '../../features/monitoring/services/monitoring-api.service';
import { routes } from '../../app.routes';

describe('Phase 2 Gateway contracts', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), { provide: APP_CONFIG, useValue: { apiUrl: 'http://gateway.test', realtime: { enabled: false } } }] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('saves rule bounds and preserves an explicit zero', () => {
    TestBed.inject(AlertRulesApiService).create({ name: 'Frost', sensorType: 'Temperature', minimumValue: 0, maximumValue: null, alertLevel: 'Red', riskType: 'Frost', message: 'Freezing', isActive: true }).subscribe();
    const req = http.expectOne('http://gateway.test/api/alert-rules');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.minimumValue).toBe(0);
    expect(req.request.body.maximumValue).toBeNull();
    req.flush({});
  });
  it('sends workflow actions and filters to Gateway', () => {
    const api = TestBed.inject(AlertsApiService);
    api.getAll({ status: 'Attended', from: '2026-09-01T00:00:00Z', to: '2026-09-30T00:00:00Z' }).subscribe();
    const list = http.expectOne(req => req.url.endsWith('/api/alerts'));
    expect(list.request.params.get('status')).toBe('Attended');
    expect(list.request.params.get('from')).toBe('2026-09-01T00:00:00Z');
    expect(list.request.params.get('to')).toBe('2026-09-30T00:00:00Z');
    list.flush([]);
    for (const action of ['attend', 'close'] as const) {
      api.transition('alert1', action).subscribe();
      const req = http.expectOne(`http://gateway.test/api/alerts/alert1/${action}`);
      expect(req.request.method).toBe('PATCH'); req.flush(null);
    }
  });
  it('queries bulk readings with community, dates and pagination', () => {
    TestBed.inject(MonitoringApiService).getReadings({ communityId: 'c1', sensorId: 's1', from: '2026-09-01T00:00:00Z', page: 2 }).subscribe();
    const req = http.expectOne(r => r.url.endsWith('/api/monitoring/readings'));
    expect(req.request.params.get('communityId')).toBe('c1');
    expect(req.request.params.get('sensorId')).toBe('s1');
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ items: [], total: 0, page: 2, pageSize: 100 });
  });
  it('changes simulated value separately from sensor metadata', () => {
    TestBed.inject(MonitoringApiService).setSimulatedValue('s1', 0).subscribe();
    const req = http.expectOne('http://gateway.test/api/monitoring/simulation/values/s1');
    expect(req.request.method).toBe('PUT'); expect(req.request.body).toEqual({ value: 0 }); req.flush({});
  });
  it('uses aggregate dashboard and statistics endpoints with community scope', () => {
    TestBed.inject(DashboardApiService).getSummary('c1').subscribe();
    const summary = http.expectOne('http://gateway.test/api/dashboard/summary?communityId=c1'); summary.flush({});
    TestBed.inject(EventsApiService).statistics({ communityId: 'c1', from: '2026-09-01T00:00:00Z' }).subscribe();
    const stats = http.expectOne(r => r.url.endsWith('/api/events/statistics'));
    expect(stats.request.params.get('communityId')).toBe('c1');
    expect(stats.request.params.get('from')).toBe('2026-09-01T00:00:00Z'); stats.flush({});
  });
  it('requires administrator role for creating and editing rules', () => {
    const children = routes.find(r => r.path === '')!.children!;
    for (const path of ['alert-rules/new', 'alert-rules/:id/edit']) {
      const route = children.find(r => r.path === path)!;
      expect(route.canActivate?.length).toBeGreaterThan(0);
      expect(route.data?.['roles']).toEqual(['Administrator']);
    }
  });
});
