import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiError } from '../../../../core/http/api-error.model';
import { SystemRole } from '../../../../shared/models/api/auth.models';
import { UsersApiService } from '../../services/users-api.service';

@Component({
  selector: 'app-user-create-page', imports: [ReactiveFormsModule, RouterLink], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-xl space-y-5">
      <a routerLink="/users" class="text-cyan-800 underline">Volver a usuarios</a>
      <h1 class="text-3xl font-semibold">Crear usuario</h1>
      @if (error()) { <p role="alert" class="rounded-xl bg-red-50 p-4 text-red-800">{{ error() }}</p> }
      <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4 rounded-xl border bg-white p-6">
        <label class="block">Usuario<input formControlName="username" autocomplete="username" class="mt-1 block w-full rounded-lg border p-3"></label>
        <label class="block">Correo<input type="email" formControlName="email" autocomplete="email" class="mt-1 block w-full rounded-lg border p-3"></label>
        <label class="block">Contraseña<input type="password" formControlName="password" autocomplete="new-password" aria-describedby="password-help" class="mt-1 block w-full rounded-lg border p-3"></label>
        <p id="password-help" class="text-sm text-slate-600">De 12 a 128 caracteres, con mayúsculas, minúsculas y números.</p>
        <label class="block">Rol<select formControlName="role" class="mt-1 block w-full rounded-lg border p-3"><option value="Viewer">Consulta</option><option value="Operator">Operador</option><option value="Administrator">Administrador</option></select></label>
        <button [disabled]="saving() || form.invalid" class="rounded-lg bg-cyan-700 px-4 py-3 text-white disabled:opacity-50">{{ saving() ? 'Guardando…' : 'Crear usuario' }}</button>
      </form>
    </section>`
})
export class UserCreatePage {
  private readonly api = inject(UsersApiService);
  private readonly router = inject(Router);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9._-]+$/)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email, Validators.maxLength(254)] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(12), Validators.maxLength(128), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).+$/)] }),
    role: new FormControl<SystemRole>('Viewer', { nonNullable: true }),
  });
  protected save(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true); this.error.set(null);
    this.api.create(this.form.getRawValue()).pipe(finalize(() => this.saving.set(false))).subscribe({
      next: user => { this.form.reset(); void this.router.navigate(['/users', user.id]); },
      error: error => this.error.set(error instanceof ApiError ? error.message : 'No fue posible crear el usuario.'),
    });
  }
}
