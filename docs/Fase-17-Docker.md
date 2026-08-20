# Fase 17 — Docker

## Resultado

Angular quedó dockerizado mediante una imagen multi-stage y un servidor Nginx no-root optimizado para SPA, REST y SignalR.

## Archivos

- `climate-monitoring-web/Dockerfile`
- `climate-monitoring-web/.dockerignore`
- `climate-monitoring-web/nginx.conf.template`
- `climate-monitoring-web/docker-compose.yml`
- `src/environments/environment.production.ts`

## Imagen

1. `node:22-alpine` instala dependencias reproducibles con `npm ci` y genera el build de producción.
2. `nginxinc/nginx-unprivileged:1.27-alpine` recibe únicamente `dist/climate-monitoring-web/browser`.
3. El proceso final escucha en el puerto interno 8080 sin ejecutarse como root.

## Red y configuración

En producción Angular usa rutas relativas:

- API: `/api`
- Hub: `/hubs/monitoring`

Nginx las reenvía a `http://${BACKEND_HOST}`. El valor predeterminado del compose es `host.docker.internal:8080`, adecuado cuando el backend se ejecuta en Docker Desktop o en el host local.

Para otro destino:

```powershell
$env:BACKEND_HOST = "gateway:8080"
docker compose up -d --build
```

La navegación, REST y WebSocket quedan bajo el mismo origen, evitando configuración CORS adicional en el navegador.

## Nginx

- Fallback `try_files` hacia `index.html` para rutas Angular.
- Upgrade WebSocket y timeouts largos para SignalR.
- `index.html` sin caché y assets versionados con caché inmutable.
- Headers de seguridad para MIME sniffing, iframes, referrer y permisos del navegador.
- Endpoint `/health` independiente del backend.

## Comandos

```bash
docker compose config
docker compose build
docker compose up -d
```

Abrir `http://localhost:4200`. Para detenerlo:

```bash
docker compose down
```

## Verificación realizada

- Lint correcto.
- 31/31 pruebas aprobadas.
- Build local de producción correcto.
- `docker compose config` válido.
- Imagen `climate-monitoring-web:local` construida correctamente.
- Contenedor efímero validado:
  - `/health` → 200 `healthy`
  - `/` → 200
  - `/monitoring` → 200 mediante fallback SPA

El contenedor efímero se detuvo y eliminó automáticamente después de la comprobación.
