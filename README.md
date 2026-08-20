# Climate Monitoring Web

Frontend web del Sistema de Monitoreo Climático. Consume el Gateway .NET, presenta métricas y alertas, administra catálogos según el rol y recibe actualizaciones mediante SignalR.

## Tecnologías

- Angular 21 con componentes standalone, Signals y rutas lazy.
- TypeScript 5.9 estricto, Tailwind CSS 4 y SCSS.
- Chart.js y RxJS.
- Vitest y Angular HTTP Testing.
- Nginx no-root para producción.

## Requisitos

Para ejecución local:

- Node.js 22.12 o superior.
- npm 10 o superior.
- Gateway disponible en `http://localhost:8080`.

Para Docker:

- Docker Desktop o Docker Engine con Compose v2.
- Gateway accesible desde el contenedor.

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

El contenedor usa `BACKEND_HOST` sin protocolo. El valor predeterminado es `host.docker.internal:8080`.

Copia [.env.example](.env.example):

```powershell
Copy-Item .env.example .env
```

```bash
cp .env.example .env
```

Después ajusta el destino:

```dotenv
BACKEND_HOST=gateway:8080
```

Si frontend y backend comparten una red Docker, `gateway` debe ser el nombre DNS del servicio Gateway. Si el backend corre en el host, conserva `host.docker.internal:8080`.

### Funcionamiento de la imagen

1. `node:22-alpine` ejecuta `npm ci` y el build.
2. Solo `dist/climate-monitoring-web/browser` pasa a producción.
3. `nginxinc/nginx-unprivileged` sirve Angular en el puerto interno 8080.
4. Nginx reenvía `/api` y `/hubs` a `BACKEND_HOST`.
5. Las rutas Angular usan fallback a `index.html`.

En producción el navegador usa rutas relativas, manteniendo REST y WebSocket bajo el mismo origen.

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
| `Operator` | Lo anterior más simulación, sensores, comunidades y resolución de alertas. |
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

`BACKEND_HOST` no debe incluir `http://`.

### Una ruta devuelve 404 al recargar

Usa el Nginx incluido. Si despliegas los archivos en otro servidor, configura fallback hacia `index.html`.

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
