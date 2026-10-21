import { DatePipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, exhaustMap, timer } from 'rxjs';
import { AuthStore } from '../../core/auth/auth.store';
import { CommunitiesApiService } from '../communities/services/communities-api.service';
import { CommunityResponse } from '../communities/models/community.models';
import { SensorsApiService } from '../sensors/services/sensors-api.service';
import { SensorResponse } from '../sensors/models/sensor.models';
import { SENSOR_TYPE_LABELS } from '../monitoring/models/monitoring.models';
import { Report, ReportsApiService } from './reports-api.service';

@Component({selector: 'app-reports-page', imports: [FormsModule, DatePipe, JsonPipe], templateUrl: './reports-page.html', changeDetection: ChangeDetectionStrategy.OnPush})
export class ReportsPage implements OnInit {
  protected readonly auth = inject(AuthStore);
  private readonly api = inject(ReportsApiService);
  private readonly communitiesApi = inject(CommunitiesApiService);
  private readonly sensorsApi = inject(SensorsApiService);
  private readonly destroy = inject(DestroyRef);
  protected readonly reports = signal<Report[]>([]);
  protected readonly types = signal<{id: string; name: string}[]>([]);
  protected readonly communities = signal<CommunityResponse[]>([]);
  protected readonly sensors = signal<SensorResponse[]>([]);
  protected readonly error = signal('');
  protected readonly notice = signal('');
  protected readonly busy = signal(false);
  protected readonly loading = signal(true);
  protected readonly historyError = signal('');
  protected readonly total = signal(0);
  protected readonly selected = signal<Report | null>(null);
  protected readonly downloading = signal<string | null>(null);
  protected readonly labels = Object.entries(SENSOR_TYPE_LABELS);
  protected readonly availableSensors = computed(() => this.sensors());
  protected page = 1;
  protected type = 'EXECUTIVE';
  protected filters = {communityId: '', sensorId: '', sensorType: '', municipality: '', department: '', search: '', isActive: '', riskType: '', status: '', timezone: 'America/Guatemala', from: '', to: ''};
  ngOnInit(): void {
    this.api.types().pipe(takeUntilDestroyed(this.destroy)).subscribe({next: types => this.types.set(types), error: () => this.error.set('No se pudo cargar el catálogo de reportes.')});
    this.communitiesApi.getAll().pipe(takeUntilDestroyed(this.destroy)).subscribe({next: items => this.communities.set(items), error: () => this.error.set('No se pudieron cargar las comunidades.')});
    this.sensorsApi.getAll().pipe(takeUntilDestroyed(this.destroy)).subscribe({next: items => this.sensors.set(items), error: () => this.error.set('No se pudieron cargar los sensores.')});
    timer(0, 5000).pipe(exhaustMap(() => this.api.history(this.page).pipe(catchError(() => {
      this.loading.set(false); this.historyError.set('No se pudo consultar el historial. Se reintentará automáticamente.'); return EMPTY;
    }))), takeUntilDestroyed(this.destroy)).subscribe({
      next: value => {this.loading.set(false); this.historyError.set(''); this.reports.set(value.items); this.total.set(value.total); const selected = this.selected(); if (selected) this.selected.set(value.items.find(item => item.id === selected.id) ?? selected);},
      error: () => this.error.set('No se pudo consultar el historial. Usa Actualizar para reintentar.'),
    });
  }
  protected load(): void {
    this.loading.set(true);
    this.api.history(this.page).pipe(takeUntilDestroyed(this.destroy)).subscribe({next: value => {this.loading.set(false); this.historyError.set(''); this.reports.set(value.items); this.total.set(value.total);}, error: () => {this.loading.set(false); this.historyError.set('No se pudo consultar el historial.');}});
  }
  protected changePage(delta: number): void { this.page += delta; this.load(); }
  protected generate(): void {
    this.error.set(''); this.notice.set('');
    const filters: Record<string, string | boolean> = {};
    for (const [key, value] of Object.entries(this.filters)) if (value !== '' && this.allows(key)) filters[key] = key === 'isActive' ? value === 'true' : value.trim();
    for (const key of ['from', 'to']) if (filters[key]) {
      const date = new Date(String(filters[key]));
      if (!Number.isFinite(date.getTime())) {this.error.set('Indica fechas válidas.'); return;}
      filters[key] = date.toISOString();
    }
    if ((this.type === 'READINGS' || this.type === 'CLIMATE_STATISTICS') && (!filters['from'] || !filters['to'])) {this.error.set('Este reporte requiere ambas fechas.'); return;}
    if (filters['from'] && filters['to'] && String(filters['from']) > String(filters['to'])) {this.error.set('La fecha inicial debe ser anterior a la final.'); return;}
    this.busy.set(true);
    this.api.generate(this.type, filters).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: report => {this.busy.set(false); this.selected.set(report); this.page = 1; this.notice.set('Solicitud recibida. El estado se actualiza automáticamente cada 5 segundos.'); this.load();},
      error: error => {this.busy.set(false); this.error.set(error.status === 429 ? 'Ya hay reportes pendientes. Espera a que terminen.' : 'No se pudo generar el reporte. Revisa los filtros y tus permisos.');},
    });
  }
  protected download(report: Report): void {
    this.downloading.set(report.id); this.error.set('');
    this.api.download(report.id).pipe(takeUntilDestroyed(this.destroy)).subscribe({next: blob => {
      const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = report.fileName;
      link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); this.downloading.set(null); this.load();
    }, error: error => {this.downloading.set(null); this.error.set(error.status === 410 ? 'El PDF expiró. Genera uno nuevo.' : 'No se pudo descargar el PDF.');}});
  }
  protected name(type: string): string {return this.types().find(item => item.id === type)?.name ?? type;}
  protected allows(field: string): boolean {
    const fields: Record<string, readonly string[]> = {
      COMMUNITIES: ['communityId','municipality','department','search','isActive'],
      SENSORS: ['communityId','sensorId','sensorType','search','isActive'],
      READINGS: ['communityId','sensorId','sensorType','from','to'],
      ALERTS: ['communityId','sensorId','sensorType','from','to','riskType','status'],
      EVENTS: ['communityId','sensorId','sensorType','from','to','riskType'],
      SENSOR_STATUS: ['communityId','sensorId','sensorType','search','isActive'],
      CLIMATE_STATISTICS: ['communityId','sensorId','sensorType','from','to','riskType','status'],
      EXECUTIVE: ['communityId','sensorId','sensorType','from','to','riskType','status'],
    };
    return field === 'timezone' || (fields[this.type]?.includes(field) ?? false);
  }
  protected state(status: Report['status']): string {return {PENDING: 'Pendiente', PROCESSING: 'Generando', COMPLETED: 'Completado', FAILED: 'Fallido'}[status];}
}
