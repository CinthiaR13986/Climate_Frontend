# Fase 10 — Alertas

## Resultado

Se implementó la gestión de alertas contra el Gateway real con filtros, tarjetas, detalle, resolución y notificaciones.

## Rutas

- `/alerts`: filtros y resultados responsive.
- `/alerts/:id`: detalle completo y resolución.

## Endpoints

- `GET /api/alerts` con `riskType`, `alertLevel`, `sensorId`, `communityId` e `isActive`.
- `GET /api/alerts/{id}`.
- `PATCH /api/alerts/{id}/resolve`.
- Los catálogos de sensores y comunidades enriquecen los identificadores mostrados.

## Experiencia y autorización

- El nivel se comunica con color y texto para no depender únicamente del color.
- Hay estados de carga, error y resultados vacíos.
- Resolver exige confirmación y muestra una notificación al finalizar.
- La resolución solo se ofrece a `Administrator` y `Operator`; cualquier usuario autenticado puede consultar.
- No se implementó creación ni eliminación porque no existen en el contrato.

## Verificación

```bash
npm run lint
npm test -- --watch=false
npm run build
```
