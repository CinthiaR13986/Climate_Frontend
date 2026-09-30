import { ModalDirective } from '../../../../shared/directives/modal.directive';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthStore } from '../../../../core/auth/auth.store';
import { ApiError } from '../../../../core/http/api-error.model';
import { ToastService } from '../../../../core/notifications/toast.service';
import { SystemRole, UserResponse } from '../../../../shared/models/api/auth.models';
import { ROLE_LABELS } from '../../models/user.models';
import { UsersApiService } from '../../services/users-api.service';

@Component({ selector: 'app-users-page', imports: [ModalDirective, DatePipe, ReactiveFormsModule, RouterLink], templateUrl: './users-page.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class UsersPage implements OnInit {
  private readonly api = inject(UsersApiService);
  private readonly toast = inject(ToastService);
  protected readonly authStore = inject(AuthStore);
  protected readonly users = signal<readonly UserResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly mutatingId = signal<string | null>(null);
  protected readonly selectedUser = signal<UserResponse | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly roleLabels = ROLE_LABELS;
  protected readonly roles: readonly SystemRole[] = ['Administrator', 'Operator', 'Viewer'];
  protected readonly filters = new FormGroup({ query: new FormControl('', { nonNullable: true }), role: new FormControl<SystemRole | ''>('', { nonNullable: true }), status: new FormControl<'all' | 'active' | 'inactive'>('all', { nonNullable: true }) });
  protected readonly filtered = computed(() => { const { query, role, status } = this.filters.getRawValue(); const term = query.trim().toLocaleLowerCase(); return this.users().filter(user => (!term || [user.username, user.email].some(value => value?.toLocaleLowerCase().includes(term))) && (!role || user.role === role) && (status === 'all' || user.isActive === (status === 'active'))); });
  ngOnInit(): void { this.load(); this.filters.valueChanges.subscribe(() => this.users.update(users => [...users])); }
  protected confirmStatus(): void { const user = this.selectedUser(); if (!user) return; this.mutatingId.set(user.id); this.api.updateStatus(user.id, { isActive: !user.isActive }).pipe(finalize(() => this.mutatingId.set(null))).subscribe({ next: () => { this.selectedUser.set(null); this.toast.show(`Usuario ${user.isActive ? 'desactivado' : 'activado'}.`, 'success'); this.load(false); }, error: error => this.setError(error) }); }
  protected applyFilters(): void { this.load(); }
  private load(showLoading = true): void { if (showLoading) this.loading.set(true); this.api.getAll({ search: this.filters.getRawValue().query, role: this.filters.getRawValue().role, isActive: this.filters.getRawValue().status === 'all' ? undefined : this.filters.getRawValue().status === 'active' }).pipe(finalize(() => this.loading.set(false))).subscribe({ next: users => { this.users.set(users); this.error.set(null); }, error: error => this.setError(error) }); }
  private setError(error: unknown): void { this.error.set(error instanceof ApiError ? error.message : 'No fue posible administrar los usuarios.'); }
}
