import { DOCUMENT } from '@angular/common';
import { DestroyRef, computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, filter, finalize, forkJoin, of, switchMap, timer } from 'rxjs';
import { ApiError } from '../../../core/http/api-error.model';
import { ToastService } from '../../../core/notifications/toast.service';
import { RealtimeService } from '../../../core/realtime/realtime.service';
import { AlertResponse } from '../../alerts/models/alert.models';
import { AlertsApiService } from '../../alerts/services/alerts-api.service';
import { SensorResponse } from '../../sensors/models/sensor.models';
import { SensorsApiService } from '../../sensors/services/sensors-api.service';
import { ChartFilters, ReadingHistoryFilters, SensorChartResponse, SensorReadingResponse, SimulationStatusResponse } from '../models/monitoring.models';
import { MonitoringApiService } from '../services/monitoring-api.service';

@Injectable()
export class MonitoringStore {
  private readonly api = inject(MonitoringApiService);
  private readonly sensorsApi = inject(SensorsApiService);
  private readonly alertsApi = inject(AlertsApiService);
  private readonly toast = inject(ToastService);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly realtime = inject(RealtimeService);

  private readonly sensorsState = signal<readonly SensorResponse[]>([]);
  private readonly currentState = signal<readonly SensorReadingResponse[]>([]);
  private readonly alertsState = signal<readonly AlertResponse[]>([]);
  private readonly simulationState = signal<SimulationStatusResponse | null>(null);
  private readonly latestState = signal<SensorReadingResponse | null>(null);
  private readonly historyState = signal<readonly SensorReadingResponse[]>([]);
  private readonly chartState = signal<SensorChartResponse | null>(null);

  readonly selectedSensorId = signal<string | null>(null);
  readonly loading = signal(true);
  readonly detailsLoading = signal(false);
  readonly operating = signal(false);
  readonly error = signal<string | null>(null);
  readonly sensors = this.sensorsState.asReadonly();
  readonly current = this.currentState.asReadonly();
  readonly alerts = this.alertsState.asReadonly();
  readonly simulation = this.simulationState.asReadonly();
  readonly latest = this.latestState.asReadonly();
  readonly history = this.historyState.asReadonly();
  readonly chart = this.chartState.asReadonly();
  readonly selectedSensor = computed(() => this.sensorsState().find(sensor => sensor.id === this.selectedSensorId()) ?? null);
  readonly lastUpdatedAt = computed(() => this.currentState().reduce<string | null>((latest, reading) =>
    !latest || Date.parse(reading.recordedAt) > Date.parse(latest) ? reading.recordedAt : latest, null));
  readonly realtimeState = this.realtime.state;

  initialize(): void {
    this.loading.set(true);
    this.sensorsApi.getAll().pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: sensors => {
        this.sensorsState.set(sensors);
        const first = sensors.find(sensor => sensor.isActive) ?? sensors[0];
        if (first) this.selectSensor(first.id);
      },
      error: error => this.setError(error),
    });

    this.refreshSnapshot();
    this.bindRealtime();

    timer(5000, 5000).pipe(
      filter(() => this.document.visibilityState === 'visible' && this.realtime.state() !== 'connected'),
      switchMap(() => forkJoin({
        current: this.api.getCurrent(),
        simulation: this.api.getSimulationStatus(),
        alerts: this.alertsApi.getAll({ isActive: true }),
      }).pipe(catchError(error => { this.setError(error); return EMPTY; }))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: result => {
        this.currentState.set(result.current);
        this.simulationState.set(result.simulation);
        this.alertsState.set(result.alerts);
        this.error.set(null);
      },
    });
  }

  selectSensor(sensorId: string): void {
    this.selectedSensorId.set(sensorId);
    this.loadDetails();
  }

  loadDetails(historyFilters: ReadingHistoryFilters = {}, chartFilters: ChartFilters = { interval: '5m' }): void {
    const sensorId = this.selectedSensorId();
    if (!sensorId || this.detailsLoading()) return;
    this.detailsLoading.set(true);
    forkJoin({
      latest: this.api.getLatest(sensorId).pipe(catchError(() => of(null))),
      history: this.api.getHistory(sensorId, historyFilters),
      chart: this.api.getChart(sensorId, chartFilters),
    }).pipe(finalize(() => this.detailsLoading.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => {
        this.latestState.set(result.latest);
        this.historyState.set(result.history);
        this.chartState.set(result.chart);
      },
      error: error => this.setError(error),
    });
  }

  startSimulation(): void { this.runOperation(this.api.startSimulation(), 'Simulación iniciada.'); }
  stopSimulation(): void { this.runOperation(this.api.stopSimulation(), 'Simulación detenida.'); }
  resetSimulation(): void { this.runOperation(this.api.resetSimulation(), 'Simulación reiniciada.'); }

  private runOperation(request: ReturnType<MonitoringApiService['startSimulation']>, successMessage: string): void {
    if (this.operating()) return;
    this.operating.set(true);
    request.pipe(finalize(() => this.operating.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: status => { this.simulationState.set(status); this.toast.show(successMessage, 'success'); },
      error: error => this.setError(error),
    });
  }

  private refreshSnapshot(): void {
    forkJoin({ current: this.api.getCurrent(), simulation: this.api.getSimulationStatus(), alerts: this.alertsApi.getAll({ isActive: true }) })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: result => { this.currentState.set(result.current); this.simulationState.set(result.simulation); this.alertsState.set(result.alerts); this.error.set(null); }, error: error => this.setError(error) });
  }

  private bindRealtime(): void {
    this.realtime.readingUpdated$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(reading => {
      this.currentState.update(items => [reading, ...items.filter(item => item.sensorId !== reading.sensorId)]);
      if (reading.sensorId !== this.selectedSensorId()) return;
      this.latestState.set(reading);
      this.historyState.update(items => [...items.filter(item => item.id !== reading.id), reading].slice(-500));
      this.chartState.update(chart => chart ? { ...chart, unit: reading.unit, data: [...(chart.data ?? []), { timestamp: reading.recordedAt, value: reading.value }].slice(-500) } : { sensorId: reading.sensorId, unit: reading.unit, data: [{ timestamp: reading.recordedAt, value: reading.value }] });
    });
    this.realtime.alertGenerated$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(alert => this.alertsState.update(items => [alert, ...items.filter(item => item.id !== alert.id)]));
    this.realtime.sensorStatusChanged$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(status => this.sensorsState.update(items => items.map(sensor => sensor.id === status.id ? { ...sensor, isActive: status.isActive } : sensor)));
    this.realtime.systemReset$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(status => { this.simulationState.set(status); this.currentState.set([]); this.latestState.set(null); this.historyState.set([]); this.chartState.set(null); });
  }

  private setError(error: unknown): void {
    this.error.set(error instanceof ApiError ? error.message : 'No fue posible actualizar el monitoreo.');
  }
}
