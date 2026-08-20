Actúa como un **Senior Frontend Developer y Software Architect especializado en Angular 20+, TypeScript, Tailwind CSS, RxJS, Signals, integración con APIs REST, JWT, SignalR, diseño responsive y arquitectura frontend empresarial**.

Debes diseñar e implementar el frontend completo para el proyecto:

# Sistema Web de Monitoreo y Alerta Temprana para Riesgos Climáticos

El backend ya existe y está desarrollado mediante microservicios en C# .NET, detrás de un API Gateway.

No debes inventar endpoints ni contratos.

La fuente de verdad para la integración es el Swagger/OpenAPI del backend.

---

# 1. Backend disponible

El API Gateway se encuentra disponible localmente en:

```text
http://localhost:8080
```

La aplicación Angular deberá consumir siempre el Gateway y no comunicarse directamente con los microservicios internos.

Configura:

```typescript
apiUrl: 'http://localhost:8080'
```

mediante environments/configuración y nunca hardcodees la URL directamente dentro de componentes o servicios.

---

# 2. Tecnologías

Utiliza:

- Angular 20 o superior.
- TypeScript.
- Standalone Components.
- Angular Router.
- Angular HttpClient.
- Angular Signals.
- RxJS cuando realmente sea necesario.
- Reactive Forms.
- Tailwind CSS.
- SignalR si el backend expone realmente un Hub.
- Chart.js mediante una integración Angular adecuada, o una librería equivalente compatible con Angular 20.
- Leaflet solamente si se implementa el mapa opcional.
- ESLint.
- Vitest/Jasmine/Karma según la configuración estándar disponible en el proyecto.
- Docker para ejecución final.

No utilizar:

- Bootstrap.
- jQuery.
- NgModules tradicionales salvo que una dependencia estrictamente lo requiera.
- `any` salvo una situación excepcional debidamente justificada.

---

# 3. Principio fundamental de integración

El Swagger/OpenAPI proporcionado por el backend constituye la **fuente de verdad**.

Debes respetar exactamente:

- URLs.
- Métodos HTTP.
- Query parameters.
- Path parameters.
- Request DTO.
- Response DTO.
- enums.
- códigos HTTP.
- autenticación Bearer.

No inventes propiedades adicionales.

No renombres arbitrariamente propiedades recibidas por el backend.

No inventes endpoints para facilitar el frontend.

Si alguna funcionalidad visual necesita información que el API actual no proporciona, indica claramente:

```text
Frontend necesita:
Backend actualmente proporciona:
Dato faltante:
Cambio de backend recomendado:
```

antes de asumir información inexistente.

---

# 4. Objetivo funcional

Construir una aplicación web que permita visualizar y administrar un sistema de monitoreo climático de comunidades rurales.

El frontend debe permitir:

- Iniciar sesión.
- Administrar usuarios.
- Visualizar comunidades.
- Administrar comunidades.
- Visualizar sensores.
- Crear sensores.
- Editar sensores.
- Activar sensores.
- Desactivar sensores.
- Eliminar sensores.
- Visualizar lecturas climáticas actuales.
- Visualizar históricos.
- Visualizar gráficas.
- Administrar la simulación.
- Visualizar alertas.
- Diferenciar alertas por nivel de riesgo.
- Resolver alertas.
- Consultar historial de eventos.
- Consultar auditoría.
- Visualizar indicadores principales mediante un dashboard.
- Adaptarse a dispositivos desktop, tablet y móvil.

---

# 5. Diseño visual general

Quiero una interfaz moderna de tipo:

```text
Climate Monitoring Dashboard
```

Inspirada visualmente en dashboards modernos de:

- monitoreo ambiental,
- centros de operaciones,
- aplicaciones meteorológicas,
- sistemas IoT,
- observabilidad.

Pero sin copiar literalmente ninguna aplicación existente.

El resultado debe sentirse como una aplicación empresarial real y no como una tarea universitaria básica.

---

# 6. Layout principal

Después del login utilizar:

```text
┌──────────────────────────────────────────────────────────┐
│ Topbar                                                   │
├──────────────┬───────────────────────────────────────────┤
│              │                                           │
│   Sidebar    │              Router Outlet                │
│              │                                           │
│              │                                           │
└──────────────┴───────────────────────────────────────────┘
```

Sidebar:

```text
Dashboard

MONITOREO
├── Monitoreo
├── Sensores
├── Comunidades
├── Alertas
└── Historial

ADMINISTRACIÓN
├── Usuarios
├── Auditoría
└── Configuración / Sistema

Cerrar sesión
```

Mostrar opciones administrativas según el rol del usuario.

---

# 7. Responsive Design

Debe funcionar correctamente en:

- Desktop.
- Laptop.
- Tablet.
- Mobile.

En desktop:

```text
Sidebar fijo
+
Contenido
```

En móvil:

```text
Sidebar colapsable / drawer
```

No permitir scroll horizontal innecesario.

Las tablas deben poder transformarse o adaptarse correctamente a pantallas pequeñas.

---

# 8. Arquitectura Angular

Utilizar una arquitectura basada en features.

Crear aproximadamente:

