import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../../core/config/app-config.token';
import { UserResponse } from '../../../shared/models/api/auth.models';
import { UpdateUserRequest, UpdateUserStatusRequest } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  getAll(): Observable<UserResponse[]> { return this.http.get<UserResponse[]>(`${this.config.apiUrl}/api/users`); }
  getById(id: string): Observable<UserResponse> { return this.http.get<UserResponse>(`${this.config.apiUrl}/api/users/${id}`); }
  update(id: string, request: UpdateUserRequest): Observable<UserResponse> { return this.http.put<UserResponse>(`${this.config.apiUrl}/api/users/${id}`, request); }
  updateStatus(id: string, request: UpdateUserStatusRequest): Observable<void> { return this.http.patch<void>(`${this.config.apiUrl}/api/users/${id}/status`, request); }
}
