import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ToastService } from '../../../core/notifications/toast.service';

@Component({
  selector: 'app-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast-container.html',
})
export class ToastContainer {
  protected readonly toastService = inject(ToastService);
}
