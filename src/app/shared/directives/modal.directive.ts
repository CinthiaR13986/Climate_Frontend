import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, HostListener, inject, input, OnDestroy, OnInit, output } from '@angular/core';

@Directive({ selector: '[appModal]', host: { tabindex: '-1', '[attr.aria-busy]': 'appModalBusy()' } })
export class ModalDirective implements OnInit, OnDestroy {
  readonly appModalBusy = input(false);
  readonly modalDismiss = output<void>();
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly previousFocus = this.document.activeElement as HTMLElement | null;
  private readonly previousOverflow = this.document.body.style.overflow;
  private readonly backgrounds = new Map<HTMLElement, boolean>();
  private destroyed = false;

  ngOnInit(): void {
    let branch = this.element;
    while (branch.parentElement) {
      for (const sibling of Array.from(branch.parentElement.children)) {
        if (sibling !== branch && sibling instanceof HTMLElement) {
          this.backgrounds.set(sibling, sibling.hasAttribute('inert'));
          sibling.setAttribute('inert', '');
        }
      }
      branch = branch.parentElement;
      if (branch === this.document.body) break;
    }
    this.document.body.style.overflow = 'hidden';
    queueMicrotask(() => { if (!this.destroyed) (this.focusable()[0] ?? this.element).focus(); });
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault(); event.stopPropagation();
      if (!this.appModalBusy()) this.modalDismiss.emit();
    }
    if (event.key !== 'Tab') return;
    const items = this.focusable();
    const first = items[0], last = items.at(-1);
    if (!first) { event.preventDefault(); this.element.focus(); return; }
    if (event.shiftKey && (this.document.activeElement === first || this.document.activeElement === this.element)) {
      event.preventDefault(); last?.focus();
    } else if (!event.shiftKey && (this.document.activeElement === last || this.document.activeElement === this.element)) {
      event.preventDefault(); first.focus();
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    for (const [element, wasInert] of this.backgrounds) { if (!wasInert) element.removeAttribute('inert'); }
    this.document.body.style.overflow = this.previousOverflow;
    if (this.previousFocus?.isConnected) this.previousFocus.focus();
  }

  private focusable(): HTMLElement[] {
    return Array.from(this.element.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex]'))
      .filter(x => !x.matches(':disabled, [hidden], [tabindex="-1"]') && !x.closest('[hidden]'));
  }
}
