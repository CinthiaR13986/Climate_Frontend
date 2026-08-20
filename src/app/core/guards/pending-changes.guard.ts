import { CanDeactivateFn } from '@angular/router';

export interface PendingChangesAware { hasPendingChanges(): boolean; }
export const pendingChangesGuard: CanDeactivateFn<PendingChangesAware> = component => !component.hasPendingChanges();
