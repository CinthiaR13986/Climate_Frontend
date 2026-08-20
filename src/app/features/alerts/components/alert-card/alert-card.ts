import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ALERT_LEVEL_LABELS, AlertResponse, RISK_TYPE_LABELS } from '../../models/alert.models';

@Component({ selector: 'app-alert-card', imports: [DatePipe, DecimalPipe, RouterLink], templateUrl: './alert-card.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class AlertCard {
  readonly alert = input.required<AlertResponse>();
  readonly sensorName = input('Sensor no identificado');
  readonly communityName = input('Comunidad no identificada');
  readonly canResolve = input(false);
  readonly resolving = input(false);
  readonly resolveRequested = output<AlertResponse>();
  protected readonly levelLabels = ALERT_LEVEL_LABELS;
  protected readonly riskLabels = RISK_TYPE_LABELS;
}
