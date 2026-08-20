import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { ApiError } from '../../../../core/http/api-error.model';
import { ALERT_LEVEL_LABELS, RISK_TYPE_LABELS } from '../../../alerts/models/alert.models';
import { CommunityResponse } from '../../../communities/models/community.models';
import { CommunitiesApiService } from '../../../communities/services/communities-api.service';
import { SensorResponse } from '../../../sensors/models/sensor.models';
import { SensorsApiService } from '../../../sensors/services/sensors-api.service';
import { EventResponse } from '../../models/event.models';
import { EventsApiService } from '../../services/events-api.service';

@Component({ selector: 'app-event-detail-page', imports: [DatePipe, RouterLink], templateUrl: './event-detail-page.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class EventDetailPage implements OnInit {
  private readonly api = inject(EventsApiService);
  private readonly sensorsApi = inject(SensorsApiService);
  private readonly communitiesApi = inject(CommunitiesApiService);
  private readonly route = inject(ActivatedRoute);
  protected readonly event = signal<EventResponse | null>(null);
  protected readonly sensor = signal<SensorResponse | null>(null);
  protected readonly community = signal<CommunityResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly riskLabels = RISK_TYPE_LABELS;
  protected readonly levelLabels = ALERT_LEVEL_LABELS;
  ngOnInit(): void { const id = this.route.snapshot.paramMap.get('id'); if (!id) { this.error.set('El identificador del evento no es válido.'); this.loading.set(false); return; } this.api.getById(id).subscribe({ next: event => { this.event.set(event); forkJoin({ sensor: this.sensorsApi.getById(event.sensorId), community: this.communitiesApi.getById(event.communityId) }).pipe(finalize(() => this.loading.set(false))).subscribe({ next: context => { this.sensor.set(context.sensor); this.community.set(context.community); }, error: () => this.loading.set(false) }); }, error: error => { this.error.set(error instanceof ApiError ? error.message : 'No fue posible cargar el evento.'); this.loading.set(false); } }); }
}
