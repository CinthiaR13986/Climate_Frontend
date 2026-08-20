import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthStore } from '../../../../core/auth/auth.store';
import { ApiError } from '../../../../core/http/api-error.model';
import { ToastService } from '../../../../core/notifications/toast.service';
import { SENSOR_TYPE_LABELS } from '../../../monitoring/models/monitoring.models';
import { SensorResponse } from '../../models/sensor.models';
import { SensorsApiService } from '../../services/sensors-api.service';

@Component({ selector: 'app-sensors-page', imports: [DatePipe, FormsModule, RouterLink], templateUrl: './sensors-page.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class SensorsPage implements OnInit {
  private readonly api = inject(SensorsApiService);
  private readonly toast = inject(ToastService);
  protected readonly authStore = inject(AuthStore);
  protected readonly labels = SENSOR_TYPE_LABELS;
  protected readonly sensors = signal<readonly SensorResponse[]>([]);
  protected readonly query = signal('');
  protected readonly loading = signal(true);
  protected readonly mutatingId = signal<string | null>(null);
  protected readonly deleting = signal<SensorResponse | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly filtered = computed(() => {
    const term = this.query().trim().toLocaleLowerCase();
    return term ? this.sensors().filter(sensor => [sensor.name, sensor.code, sensor.communityName, this.labels[sensor.type]].some(value => value?.toLocaleLowerCase().includes(term))) : this.sensors();
  });

  ngOnInit(): void { this.load(); }
  protected updateQuery(value: string): void { this.query.set(value); }
  protected changeStatus(sensor: SensorResponse): void {
    this.mutatingId.set(sensor.id);
    const request = sensor.isActive ? this.api.deactivate(sensor.id) : this.api.activate(sensor.id);
    request.pipe(finalize(() => this.mutatingId.set(null))).subscribe({ next: () => { this.toast.show(`Sensor ${sensor.isActive ? 'desactivado' : 'activado'}.`, 'success'); this.load(false); }, error: error => this.setError(error) });
  }
  protected confirmDelete(): void {
    const sensor = this.deleting();
    if (!sensor) return;
    this.mutatingId.set(sensor.id);
    this.api.delete(sensor.id).pipe(finalize(() => this.mutatingId.set(null))).subscribe({ next: () => { this.deleting.set(null); this.toast.show('Sensor eliminado.', 'success'); this.load(false); }, error: error => this.setError(error) });
  }
  private load(showLoading = true): void {
    if (showLoading) this.loading.set(true);
    this.api.getAll().pipe(finalize(() => this.loading.set(false))).subscribe({ next: sensors => { this.sensors.set(sensors); this.error.set(null); }, error: error => this.setError(error) });
  }
  private setError(error: unknown): void { this.error.set(error instanceof ApiError ? error.message : 'No fue posible procesar los sensores.'); }
}
