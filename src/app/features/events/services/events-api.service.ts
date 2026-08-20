import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../../core/config/app-config.token';
import { EventFilters, EventResponse } from '../models/event.models';

@Injectable({ providedIn: 'root' })
export class EventsApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  getAll(filters: EventFilters = {}): Observable<EventResponse[]> {
    let params = new HttpParams();
    if (filters.riskType) params = params.set('riskType', filters.riskType);
    if (filters.alertLevel) params = params.set('alertLevel', filters.alertLevel);
    if (filters.sensorId) params = params.set('sensorId', filters.sensorId);
    if (filters.communityId) params = params.set('communityId', filters.communityId);
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    return this.http.get<EventResponse[]>(`${this.config.apiUrl}/api/events`, { params });
  }
  getById(id: string): Observable<EventResponse> { return this.http.get<EventResponse>(`${this.config.apiUrl}/api/events/${id}`); }
}
