# FASE 1 — ANÁLISIS DEL FRONTEND Y DEL SWAGGER

## Alcance y fuentes

Esta fase es exclusivamente de análisis: no crea todavía el proyecto Angular ni instala dependencias. Se inspeccionaron el OpenAPI 3.0.1 real (`backend/docs/openapi/climate-api-v1.json`) y, solo para información ausente del contrato, las políticas y SignalR del backend.

- Gateway: `http://localhost:8080`.
- Inventario: **29 paths, 35 operaciones y 24 schemas**.
- Seguridad: HTTP Bearer JWT. Solo registro y login son anónimos.
- Roles reales: `Administrator`, `Operator`, `Viewer`.

## 1. Endpoints detectados

### Auth

| Método | Ruta | Request | Response | Estados |
|---|---|---|---|---|
| POST | `/api/auth/register` | `RegisterRequest` | `UserResponse` | 201, 409, 422 |
| POST | `/api/auth/login` | `LoginRequest` | `LoginResponse` | 200, 401, 403, 422 |

### Users

| Método | Ruta | Entrada | Response |
|---|---|---|---|
| GET | `/api/users/me` | — | `UserResponse` |
| GET | `/api/users` | — | `UserResponse[]` |
| GET | `/api/users/{id}` | path `id: uuid` | `UserResponse` |
| PUT | `/api/users/{id}` | path `id`, `UpdateUserRequest` | `UserResponse` |
| PATCH | `/api/users/{id}/status` | path `id`, `UpdateUserStatusRequest` | `void` (204) |

Todas requieren Bearer. Según las políticas reales, listar, consultar por id y modificar usuarios requiere `Administrator`; `/me` admite cualquier usuario autenticado.

### Communities

| Método | Ruta | Entrada | Response |
|---|---|---|---|
| GET | `/api/communities` | — | `CommunityResponse[]` |
| POST | `/api/communities` | `CreateCommunityRequest` | `CommunityResponse` |
| GET | `/api/communities/{id}` | path `id: uuid` | `CommunityResponse` |
| PUT | `/api/communities/{id}` | path `id`, `UpdateCommunityRequest` | `CommunityResponse` |

Lectura: cualquier autenticado. Escritura: `Administrator` u `Operator`.

### Sensors

| Método | Ruta | Entrada | Response |
|---|---|---|---|
| GET | `/api/sensors` | — | `SensorResponse[]` |
| POST | `/api/sensors` | `CreateSensorRequest` | `SensorResponse` |
| GET | `/api/sensors/{id}` | path `id: uuid` | `SensorResponse` |
| PUT | `/api/sensors/{id}` | path `id`, `UpdateSensorRequest` | `SensorResponse` |
| DELETE | `/api/sensors/{id}` | path `id` | sin schema documentado |
| PATCH | `/api/sensors/{id}/activate` | path `id` | sin schema documentado |
| PATCH | `/api/sensors/{id}/deactivate` | path `id` | sin schema documentado |

Lectura: cualquier autenticado. Mutaciones: `Administrator` u `Operator`.

### Monitoring

| Método | Ruta | Entrada | Response |
|---|---|---|---|
| GET | `/api/monitoring/current` | — | `SensorReadingResponse[]` |
| GET | `/api/monitoring/sensors/{sensorId}/latest` | path `sensorId: uuid` | `SensorReadingResponse` |
| GET | `/api/monitoring/sensors/{sensorId}/history` | path `sensorId`; query `communityId?`, `from?`, `to?` | `SensorReadingResponse[]` |
| GET | `/api/monitoring/sensors/{sensorId}/chart` | path `sensorId`; query `from?`, `to?`, `interval?` (default `5m`) | `SensorChartResponse` |
| POST | `/api/monitoring/readings` | `CreateReadingRequest` | `SensorReadingResponse` |
| GET | `/api/monitoring/simulation/status` | — | `SimulationStatusResponse` |
| POST | `/api/monitoring/simulation/start` | — | `SimulationStatusResponse` |
| POST | `/api/monitoring/simulation/stop` | — | `SimulationStatusResponse` |
| POST | `/api/monitoring/simulation/reset` | — | `SimulationStatusResponse` |
| POST | `/api/monitoring/system/reset` | — | `SimulationStatusResponse` |

