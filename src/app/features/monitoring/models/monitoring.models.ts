export type SensorType = 'Temperature' | 'Humidity' | 'WindSpeed' | 'Rainfall' | 'WaterLevel';

export interface SensorReadingResponse {
  readonly id: string;
  readonly sensorId: string;
  readonly communityId: string;
  readonly sensorType: SensorType;
  readonly value: number;
  readonly unit: string | null;
  readonly recordedAt: string;
}

export interface SimulationStatusResponse { readonly isRunning: boolean; }

export interface ChartPoint { readonly timestamp: string; readonly value: number; }

export interface SensorChartResponse {
  readonly sensorId: string;
  readonly unit: string | null;
  readonly data: readonly ChartPoint[] | null;
}

export interface ReadingHistoryFilters {
  readonly communityId?: string;
  readonly from?: string;
  readonly to?: string;
}

export interface ChartFilters {
  readonly from?: string;
  readonly to?: string;
  readonly interval?: string;
}

export interface CreateReadingRequest {
  readonly sensorId: string;
  readonly value: number;
  readonly recordedAt?: string | null;
}

export const SENSOR_TYPES: readonly SensorType[] = ['Temperature', 'Humidity', 'WindSpeed', 'Rainfall', 'WaterLevel'];

export const SENSOR_TYPE_LABELS: Readonly<Record<SensorType, string>> = {
  Temperature: 'Temperatura', Humidity: 'Humedad', WindSpeed: 'Velocidad del viento',
  Rainfall: 'Nivel de lluvia', WaterLevel: 'Nivel del río',
};
