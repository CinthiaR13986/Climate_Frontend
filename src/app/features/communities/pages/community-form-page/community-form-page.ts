import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiError } from '../../../../core/http/api-error.model';
import { ToastService } from '../../../../core/notifications/toast.service';
import { CreateCommunityRequest, UpdateCommunityRequest } from '../../models/community.models';
import { CommunitiesApiService } from '../../services/communities-api.service';

@Component({ selector: 'app-community-form-page', imports: [ReactiveFormsModule, RouterLink], templateUrl: './community-form-page.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class CommunityFormPage implements OnInit {
  private readonly api = inject(CommunitiesApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  protected readonly communityId = this.route.snapshot.paramMap.get('id');
  protected readonly isEdit = Boolean(this.communityId);
  protected readonly loading = signal(this.isEdit);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = new FormGroup({
    municipality: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(120)] }),
    department: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(120)] }),
    country: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(120)] }),
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(500)] }),
    latitude: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(-90), Validators.max(90)] }),
    longitude: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(-180), Validators.max(180)] }),
    isActive: new FormControl(true, { nonNullable: true }),
  });

  ngOnInit(): void {
    if (!this.communityId) return;
    this.api.getById(this.communityId).pipe(finalize(() => this.loading.set(false))).subscribe({ next: community => this.form.patchValue({ ...community, municipality: community.municipality ?? '', department: community.department ?? '', country: community.country ?? '', name: community.name ?? '', description: community.description ?? '' }), error: error => this.setError(error) });
  }

  protected save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const value = this.form.getRawValue();
    const base: CreateCommunityRequest = { municipality: value.municipality.trim() || null, department: value.department.trim() || null, country: value.country.trim() || null, name: value.name.trim(), description: value.description.trim() || null, latitude: value.latitude, longitude: value.longitude };
    const operation = this.communityId ? this.api.update(this.communityId, { ...base, isActive: value.isActive } satisfies UpdateCommunityRequest) : this.api.create(base);
    operation.pipe(finalize(() => this.saving.set(false))).subscribe({ next: community => { this.form.markAsPristine(); this.toast.show(`Comunidad ${this.isEdit ? 'actualizada' : 'creada'}.`, 'success'); void this.router.navigate(['/communities', community.id]); }, error: error => this.setError(error) });
  }

  private setError(error: unknown): void { this.error.set(error instanceof ApiError ? error.message : 'No fue posible guardar la comunidad.'); }
}
