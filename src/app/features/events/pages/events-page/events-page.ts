import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { ApiError } from '../../../../core/http/api-error.model';
import { ALERT_LEVEL_LABELS, AlertLevel, RISK_TYPE_LABELS, RiskType } from '../../../alerts/models/alert.models';
import { CommunityResponse } from '../../../communities/models/community.models';
import { CommunitiesApiService } from '../../../communities/services/communities-api.service';
import { SensorResponse } from '../../../sensors/models/sensor.models';
import { SensorsApiService } from '../../../sensors/services/sensors-api.service';
import { EventFilters, EventResponse, EventStatistics } from '../../models/event.models';
import { EventsApiService } from '../../services/events-api.service';

@Component({ selector: 'app-events-page', imports: [DatePipe, ReactiveFormsModule, RouterLink], templateUrl: './events-page.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class EventsPage implements OnInit {
  private readonly api = inject(EventsApiService);
  private readonly sensorsApi = inject(SensorsApiService);
  private readonly communitiesApi = inject(CommunitiesApiService);
  protected readonly statistics = signal<EventStatistics | null>(null);
  protected readonly entries = Object.entries;
  protected readonly events = signal<readonly EventResponse[]>([]);
  protected readonly sensors = signal<readonly SensorResponse[]>([]);
  protected readonly communities = signal<readonly CommunityResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly riskTypes = Object.keys(RISK_TYPE_LABELS) as RiskType[];
  protected readonly levels = Object.keys(ALERT_LEVEL_LABELS) as AlertLevel[];
  protected readonly riskLabels = RISK_TYPE_LABELS;
  protected readonly levelLabels = ALERT_LEVEL_LABELS;
  protected readonly filters = new FormGroup({ riskType: new FormControl<RiskType | ''>('', { nonNullable: true }), alertLevel: new FormControl<AlertLevel | ''>('', { nonNullable: true }), sensorId: new FormControl('', { nonNullable: true }), communityId: new FormControl('', { nonNullable: true }), from: new FormControl('', { nonNullable: true }), to: new FormControl('', { nonNullable: true }) });

  ngOnInit(): void { forkJoin({ sensors: this.sensorsApi.getAll(), communities: this.communitiesApi.getAll() }).subscribe({ next: result => { this.sensors.set(result.sensors); this.communities.set(result.communities); this.load(); }, error: error => { this.loading.set(false); this.setError(error); } }); }
  protected applyFilters(): void { const { from, to } = this.filters.getRawValue(); if (from && to && new Date(from) > new Date(to)) { this.error.set('La fecha inicial no puede ser posterior a la fecha final.'); return; } this.load(); }
  protected clearFilters(): void { this.filters.reset({ riskType: '', alertLevel: '', sensorId: '', communityId: '', from: '', to: '' }); this.load(); }
  protected sensorName(id: string): string { const item = this.sensors().find(sensor => sensor.id === id); return item?.name ?? item?.code ?? 'Sensor no identificado'; }
  protected communityName(id: string): string { return this.communities().find(item => item.id === id)?.name ?? 'Comunidad no identificada'; }
  private load(): void { this.loading.set(true); const value = this.filters.getRawValue(); const filters: EventFilters = { riskType: value.riskType || undefined, alertLevel: value.alertLevel || undefined, sensorId: value.sensorId || undefined, communityId: value.communityId || undefined, from: this.toIso(value.from), to: this.toIso(value.to) }; forkJoin({ events: this.api.getAll(filters), statistics: this.api.statistics({ communityId: filters.communityId, from: filters.from, to: filters.to }) }).pipe(finalize(() => this.loading.set(false))).subscribe({ next: result => { this.events.set(result.events); this.statistics.set(result.statistics); this.error.set(null); }, error: error => this.setError(error) }); }
  private toIso(value: string): string | undefined { return value ? new Date(value).toISOString() : undefined; }
  private setError(error: unknown): void { this.error.set(error instanceof ApiError ? error.message : 'No fue posible cargar el historial de eventos.'); }
}
