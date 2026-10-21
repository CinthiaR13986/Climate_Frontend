import { SensorChart } from '../../../monitoring/components/sensor-chart/sensor-chart';
import { SENSOR_TYPE_LABELS } from '../../../monitoring/models/monitoring.models';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReportsApiService } from '../../../reports/reports-api.service';
import { RISK_TYPE_LABELS } from '../../../alerts/models/alert.models';
import { RouterLink } from '@angular/router';
import { ActiveAlertsPanel } from '../../components/active-alerts-panel/active-alerts-panel';
import { ClimateMetricCard } from '../../components/climate-metric-card/climate-metric-card';
import { DashboardStore } from '../../store/dashboard.store';

@Component({
  selector: 'app-dashboard-page',
  imports: [DatePipe, RouterLink, SensorChart, ClimateMetricCard, ActiveAlertsPanel],
  providers: [DashboardStore],
  templateUrl: './dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit {
  protected readonly labels = SENSOR_TYPE_LABELS;
  protected readonly riskLabels: Record<string, string> = RISK_TYPE_LABELS;
  protected readonly store = inject(DashboardStore);
  private readonly reportsApi = inject(ReportsApiService);
  private readonly destroy = inject(DestroyRef);
  protected readonly reportStats = signal<{total: number; byStatus: Record<string, number>} | null>(null);
  ngOnInit(): void {
    this.store.load();
    this.reportsApi.statistics().pipe(takeUntilDestroyed(this.destroy)).subscribe({next: value => this.reportStats.set(value), error: () => this.reportStats.set(null)});
  }
}
