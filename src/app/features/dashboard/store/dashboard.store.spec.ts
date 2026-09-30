import { TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { RealtimeService } from '../../../core/realtime/realtime.service';
import { AlertResponse } from '../../alerts/models/alert.models';
import { DashboardApiService, DashboardSummary } from '../dashboard-api.service';
import { SensorReadingResponse, SimulationStatusResponse } from '../../monitoring/models/monitoring.models';
import { DashboardStore } from './dashboard.store';

describe('DashboardStore', () => {
  const readingUpdated = new Subject<SensorReadingResponse>();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DashboardStore,
        { provide: DashboardApiService, useValue: { getSummary: () => of(emptySummary()) } },
        {
          provide: RealtimeService,
          useValue: {
            readingUpdated$: readingUpdated.asObservable(),
            alertGenerated$: new Subject<AlertResponse>(),
            sensorStatusChanged$: new Subject<{ id: string; isActive: boolean }>(),
            systemReset$: new Subject<SimulationStatusResponse>(),
          },
        },
      ],
    });
  });

  it('applies a realtime readings batch in a single buffered update', async () => {
    vi.useFakeTimers();
    const store = TestBed.inject(DashboardStore);
    store.load();

    readingUpdated.next(createReading('sensor-1', 20));
    readingUpdated.next(createReading('sensor-2', 25));

    expect(store.readings()).toEqual([]);
    await vi.advanceTimersByTimeAsync(500);
    expect(store.readings().map(reading => reading.value)).toEqual([20, 25]);
    vi.useRealTimers();
  });

  it('keeps realtime readings inside the selected community', async () => {
    vi.useFakeTimers();
    const store = TestBed.inject(DashboardStore);
    store.selectCommunity('community-1');
    readingUpdated.next(createReading('inside', 20));
    readingUpdated.next({ ...createReading('outside', 99), communityId: 'community-2' });
    await vi.advanceTimersByTimeAsync(500);
    expect(store.readings().map(x => x.sensorId)).toEqual(['inside']);
    vi.useRealTimers();
  });

  it('binds realtime only once when the dashboard reloads', () => {
    const store = TestBed.inject(DashboardStore);
    store.load();
    const observerCount = readingUpdated.observers.length;
    store.load();

    expect(observerCount).toBeGreaterThan(0);
    expect(readingUpdated.observers).toHaveLength(observerCount);
  });
});

function createReading(sensorId: string, value: number): SensorReadingResponse {
  return {
    id: `reading-${sensorId}`,
    sensorId,
    communityId: 'community-1',
    sensorType: 'Temperature',
    value,
    unit: '°C',
    recordedAt: '2026-08-20T00:00:00Z',
  };
}

function emptySummary(): DashboardSummary { return { communityCount: 0, activeSensorCount: 0, inactiveSensorCount: 0, activeAlertCount: 0, byAlertLevel: {}, communities: [], sensors: [], alerts: [], readings: [], simulation: { isRunning: true }, events: { total: 0, byRiskType: {}, byAlertLevel: {}, byStatus: {} }, evolution: [] }; }
