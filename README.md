# Climate Monitoring Web

Frontend web del Sistema de Monitoreo Climático. Consume el Gateway .NET, presenta métricas y alertas, administra catálogos según el rol y recibe actualizaciones mediante SignalR.

## Tecnologías

- Angular 21 con componentes standalone, Signals y rutas lazy.
- TypeScript 5.9 estricto, Tailwind CSS 4 y SCSS.
- Chart.js y RxJS.
- Vitest y Angular HTTP Testing.
- Servidor HTTP Node.js sin privilegios para producción.

## Requisitos

Para ejecución local:

- Node.js 22.12 o superior.
- npm 10 o superior.
- Gateway disponible en `http://localhost:8080`.

Para Docker:

- Docker Desktop o Docker Engine con Compose v2.
- Gateway accesible desde el navegador y CORS configurado para el origen del frontend.

## Preparar el backend

Este frontend no contiene base de datos ni credenciales. Levanta el backend desde su carpeta y comprueba que el Gateway esté publicado en:

```text
http://localhost:8080
```

Las credenciales iniciales se obtienen de `ADMIN_SEED_USERNAME` y `ADMIN_SEED_PASSWORD` en la configuración del backend. No copies esa contraseña al código o a archivos versionados del frontend.

## Ejecutar localmente

En PowerShell:

```powershell
cd C:\Users\casa\Documents\umg\desarrolloweb\webdev_proyect\frontend\climate-monitoring-web
npm ci
npm start
```

En Bash o desde la raíz del repositorio:

```bash
cd frontend/climate-monitoring-web
npm ci
npm start
```

Abre `http://localhost:4200`.

En desarrollo, [environment.ts](src/environments/environment.ts) conecta directamente con:

```text
API:     http://localhost:8080
SignalR: http://localhost:8080/hubs/monitoring
```

Si cambia el puerto del Gateway, actualiza `apiUrl` y `realtime.hubUrl` en ese archivo y reinicia `npm start`.

## Ejecutar con Docker

### Opción rápida

Con el backend publicado en el host por el puerto 8080:

```powershell
cd C:\Users\casa\Documents\umg\desarrolloweb\webdev_proyect\frontend\climate-monitoring-web
docker compose up -d --build
```

También puedes usar:

```bash
npm run docker:build
npm run docker:up
```

Abre `http://localhost:4200` y comprueba el contenedor:

```bash
docker compose ps
curl http://localhost:4200/health
```

El healthcheck debe responder `healthy`.

Logs y apagado:

```bash
docker compose logs -f climate-monitoring-web
docker compose down
```

`docker compose down` elimina el contenedor y la red del frontend, pero no la imagen ni datos del backend.

### Configurar otro backend

El contenedor usa `GATEWAY_PUBLIC_URL`, un origen HTTP(S) accesible desde el navegador.
Copia `.env.example` a `.env` y ajusta, por ejemplo:

```dotenv
GATEWAY_PUBLIC_URL=http://localhost:8080
FRONTEND_PORT=4200
```

Configura `FRONTEND_ORIGIN` en el backend con el origen exacto del frontend.
Las direcciones DNS internas de Docker/Kubernetes no son direcciones del navegador.

### Funcionamiento de la imagen

1. Node.js 24.21.0 construye Angular con `npm ci`; ambas etapas fijan el digest base.
2. El runtime contiene los archivos publicados y `server.mjs`, sin dependencias npm.
3. El servidor usa el usuario `node`, puerto 8080 y fallback para rutas Angular.
4. `/runtime-config.json` entrega la URL del Gateway antes de iniciar Angular.
5. REST y SignalR conectan directamente al Gateway. El servidor frontend no reenvía solicitudes API.

El mismo build permite cambiar de entorno sin recompilar. El contenedor exige
`GATEWAY_PUBLIC_URL`; un origen ausente o incorrecto impide el arranque.

## Scripts

| Comando | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo en el puerto 4200. |
| `npm run build` | Build optimizado. |
| `npm run watch` | Build de desarrollo en modo watch. |
| `npm test` | Vitest interactivo. |
| `npm run test:ci` | Ejecuta la suite una vez. |
| `npm run lint` | ESLint para TypeScript y templates. |
| `npm run docker:build` | Construye la imagen local. |
| `npm run docker:up` | Inicia el frontend con Compose. |

## Verificación

```bash
npm run lint
npm run test:ci
npm run build
docker compose config
docker compose build
```

Estado al cerrar la fase 18: 6 archivos y 31 pruebas aprobadas.

