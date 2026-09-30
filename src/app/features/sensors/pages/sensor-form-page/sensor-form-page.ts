import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin, of } from 'rxjs';
import { ApiError } from '../../../../core/http/api-error.model';
import { ToastService } from '../../../../core/notifications/toast.service';
import { CommunityResponse } from '../../../communities/models/community.models';
import { CommunitiesApiService } from '../../../communities/services/communities-api.service';
import { SENSOR_TYPE_LABELS, SensorType } from '../../../monitoring/models/monitoring.models';
import { SensorRequest } from '../../models/sensor.models';
import { SensorsApiService } from '../../services/sensors-api.service';

const SENSOR_TYPES = Object.keys(SENSOR_TYPE_LABELS) as SensorType[];

@Component({ selector: 'app-sensor-form-page', imports: [ReactiveFormsModule, RouterLink], templateUrl: './sensor-form-page.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class SensorFormPage implements OnInit {
  private readonly api = inject(SensorsApiService);
  private readonly communitiesApi = inject(CommunitiesApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  protected readonly sensorId = this.route.snapshot.paramMap.get('id');
  protected readonly isEdit = Boolean(this.sensorId);
  protected readonly types = SENSOR_TYPES;
  protected readonly labels = SENSOR_TYPE_LABELS;
  protected readonly communities = signal<readonly CommunityResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = new FormGroup({
    installationDate: new FormControl('', { nonNullable: true }),
    location: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(250)] }),
    environmentalType: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(100)] }),
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
    code: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(500)] }),
    type: new FormControl<SensorType>('Temperature', { nonNullable: true, validators: [Validators.required] }),
    unit: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(20)] }),
    communityId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    latitude: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(-90), Validators.max(90)] }),
    longitude: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(-180), Validators.max(180)] }),
  });

  ngOnInit(): void {
    const sensorRequest = this.sensorId ? this.api.getById(this.sensorId) : of(null);
    forkJoin({ communities: this.communitiesApi.getAll(), sensor: sensorRequest }).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: ({ communities, sensor }) => { this.communities.set(communities.filter(item => item.isActive || item.id === sensor?.communityId)); if (sensor) this.form.patchValue({ ...sensor, installationDate: sensor.installationDate ?? '', location: sensor.location ?? '', environmentalType: sensor.environmentalType ?? '', description: sensor.description ?? '', name: sensor.name ?? '', code: sensor.code ?? '', unit: sensor.unit ?? '' }); },
      error: error => this.setError(error),
    });
  }

  protected save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const value = this.form.getRawValue();
    const request: SensorRequest = { ...value, installationDate: value.installationDate || null, location: value.location.trim() || null, environmentalType: value.environmentalType.trim() || null, description: value.description.trim() || null };
    const operation = this.sensorId ? this.api.update(this.sensorId, request) : this.api.create(request);
    operation.pipe(finalize(() => this.saving.set(false))).subscribe({ next: sensor => { this.form.markAsPristine(); this.toast.show(`Sensor ${this.isEdit ? 'actualizado' : 'creado'}.`, 'success'); void this.router.navigate(['/sensors', sensor.id]); }, error: error => this.setError(error) });
  }

  private setError(error: unknown): void { this.error.set(error instanceof ApiError ? error.message : 'No fue posible guardar el sensor.'); }
}