`communityId` es UUID y `from`/`to` son ISO date-time. Start/stop requieren `Administrator` u `Operator`; ambos resets requieren `Administrator` en el backend actual.

### Alerts

| Método | Ruta | Entrada | Response |
|---|---|---|---|
| GET | `/api/alerts` | query `riskType?`, `alertLevel?`, `sensorId?`, `communityId?`, `isActive?` | `AlertResponse[]` |
| GET | `/api/alerts/{id}` | path `id: uuid` | `AlertResponse` |
| PATCH | `/api/alerts/{id}/resolve` | path `id: uuid` | sin schema documentado |

Resolver requiere `Administrator` u `Operator`.

### Events

| Método | Ruta | Entrada | Response |
|---|---|---|---|
| GET | `/api/events` | query `riskType?`, `alertLevel?`, `sensorId?`, `communityId?`, `from?`, `to?` | `EventResponse[]` |
| GET | `/api/events/{id}` | path `id: uuid` | `EventResponse` |

### Audit

| Método | Ruta | Entrada | Response |
|---|---|---|---|
| GET | `/api/audit` | query `userId?`, `action?`, `resource?`, `from?`, `to?` | `AuditResponse[]` |
| GET | `/api/audit/{id}` | path `id: uuid` | `AuditResponse` |

## 2. Schemas detectados

### Auth y usuarios

- `LoginRequest`: `login`, `password`.
- `LoginResponse`: `accessToken`, `expiresAt`, `user`.
- `RegisterRequest`: `username`, `email`, `password`.
- `UpdateUserRequest`: `username`, `email`, `role`.
- `UpdateUserStatusRequest`: `isActive`.
- `UserResponse`: `id`, `username`, `email`, `role`, `isActive`, `createdAt`, `updatedAt`.
- `ProblemDetails`: `type`, `title`, `status`, `detail`, `instance`.

### Comunidades y sensores

- `CommunityResponse`: `id`, `name`, `description`, `latitude`, `longitude`, `isActive`, `createdAt`.
- `CreateCommunityRequest`: `name`, `description`, `latitude`, `longitude`.
- `UpdateCommunityRequest`: los anteriores más `isActive`.
- `SensorResponse`: `id`, `name`, `code`, `description`, `type`, `unit`, `communityId`, `communityName`, `latitude`, `longitude`, `isActive`, `createdAt`, `updatedAt`.
- `CreateSensorRequest` / `UpdateSensorRequest`: `name`, `code`, `description`, `type`, `unit`, `communityId`, `latitude`, `longitude`.
- `SensorType`: `Temperature | Humidity | WindSpeed | Rainfall | WaterLevel`.

### Monitoreo, alertas e historial

- `CreateReadingRequest`: `sensorId`, `value`, `recordedAt`.
- `SensorReadingResponse`: `id`, `sensorId`, `communityId`, `sensorType`, `value`, `unit`, `recordedAt`.
- `SensorChartResponse`: `sensorId`, `unit`, `data: ChartPoint[]`.
- `ChartPoint`: `timestamp`, `value`.
- `SimulationStatusResponse`: `isRunning`.
- `AlertResponse`: `id`, `sensorId`, `communityId`, `alertType`, `level`, `title`, `description`, `sensorValue`, `thresholdValue`, `generatedAt`, `isActive`, `resolvedAt`.
- `RiskType`: `Flood | Drought | Storm | Frost | ForestFire`.
- `AlertLevel`: `Green | Yellow | Orange | Red`.
- `EventResponse`: `id`, `alertId`, `sensorId`, `communityId`, `riskType`, `alertLevel`, `description`, `occurredAt`, `resolvedAt`.
- `AuditResponse`: `id`, `userId`, `userName`, `action`, `resource`, `resourceId`, `description`, `ipAddress`, `timestamp`.

Antes de implementar cada servicio se volverá a consultar `nullable`, formatos y responses directamente en OpenAPI.

## 3. Inconsistencias y riesgos