```text
src/app/
│
├── core/
│   ├── auth/
│   ├── guards/
│   ├── interceptors/
│   ├── http/
│   ├── layout/
│   ├── config/
│   └── realtime/
│
├── shared/
│   ├── components/
│   ├── directives/
│   ├── pipes/
│   ├── models/
│   └── utils/
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── monitoring/
│   ├── sensors/
│   ├── communities/
│   ├── alerts/
│   ├── events/
│   ├── users/
│   └── audit/
│
├── app.routes.ts
├── app.config.ts
└── app.component.ts
```

Cada feature deberá contener solamente elementos relacionados con ese dominio.

Ejemplo:

```text
features/sensors/
├── pages/
├── components/
├── services/
├── models/
└── sensors.routes.ts
```

---

# 9. Lazy Loading

Las features deben cargarse mediante rutas lazy.

Ejemplo conceptual:

```typescript
{
  path: 'sensors',
  loadChildren: () =>
    import('./features/sensors/sensors.routes')
      .then(m => m.SENSOR_ROUTES)
}
```

No cargar toda la aplicación inicialmente.

---

# 10. Rutas principales

Crear:

```text
/login

/dashboard

/monitoring

/sensors
/sensors/new
/sensors/:id
/sensors/:id/edit

/communities
/communities/new
/communities/:id/edit

/alerts
/alerts/:id

/events
/events/:id

/users
/users/:id

/audit
```

Utilizar rutas protegidas.

---

# 11. Autenticación

El backend expone:

```http
POST /api/auth/register
POST /api/auth/login
```

Login request:

```typescript
interface LoginRequest {
  login: string | null;
  password: string | null;
}
```

Login response:

```typescript
interface LoginResponse {
  accessToken: string | null;
  expiresAt: string;
  user: UserResponse;
}
```

Crear:

```text
AuthService
AuthStore
authGuard
roleGuard
authInterceptor
```

---

# 12. Login

Crear una pantalla visualmente cuidada.

Debe contener:

```text
Sistema de Monitoreo Climático

Usuario o correo
Contraseña

[ Iniciar sesión ]
```

Agregar:

- estado loading,
- validaciones,
- mensajes de error,
- mostrar/ocultar contraseña,
- manejo de credenciales incorrectas.

No mostrar mensajes técnicos del backend directamente al usuario.

---

# 13. JWT

Guardar y administrar correctamente:

```text
accessToken
expiresAt
user
```

Centralizar el manejo de la sesión.

No acceder directamente a `localStorage` desde diferentes componentes.

Crear:

```typescript
TokenStorageService
```

o encapsularlo dentro del AuthStore/AuthService.

---

# 14. HTTP Interceptor

Todas las llamadas protegidas deberán incluir:

```http
Authorization: Bearer {token}
```

Crear:

```text
authInterceptor
```

También crear un interceptor global de errores.

---

# 15. Manejo de 401

Ante:

```text
401 Unauthorized
```

el frontend deberá:

1. eliminar sesión inválida;
2. redirigir a `/login`;
3. impedir loops de navegación.

---

# 16. Manejo de 403

Ante:

```text
403 Forbidden
```

mostrar una pantalla o mensaje:

```text
No tienes permisos para realizar esta acción.
```

No cerrar la sesión automáticamente por un 403.

---

# 17. ProblemDetails

El backend puede devolver:

```typescript
interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
}
```

Crear un sistema centralizado que traduzca estos errores a mensajes amigables.

Nunca hacer esto repetidamente en cada componente:

```typescript
subscribe({
  error: ...
})
```

si el error puede gestionarse globalmente.

---

# 18. UserResponse

Respetar:

```typescript
interface UserResponse {
  id: string;
  username: string | null;
  email: string | null;
  role: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

Endpoints disponibles:

```http
GET /api/users/me
GET /api/users
GET /api/users/{id}
PUT /api/users/{id}
PATCH /api/users/{id}/status
```

---

# 19. Administración de usuarios

Crear página:

```text
Usuarios
```

Mostrar:

```text
Usuario
Correo
Rol
Estado
Fecha de creación
Acciones
```

Acciones disponibles según permisos:

```text
Editar
Activar
Desactivar
```

Utilizar:

```http
PATCH /api/users/{id}/status
```

con:

```typescript
interface UpdateUserStatusRequest {
  isActive: boolean;
}
```

---

# 20. Dashboard

El Dashboard debe ser la pantalla principal.

Debe mostrar como mínimo cinco indicadores climáticos:

```text
Temperatura
Humedad
Velocidad del viento
Nivel de lluvia
Nivel del río
```

Consumir:

```http
GET /api/monitoring/current
```

Respuesta:

```typescript
SensorReadingResponse[]
```

Cada tarjeta debe mostrar:

```text
Icono
Nombre
Valor
Unidad
Hora de última lectura
Estado visual
```

Ejemplo:

```text
┌──────────────────────┐
│ 🌡 Temperatura       │
│                      │
│     27.4 °C          │
│                      │
│ Actualizado 15:42    │
└──────────────────────┘
```

No codificar valores ficticios si el backend está disponible.

---

# 21. SensorReadingResponse

Representar exactamente:

```typescript
interface SensorReadingResponse {
  id: string;
  sensorId: string;
  communityId: string;
  sensorType: SensorType;
  value: number;
  unit: string | null;
  recordedAt: string;
}
```

---

# 22. SensorType

Crear:

```typescript
export type SensorType =
  | 'Temperature'
  | 'Humidity'
  | 'WindSpeed'
  | 'Rainfall'
  | 'WaterLevel';
