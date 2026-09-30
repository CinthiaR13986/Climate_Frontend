import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../../core/config/app-config.token';
import { ChartFilters, CreateReadingRequest, ReadingHistoryFilters, SensorChartResponse, SensorReadingResponse, SimulationStatusResponse } from '../models/monitoring.models';

@Injectable({ providedIn: 'root' })
export class MonitoringApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  getReadings(filters: ReadingHistoryFilters & { sensorId?: string; page?: number } = {}) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => { if (value !== undefined && value !== '') params = params.set(key, value); });
    return this.http.get<{ items: SensorReadingResponse[]; total: number; page: number; pageSize: number }>(`${this.config.apiUrl}/api/monitoring/readings`, { params });
  }
  getSimulatedValue(id: string) { return this.http.get<{ value: number | null }>(`${this.config.apiUrl}/api/monitoring/simulation/values/${id}`); }
  setSimulatedValue(id: string, value: number) { return this.http.put(`${this.config.apiUrl}/api/monitoring/simulation/values/${id}`, { value }); }
  clearSimulatedValue(id: string) { return this.http.delete(`${this.config.apiUrl}/api/monitoring/simulation/values/${id}`); }
  getCurrent(): Observable<SensorReadingResponse[]> {
    return this.http.get<SensorReadingResponse[]>(`${this.config.apiUrl}/api/monitoring/current`);
  }

  getSimulationStatus(): Observable<SimulationStatusResponse> {
    return this.http.get<SimulationStatusResponse>(`${this.config.apiUrl}/api/monitoring/simulation/status`);
  }

  getLatest(sensorId: string): Observable<SensorReadingResponse> {
    return this.http.get<SensorReadingResponse>(`${this.config.apiUrl}/api/monitoring/sensors/${sensorId}/latest`);
  }

  getHistory(sensorId: string, filters: ReadingHistoryFilters = {}): Observable<SensorReadingResponse[]> {
    let params = new HttpParams();
    if (filters.communityId) params = params.set('communityId', filters.communityId);
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    return this.http.get<SensorReadingResponse[]>(`${this.config.apiUrl}/api/monitoring/sensors/${sensorId}/history`, { params });
  }

  getChart(sensorId: string, filters: ChartFilters = {}): Observable<SensorChartResponse> {
    let params = new HttpParams();
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    if (filters.interval) params = params.set('interval', filters.interval);
    return this.http.get<SensorChartResponse>(`${this.config.apiUrl}/api/monitoring/sensors/${sensorId}/chart`, { params });
  }

  createReading(request: CreateReadingRequest): Observable<SensorReadingResponse> {
    return this.http.post<SensorReadingResponse>(`${this.config.apiUrl}/api/monitoring/readings`, request);
  }

  startSimulation(): Observable<SimulationStatusResponse> { return this.postSimulationAction('start'); }
  stopSimulation(): Observable<SimulationStatusResponse> { return this.postSimulationAction('stop'); }
  resetSimulation(): Observable<SimulationStatusResponse> { return this.postSimulationAction('reset'); }

  private postSimulationAction(action: 'start' | 'stop' | 'reset'): Observable<SimulationStatusResponse> {
    return this.http.post<SimulationStatusResponse>(`${this.config.apiUrl}/api/monitoring/simulation/${action}`, null);
  }
}
