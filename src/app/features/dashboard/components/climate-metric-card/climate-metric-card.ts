import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { SENSOR_TYPE_LABELS, SensorReadingResponse, SensorType } from '../../../monitoring/models/monitoring.models';

@Component({
  selector: 'app-climate-metric-card',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './climate-metric-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClimateMetricCard {
  readonly type = input.required<SensorType>();
  readonly reading = input.required<SensorReadingResponse | null>();
  protected readonly labels = SENSOR_TYPE_LABELS;
}
