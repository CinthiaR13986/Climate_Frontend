# Fase 3 — Core

## Resultado

Se implementó la infraestructura transversal del frontend sin adelantar las features. La aplicación ya posee configuración, sesión JWT, servicios de autenticación, guards, interceptores, manejo uniforme de errores, notificaciones y layout responsive.

## Estructura creada

```text
src/app/
├── core/
│   ├── auth/
│   │   ├── auth-api.service.ts
│   │   ├── auth-session.model.ts
│   │   ├── auth.service.ts
│   │   ├── auth.store.ts
│   │   └── token-storage.service.ts
│   ├── config/
│   │   ├── app-config.model.ts
│   │   └── app-config.token.ts
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   ├── guest.guard.ts
│   │   ├── pending-changes.guard.ts
│   │   └── role.guard.ts
│   ├── http/
│   │   ├── api-error.model.ts
│   │   └── problem-details.service.ts
│   ├── interceptors/
│   │   ├── api-error.interceptor.ts
│   │   └── auth.interceptor.ts
│   ├── layout/
│   │   ├── app-shell/
│   │   ├── core-welcome-page/
│   │   ├── login-placeholder-page/
│   │   ├── sidebar/
│   │   └── topbar/
│   └── notifications/toast.service.ts
├── shared/
│   ├── components/toast-container/
│   └── models/api/
│       ├── auth.models.ts
│       └── problem-details.model.ts
└── app.config.ts
```

También se crearon `src/environments/environment.ts` y `environment.production.ts`, con reemplazo de producción configurado en `angular.json`.

## Decisiones relevantes

### Configuración

`APP_CONFIG` es un `InjectionToken<AppConfig>`. Los servicios no conocen URLs literales. Su valor actual es:

```typescript
{
  apiUrl: 'http://localhost:8080',
  realtime: {
    enabled: true,
    hubUrl: 'http://localhost:8080/hubs/monitoring'
  }
}
```

### Sesión

`TokenStorageService` es la única clase que accede a `localStorage`. Valida mínimamente el JSON y es segura para ejecución no-browser. `AuthStore` usa Signals y rechaza sesiones expiradas, sin token, con usuario inactivo o rol desconocido.

Estado derivado disponible:

- `accessToken`
- `currentUser`
- `isAuthenticated`
- `role`
- `isAdministrator`
- `canOperate`

### HTTP

`authInterceptor` adjunta el encabezado solamente cuando el destino pertenece al Gateway configurado:

```http
Authorization: Bearer <token>
```

Esto evita filtrar el JWT a URLs de terceros. `apiErrorInterceptor` convierte `HttpErrorResponse` en `ApiError`:

- 401 con token: limpia la sesión y navega a `/login`.
- 403: conserva la sesión y muestra mensaje de permisos.
- ProblemDetails: traduce mensajes de red, 400, 404, 409 y 422.

### Guards

- `authGuard`: protege el shell y preserva `returnUrl`.
- `guestGuard`: evita mostrar login a una sesión válida.
- `roleGuard`: consume `route.data['roles']`.
- `pendingChangesGuard`: contrato reutilizable para formularios de fases posteriores.

Los roles en frontend son UX; el backend continúa siendo la autoridad.

### Layout

El shell posee sidebar fijo en desktop y drawer en móvil. La navegación administrativa solo aparece a `Administrator`. Las rutas futuras se mantienen fuera del router hasta implementar sus features; por ahora el shell incluye únicamente el placeholder de dashboard y el login incluye un placeholder explícito.

## Contratos respetados

Los modelos `LoginRequest`, `LoginResponse`, `RegisterRequest`, `UserResponse` y `ProblemDetails` reflejan el OpenAPI real. `AuthApiService` utiliza exclusivamente:

```text
POST /api/auth/login
POST /api/auth/register
```

## Comandos de comprobación

```powershell
cd frontend/climate-monitoring-web
npm.cmd run lint
npm.cmd test -- --watch=false
npm.cmd run build
```

## Resultado de validación

- ESLint: sin errores.
- Tests: 2/2 aprobados.
- Build production: correcto.
- Bundle inicial: 270.54 kB raw, 72.71 kB estimados transferidos.
- TypeScript y templates estrictos: sin errores.

La siguiente etapa es **Fase 4 — Login** y no se inició automáticamente.
