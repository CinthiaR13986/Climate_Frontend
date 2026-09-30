import { ModalDirective } from '../../../shared/directives/modal.directive';
import { Component, effect, ElementRef, HostListener, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';
import { RealtimeService } from '../../realtime/realtime.service';

@Component({
  selector: 'app-shell',
  imports: [ModalDirective, RouterOutlet, Sidebar, Topbar],
  templateUrl: './app-shell.html',
})
export class AppShell implements OnInit, OnDestroy {
  private readonly realtime = inject(RealtimeService);
  private readonly mobileNavigation = viewChild<ElementRef<HTMLElement>>('mobileNavigation');
  protected readonly menuOpen = signal(false);

  constructor() {
    effect(() => {
      if (this.menuOpen()) queueMicrotask(() => this.mobileNavigation()?.nativeElement.focus());
    });
  }

  ngOnInit(): void { void this.realtime.start(); }
  ngOnDestroy(): void { this.realtime.stop(); }

  @HostListener('document:keydown.escape')
  protected closeMenu(): void { this.menuOpen.set(false); }
}
