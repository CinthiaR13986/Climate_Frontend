import { SensorType } from '../../monitoring/models/monitoring.models';

export interface SensorResponse {
  readonly id: string;
  readonly name: string | null;
  readonly code: string | null;
  readonly description: string | null;
  readonly type: SensorType;
  readonly unit: string | null;
  readonly communityId: string;
  readonly communityName: string | null;
  readonly latitude: number;
  readonly longitude: number;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SensorRequest {
  readonly name: string;
  readonly code: string;
  readonly description: string | null;
  readonly type: SensorType;
  readonly unit: string;
  readonly communityId: string;
  readonly latitude: number;
  readonly longitude: number;
}