1. Los 24 schemas tienen `required` vacío aunque C# y sus validadores imponen reglas. No se asumirá que todo es opcional.
2. OpenAPI marca Bearer, pero no expresa las políticas por rol. El frontend ocultará acciones por UX y siempre manejará 403.
3. Varias operaciones solo declaran 200/401/403 y omiten posibles 404/409/422.
4. Communities y Sensors crean con 200, mientras register usa 201; se respetará el contrato actual.
5. No existe paginación. Búsqueda, ordenamiento y algunos filtros serán locales sin enviar parámetros ficticios.
6. SignalR no está descrito en OpenAPI; se confirmó en código backend.
7. DELETE, activate, deactivate y resolve no documentan un response schema; se tiparán `Observable<void>` hasta que el contrato cambie.
8. El servidor OpenAPI es localhost. Cada entorno usará configuración, nunca URLs mágicas.
9. El rol de Audit no figura en el contrato; la UI lo reservará a `Administrator`, pero el backend es la autoridad.

## 4. SignalR confirmado

- Hub público: `/hubs/monitoring` a través del Gateway.
- Hub protegido con JWT; Angular usará `accessTokenFactory`.
- Eventos reales y payloads:

| Evento | Payload |
|---|---|
| `SensorReadingUpdated` | `SensorReadingResponse` |
| `AlertGenerated` | `AlertResponse` |
| `SensorStatusChanged` | `{ id: string; isActive: boolean }` |
| `SystemReset` | `SimulationStatusResponse` |

No existen eventos separados llamados `ReadingReceived` o `AlertResolved`; no se inventarán. SignalR actualizará stores después de la carga REST inicial. Ante desconexión se usará polling controlado cada 5 segundos solo en vistas dinámicas, cancelado al destruir la vista, ocultar la pestaña o cerrar sesión.

## 5. Arquitectura Angular propuesta

Angular standalone, TypeScript strict, rutas lazy, Signals para estado y RxJS para HTTP/polling/realtime. No NgRx.

```text
App shell
├── core: config, auth, guards, interceptors, layout, realtime
├── shared: UI y utilidades sin HTTP ni reglas de features
└── features lazy: auth, dashboard, monitoring, sensors,
    communities, alerts, events, users, audit y system
```

Reglas: `core` no importa features; `shared` no conoce endpoints; los HTTP services son delgados; stores/facades coordinan estado; todas las llamadas inyectan `API_URL`.

## 6. Páginas y rutas

| Ruta | Página | Acceso UX |
|---|---|---|
| `/login` | Login | pública |
| `/dashboard` | Resumen climático | autenticado |
| `/monitoring` | Tiempo real, gráfica, simulación | autenticado; acciones por rol |
| `/sensors`, `/sensors/:id` | Lista/detalle | autenticado |
| `/sensors/new`, `/sensors/:id/edit` | Formularios | Administrator/Operator |
| `/communities` | Lista | autenticado |
| `/communities/new`, `/communities/:id/edit` | Formularios | Administrator/Operator |
| `/alerts`, `/alerts/:id` | Lista/detalle | autenticado |
| `/events`, `/events/:id` | Historial/detalle | autenticado |
| `/users`, `/users/:id` | Administración | Administrator |
| `/audit` | Bitácora | Administrator |
| `/system` | Reinicio del sistema | Administrator |
| `/forbidden` | Acceso denegado | autenticado |
| `/**` | No encontrado | cualquiera |

## 7. Servicios, guards, interceptors y stores

Servicios core: `AppConfigService`, `TokenStorageService`, `AuthApiService`, `AuthService`, `ProblemDetailsService`, `ToastService`, `RealtimeService`.

Servicios API: `UsersApiService`, `CommunitiesApiService`, `SensorsApiService`, `MonitoringApiService`, `AlertsApiService`, `EventsApiService`, `AuditApiService`.

Guards:

- `authGuard`: sesión válida y `returnUrl` seguro.
- `guestGuard`: impide volver a login autenticado.
- `roleGuard`: compara `route.data.roles`; deriva a `/forbidden`.
- `pendingChangesGuard`: protege formularios dirty.

Interceptors:

- `authInterceptor`: añade Bearer únicamente al origen configurado del Gateway.
- `authErrorInterceptor`: 401 limpia sesión una sola vez; 403 conserva sesión.
- `apiErrorInterceptor`: normaliza `ProblemDetails` y errores de red.

Stores:

