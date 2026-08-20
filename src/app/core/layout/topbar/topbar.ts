import { Component, DestroyRef, HostListener, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthStore } from '../../auth/auth.store';
import { AuthService } from '../../auth/auth.service';

@Component({ selector: 'app-topbar', templateUrl: './topbar.html' })
export class Topbar {
  protected readonly authStore = inject(AuthStore);
  protected readonly userMenuOpen = signal(false);
  protected readonly pageTitle = signal('Dashboard');
  readonly menuToggle = output<void>();

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.updatePageTitle();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.userMenuOpen.set(false);
      this.updatePageTitle();
    });
  }

  protected logout(): void { this.authService.logout(); }

  @HostListener('document:keydown.escape')
  protected closeUserMenu(): void { this.userMenuOpen.set(false); }

  private updatePageTitle(): void {
    let current = this.router.routerState.snapshot.root;
    while (current.firstChild) current = current.firstChild;
    const pageTitle = current.data?.['pageTitle'];
    this.pageTitle.set(typeof pageTitle === 'string' ? pageTitle : 'Dashboard');
  }
}
