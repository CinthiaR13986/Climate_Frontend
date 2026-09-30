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
  readonly value?: number | null;
  readonly status?: "Active" | "Attended" | "Closed";
  readonly responsibleUserId?: string | null;
}

export interface EventFilters {
  readonly riskType?: RiskType;
  readonly alertLevel?: AlertLevel;
  readonly sensorId?: string;
  readonly communityId?: string;
  readonly from?: string;
  readonly to?: string;
}

export interface EventStatistics { total: number; byRiskType: Record<string, number>; byAlertLevel: Record<string, number>; byStatus: Record<string, number>; }
