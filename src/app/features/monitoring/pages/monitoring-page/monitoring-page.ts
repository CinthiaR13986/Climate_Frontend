import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthStore } from '../../../../core/auth/auth.store';
import { ALERT_LEVEL_LABELS, RISK_TYPE_LABELS } from '../../../alerts/models/alert.models';
import { SENSOR_TYPE_LABELS } from '../../models/monitoring.models';
import { SensorChart } from '../../components/sensor-chart/sensor-chart';
import { SimulationControl } from '../../components/simulation-control/simulation-control';
import { MonitoringStore } from '../../store/monitoring.store';

@Component({
  selector: 'app-monitoring-page',
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule, SensorChart, SimulationControl],
  providers: [MonitoringStore],
  templateUrl: './monitoring-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonitoringPage implements OnInit {
  protected readonly store = inject(MonitoringStore);
  protected readonly authStore = inject(AuthStore);
  protected readonly sensorLabels = SENSOR_TYPE_LABELS;
  protected readonly levelLabels = ALERT_LEVEL_LABELS;
  protected readonly riskLabels = RISK_TYPE_LABELS;
  protected readonly filters = new FormGroup({
    from: new FormControl('', { nonNullable: true }),
    to: new FormControl('', { nonNullable: true }),
    interval: new FormControl('5m', { nonNullable: true }),
  });

  ngOnInit(): void { this.store.initialize(); }

  protected selectSensor(event: Event): void {
    const sensorId = (event.target as HTMLSelectElement).value;
    if (sensorId) this.store.selectSensor(sensorId);
  }

  protected applyFilters(): void {
    const { from, to, interval } = this.filters.getRawValue();
    const fromIso = this.toIso(from);
    const toIso = this.toIso(to);
    this.store.loadDetails({ from: fromIso, to: toIso }, { from: fromIso, to: toIso, interval });
  }

  private toIso(value: string): string | undefined { return value ? new Date(value).toISOString() : undefined; }
}