## Autenticación y roles

El login consume `POST /api/auth/login`. La sesión JWT se guarda localmente y el interceptor agrega Bearer únicamente a requests del Gateway.

| Rol | Capacidades principales |
|---|---|
| `Viewer` | Dashboard, monitoreo y consultas. |
| `Operator` | Lo anterior más simulación, sensores y atención/cierre de alertas. |
| `Administrator` | Acceso completo, usuarios, auditoría y reinicios administrativos. |

El backend conserva siempre la autorización definitiva.

## Funcionalidad y rutas

| Ruta | Funcionalidad |
|---|---|
| `/login` | Inicio de sesión. |
| `/dashboard` | Métricas, simulación, sensores y alertas. |
| `/monitoring` | Lecturas, histórico, gráfica y simulación. |
| `/sensors` | Listado, detalle y administración. |
| `/communities` | Listado, detalle, creación y edición. |
| `/alerts` | Filtros, detalle y resolución. |
| `/events` | Historial y detalle relacionado. |
| `/users` | Administración para `Administrator`. |
| `/audit` | Bitácora para `Administrator`. |
| `/forbidden` | Acceso denegado. |

## Tiempo real

El shell autenticado conecta con `/hubs/monitoring` y consume:

- `SensorReadingUpdated`
- `AlertGenerated`
- `SensorStatusChanged`
- `SystemReset`

La conexión usa JWT, reconexión exponencial y cierre explícito al terminar sesión. Monitoring hace una carga REST inicial y activa polling cada cinco segundos solo cuando SignalR está desconectado y la pestaña está visible.

## Arquitectura

```text
src/app/
├── core/       configuración, auth, guards, interceptores, layout y realtime
├── shared/     modelos, componentes y pruebas compartidas
└── features/   auth, dashboard, monitoring, sensors, communities,
                alerts, events, users y audit
```

- Componentes standalone con `OnPush`.
- Servicios HTTP alineados con Swagger.
- Signals para UI y RxJS para flujos asíncronos.
- Lazy loading por página.
- Sin endpoints, roles ni datos ficticios.

## Responsive y accesibilidad

- Mobile first desde 320 px.
- Sidebar de escritorio y drawer móvil.
- Tablas desplazables accesibles por teclado.
- Salto al contenido y foco visible.
- Estados de carga, error y vacío.
- Diálogos y confirmaciones accesibles.
- `prefers-reduced-motion`.
- Estados expresados con texto además de color.

## Solución de problemas

### El login devuelve error de red

Comprueba el Gateway en `http://localhost:8080`. En Docker ejecuta:

```bash
docker compose logs climate-monitoring-web
docker compose config
```

`GATEWAY_PUBLIC_URL` debe incluir `http://` o `https://` y no contener una ruta. Comprueba también CORS en Gateway.

### Una ruta devuelve 404 al recargar

Usa el servidor Node.js incluido y publica `/runtime-config.json`. Si despliegas los archivos en otro servidor, configura fallback hacia `index.html`.

### Aparece “Fallback REST activo”

Verifica `/hubs/monitoring/negotiate`, la vigencia del token y el soporte de `Upgrade: websocket`. La aplicación continúa mediante polling mientras se reconecta.

### El puerto 4200 está ocupado

Angular local:

```bash
npm start -- --port 4300
```

En Docker cambia `4200:8080` por `4300:8080` en `docker-compose.yml`.

### npm muestra `UNABLE_TO_VERIFY_LEAF_SIGNATURE`

Configura la CA de la organización o proxy. No desactives `strict-ssl`. Usa `npm ci` con el lockfile versionado.

## Documentación por fases

Los análisis y decisiones de las fases 1 a 18 están en la carpeta `frontend/docs`, desde `Fase-1-Analisis-del-Frontend-y-Swagger.md` hasta `Fase-18-README.md`.


## Phase 2: secciones 11–20

- Usuarios: creación administrativa en `/users/new`, último acceso y filtros de
  búsqueda, rol y estado enviados a la API.
- Comunidades: municipio, departamento, país y conteo de sensores; filtros de
  geografía y estado. Crear/editar requiere Administrator.
- Sensores: instalación, ubicación, RiverLevel, ReservoirLevel, Smoke y Other
  (con tipo ambiental adicional); filtros de comunidad, tipo, estado, código y búsqueda.
- Logout: solicitud autenticada a Gateway para auditoría antes de limpiar la sesión.
- Formularios y pantallas existentes conservan estados de carga, error y vacío.

