import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiError } from '../../../../core/http/api-error.model';
import { AuditResponse } from '../../models/audit.models';
import { AuditApiService } from '../../services/audit-api.service';

@Component({ selector: 'app-audit-detail-page', imports: [DatePipe, RouterLink], templateUrl: './audit-detail-page.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class AuditDetailPage implements OnInit {
  private readonly api = inject(AuditApiService);
  private readonly route = inject(ActivatedRoute);
  protected readonly record = signal<AuditResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  ngOnInit(): void { const id = this.route.snapshot.paramMap.get('id'); if (!id) { this.error.set('El identificador del registro no es válido.'); this.loading.set(false); return; } this.api.getById(id).pipe(finalize(() => this.loading.set(false))).subscribe({ next: record => this.record.set(record), error: error => this.error.set(error instanceof ApiError ? error.message : 'No fue posible cargar el registro de auditoría.') }); }
}
