import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../../core/config/app-config.token';

export interface Report {
  id: string; type: string; userName: string; generatedAt: string; downloadedAt: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'; progress: number; error: string | null;
  parameters: Record<string, string | boolean>; fileName: string; rowCount: number | null; size: number | null;
}
export interface ReportHistory { items: Report[]; total: number; page: number; pageSize: number; }
@Injectable({ providedIn: 'root' })
export class ReportsApiService {
  private readonly http = inject(HttpClient);
  private readonly url = inject(APP_CONFIG).apiUrl + '/api/reports';
  types() { return this.http.get<{id: string; name: string}[]>(this.url + '/types'); }
  history(page = 1) { return this.http.get<ReportHistory>(this.url, {params: {page, pageSize: 25}}); }
  statistics() { return this.http.get<{total: number; byStatus: Record<string, number>}>(this.url + '/statistics'); }
  generate(type: string, filters: Record<string, string | boolean>) { return this.http.post<Report>(this.url + '/generate', {type, filters}); }
  download(id: string) { return this.http.get(this.url + '/' + encodeURIComponent(id) + '/download', {responseType: 'blob'}); }
}
