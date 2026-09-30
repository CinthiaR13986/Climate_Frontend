import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { buffer, debounceTime, filter, finalize, interval, Subscription } from 'rxjs';
import { ApiError } from '../../../core/http/api-error.model';
import { RealtimeService } from '../../../core/realtime/realtime.service';
import { AlertResponse } from '../../alerts/models/alert.models';
import { DashboardApiService, DashboardSummary } from '../dashboard-api.service';
import { SENSOR_TYPES, SensorReadingResponse, SensorType, SimulationStatusResponse } from '../../monitoring/models/monitoring.models';
import { SensorResponse } from '../../sensors/models/sensor.models';

export interface ClimateMetric { readonly type: SensorType; readonly reading: SensorReadingResponse | null; }

@Injectable()
export class DashboardStore {
  private readonly api = inject(DashboardApiService);
  private request?: Subscription;
  readonly communityId = signal('');
  readonly summary = signal<DashboardSummary | null>(null);
  readonly communities = computed(() => this.summary()?.communities ?? []);
  readonly communityCount = computed(() => this.summary()?.communityCount ?? 0);
  readonly chartSeries = computed(() => {
    const points = this.summary()?.evolution ?? [];
    const keys = [...new Set(points.map(p => `${p.sensorType}|${p.unit}`))];
    return keys.map(key => { const rows = points.filter(p => `${p.sensorType}|${p.unit}` === key); return { type: rows[0].sensorType, sensorId: key, unit: rows[0].unit, data: rows.map(p => ({ timestamp: p.timestamp, value: p.value })) }; });
  });
  readonly byLevel = computed(() => Object.entries(this.summary()?.byAlertLevel ?? {}));
  selectCommunity(id: string): void { this.communityId.set(id); this.request?.unsubscribe(); this.loading.set(false); this.readingsState.set([]); this.alertsState.set([]); this.sensorsState.set([]); this.load(); }
  private readonly realtime = inject(RealtimeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly readingsState = signal<readonly SensorReadingResponse[]>([]);
  private readonly sensorsState = signal<readonly SensorResponse[]>([]);
  private readonly alertsState = signal<readonly AlertResponse[]>([]);
  private readonly simulationState = signal<SimulationStatusResponse | null>(null);
  private realtimeBound = false;

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly readings = this.readingsState.asReadonly();
  readonly sensors = this.sensorsState.asReadonly();
  readonly alerts = this.alertsState.asReadonly();
  readonly simulation = this.simulationState.asReadonly();
  readonly activeSensorCount = computed(() => this.sensorsState().filter(sensor => sensor.isActive).length);
  readonly inactiveSensorCount = computed(() => this.sensorsState().length - this.activeSensorCount());
  readonly metrics = computed<readonly ClimateMetric[]>(() => SENSOR_TYPES.map(type => ({ type, reading: this.latestByType(type) })));
  readonly lastUpdatedAt = computed(() => this.readingsState().reduce<string | null>((latest, reading) =>
    !latest || Date.parse(reading.recordedAt) > Date.parse(latest) ? reading.recordedAt : latest, null));

  load(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    const communityId = this.communityId();
    this.request = this.api.getSummary(communityId || undefined).pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => {
        this.summary.set(result); this.readingsState.set(result.readings);
        this.simulationState.set(result.simulation); this.alertsState.set(result.alerts); this.sensorsState.set(result.sensors);
      },
      error: (error: unknown) => this.error.set(error instanceof ApiError ? error.message : 'No fue posible cargar el dashboard.'),
    });
    this.bindRealtime();
  }

  private bindRealtime(): void {
    if (this.realtimeBound) return;
    this.realtimeBound = true;
    interval(30000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.load());

    const readingUpdates = this.realtime.readingUpdated$;
    readingUpdates.pipe(
      buffer(readingUpdates.pipe(debounceTime(500))),
      filter(readings => readings.length > 0),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(readings => this.readingsState.update(items => {
      const readingsBySensor = new Map(items.map(reading => [reading.sensorId, reading]));
      readings.filter(r => !this.communityId() || r.communityId === this.communityId()).forEach(reading => readingsBySensor.set(reading.sensorId, reading));
      return [...readingsBySensor.values()];
    }));
    this.realtime.alertGenerated$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(alert => { this.alertsState.update(items => { const rest = items.filter(item => item.id !== alert.id); return alert.isActive && (!this.communityId() || alert.communityId === this.communityId()) ? [alert, ...rest] : rest; }); this.load(); });
    this.realtime.sensorStatusChanged$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(status => this.sensorsState.update(items => items.map(sensor => sensor.id === status.id ? { ...sensor, isActive: status.isActive } : sensor)));
    this.realtime.systemReset$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(status => { this.simulationState.set(status); this.readingsState.set([]); });
  }

  private latestByType(type: SensorType): SensorReadingResponse | null {
    return this.readingsState().filter(reading => reading.sensorType === type).reduce<SensorReadingResponse | null>(
      (latest, reading) => !latest || Date.parse(reading.recordedAt) > Date.parse(latest.recordedAt) ? reading : latest,
      null,
    );
  }
}