- `AuthStore`: token, expiración, usuario, rol y permisos derivados.
- `MonitoringStore`: lecturas, selección, simulación, loading y última actualización.
- `AlertStore`: alertas, filtros y contadores por nivel.
- `SensorStore`: catálogo, filtros locales y mutaciones.

## 8. Componentes reutilizables

`UiButton`, `IconButton`, `UiInput`, `UiSelect`, `FormField`, `Card`, `Modal`, `ConfirmDialog`, `LoadingSpinner`, `Skeleton`, `EmptyState`, `ErrorState`, `PageHeader`, `ResponsiveTable`, `ToastContainer`, `StatusBadge`, `AlertLevelBadge`, `SensorTypeBadge`, `DateRangeFilter`, `AppShell`, `Sidebar`, `Topbar` y `MobileNav`.

Se usarán SVG accesibles o una biblioteca Angular tree-shakeable; no emojis en la interfaz final.

## 9. Flujos principales

### Autenticación

```text
/login → POST /api/auth/login
→ TokenStorage/AuthStore guarda accessToken, expiresAt y user
→ /dashboard o returnUrl
→ authInterceptor añade Bearer
→ 401: limpiar y regresar a login sin loop
→ 403: conservar sesión y mostrar acceso denegado
→ logout/expiración: detener SignalR y polling
```

Al restaurar se validará `expiresAt` y se podrá confirmar la identidad con `/api/users/me`.

### Monitoreo

```text
Entrar a dashboard
→ cargar current + simulation/status + alertas activas + sensores
→ conectar SignalR
→ SensorReadingUpdated actualiza lectura
→ AlertGenerated actualiza alertas
→ fallback polling si SignalR falla
→ cancelar recursos al salir/logout
```

Histórico y chart se consultan al seleccionar sensor y se construyen queries mediante `HttpParams`.

### Alertas

```text
GET /api/alerts con filtros soportados
→ representar nivel con color + texto + icono
→ AlertGenerated inserta/actualiza store
→ confirmación accesible
→ PATCH /api/alerts/{id}/resolve
→ refrescar store y mostrar toast
```

## 10. Estrategia responsive y accesible

- Mobile first; sidebar fijo en desktop y drawer con focus trap en móvil.
- Sin scroll horizontal global; tablas con contenedor o tarjetas móviles.
- Dashboard: 1 columna móvil, 2 tablet, hasta 5 desktop.
- Foco visible, labels, `aria-describedby`, navegación por teclado y targets táctiles.
- Alertas nunca dependen solo del color; contraste WCAG AA.
- Gráficas con resumen textual y preferencia `prefers-reduced-motion`.

## 11. Estructura inicial de carpetas

```text
climate-monitoring-web/
├── public/
│   ├── config.json
│   └── icons/
├── src/app/
│   ├── core/
│   │   ├── auth/
│   │   ├── config/
│   │   ├── guards/
│   │   ├── http/
│   │   ├── interceptors/
│   │   ├── layout/{app-shell,sidebar,topbar,mobile-nav}/
│   │   └── realtime/
│   ├── shared/
│   │   ├── components/
│   │   ├── directives/
│   │   ├── models/api/
│   │   ├── pipes/
│   │   └── utils/
│   ├── features/
│   │   ├── auth/{pages,components,models}/
│   │   ├── dashboard/{pages,components,services}/
│   │   ├── monitoring/{pages,components,services,models,store}/
│   │   ├── sensors/{pages,components,services,models,store}/
│   │   ├── communities/{pages,components,services,models}/
│   │   ├── alerts/{pages,components,services,models,store}/
│   │   ├── events/{pages,components,services,models}/
│   │   ├── users/{pages,components,services,models}/
│   │   ├── audit/{pages,components,services,models}/
│   │   └── system/{pages,components}/
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── src/environments/
├── src/styles.scss
├── Dockerfile
├── nginx.conf
├── eslint.config.js
├── package.json
├── tailwind.config.js
└── README.md
```

## 12. Comandos y comprobación

No se ejecutó `ng new`, no se instalaron paquetes y no se generó código: así lo exige la fase 1. Se recorrieron las 35 operaciones y los 24 schemas, se confirmaron seguridad y parámetros, se detectaron inconsistencias, y se verificaron el Hub y sus cuatro eventos reales.

La siguiente fase será **Fase 2 — Bootstrap**, pero no se inicia automáticamente.
