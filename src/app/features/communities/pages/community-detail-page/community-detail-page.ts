import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthStore } from '../../../../core/auth/auth.store';
import { CommunityResponse } from '../../models/community.models';
import { CommunitiesApiService } from '../../services/communities-api.service';

@Component({ selector: 'app-community-detail-page', imports: [DatePipe, DecimalPipe, RouterLink], templateUrl: './community-detail-page.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class CommunityDetailPage implements OnInit {
  private readonly api = inject(CommunitiesApiService);
  private readonly route = inject(ActivatedRoute);
  protected readonly authStore = inject(AuthStore);
  protected readonly community = signal<CommunityResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  ngOnInit(): void { const id = this.route.snapshot.paramMap.get('id'); if (!id) { this.error.set(true); this.loading.set(false); return; } this.api.getById(id).pipe(finalize(() => this.loading.set(false))).subscribe({ next: community => this.community.set(community), error: () => this.error.set(true) }); }
}
