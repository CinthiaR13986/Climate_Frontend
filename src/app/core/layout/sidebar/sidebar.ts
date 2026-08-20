import { Component, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../../auth/auth.store';
import { AuthService } from '../../auth/auth.service';
import { NavIcon } from '../nav-icon/nav-icon';
import { ADMIN_NAV, MONITORING_NAV } from '../navigation.model';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, NavIcon],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  protected readonly monitoringNav = MONITORING_NAV;
  protected readonly adminNav = ADMIN_NAV;
  protected readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  readonly navigate = output<void>();

  protected logout(): void {
    this.navigate.emit();
    this.authService.logout();
  }
}
