import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { ApiError } from '../../../core/http/api-error.model';
import { CommunitiesApiService } from '../../communities/services/communities-api.service';
import { CommunityResponse } from '../../communities/models/community.models';
import { SensorsApiService } from '../../sensors/services/sensors-api.service';
import { SensorResponse } from '../../sensors/models/sensor.models';
import { SensorReadingResponse } from '../models/monitoring.models';
import { MonitoringApiService } from '../services/monitoring-api.service';
@Component({ selector: 'app-readings-page', imports: [DatePipe, ReactiveFormsModule], templateUrl: './readings-page.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class ReadingsPage implements OnInit {
  private readonly api = inject(MonitoringApiService);
  private readonly sensorsApi = inject(SensorsApiService); private readonly communitiesApi = inject(CommunitiesApiService);
  protected readonly sensors = signal<SensorResponse[]>([]); protected readonly communities = signal<CommunityResponse[]>([]);
  protected readonly readings = signal<SensorReadingResponse[]>([]); protected readonly busy = signal(false); protected readonly error = signal('');
  protected readonly page = signal(1); protected readonly total = signal(0);
  protected readonly filters = new FormGroup({ sensorId: new FormControl('', { nonNullable: true }), communityId: new FormControl('', { nonNullable: true }), from: new FormControl('', { nonNullable: true }), to: new FormControl('', { nonNullable: true }) });
  ngOnInit() { forkJoin({ sensors: this.sensorsApi.getAll(), communities: this.communitiesApi.getAll() }).subscribe({ next: x => { this.sensors.set(x.sensors); this.communities.set(x.communities); }, error: e => this.fail(e) }); this.load(); }
  protected name(id: string) { return this.sensors().find(x => x.id === id)?.name ?? id; }
  protected load(page = 1) { const f = this.filters.getRawValue(); if (f.from && f.to && f.from > f.to) { this.error.set('El rango de fechas es inválido.'); return; } this.busy.set(true); this.api.getReadings({ sensorId: f.sensorId || undefined, communityId: f.communityId || undefined, from: f.from ? new Date(f.from).toISOString() : undefined, to: f.to ? new Date(f.to).toISOString() : undefined, page }).pipe(finalize(() => this.busy.set(false))).subscribe({ next: x => { this.readings.set(x.items); this.total.set(x.total); this.page.set(x.page); this.error.set(''); }, error: e => this.fail(e) }); }
  private fail(e: unknown) { this.error.set(e instanceof ApiError ? e.message : 'No fue posible consultar las lecturas.'); }
}
