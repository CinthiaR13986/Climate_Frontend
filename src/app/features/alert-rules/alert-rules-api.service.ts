import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../../core/config/app-config.token';
import { AlertLevel, RiskType } from '../alerts/models/alert.models';
import { SensorType } from '../monitoring/models/monitoring.models';
export interface AlertRuleRequest {
  name: string; sensorType: SensorType; minimumValue: number | null; maximumValue: number | null;
  alertLevel: AlertLevel; riskType: RiskType; message: string; isActive: boolean;
}
export interface AlertRule extends AlertRuleRequest { id: string; createdAt: string; updatedAt: string; }
@Injectable({ providedIn: 'root' })
export class AlertRulesApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(APP_CONFIG).apiUrl}/api/alert-rules`;
  getAll() { return this.http.get<AlertRule[]>(this.url); }
  get(id: string) { return this.http.get<AlertRule>(`${this.url}/${id}`); }
  create(value: AlertRuleRequest) { return this.http.post<AlertRule>(this.url, value); }
  update(id: string, value: AlertRuleRequest) { return this.http.put<AlertRule>(`${this.url}/${id}`, value); }
  setActive(id: string, active: boolean) { return this.http.patch<void>(`${this.url}/${id}/${active ? 'activate' : 'deactivate'}`, null); }
}
