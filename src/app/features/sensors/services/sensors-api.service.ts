import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../../core/config/app-config.token';
import { SensorRequest, SensorResponse } from '../models/sensor.models';

@Injectable({ providedIn: 'root' })
export class SensorsApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  getAll(filters: { search?: string; communityId?: string; type?: string; isActive?: boolean; code?: string } = {}): Observable<SensorResponse[]> {
    return this.http.get<SensorResponse[]>(`${this.config.apiUrl}/api/sensors`, { params: Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined && value !== "").map(([key, value]) => [key, String(value)])) });
  }

  getById(id: string): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.config.apiUrl}/api/sensors/${id}`);
  }

  create(request: SensorRequest): Observable<SensorResponse> {
    return this.http.post<SensorResponse>(`${this.config.apiUrl}/api/sensors`, request);
  }

  update(id: string, request: SensorRequest): Observable<SensorResponse> {
    return this.http.put<SensorResponse>(`${this.config.apiUrl}/api/sensors/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.config.apiUrl}/api/sensors/${id}`);
  }

  activate(id: string): Observable<void> {
    return this.http.patch<void>(`${this.config.apiUrl}/api/sensors/${id}/activate`, null);
  }

  deactivate(id: string): Observable<void> {
    return this.http.patch<void>(`${this.config.apiUrl}/api/sensors/${id}/deactivate`, null);
  }
}
