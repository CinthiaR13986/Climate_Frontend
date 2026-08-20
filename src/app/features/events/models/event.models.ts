import { AlertLevel, RiskType } from '../../alerts/models/alert.models';

export interface EventResponse {
  readonly id: string;
  readonly alertId: string;
  readonly sensorId: string;
  readonly communityId: string;
  readonly riskType: RiskType;
  readonly alertLevel: AlertLevel;
  readonly description: string | null;
  readonly occurredAt: string;
  readonly resolvedAt: string | null;
}

export interface EventFilters {
  readonly riskType?: RiskType;
  readonly alertLevel?: AlertLevel;
  readonly sensorId?: string;
  readonly communityId?: string;
  readonly from?: string;
  readonly to?: string;
}
