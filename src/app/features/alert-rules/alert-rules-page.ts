import { ModalDirective } from '../../shared/directives/modal.directive';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthStore } from '../../core/auth/auth.store';
import { ApiError } from '../../core/http/api-error.model';
import { ALERT_LEVEL_LABELS, RISK_TYPE_LABELS } from '../alerts/models/alert.models';
import { SENSOR_TYPE_LABELS } from '../monitoring/models/monitoring.models';
import { AlertRule, AlertRulesApiService } from './alert-rules-api.service';
@Component({ selector: 'app-alert-rules-page', imports: [ModalDirective, RouterLink], templateUrl: './alert-rules-page.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class AlertRulesPage implements OnInit {
  private readonly api = inject(AlertRulesApiService);
  protected readonly auth = inject(AuthStore);
  protected readonly rules = signal<AlertRule[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly selected = signal<AlertRule | null>(null);
  protected readonly busy = signal(false);
  protected readonly sensorLabels = SENSOR_TYPE_LABELS;
  protected readonly levels = ALERT_LEVEL_LABELS;
  protected readonly risks = RISK_TYPE_LABELS;
  ngOnInit() { this.load(); }
  protected load() { this.loading.set(true); this.api.getAll().pipe(finalize(() => this.loading.set(false))).subscribe({ next: rows => { this.rules.set(rows); this.error.set(''); }, error: e => this.fail(e) }); }
  protected confirm() { const rule = this.selected(); if (!rule) return; this.busy.set(true); this.api.setActive(rule.id, !rule.isActive).pipe(finalize(() => this.busy.set(false))).subscribe({ next: () => { this.selected.set(null); this.load(); }, error: e => this.fail(e) }); }
  private fail(e: unknown) { this.error.set(e instanceof ApiError ? e.message : 'No fue posible guardar o cargar las reglas.'); }
}
