import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, finalize, forkJoin, Subject } from 'rxjs';
import { AuthStore } from '../../../../core/auth/auth.store';
import { ApiError } from '../../../../core/http/api-error.model';
import { ToastService } from '../../../../core/notifications/toast.service';
import { RealtimeService } from '../../../../core/realtime/realtime.service';
import { CommunityResponse } from '../../../communities/models/community.models';
import { CommunitiesApiService } from '../../../communities/services/communities-api.service';
import { SensorResponse } from '../../../sensors/models/sensor.models';
import { SensorsApiService } from '../../../sensors/services/sensors-api.service';
import { AlertCard } from '../../components/alert-card/alert-card';
import { ALERT_LEVEL_LABELS, AlertFilters, AlertLevel, AlertResponse, RISK_TYPE_LABELS, RiskType } from '../../models/alert.models';
import { AlertsApiService } from '../../services/alerts-api.service';

@Component({ selector: 'app-alerts-page', imports: [ReactiveFormsModule, AlertCard], templateUrl: './alerts-page.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class AlertsPage implements OnInit {
  private readonly api = inject(AlertsApiService);
  private readonly sensorsApi = inject(SensorsApiService);
  private readonly communitiesApi = inject(CommunitiesApiService);
  private readonly toast = inject(ToastService);
  private readonly realtime = inject(RealtimeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly realtimeRefresh = new Subject<void>();
  private initialAlertsLoaded = false;
  protected readonly authStore = inject(AuthStore);
  protected readonly alerts = signal<readonly AlertResponse[]>([]);
  protected readonly sensors = signal<readonly SensorResponse[]>([]);
  protected readonly communities = signal<readonly CommunityResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly resolving = signal(false);
  protected readonly selectedAlert = signal<AlertResponse | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly riskTypes = Object.keys(RISK_TYPE_LABELS) as RiskType[];
  protected readonly levels = Object.keys(ALERT_LEVEL_LABELS) as AlertLevel[];
  protected readonly riskLabels = RISK_TYPE_LABELS;
  protected readonly levelLabels = ALERT_LEVEL_LABELS;
  protected readonly activeCount = computed(() => this.alerts().filter(alert => alert.isActive).length);
  protected readonly filters = new FormGroup({ riskType: new FormControl<RiskType | ''>('', { nonNullable: true }), alertLevel: new FormControl<AlertLevel | ''>('', { nonNullable: true }), sensorId: new FormControl('', { nonNullable: true }), communityId: new FormControl('', { nonNullable: true }), status: new FormControl<'all' | 'active' | 'resolved'>('active', { nonNullable: true }) });

  ngOnInit(): void {
    forkJoin({ sensors: this.sensorsApi.getAll(), communities: this.communitiesApi.getAll() }).subscribe({ next: result => { this.sensors.set(result.sensors); this.communities.set(result.communities); this.load(); }, error: error => { this.loading.set(false); this.setError(error); } });
    this.realtimeRefresh.pipe(debounceTime(150), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.load(false));
    this.realtime.alertGenerated$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(alert => {
      const isNew = this.initialAlertsLoaded && !this.alerts().some(item => item.id === alert.id);
      if (isNew) this.toast.show(`Nueva alerta: ${alert.title ?? this.riskLabels[alert.alertType]}.`, 'info');
      this.realtimeRefresh.next();
    });
  }
  protected applyFilters(): void { this.load(); }
  protected clearFilters(): void { this.filters.reset({ riskType: '', alertLevel: '', sensorId: '', communityId: '', status: 'active' }); this.load(); }
  protected sensorName(id: string): string { const sensor = this.sensors().find(item => item.id === id); return sensor?.name ?? sensor?.code ?? 'Sensor no identificado'; }
  protected communityName(id: string): string { return this.communities().find(item => item.id === id)?.name ?? 'Comunidad no identificada'; }
  protected confirmResolve(): void { const alert = this.selectedAlert(); if (!alert) return; this.resolving.set(true); this.api.resolve(alert.id).pipe(finalize(() => this.resolving.set(false))).subscribe({ next: () => { this.selectedAlert.set(null); this.toast.show('Alerta resuelta correctamente.', 'success'); this.load(false); }, error: error => this.setError(error) }); }
  private load(showLoading = true): void { if (showLoading) this.loading.set(true); const value = this.filters.getRawValue(); const filters: AlertFilters = { riskType: value.riskType || undefined, alertLevel: value.alertLevel || undefined, sensorId: value.sensorId || undefined, communityId: value.communityId || undefined, isActive: value.status === 'all' ? undefined : value.status === 'active' }; this.api.getAll(filters).pipe(finalize(() => this.loading.set(false))).subscribe({ next: alerts => { this.alerts.set(alerts); this.initialAlertsLoaded = true; this.error.set(null); }, error: error => this.setError(error) }); }
  private setError(error: unknown): void { this.error.set(error instanceof ApiError ? error.message : 'No fue posible procesar las alertas.'); }
}
