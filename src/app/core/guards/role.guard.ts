import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SystemRole } from '../../shared/models/api/auth.models';
import { AuthStore } from '../auth/auth.store';

export const roleGuard: CanActivateFn = route => {
  const roles = route.data['roles'] as readonly SystemRole[] | undefined;
  return !roles?.length || inject(AuthStore).hasAnyRole(roles)
    ? true
    : inject(Router).createUrlTree(['/forbidden']);
};
