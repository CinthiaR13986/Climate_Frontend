import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { buffer, debounceTime, filter, finalize, forkJoin } from 'rxjs';
import { ApiError } from '../../../core/http/api-error.model';
import { RealtimeService } from '../../../core/realtime/realtime.service';
import { AlertResponse } from '../../alerts/models/alert.models';
import { AlertsApiService } from '../../alerts/services/alerts-api.service';
import { SENSOR_TYPES, SensorReadingResponse, SensorType, SimulationStatusResponse } from '../../monitoring/models/monitoring.models';
import { MonitoringApiService } from '../../monitoring/services/monitoring-api.service';
import { SensorResponse } from '../../sensors/models/sensor.models';
import { SensorsApiService } from '../../sensors/services/sensors-api.service';

export interface ClimateMetric { readonly type: SensorType; readonly reading: SensorReadingResponse | null; }

@Injectable()
export class DashboardStore {
  private readonly monitoringApi = inject(MonitoringApiService);
  private readonly sensorsApi = inject(SensorsApiService);
  private readonly alertsApi = inject(AlertsApiService);
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
    forkJoin({
      readings: this.monitoringApi.getCurrent(),
      simulation: this.monitoringApi.getSimulationStatus(),
      alerts: this.alertsApi.getAll({ isActive: true }),
      sensors: this.sensorsApi.getAll(),
    }).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: result => {
        this.readingsState.set(result.readings);
        this.simulationState.set(result.simulation);
        this.alertsState.set(result.alerts);
        this.sensorsState.set(result.sensors);
      },
      error: (error: unknown) => this.error.set(error instanceof ApiError ? error.message : 'No fue posible cargar el dashboard.'),
    });
    this.bindRealtime();
  }

  private bindRealtime(): void {
    if (this.realtimeBound) return;
    this.realtimeBound = true;

    const readingUpdates = this.realtime.readingUpdated$;
    readingUpdates.pipe(
      buffer(readingUpdates.pipe(debounceTime(500))),
      filter(readings => readings.length > 0),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(readings => this.readingsState.update(items => {
      const readingsBySensor = new Map(items.map(reading => [reading.sensorId, reading]));
      readings.forEach(reading => readingsBySensor.set(reading.sensorId, reading));
      return [...readingsBySensor.values()];
    }));
    this.realtime.alertGenerated$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(alert => this.alertsState.update(items => [alert, ...items.filter(item => item.id !== alert.id)]));
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