```

Mapeo solamente de presentación:

```text
Temperature -> Temperatura
Humidity    -> Humedad
WindSpeed   -> Velocidad del viento
Rainfall    -> Lluvia
WaterLevel  -> Nivel del río/reservorio
```

Mantener los valores originales en las peticiones al backend.

---

# 23. Iconos climáticos

Utilizar iconos consistentes:

```text
Temperature -> termómetro
Humidity -> gota
WindSpeed -> viento
Rainfall -> nube/lluvia
WaterLevel -> ondas/agua
```

Utilizar una biblioteca de iconos Angular compatible o SVG.

No utilizar emojis como interfaz final.

---

# 24. Página de Monitoreo

Crear:

```text
Monitoreo en tiempo real
```

Debe mostrar:

- estado de simulación,
- tarjetas de lecturas,
- gráfica de evolución,
- sensor seleccionado,
- última actualización,
- alertas recientes.

Consultar:

```http
GET /api/monitoring/current
```

---

# 25. Última lectura

Utilizar:

```http
GET /api/monitoring/sensors/{sensorId}/latest
```

para visualizar detalles específicos de un sensor.

---

# 26. Historial de lecturas

Utilizar:

```http
GET /api/monitoring/sensors/{sensorId}/history
```

Query parameters disponibles:

```text
communityId
from
to
```

Crear filtros mediante Reactive Forms.

No concatenar query strings manualmente.

Utilizar:

```typescript
HttpParams
```

---

# 27. Gráfica de sensores

El backend proporciona específicamente:

```http
GET /api/monitoring/sensors/{sensorId}/chart
```

Query params:

```text
from
to
interval
```

El valor por defecto del backend para interval es:

```text
5m
```

Respuesta:

```typescript
interface SensorChartResponse {
  sensorId: string;
  unit: string | null;
  data: ChartPoint[] | null;
}

interface ChartPoint {
  timestamp: string;
  value: number;
}
```

Mostrar mediante gráfica de línea.

Eje X:

```text
timestamp
```

Eje Y:

```text
value
```

Mostrar unidad.

---

# 28. Simulación

Existe:

```http
GET /api/monitoring/simulation/status
```

Respuesta:

```typescript
interface SimulationStatusResponse {
  isRunning: boolean;
}
```

Crear un componente:

```text
SimulationControlComponent
```

Debe mostrar claramente:

```text
Simulación activa
```

o:

```text
Simulación detenida
```

---

# 29. Controles de simulación

Utilizar exactamente:

```http
POST /api/monitoring/simulation/start
POST /api/monitoring/simulation/stop
POST /api/monitoring/simulation/reset
```

Mostrar botones:

```text
[ Iniciar ]
[ Detener ]
[ Reiniciar ]
```

Antes de RESET mostrar confirmación.

No permitir múltiples clicks mientras una operación está procesándose.

---

# 30. Reinicio completo del sistema

Existe adicionalmente:

```http
POST /api/monitoring/system/reset
```

No confundirlo con:

```http
POST /api/monitoring/simulation/reset
```

Crear una opción administrativa claramente diferenciada.

Antes de ejecutarla mostrar modal de confirmación.

Ejemplo:

```text
¿Reiniciar el sistema de monitoreo?

Esta acción modificará el estado operativo del sistema.

[Cancelar] [Reiniciar sistema]
```

---

# 31. Crear lectura manual

El backend dispone:

```http
POST /api/monitoring/readings
```

Contrato:

```typescript
interface CreateReadingRequest {
  sensorId: string;
  value: number;
  recordedAt?: string | null;
}
```

Puede utilizarse dentro de una pantalla administrativa o de prueba.

No debe formar parte del flujo principal del usuario si no aporta valor funcional.

---

# 32. Comunidades

Endpoints:

```http
GET  /api/communities
POST /api/communities
GET  /api/communities/{id}
PUT  /api/communities/{id}
```

Crear:

```text
CommunityService
CommunityListPage
CommunityFormPage
```

---

# 33. CommunityResponse

Utilizar:

```typescript
interface CommunityResponse {
  id: string;
  name: string | null;
  description: string | null;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: string;
}
```

---

# 34. Formulario de comunidad

Datos:

```text
Nombre
Descripción
Latitud
Longitud
```

Utilizar Reactive Forms.

Validar coordenadas:

```text
latitude:
-90 <= latitude <= 90

longitude:
-180 <= longitude <= 180
```

Sin asumir que dichas validaciones sustituyen las reglas del backend.

---

# 35. Sensores

Endpoints disponibles:

```http
GET    /api/sensors
POST   /api/sensors
GET    /api/sensors/{id}
PUT    /api/sensors/{id}
DELETE /api/sensors/{id}

