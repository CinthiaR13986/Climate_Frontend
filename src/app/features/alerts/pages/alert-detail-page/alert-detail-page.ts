import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { AuthStore } from '../../../../core/auth/auth.store';
import { ApiError } from '../../../../core/http/api-error.model';
import { ToastService } from '../../../../core/notifications/toast.service';
import { CommunityResponse } from '../../../communities/models/community.models';
import { CommunitiesApiService } from '../../../communities/services/communities-api.service';
import { SensorResponse } from '../../../sensors/models/sensor.models';
import { SensorsApiService } from '../../../sensors/services/sensors-api.service';
import { ALERT_LEVEL_LABELS, AlertResponse, RISK_TYPE_LABELS } from '../../models/alert.models';
import { AlertsApiService } from '../../services/alerts-api.service';

@Component({ selector: 'app-alert-detail-page', imports: [DatePipe, DecimalPipe, RouterLink], templateUrl: './alert-detail-page.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class AlertDetailPage implements OnInit {
  private readonly api = inject(AlertsApiService);
  private readonly sensorsApi = inject(SensorsApiService);
  private readonly communitiesApi = inject(CommunitiesApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  protected readonly authStore = inject(AuthStore);
  protected readonly alert = signal<AlertResponse | null>(null);
  protected readonly sensor = signal<SensorResponse | null>(null);
  protected readonly community = signal<CommunityResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly resolving = signal(false);
  protected readonly confirmVisible = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly levelLabels = ALERT_LEVEL_LABELS;
  protected readonly riskLabels = RISK_TYPE_LABELS;
  ngOnInit(): void { this.load(); }
  protected resolveAlert(): void { const alert = this.alert(); if (!alert) return; this.resolving.set(true); this.api.resolve(alert.id).pipe(finalize(() => this.resolving.set(false))).subscribe({ next: () => { this.confirmVisible.set(false); this.toast.show('Alerta resuelta correctamente.', 'success'); this.load(false); }, error: error => this.setError(error) }); }
  private load(showLoading = true): void { const id = this.route.snapshot.paramMap.get('id'); if (!id) { this.setError(null); this.loading.set(false); return; } if (showLoading) this.loading.set(true); this.api.getById(id).subscribe({ next: alert => { this.alert.set(alert); forkJoin({ sensor: this.sensorsApi.getById(alert.sensorId), community: this.communitiesApi.getById(alert.communityId) }).pipe(finalize(() => this.loading.set(false))).subscribe({ next: context => { this.sensor.set(context.sensor); this.community.set(context.community); }, error: () => this.loading.set(false) }); }, error: error => { this.loading.set(false); this.setError(error); } }); }
  private setError(error: unknown): void { this.error.set(error instanceof ApiError ? error.message : 'No fue posible cargar la alerta.'); }
}
