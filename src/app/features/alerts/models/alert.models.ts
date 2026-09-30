export type AlertStatus = 'Active' | 'Attended' | 'Closed';
export const ALERT_STATUS_LABELS = { Active: 'Activa', Attended: 'Atendida', Closed: 'Cerrada' } as const;
export type AlertLevel = 'Green' | 'Yellow' | 'Orange' | 'Red';
export type RiskType = 'Flood' | 'Drought' | 'Storm' | 'Frost' | 'ForestFire';

export interface AlertResponse {
  readonly id: string;
  readonly sensorId: string;
  readonly communityId: string;
  readonly alertType: RiskType;
  readonly level: AlertLevel;
  readonly title: string | null;
  readonly description: string | null;
  readonly sensorValue: number;
  readonly thresholdValue: number;
  readonly generatedAt: string;
  readonly isActive: boolean;
  readonly resolvedAt: string | null;
  readonly status?: AlertStatus;
  readonly attendedByUserId?: string | null;
  readonly attendedAt?: string | null;
  readonly closedByUserId?: string | null;
  readonly closedAt?: string | null;
  readonly ruleId?: string | null;
  readonly ruleName?: string | null;
  readonly minimumValueSnapshot?: number | null;
  readonly maximumValueSnapshot?: number | null;
}

export interface AlertFilters {
  readonly from?: string;
  readonly to?: string;
  readonly status?: AlertStatus;
  readonly riskType?: RiskType;
  readonly alertLevel?: AlertLevel;
  readonly sensorId?: string;
  readonly communityId?: string;
  readonly isActive?: boolean;
}

export const ALERT_LEVEL_LABELS: Readonly<Record<AlertLevel, string>> = {
  Green: 'Normal', Yellow: 'Precaución', Orange: 'Alerta', Red: 'Emergencia',
};

export const RISK_TYPE_LABELS: Readonly<Record<RiskType, string>> = {
  Flood: 'Inundación', Drought: 'Sequía', Storm: 'Tormenta', Frost: 'Helada', ForestFire: 'Incendio forestal',
};
