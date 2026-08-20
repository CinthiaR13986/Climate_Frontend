import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiError } from '../../../../core/http/api-error.model';
import { UserResponse } from '../../../../shared/models/api/auth.models';
import { UsersApiService } from '../../../users/services/users-api.service';
import { AuditFilters, AuditResponse } from '../../models/audit.models';
import { AuditApiService } from '../../services/audit-api.service';

@Component({ selector: 'app-audit-page', imports: [DatePipe, ReactiveFormsModule, RouterLink], templateUrl: './audit-page.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class AuditPage implements OnInit {
  private readonly api = inject(AuditApiService);
  private readonly usersApi = inject(UsersApiService);
  protected readonly records = signal<readonly AuditResponse[]>([]);
  protected readonly users = signal<readonly UserResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly filters = new FormGroup({ userId: new FormControl('', { nonNullable: true }), action: new FormControl('', { nonNullable: true }), resource: new FormControl('', { nonNullable: true }), from: new FormControl('', { nonNullable: true }), to: new FormControl('', { nonNullable: true }) });
  ngOnInit(): void { this.usersApi.getAll().subscribe({ next: users => { this.users.set(users); this.load(); }, error: error => { this.loading.set(false); this.setError(error); } }); }
  protected applyFilters(): void { const { from, to } = this.filters.getRawValue(); if (from && to && new Date(from) > new Date(to)) { this.error.set('La fecha inicial no puede ser posterior a la fecha final.'); return; } this.load(); }
  protected clearFilters(): void { this.filters.reset({ userId: '', action: '', resource: '', from: '', to: '' }); this.load(); }
  private load(): void { this.loading.set(true); const value = this.filters.getRawValue(); const filters: AuditFilters = { userId: value.userId || undefined, action: value.action.trim() || undefined, resource: value.resource.trim() || undefined, from: this.toIso(value.from), to: this.toIso(value.to) }; this.api.getAll(filters).pipe(finalize(() => this.loading.set(false))).subscribe({ next: records => { this.records.set(records); this.error.set(null); }, error: error => this.setError(error) }); }
  private toIso(value: string): string | undefined { return value ? new Date(value).toISOString() : undefined; }
  private setError(error: unknown): void { this.error.set(error instanceof ApiError ? error.message : 'No fue posible cargar la bitácora.'); }
}
