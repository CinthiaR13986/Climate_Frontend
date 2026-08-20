import { SystemRole } from '../../../shared/models/api/auth.models';

export interface UpdateUserRequest {
  readonly username: string;
  readonly email: string;
  readonly role: SystemRole;
}

export interface UpdateUserStatusRequest { readonly isActive: boolean; }

export const ROLE_LABELS: Readonly<Record<SystemRole, string>> = {
  Administrator: 'Administrador', Operator: 'Operador', Viewer: 'Visualizador',
};
