import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info';
export interface ToastMessage { readonly id: number; readonly kind: ToastKind; readonly message: string; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly state = signal<readonly ToastMessage[]>([]);
  readonly messages = this.state.asReadonly();

  show(message: string, kind: ToastKind = 'info', durationMs = 5000): void {
    const toast = { id: ++this.nextId, kind, message } satisfies ToastMessage;
    this.state.update(messages => [...messages, toast]);
    setTimeout(() => this.dismiss(toast.id), durationMs);
  }

  dismiss(id: number): void {
    this.state.update(messages => messages.filter(message => message.id !== id));
  }
}
