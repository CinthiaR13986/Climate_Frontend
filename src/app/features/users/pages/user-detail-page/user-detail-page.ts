import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiError } from '../../../../core/http/api-error.model';
import { SystemRole, UserResponse } from '../../../../shared/models/api/auth.models';
import { ROLE_LABELS } from '../../models/user.models';
import { UsersApiService } from '../../services/users-api.service';

@Component({ selector: 'app-user-detail-page', imports: [DatePipe, RouterLink], templateUrl: './user-detail-page.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class UserDetailPage implements OnInit {
  private readonly api = inject(UsersApiService);
  private readonly route = inject(ActivatedRoute);
  protected readonly user = signal<UserResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly roleLabels = ROLE_LABELS;
  protected roleLabel(role: string | null): string { return role && ['Administrator', 'Operator', 'Viewer'].includes(role) ? this.roleLabels[role as SystemRole] : role ?? 'Sin rol'; }
  ngOnInit(): void { const id = this.route.snapshot.paramMap.get('id'); if (!id) { this.error.set('El identificador del usuario no es válido.'); this.loading.set(false); return; } this.api.getById(id).pipe(finalize(() => this.loading.set(false))).subscribe({ next: user => this.user.set(user), error: error => this.error.set(error instanceof ApiError ? error.message : 'No fue posible cargar el usuario.') }); }
}