PATCH /api/sensors/{id}/activate
PATCH /api/sensors/{id}/deactivate
```

Crear:

```text
SensorService
SensorListPage
SensorDetailPage
SensorFormPage
```

---

# 36. SensorResponse

Implementar:

```typescript
interface SensorResponse {
  id: string;
  name: string | null;
  code: string | null;
  description: string | null;
  type: SensorType;
  unit: string | null;
  communityId: string;
  communityName: string | null;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

# 37. Lista de sensores

Mostrar:

```text
Nombre
Código
Tipo
Unidad
Comunidad
Estado
Última actualización
Acciones
```

Agregar:

```text
Buscar
Filtrar por tipo
Filtrar por estado
```

Los filtros que el backend no soporte pueden realizarse localmente mientras el volumen de datos lo permita.

No enviar query parameters inexistentes al backend.

---

# 38. Crear sensor

Formulario:

```text
Nombre
Código
Descripción
Tipo
Unidad
Comunidad
Latitud
Longitud
```

Contrato:

```typescript
interface CreateSensorRequest {
  name: string | null;
  code: string | null;
  description: string | null;
  type: SensorType;
  unit: string | null;
  communityId: string;
  latitude: number;
  longitude: number;
}
```

El selector de comunidad debe consumir:

```http
GET /api/communities
```

No utilizar IDs hardcodeados.

---

# 39. Editar sensor

Consumir:

```http
PUT /api/sensors/{id}
```

Precargar los datos mediante:

```http
GET /api/sensors/{id}
```

---

# 40. Activación de sensores

Utilizar:

```http
PATCH /api/sensors/{id}/activate
PATCH /api/sensors/{id}/deactivate
```

Representar visualmente:

```text
Activo
Inactivo
```

mediante badges.

---

# 41. Eliminar sensor

Consumir:

```http
DELETE /api/sensors/{id}
```

Mostrar confirmación antes de ejecutar.

Nunca eliminar inmediatamente desde un icono sin confirmación.

---

# 42. Alertas

Endpoints:

```http
GET /api/alerts

GET /api/alerts/{id}

PATCH /api/alerts/{id}/resolve
```

Filtros soportados por backend:

```text
riskType
alertLevel
sensorId
communityId
isActive
```

Implementar mediante `HttpParams`.

---

# 43. AlertLevel

Implementar:

```typescript
export type AlertLevel =
  | 'Green'
  | 'Yellow'
  | 'Orange'
  | 'Red';
```

Mapeo visual:

```text
Green  -> Normal
Yellow -> Precaución
Orange -> Alerta
Red    -> Emergencia
```

---

# 44. Código visual de alertas

Utilizar consistentemente:

```text
Green
Yellow
Orange
Red
```

como semántica de peligro.

Estos colores sí son parte funcional del sistema.

Aplicarlos en:

- badges,
- bordes,
- indicadores,
- alertas,
- gráficas cuando corresponda,
- cards.

Mantener contraste WCAG adecuado.

No depender exclusivamente del color.

Agregar texto e icono.

---

# 45. RiskType

Implementar:

```typescript
export type RiskType =
  | 'Flood'
  | 'Drought'
  | 'Storm'
  | 'Frost'
  | 'ForestFire';
```

Mapeo visual:

```text
Flood      -> Inundación
Drought    -> Sequía
Storm      -> Tormenta
Frost      -> Helada
ForestFire -> Incendio forestal
```

Los valores enviados al backend deben mantenerse en inglés.

---

# 46. AlertResponse

Implementar:

```typescript
interface AlertResponse {
  id: string;
  sensorId: string;
  communityId: string;
  alertType: RiskType;
  level: AlertLevel;
  title: string | null;
  description: string | null;
  sensorValue: number;
  thresholdValue: number;
  generatedAt: string;
  isActive: boolean;
  resolvedAt: string | null;
}
```

---

# 47. Pantalla de alertas

Crear un diseño que permita identificar inmediatamente:

```text
Emergencias
Alertas
Precauciones
Normales
```

Mostrar:

```text
Nivel
Fenómeno
Título
Descripción
Valor detectado
Valor límite
Fecha
Estado
Acción
```

---

# 48. Resolver alerta

Para una alerta activa mostrar:

```text
[ Resolver alerta ]
```

Consumir:

```http
PATCH /api/alerts/{id}/resolve
```

Actualizar inmediatamente la interfaz tras respuesta exitosa.

---

# 49. Notificación sonora

Cuando aparezca una nueva alerta:

```text
Orange
Red
```

permitir emitir una notificación sonora.

Pero:

- respetar las restricciones de autoplay del navegador;
- permitir al usuario desactivar sonidos;
- no reproducir sonidos continuamente;
- evitar duplicados;
- no reproducir sonido para la misma alerta repetidamente.

Guardar preferencia local:

```text
soundEnabled
```

---

# 50. Historial de eventos

Endpoints:

```http
GET /api/events
GET /api/events/{id}
```

Filtros soportados:

```text
riskType
alertLevel
sensorId
communityId
from
to
```

---

# 51. EventResponse

Implementar:

```typescript
interface EventResponse {
  id: string;
  alertId: string;
  sensorId: string;
  communityId: string;
  riskType: RiskType;
  alertLevel: AlertLevel;
  description: string | null;
  occurredAt: string;
  resolvedAt: string | null;
}
```

---

# 52. Página Historial

Mostrar:

```text
Fecha
Fenómeno
Nivel
Sensor
Comunidad
Descripción
Fecha resolución
```

Agregar filtros:

```text
Fenómeno
Nivel
Sensor
Comunidad
Desde
Hasta
```

Crear botón:

```text
Limpiar filtros
```

---

# 53. Auditoría

El backend proporciona:

```http
GET /api/audit
GET /api/audit/{id}
```

Filtros:

```text
userId
action
resource
from
to
```

Página disponible solamente para usuarios autorizados.

---

# 54. AuditResponse

Utilizar:

```typescript
interface AuditResponse {
  id: string;
  userId: string;
  userName: string | null;
  action: string | null;
  resource: string | null;
  resourceId: string | null;
  description: string | null;
  ipAddress: string | null;
  timestamp: string;
}
```

Mostrar:

```text
Fecha
Usuario
Acción
Recurso
Descripción
IP
```

---

# 55. Dashboard de alertas

Además de las lecturas actuales mostrar:

```text
Alertas activas
Emergencias activas
Sensores activos
Sensores inactivos
Estado de simulación
```

Si no existe un endpoint agregado para alguno de estos valores, calcularlo utilizando los endpoints disponibles.

Por ejemplo:

```http
GET /api/sensors

GET /api/alerts?isActive=true
```

No inventar:

```http
GET /api/dashboard/summary
```

si dicho endpoint no existe en el Swagger actual.

---

# 56. Alertas recientes

En Dashboard mostrar las últimas alertas obtenidas desde:

```http
GET /api/alerts
```

Ordenar por:

```text
generatedAt DESC
```

si el backend no garantiza el orden, realizar el ordenamiento en frontend.

Mostrar inicialmente un número limitado, por ejemplo:

```text
5
```

sin alterar la API.

---

# 57. Mapa

El proyecto original contempla el mapa como opcional.

El Swagger posee:

```text
Sensor.latitude
Sensor.longitude

Community.latitude
Community.longitude
```

Por lo tanto puede implementarse un mapa.

Utilizar Leaflet.

Mostrar:

```text
Comunidad
└── sensores
```

Cada sensor deberá mostrar:

```text
Nombre
Tipo
Estado
Última lectura si está disponible
```

No utilizar Google Maps si requiere API Key innecesariamente.

Esta funcionalidad debe quedar aislada en un componente lazy/cargable para no afectar el bundle inicial.

---

# 58. Tiempo real

IMPORTANTE.

No inventes una URL de SignalR.

El OpenAPI REST suministrado no documenta ningún Hub SignalR.

Procedimiento obligatorio:

### Caso A — tienes acceso al código backend

Busca en el backend:

```csharp
MapHub
Hub<>
HubConnection
```

Identifica:

- URL real del Hub,
- eventos emitidos,
- modelos enviados,
- autenticación requerida.

Solo después implementa SignalR.

### Caso B — solamente tienes el Swagger

No inventes:

```text
/hubs/monitoring
```

ni nombres de eventos.

Crea una abstracción:

```text
RealtimeService
```

que inicialmente pueda funcionar mediante actualización REST controlada.

Deja preparada una configuración:

```typescript
realtime: {
  enabled: false,
  hubUrl: ''
}
```

hasta conocer el contrato real.

---

# 59. Fallback temporal de actualización

Si SignalR aún no puede conectarse, actualizar solamente las pantallas que necesitan datos dinámicos mediante un mecanismo eficiente.

Por ejemplo:

```text
Dashboard/Monitoring:
cada 5 segundos
```

Consultar:

```http
GET /api/monitoring/current
```

Y eventualmente:

```http
GET /api/alerts?isActive=true
```

Detener el polling cuando:

- el componente se destruya,
- la aplicación pierda sesión,
- la pestaña no requiera dicho flujo.

Utilizar RxJS correctamente y evitar memory leaks.

Este polling es únicamente un fallback.

---

# 60. Signals

Utilizar Angular Signals para estado local y feature state cuando tenga sentido.

Ejemplo:

```typescript
readonly sensors = signal<SensorResponse[]>([]);
readonly loading = signal(false);
readonly selectedSensor = signal<SensorResponse | null>(null);
```

Usar:

```text
computed()
effect()
```

solo donde sean apropiados.

No convertir absolutamente todo a signals sin necesidad.

---

# 61. Stores

Crear stores ligeros para features con estado significativo:

```text
AuthStore
MonitoringStore
AlertStore
```

No instalar NgRx únicamente por complejidad artificial.

Si no existe necesidad real de un state manager global, utilizar Signals + Services.

---

# 62. Formularios

Todos los formularios deben utilizar:

```text
ReactiveFormsModule
```

Evitar Template Driven Forms.

Implementar:

- touched,
- dirty,
- validation messages,
- submit loading,
- disable durante requests.

---

# 63. UI Components reutilizables

Crear componentes compartidos:

```text
Button
Input
Select
Badge
Card
Modal
ConfirmDialog
LoadingSpinner
Skeleton
EmptyState
ErrorState
PageHeader
Table
Toast
StatusBadge
AlertLevelBadge
SensorTypeBadge
DateRangeFilter
```

No duplicar HTML complejo en múltiples features.

---

# 64. Loading states

No dejar pantallas vacías mientras carga la información.

Utilizar:

```text
Skeletons
```

para Dashboard.

Utilizar spinner únicamente para acciones pequeñas cuando sea apropiado.

---

# 65. Empty states

Ejemplo:

```text
No existen sensores registrados.

[Agregar sensor]
```

Para alertas:

```text
No hay alertas activas.
El sistema se encuentra operando normalmente.
```

---

# 66. Toasts

Mostrar mensajes para operaciones como:

```text
Sensor creado correctamente.
Sensor actualizado.
Sensor activado.
Sensor desactivado.
Alerta resuelta.
Simulación iniciada.
Simulación detenida.
```

Para errores mostrar un mensaje amigable basado en `ProblemDetails`.

---

# 67. Confirmaciones

Utilizar modal para acciones destructivas:

```text
Eliminar sensor
Desactivar usuario
Resolver alerta
Reiniciar simulación
Reiniciar sistema
```

No utilizar:

```typescript
window.confirm()
```

en la implementación final.

---

# 68. Fechas

El backend utiliza fechas ISO/date-time.

Crear utilidades consistentes.

Mostrar en la interfaz según zona horaria del navegador.

Ejemplo:

```text
17/08/2026 16:15
```

Mantener los valores originales en UTC al comunicarse con backend.

---

# 69. Http Services

Crear servicios especializados:

```text
AuthApiService
UsersApiService
CommunitiesApiService
SensorsApiService
MonitoringApiService
AlertsApiService
EventsApiService
AuditApiService
```

Los servicios HTTP no deben contener lógica visual.

Ejemplo:

```typescript
@Injectable({
  providedIn: 'root'
})
export class SensorsApiService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getAll(): Observable<SensorResponse[]> {
    return this.http.get<SensorResponse[]>(
      `${this.apiUrl}/api/sensors`
    );
  }
}
```

---

# 70. No usar URLs mágicas

No hacer repetidamente:

```typescript
this.http.get(
  'http://localhost:8080/api/...'
);
```

Crear:

```typescript
API_URL
```

mediante InjectionToken/config/environment.

---

# 71. Query params

Crear objetos tipados:

```typescript
interface AlertFilters {
  riskType?: RiskType;
  alertLevel?: AlertLevel;
  sensorId?: string;
  communityId?: string;
  isActive?: boolean;
}
```

y construir:

```typescript
HttpParams
```

solo con propiedades definidas.

---

# 72. Tablas

Las tablas administrativas deben incluir cuando tenga sentido:

- búsqueda local,
- filtros,
- ordenamiento,
- empty state,
- loading,
- acciones.

No implementar paginación backend ficticia porque el Swagger actual no presenta parámetros de paginación.

Si el volumen aumenta, documentar que el backend debería incorporar:

```text
page
pageSize
sort
```

pero no enviarlos mientras la API no los soporte.

---

# 73. Accesibilidad

Cumplir:

- labels,
- aria-label,
- foco visible,
- navegación mediante teclado,
- contraste,
- errores asociados a inputs,
- botones semánticos.

Los estados de alerta no deben diferenciarse únicamente mediante color.

---

# 74. Tailwind

Crear un pequeño Design System.

Usar spacing, typography, borders y shadows consistentes.

Evitar clases Tailwind gigantes repetidas.

Cuando exista repetición visual, crear un componente.

---

# 75. Tema visual

Usar una apariencia limpia.

Base:

```text
fondos neutros
cards blancas
sidebar oscuro o neutro
tipografía legible
bordes suaves
sombras discretas
```

Los colores semánticos del sistema deben reservarse para alertas:

```text
Green
Yellow
Orange
Red
```

No saturar toda la interfaz con colores.

---

# 76. Dark Mode

Preparar la arquitectura para modo oscuro.

Puede implementarse si no aumenta excesivamente la complejidad.

Debe persistir la preferencia local.

No es prioritario frente a las funcionalidades obligatorias.

---

# 77. Seguridad frontend

No considerar que ocultar botones constituye seguridad.

Los roles del frontend solo mejoran UX.

La seguridad real corresponde al backend.

Aunque un botón esté oculto, manejar correctamente:

```text
403
```

del servidor.

---

# 78. Código TypeScript

Habilitar modo estricto.

No utilizar:

```typescript
any
```

innecesariamente.

Preferir:

```text
interfaces
type aliases
readonly
private
protected
```

según corresponda.

No crear clases de modelo que solamente contengan propiedades.

Utilizar interfaces/types para DTO.

---

# 79. Clean Code

Evitar:

- componentes de 1000 líneas,
- lógica HTTP dentro del HTML,
- subscriptions anidadas,
- código duplicado,
- URLs hardcodeadas,
- magic strings,
- métodos gigantes,
- múltiples responsabilidades,
- lógica de dominio dentro de templates.

---

# 80. RxJS

Cuando uses RxJS:

Preferir operadores adecuados:

```text
switchMap
map
tap
catchError
finalize
combineLatest
forkJoin
```

según corresponda.

Evitar:

```text
subscribe dentro de subscribe
```

Utilizar:

```text
takeUntilDestroyed()
```

cuando exista una suscripción manual ligada al lifecycle.

---

# 81. Performance

Utilizar:

- lazy loading,
- `@for` con `track`,
- Signals,
- componentes pequeños,
- carga condicional de Chart.js/Leaflet cuando corresponda.

No llamar múltiples veces al mismo endpoint desde varios componentes simultáneamente sin razón.

---

# 82. Sintaxis moderna Angular

Utilizar Angular moderno:

```html
@if (...) {

}

@for (item of items; track item.id) {

}
```

Preferirla sobre:

```text
*ngIf
*ngFor
```

en código nuevo.

---

# 83. Dashboard propuesto

Visualmente quiero aproximadamente:

```text
┌──────────────────────────────────────────────────────────────────┐
│ Monitoreo climático                         Sistema ● En línea   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Temperatura   Humedad      Viento       Lluvia      Nivel río  │
│  ┌─────────┐   ┌─────────┐  ┌─────────┐  ┌─────────┐ ┌────────┐ │
│  │ 27.3°C  │   │  71 %   │  │ 16 km/h │  │ 12 mm   │ │ 2.4 m  │ │
│  └─────────┘   └─────────┘  └─────────┘  └─────────┘ └────────┘ │
│                                                                  │
│  Evolución climática                 Alertas activas             │
│  ┌──────────────────────────┐        ┌────────────────────────┐  │
│  │                          │        │ ROJO    Inundación     │  │
│  │       LINE CHART         │        │ Nivel crítico del río │  │
│  │                          │        │                        │  │
│  └──────────────────────────┘        │ NARANJA Tormenta      │  │
│                                      └────────────────────────┘  │
│                                                                  │
│  Sensores                           Estado del sistema           │
│  Activos: 8                         Simulación: Activa           │
│  Inactivos: 2                       Última lectura: 16:20        │
└──────────────────────────────────────────────────────────────────┘
```

Los números mostrados aquí son solamente representación visual.

Nunca deben quedar hardcodeados como información real.

---

# 84. Pantalla de sensores

Diseño aproximado:

```text
Sensores

[ Buscar... ] [Tipo ▼] [Estado ▼]             [+ Nuevo sensor]

┌─────────────────────────────────────────────────────────────┐
│ Nombre    Tipo          Comunidad       Estado     Acciones │
├─────────────────────────────────────────────────────────────┤
│ TEMP-01   Temperatura   Comunidad A     ● Activo     ...    │
│ HUM-01    Humedad       Comunidad A     ● Activo     ...    │
└─────────────────────────────────────────────────────────────┘
```

---

# 85. Pantalla de alertas

Diseño aproximado:

```text
Alertas

[ Todas ] [ Emergencias ] [ Alertas ] [ Precaución ]

┌─────────────────────────────────────────────────────────────┐
│ ROJO                                                        │
│ Riesgo de inundación                                        │
│                                                             │
│ El nivel del río superó el límite configurado.             │
│                                                             │
│ Detectado: 4.7 m       Límite: 4.0 m                       │
│                                                             │
│ 17 Ago 2026 16:10                       [Resolver alerta]   │
└─────────────────────────────────────────────────────────────┘
```

Los datos mostrados en el ejemplo son únicamente ilustrativos.

---

# 86. Testing

Crear pruebas para:

```text
AuthService
authInterceptor
authGuard
SensorsApiService
MonitoringApiService
AlertsApiService
```

Y componentes críticos.

Probar:

- login exitoso,
- login inválido,
- inclusión del JWT,
- manejo 401,
- carga de sensores,
- filtros,
- actualización del monitoreo,
- resolución de alertas.

---

# 87. Docker

Preparar frontend para Docker.

Construcción:

```text
Angular production build
        ↓
Nginx
```

Crear:

```text
Dockerfile
nginx.conf
```

No hardcodear API de producción dentro del build sin explicar la estrategia.

---

# 88. Integración con Docker Compose

El frontend debe poder integrarse posteriormente al compose del backend.

Arquitectura esperada:

```text
Browser
   |
   v
Angular / Nginx
   |
   v
Climate Gateway :8080
   |
   +-------------------------------+
   |
 Microservicios .NET
```

---

# 89. README

Crear README con:

```text
Descripción
Tecnologías
Requisitos
Instalación
Variables de entorno
Ejecutar Angular
Ejecutar contra backend local
Build
Docker
Estructura
Autenticación
Endpoints
Testing
Troubleshooting
```

---

# 90. API actualmente disponible

Debes trabajar solamente contra estas áreas:

```text
AUTH
POST /api/auth/register
POST /api/auth/login

USERS
GET   /api/users/me
GET   /api/users
GET   /api/users/{id}
PUT   /api/users/{id}
PATCH /api/users/{id}/status

COMMUNITIES
GET  /api/communities
POST /api/communities
GET  /api/communities/{id}
PUT  /api/communities/{id}

SENSORS
GET    /api/sensors
POST   /api/sensors
GET    /api/sensors/{id}
PUT    /api/sensors/{id}
DELETE /api/sensors/{id}
PATCH  /api/sensors/{id}/activate
PATCH  /api/sensors/{id}/deactivate

MONITORING
GET  /api/monitoring/current
GET  /api/monitoring/sensors/{sensorId}/latest
GET  /api/monitoring/sensors/{sensorId}/history
GET  /api/monitoring/sensors/{sensorId}/chart
POST /api/monitoring/readings

GET  /api/monitoring/simulation/status
POST /api/monitoring/simulation/start
POST /api/monitoring/simulation/stop
POST /api/monitoring/simulation/reset

POST /api/monitoring/system/reset

ALERTS
GET   /api/alerts
GET   /api/alerts/{id}
PATCH /api/alerts/{id}/resolve

EVENTS
GET /api/events
GET /api/events/{id}

AUDIT
GET /api/audit
GET /api/audit/{id}
```

---

# 91. Flujo principal

La aplicación debe soportar:

```text
LOGIN
  ↓
JWT
  ↓
DASHBOARD
  ↓
GET /api/monitoring/current
  ↓
Lecturas climáticas
  ↓
Gráficas
  ↓
Alertas activas
  ↓
Historial
```

Flujo administrativo:

```text
Administrador
     ↓
Sensores
     ↓
Crear / editar / activar / desactivar
     ↓
Simulación
     ↓
Start / Stop / Reset
     ↓
Auditoría
```

---

# 92. Orden de implementación

No construyas toda la aplicación de golpe.

Trabaja mediante fases.

## Fase 1 — Análisis

Antes de escribir código:

1. inspecciona el OpenAPI completo;
2. enumera todos los endpoints;
3. enumera todos los schemas;
4. detecta autenticación;
5. detecta parámetros;
6. detecta posibles inconsistencias;
7. detecta si existe SignalR dentro del backend;
8. presenta arquitectura frontend.

No escribas todavía toda la aplicación.

---

## Fase 2 — Bootstrap

Crear proyecto:

```bash
ng new climate-monitoring-web
```

Configurar:

- standalone,
- routing,
- SCSS o CSS coherente con Tailwind,
- strict TypeScript,
- Tailwind.

Mostrar exactamente los comandos.

---

## Fase 3 — Core

Crear:

```text
API configuration
AuthService
AuthStore
TokenStorage
Interceptor
Guards
ProblemDetails
Error handling
Layout
```

---

## Fase 4 — Login

Implementar autenticación real contra:

```http
POST http://localhost:8080/api/auth/login
```

Comprobar el flujo completo antes de continuar.

---

## Fase 5 — Layout

Implementar:

```text
Sidebar
Topbar
Router outlet
Responsive navigation
```

---

## Fase 6 — Dashboard

Integrar:

```http
GET /api/monitoring/current
GET /api/monitoring/simulation/status
GET /api/alerts
GET /api/sensors
```

---

## Fase 7 — Monitoring

Implementar:

- tiempo real o fallback,
- lecturas,
- detalle,
- histórico,
- chart.

---

## Fase 8 — Sensores

Implementar CRUD real contra el backend.

---

## Fase 9 — Comunidades

Implementar CRUD disponible.

---

## Fase 10 — Alertas

Implementar:

- filtros,
- cards,
- detalle,
- resolve,
- notificaciones.

---

## Fase 11 — Eventos

Implementar historial completo.

---

## Fase 12 — Usuarios

Implementar administración de usuarios.

---

## Fase 13 — Auditoría

Implementar bitácora.

---

## Fase 14 — Realtime

Si existe SignalR:

- conectar,
- autenticar,
- manejar reconexión,
- consumir eventos reales.

Si no existe información suficiente:

- mantener fallback REST;
- documentar claramente qué falta en backend.

---

## Fase 15 — Responsive + UX

Revisar:

```text
desktop
tablet
mobile
loading
error
empty
accessibility
```

---

## Fase 16 — Testing

Implementar tests.

---

## Fase 17 — Docker

Dockerizar Angular.

---

## Fase 18 — README

Crear documentación final.

---

# 93. Forma de trabajo obligatoria

En cada fase:

1. explica qué vamos a hacer;
2. muestra estructura de archivos;
3. indica comandos;
4. indica ruta exacta de cada archivo;
5. proporciona código completo;
6. no omitas imports;
7. no uses pseudocódigo para archivos necesarios;
8. explica las decisiones relevantes;
9. indica cómo comprobar el resultado;
10. resuelve errores TypeScript antes de continuar;
11. no continúes automáticamente con la siguiente fase.

---

# 94. Regla crítica sobre Swagger

Antes de implementar cualquier servicio Angular:

Verifica nuevamente el Swagger.

Ejemplo:

```text
Quiero implementar AlertsApiService.

Primero:
1. busca /api/alerts;
2. confirma parámetros;
3. confirma response;
4. confirma authentication;
5. genera el servicio.
```

Nunca generes la integración desde memoria o desde este prompt si el OpenAPI real contradice algún detalle.

**El OpenAPI real siempre tiene prioridad.**

---

# 95. Resultado esperado

Al finalizar quiero tener:

```text
Angular 20+
      |
      v
API Gateway
localhost:8080
      |
      v
Backend .NET Microservices
```

con una interfaz moderna que permita administrar y visualizar completamente el sistema de monitoreo climático.

La aplicación deberá estar suficientemente estructurada para posteriormente desplegar:

```text
Frontend
Backend
SQL Server
```

mediante Docker en GNU/Linux/VPS.

---

# 96. Inicio

Comienza únicamente con:

# FASE 1 — ANÁLISIS DEL FRONTEND Y DEL SWAGGER

Entrega:

1. resumen completo de los endpoints detectados;
2. schemas detectados;
3. arquitectura Angular propuesta;
4. páginas necesarias;
5. servicios necesarios;
6. guards;
7. interceptors;
8. stores;
9. componentes reutilizables;
10. flujo de autenticación;
11. flujo de monitoreo;
12. flujo de alertas;
13. estrategia responsive;
14. estrategia de tiempo real;
15. estructura completa inicial de carpetas.

**Todavía no generes todo el código.**