# Fase 18 — README final

## Resultado

Se reemplazó el README incremental por una guía final de instalación, ejecución, arquitectura, operación y solución de problemas.

## Contenido

- Requisitos diferenciados para local y Docker.
- Preparación del backend y ubicación segura de credenciales seed.
- Comandos para PowerShell y Bash.
- Ejecución Angular local.
- Ejecución Docker con build, healthcheck, logs y apagado.
- Configuración de `BACKEND_HOST` mediante `.env.example`.
- Explicación del proxy REST y SignalR.
- Scripts npm, roles, rutas y arquitectura.
- Responsive, accesibilidad y realtime/fallback.
- Troubleshooting de Gateway, SPA, SignalR, puertos y certificados npm.

## Archivos

- `climate-monitoring-web/README.md`
- `climate-monitoring-web/.env.example`
- `docs/Fase-18-README.md`

## Ejecución local resumida

```bash
cd frontend/climate-monitoring-web
npm ci
npm start
```

Abrir `http://localhost:4200` con el Gateway en `http://localhost:8080`.

## Ejecución Docker resumida

```bash
cd frontend/climate-monitoring-web
docker compose up -d --build
curl http://localhost:4200/health
```

Por defecto el proxy conecta a `host.docker.internal:8080`. Para otro destino, copia `.env.example` a `.env` y modifica `BACKEND_HOST`.

## Verificación

```bash
npm run lint
npm run test:ci
npm run build
docker compose config
```
