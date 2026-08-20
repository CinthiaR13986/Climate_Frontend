import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthStore } from '../../../../core/auth/auth.store';
import { ApiError } from '../../../../core/http/api-error.model';
import { CommunityResponse } from '../../models/community.models';
import { CommunitiesApiService } from '../../services/communities-api.service';

@Component({ selector: 'app-communities-page', imports: [DatePipe, DecimalPipe, FormsModule, RouterLink], templateUrl: './communities-page.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class CommunitiesPage implements OnInit {
  private readonly api = inject(CommunitiesApiService);
  protected readonly authStore = inject(AuthStore);
  protected readonly communities = signal<readonly CommunityResponse[]>([]);
  protected readonly query = signal('');
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly filtered = computed(() => {
    const term = this.query().trim().toLocaleLowerCase();
    return term ? this.communities().filter(item => [item.name, item.description].some(value => value?.toLocaleLowerCase().includes(term))) : this.communities();
  });

  ngOnInit(): void { this.api.getAll().pipe(finalize(() => this.loading.set(false))).subscribe({ next: communities => this.communities.set(communities), error: error => this.error.set(error instanceof ApiError ? error.message : 'No fue posible cargar las comunidades.') }); }
  protected updateQuery(value: string): void { this.query.set(value); }
}
