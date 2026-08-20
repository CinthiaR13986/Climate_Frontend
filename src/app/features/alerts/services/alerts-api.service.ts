import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../../core/config/app-config.token';
import { AlertFilters, AlertResponse } from '../models/alert.models';

@Injectable({ providedIn: 'root' })
export class AlertsApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  getAll(filters: AlertFilters = {}): Observable<AlertResponse[]> {
    let params = new HttpParams();
    if (filters.riskType) params = params.set('riskType', filters.riskType);
    if (filters.alertLevel) params = params.set('alertLevel', filters.alertLevel);
    if (filters.sensorId) params = params.set('sensorId', filters.sensorId);
    if (filters.communityId) params = params.set('communityId', filters.communityId);
    if (filters.isActive !== undefined) params = params.set('isActive', filters.isActive);
    return this.http.get<AlertResponse[]>(`${this.config.apiUrl}/api/alerts`, { params });
  }

  getById(id: string): Observable<AlertResponse> {
    return this.http.get<AlertResponse>(`${this.config.apiUrl}/api/alerts/${id}`);
  }

  resolve(id: string): Observable<void> {
    return this.http.patch<void>(`${this.config.apiUrl}/api/alerts/${id}/resolve`, null);
  }
}
