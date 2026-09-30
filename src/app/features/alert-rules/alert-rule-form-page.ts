import { ChangeDetectionStrategy, Component, ElementRef, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ToastService } from '../../core/notifications/toast.service';
import { ApiError } from '../../core/http/api-error.model';
import { ALERT_LEVEL_LABELS, AlertLevel, RISK_TYPE_LABELS, RiskType } from '../alerts/models/alert.models';
import { SENSOR_TYPES, SENSOR_TYPE_LABELS, SensorType } from '../monitoring/models/monitoring.models';
import { AlertRulesApiService } from './alert-rules-api.service';
@Component({ selector: 'app-alert-rule-form-page', imports: [ReactiveFormsModule, RouterLink], templateUrl: './alert-rule-form-page.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class AlertRuleFormPage implements OnInit {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly toast = inject(ToastService);
  private readonly api = inject(AlertRulesApiService);
  private readonly router = inject(Router);
  protected readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
  protected readonly busy = signal(false);
  protected readonly loaded = signal(false);
  protected readonly error = signal('');
  protected readonly types = SENSOR_TYPES;
  protected readonly labels = SENSOR_TYPE_LABELS;
  protected readonly levels = Object.keys(ALERT_LEVEL_LABELS) as AlertLevel[];
  protected readonly levelLabels = ALERT_LEVEL_LABELS;
  protected readonly risks = Object.keys(RISK_TYPE_LABELS) as RiskType[];
  protected readonly riskLabels = RISK_TYPE_LABELS;
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(200)] }),
    sensorType: new FormControl<SensorType>('Temperature', { nonNullable: true }),
    minimumValue: new FormControl<number | null>(null, [Validators.min(-1000000), Validators.max(1000000)]),
    maximumValue: new FormControl<number | null>(null, [Validators.min(-1000000), Validators.max(1000000)]),
    alertLevel: new FormControl<AlertLevel>('Yellow', { nonNullable: true }),
    riskType: new FormControl<RiskType>('Frost', { nonNullable: true }),
    message: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(1000)] }),
    isActive: new FormControl(true, { nonNullable: true }),
  });
  ngOnInit() { if (!this.id) { this.loaded.set(true); return; } this.busy.set(true); this.api.get(this.id).pipe(finalize(() => this.busy.set(false))).subscribe({ next: rule => { this.form.patchValue(rule); this.loaded.set(true); }, error: e => this.fail(e) }); }
  protected save() {
    this.form.markAllAsTouched(); const value = this.form.getRawValue();
    if (this.form.invalid || (!value.name.trim() || !value.message.trim()) || (value.minimumValue === null && value.maximumValue === null) || (value.minimumValue !== null && value.maximumValue !== null && value.minimumValue > value.maximumValue)) {
      this.error.set('Completa nombre y mensaje, al menos un límite y un intervalo válido.');
      this.element.nativeElement.querySelector<HTMLElement>('input.ng-invalid, textarea.ng-invalid')?.focus();
      return;
    }
    this.busy.set(true); (this.id ? this.api.update(this.id, value) : this.api.create(value)).pipe(finalize(() => this.busy.set(false))).subscribe({ next: () => { this.toast.show('Regla guardada correctamente.', 'success'); void this.router.navigate(['/alert-rules']); }, error: e => this.fail(e) });
  }
  private fail(e: unknown) { this.error.set(e instanceof ApiError ? e.message : 'No fue posible procesar la regla.'); }
}
