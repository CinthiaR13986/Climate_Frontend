import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthStore } from '../../../../core/auth/auth.store';
import { ApiError } from '../../../../core/http/api-error.model';
import { ToastService } from '../../../../core/notifications/toast.service';
import { SystemRole } from '../../../../shared/models/api/auth.models';
import { ROLE_LABELS } from '../../models/user.models';
import { UsersApiService } from '../../services/users-api.service';

@Component({ selector: 'app-user-edit-page', imports: [ReactiveFormsModule, RouterLink], templateUrl: './user-edit-page.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class UserEditPage implements OnInit {
  private readonly api = inject(UsersApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly authStore = inject(AuthStore);
  protected readonly userId = this.route.snapshot.paramMap.get('id');
  protected readonly roles: readonly SystemRole[] = ['Administrator', 'Operator', 'Viewer'];
  protected readonly roleLabels = ROLE_LABELS;
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = new FormGroup({ username: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }), email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email, Validators.maxLength(254)] }), role: new FormControl<SystemRole>('Viewer', { nonNullable: true, validators: [Validators.required] }) });
  ngOnInit(): void { if (!this.userId) { this.error.set('El identificador del usuario no es válido.'); this.loading.set(false); return; } this.api.getById(this.userId).pipe(finalize(() => this.loading.set(false))).subscribe({ next: user => this.form.patchValue({ username: user.username ?? '', email: user.email ?? '', role: this.toRole(user.role) }), error: error => this.setError(error) }); }
  protected save(): void { if (!this.userId || this.form.invalid) { this.form.markAllAsTouched(); return; } this.saving.set(true); this.api.update(this.userId, this.form.getRawValue()).pipe(finalize(() => this.saving.set(false))).subscribe({ next: user => { if (user.id === this.authStore.currentUser()?.id) this.authStore.updateUser(user); this.toast.show('Usuario actualizado.', 'success'); void this.router.navigate(['/users', user.id]); }, error: error => this.setError(error) }); }
  private toRole(role: string | null): SystemRole { return role === 'Administrator' || role === 'Operator' ? role : 'Viewer'; }
  private setError(error: unknown): void { this.error.set(error instanceof ApiError ? error.message : 'No fue posible actualizar el usuario.'); }
}
