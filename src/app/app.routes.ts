import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';
import { AppShell } from './core/layout/app-shell/app-shell';
import { FeaturePlaceholderPage } from './core/layout/feature-placeholder-page/feature-placeholder-page';
import { ForbiddenPage } from './core/layout/forbidden-page/forbidden-page';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/login-page/login-page').then(component => component.LoginPage),
    title: 'Iniciar sesión | Climate Monitoring',
  },
  {
    path: '',
    component: AppShell,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/pages/dashboard-page/dashboard-page').then(component => component.DashboardPage),
        data: { pageTitle: 'Dashboard' },
        title: 'Dashboard | Climate Monitoring',
      },
      {
        path: 'monitoring',
        loadComponent: () => import('./features/monitoring/pages/monitoring-page/monitoring-page').then(component => component.MonitoringPage),
        data: { pageTitle: 'Monitoreo en tiempo real' },
        title: 'Monitoreo | Climate Monitoring',
      },
      {
        path: 'sensors',
        loadComponent: () => import('./features/sensors/pages/sensors-page/sensors-page').then(component => component.SensorsPage),
        data: { pageTitle: 'Sensores' },
        title: 'Sensores | Climate Monitoring',
      },
      {
        path: 'sensors/new',
        loadComponent: () => import('./features/sensors/pages/sensor-form-page/sensor-form-page').then(component => component.SensorFormPage),
        canActivate: [roleGuard],
        data: { pageTitle: 'Nuevo sensor', roles: ['Administrator', 'Operator'] },
        title: 'Nuevo sensor | Climate Monitoring',
      },
      {
        path: 'sensors/:id/edit',
        loadComponent: () => import('./features/sensors/pages/sensor-form-page/sensor-form-page').then(component => component.SensorFormPage),
        canActivate: [roleGuard],
        data: { pageTitle: 'Editar sensor', roles: ['Administrator', 'Operator'] },
        title: 'Editar sensor | Climate Monitoring',
      },
      {
        path: 'sensors/:id',
        loadComponent: () => import('./features/sensors/pages/sensor-detail-page/sensor-detail-page').then(component => component.SensorDetailPage),
        data: { pageTitle: 'Detalle del sensor' },
        title: 'Detalle del sensor | Climate Monitoring',
      },
      {
        path: 'communities',
        loadComponent: () => import('./features/communities/pages/communities-page/communities-page').then(component => component.CommunitiesPage),
        data: { pageTitle: 'Comunidades' },
        title: 'Comunidades | Climate Monitoring',
      },
      {
        path: 'communities/new',
        loadComponent: () => import('./features/communities/pages/community-form-page/community-form-page').then(component => component.CommunityFormPage),
        canActivate: [roleGuard],
        data: { pageTitle: 'Nueva comunidad', roles: ['Administrator'] },
        title: 'Nueva comunidad | Climate Monitoring',
      },
      {
        path: 'communities/:id/edit',
        loadComponent: () => import('./features/communities/pages/community-form-page/community-form-page').then(component => component.CommunityFormPage),
        canActivate: [roleGuard],
        data: { pageTitle: 'Editar comunidad', roles: ['Administrator'] },
        title: 'Editar comunidad | Climate Monitoring',
      },
      {
        path: 'communities/:id',
        loadComponent: () => import('./features/communities/pages/community-detail-page/community-detail-page').then(component => component.CommunityDetailPage),
        data: { pageTitle: 'Detalle de comunidad' },
        title: 'Detalle de comunidad | Climate Monitoring',
      },
      { path: 'readings', loadComponent: () => import('./features/monitoring/pages/readings-page').then(m => m.ReadingsPage), data: { pageTitle: 'Lecturas históricas' } },
      { path: 'alert-rules', loadComponent: () => import('./features/alert-rules/alert-rules-page').then(m => m.AlertRulesPage), data: { pageTitle: 'Reglas de alerta' } },
      { path: 'alert-rules/new', canActivate: [roleGuard], data: { roles: ['Administrator'], pageTitle: 'Crear regla' }, loadComponent: () => import('./features/alert-rules/alert-rule-form-page').then(m => m.AlertRuleFormPage) },
      { path: 'alert-rules/:id/edit', canActivate: [roleGuard], data: { roles: ['Administrator'], pageTitle: 'Editar regla' }, loadComponent: () => import('./features/alert-rules/alert-rule-form-page').then(m => m.AlertRuleFormPage) },
      {
        path: 'alerts',
        loadComponent: () => import('./features/alerts/pages/alerts-page/alerts-page').then(component => component.AlertsPage),
        data: { pageTitle: 'Alertas' },
        title: 'Alertas | Climate Monitoring',
      },
      {
        path: 'alerts/:id',
        loadComponent: () => import('./features/alerts/pages/alert-detail-page/alert-detail-page').then(component => component.AlertDetailPage),
        data: { pageTitle: 'Detalle de alerta' },
        title: 'Detalle de alerta | Climate Monitoring',
      },
      {
        path: 'events',
        loadComponent: () => import('./features/events/pages/events-page/events-page').then(component => component.EventsPage),
        data: { pageTitle: 'Historial de eventos' },
        title: 'Eventos | Climate Monitoring',
      },
      {
        path: 'events/:id',
        loadComponent: () => import('./features/events/pages/event-detail-page/event-detail-page').then(component => component.EventDetailPage),
        data: { pageTitle: 'Detalle del evento' },
        title: 'Detalle del evento | Climate Monitoring',
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/pages/users-page/users-page').then(component => component.UsersPage),
        canActivate: [roleGuard],
        data: { pageTitle: 'Usuarios', roles: ['Administrator'] },
        title: 'Usuarios | Climate Monitoring',
      },
      {
        path: 'users/new',
        loadComponent: () => import('./features/users/pages/user-create-page/user-create-page').then(component => component.UserCreatePage),
        canActivate: [roleGuard], data: { pageTitle: 'Crear usuario', roles: ['Administrator'] },
        title: 'Crear usuario | Climate Monitoring',
      },
      {
        path: 'users/:id/edit',
        loadComponent: () => import('./features/users/pages/user-edit-page/user-edit-page').then(component => component.UserEditPage),
        canActivate: [roleGuard],
        data: { pageTitle: 'Editar usuario', roles: ['Administrator'] },
        title: 'Editar usuario | Climate Monitoring',
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./features/users/pages/user-detail-page/user-detail-page').then(component => component.UserDetailPage),
        canActivate: [roleGuard],
        data: { pageTitle: 'Detalle del usuario', roles: ['Administrator'] },
        title: 'Detalle del usuario | Climate Monitoring',
      },
      {
        path: 'audit',
        loadComponent: () => import('./features/audit/pages/audit-page/audit-page').then(component => component.AuditPage),
        canActivate: [roleGuard],
        data: { pageTitle: 'Auditoría', roles: ['Administrator'] },
        title: 'Auditoría | Climate Monitoring',
      },
      {
        path: 'audit/:id',
        loadComponent: () => import('./features/audit/pages/audit-detail-page/audit-detail-page').then(component => component.AuditDetailPage),
        canActivate: [roleGuard],
        data: { pageTitle: 'Detalle de auditoría', roles: ['Administrator'] },
        title: 'Detalle de auditoría | Climate Monitoring',
      },
      { path: 'system', component: FeaturePlaceholderPage, canActivate: [roleGuard], data: { pageTitle: 'Configuración del sistema', roles: ['Administrator'] } },
      { path: 'forbidden', component: ForbiddenPage, data: { pageTitle: 'Acceso restringido' } },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
