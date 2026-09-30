export type NavIconName = 'dashboard' | 'monitoring' | 'sensors' | 'communities' | 'alerts' | 'events' | 'users' | 'audit' | 'system' | 'logout';
export interface NavItem { readonly label: string; readonly path: string; readonly icon: NavIconName; }
export const MONITORING_NAV: readonly NavItem[] = [
  { label: 'Monitoreo', path: '/monitoring', icon: 'monitoring' }, { label: 'Sensores', path: '/sensors', icon: 'sensors' },
  { label: 'Comunidades', path: '/communities', icon: 'communities' }, { label: 'Alertas', path: '/alerts', icon: 'alerts' },
  { label: 'Reglas de alerta', path: '/alert-rules', icon: 'alerts' },
  { label: 'Lecturas', path: '/readings', icon: 'monitoring' },
  { label: 'Historial', path: '/events', icon: 'events' },
];
export const ADMIN_NAV: readonly NavItem[] = [
  { label: 'Usuarios', path: '/users', icon: 'users' }, { label: 'Auditoría', path: '/audit', icon: 'audit' },
  { label: 'Sistema', path: '/system', icon: 'system' },
];