Todos los accesos siguen usando API Gateway.

## Phase 2: secciones 21–30

- Reglas: `/alert-rules`, `/alert-rules/new` y `/alert-rules/:id/edit`.
  Administrator puede crear, editar y activar/desactivar; los demás roles pueden consultar.
  Los límites describen el intervalo permitido; una lectura fuera del intervalo
  dispara la regla. Verde no genera alertas.
- Alertas: filtros por fecha y estado; flujo Activa → Atendida → Cerrada para
  Administrator/Operator, con confirmación, responsables, fechas y regla guardada.
- Sensores: formulario de valor simulado fijo en el detalle, exclusivo de
  Administrator, y opción para recuperar los valores aleatorios.
- `/readings`: historial global paginado por comunidad, sensor y fechas; muestra
  el estado del sensor al registrar la lectura. Datos anteriores sin snapshot se
  indican como «Sin registro histórico».
- Eventos: valor, responsable y estado; estadísticas por comunidad y período.
- Dashboard: resumen agregado por comunidad, conteos, distribución por nivel,
  eventos y gráficas por tipo/unidad de las últimas 24 horas. SignalR actualiza
  lecturas/alertas; los agregados se refrescan cada 30 segundos.
- Auditoría: sugerencias de acciones para reglas y atención/cierre de alertas.
- SignalR conserva los nombres originales y reconoce AlertAttended/AlertClosed.

Validación: 48 pruebas frontend, build de producción y lint aprobados. La prueba
funcional backend también verificó los seis eventos por WebSocket del Gateway,
JWT, SQL Server y las acciones de auditoría. No se ejecutó navegación visual
automatizada con navegador.

## Phase 2: secciones 31–40

Diálogos con foco inicial, recorrido Tab/Shift+Tab, Escape, restitución de foco
y contenido de fondo inerte. Confirmaciones bloqueadas durante envío, errores
anunciados y validación de formularios asociada a sus campos. Reglas incluyen
skeletons, confirmación de guardado y foco en el primer campo inválido.

Validación: 56 pruebas y lint aprobados; imagen de producción construida.
Los manifiestos Kubernetes y sus instrucciones están en `backend/k8s`.

## Cierre de Fase 2 — secciones 51–64

- La imagen sirve únicamente Angular y `/runtime-config.json`; REST y SignalR
  se conectan al Gateway público configurado. No contiene un proxy backend.
- Kubernetes reutiliza Deployment/Service del frontend, con ConfigMap para la
  URL pública. Configuración, selección de registro, logs y diagnóstico:
  [guía Kubernetes](../../backend/docs/kubernetes.md).
- Contraste del menú lateral, nombre accesible del menú de usuario, cierre del
  menú móvil y referencia ARIA condicional corregidos mediante pruebas de navegador.
- 56 pruebas, lint y build aprobados; dependencias compatibles actualizadas y
  auditoría npm sin vulnerabilidades reportadas en esta revisión.
- La [matriz funcional](../../backend/docs/phase-2-compliance.md) cubre los 76 RF/RNF.
  Se conserva Angular 21; la diferencia con Angular 22+ de la referencia queda
  declarada. No se presenta la aplicación como desplegada en producción.

### Navegador real

Instala con `npm ci`. La prueba usa Edge headless por defecto y credenciales
temporales suministradas por el script backend. Desde `backend`:

```powershell
./scripts/Test-Images.ps1 -BrowserScript ../frontend/climate-monitoring-web/scripts/test-browser.mjs
```

Sobre una pila de prueba ya disponible puede ejecutarse `npm run test:browser`
con `ADMIN_SEED_PASSWORD`, `FRONTEND_TEST_URL` y `GATEWAY_TEST_URL` en el entorno.
Usa únicamente un entorno de prueba: crea una regla y cambia su estado.
`UI_ARTIFACTS` configura reportes y capturas; `test-results/` está ignorado por Git.
El recorrido cubre login/logout, pantallas, reglas, confirmaciones, foco/teclado,
móvil a 375 px y 14 estados con axe. Ver [resultados y límites](../../backend/docs/phase-2-validation.md).

Si el build Docker requiere una CA corporativa, pasa su certificado PEM con
`--secret id=npm_ca,src=ruta/ca.pem`. Solo se usa durante `npm ci` y TLS sigue activo.

## Hostinger con Traefik

Consulta [la guía de despliegue](HOSTINGER.md) para usar el dominio con HTTPS.

