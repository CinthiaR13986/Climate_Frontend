import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../../core/config/app-config.token';
import { AlertResponse } from '../alerts/models/alert.models';
import { CommunityResponse } from '../communities/models/community.models';
import { EventStatistics } from '../events/models/event.models';
import { SensorReadingResponse, SensorType, SimulationStatusResponse } from '../monitoring/models/monitoring.models';
import { SensorResponse } from '../sensors/models/sensor.models';
export interface DashboardSummary {
  communityCount: number; activeSensorCount: number; inactiveSensorCount: number; activeAlertCount: number;
  byAlertLevel: Record<string, number>; communities: CommunityResponse[]; sensors: SensorResponse[];
  alerts: AlertResponse[]; readings: SensorReadingResponse[]; simulation: SimulationStatusResponse; events: EventStatistics;
  evolution: { sensorType: SensorType; unit: string; timestamp: string; value: number }[];
}
@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient); private readonly config = inject(APP_CONFIG);
  getSummary(communityId?: string) { return this.http.get<DashboardSummary>(`${this.config.apiUrl}/api/dashboard/summary`, { params: communityId ? new HttpParams().set('communityId', communityId) : undefined }); }
}
