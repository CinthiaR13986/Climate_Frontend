import { SimulatedValue } from '../../../monitoring/components/simulated-value';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthStore } from '../../../../core/auth/auth.store';
import { SENSOR_TYPE_LABELS } from '../../../monitoring/models/monitoring.models';
import { SensorResponse } from '../../models/sensor.models';
import { SensorsApiService } from '../../services/sensors-api.service';

@Component({ selector: 'app-sensor-detail-page', imports: [DatePipe, DecimalPipe, RouterLink, SimulatedValue], templateUrl: './sensor-detail-page.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class SensorDetailPage implements OnInit {
  private readonly api = inject(SensorsApiService);
  private readonly route = inject(ActivatedRoute);
  protected readonly authStore = inject(AuthStore);
  protected readonly labels = SENSOR_TYPE_LABELS;
  protected readonly sensor = signal<SensorResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  ngOnInit(): void { const id = this.route.snapshot.paramMap.get('id'); if (!id) { this.error.set(true); this.loading.set(false); return; } this.api.getById(id).pipe(finalize(() => this.loading.set(false))).subscribe({ next: sensor => this.sensor.set(sensor), error: () => this.error.set(true) }); }
}
