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
}

export interface AlertFilters {
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
