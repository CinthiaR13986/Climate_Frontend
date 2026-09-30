import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ModalDirective } from './modal.directive';

@Component({ imports: [ModalDirective], template: `
  <button id="opener" (click)="open.set(true)">Open</button>
  @if (open()) { <section appModal role="dialog" [appModalBusy]="busy()" (modalDismiss)="open.set(false)"><button id="cancel">Cancel</button><button id="confirm">Confirm</button></section> }
` })
class TestModal { readonly open = signal(false); readonly busy = signal(false); }

describe('modal keyboard behavior', () => {
  it('traps focus, blocks background interaction and restores focus on Escape', async () => {
    const fixture = TestBed.createComponent(TestModal); fixture.detectChanges();
    const opener = fixture.nativeElement.querySelector('#opener') as HTMLButtonElement;
    opener.focus(); opener.click(); fixture.detectChanges(); await fixture.whenStable();
    const first = fixture.nativeElement.querySelector('#cancel') as HTMLButtonElement;
    const last = fixture.nativeElement.querySelector('#confirm') as HTMLButtonElement;
    expect(document.activeElement).toBe(first);
    expect(opener.hasAttribute('inert')).toBe(true);
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
    expect(document.activeElement).toBe(last);
    last.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(first);
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(false);
    expect(document.activeElement).toBe(opener);
    expect(opener.hasAttribute('inert')).toBe(false);
  });
  it('does not dismiss a mutation in progress', async () => {
    const fixture = TestBed.createComponent(TestModal); fixture.componentInstance.open.set(true); fixture.componentInstance.busy.set(true);
    fixture.detectChanges(); await fixture.whenStable();
    fixture.nativeElement.querySelector('section').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(fixture.componentInstance.open()).toBe(true);
    fixture.destroy();
  });
});
