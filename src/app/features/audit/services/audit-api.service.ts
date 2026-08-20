import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../../core/config/app-config.token';
import { AuditFilters, AuditResponse } from '../models/audit.models';

@Injectable({ providedIn: 'root' })
export class AuditApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  getAll(filters: AuditFilters = {}): Observable<AuditResponse[]> {
    let params = new HttpParams();
    if (filters.userId) params = params.set('userId', filters.userId);
    if (filters.action) params = params.set('action', filters.action);
    if (filters.resource) params = params.set('resource', filters.resource);
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    return this.http.get<AuditResponse[]>(`${this.config.apiUrl}/api/audit`, { params });
  }
  getById(id: string): Observable<AuditResponse> { return this.http.get<AuditResponse>(`${this.config.apiUrl}/api/audit/${id}`); }
}
