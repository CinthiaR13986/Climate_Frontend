import { SensorChart } from '../../../monitoring/components/sensor-chart/sensor-chart';
import { SENSOR_TYPE_LABELS } from '../../../monitoring/models/monitoring.models';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
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
  protected readonly store = inject(DashboardStore);
  ngOnInit(): void { this.store.load(); }
}
