import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../../core/config/app-config.token';
import { CommunityResponse, CreateCommunityRequest, UpdateCommunityRequest } from '../models/community.models';

@Injectable({ providedIn: 'root' })
export class CommunitiesApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  getAll(filters: { search?: string; isActive?: boolean; municipality?: string; department?: string } = {}): Observable<CommunityResponse[]> {
    return this.http.get<CommunityResponse[]>(`${this.config.apiUrl}/api/communities`, { params: Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined && value !== "").map(([key, value]) => [key, String(value)])) });
  }

  getById(id: string): Observable<CommunityResponse> {
    return this.http.get<CommunityResponse>(`${this.config.apiUrl}/api/communities/${id}`);
  }

  create(request: CreateCommunityRequest): Observable<CommunityResponse> {
    return this.http.post<CommunityResponse>(`${this.config.apiUrl}/api/communities`, request);
  }

  update(id: string, request: UpdateCommunityRequest): Observable<CommunityResponse> {
    return this.http.put<CommunityResponse>(`${this.config.apiUrl}/api/communities/${id}`, request);
  }
}
