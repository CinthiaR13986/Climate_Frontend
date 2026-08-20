import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ALERT_LEVEL_LABELS, AlertResponse, RISK_TYPE_LABELS } from '../../../alerts/models/alert.models';

@Component({ selector: 'app-active-alerts-panel', imports: [DatePipe, RouterLink], templateUrl: './active-alerts-panel.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class ActiveAlertsPanel {
  readonly alerts = input.required<readonly AlertResponse[]>();
  protected readonly recentAlerts = computed(() => [...this.alerts()].sort((a, b) => Date.parse(b.generatedAt) - Date.parse(a.generatedAt)).slice(0, 4));
  protected readonly levelLabels = ALERT_LEVEL_LABELS;
  protected readonly riskLabels = RISK_TYPE_LABELS;
}
