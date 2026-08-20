# Fase 8 — Sensores

## Resultado

Se implementó el CRUD real de sensores contra el Gateway, sin datos ficticios ni endpoints adicionales.

## Rutas

- `/sensors`: listado y búsqueda local.
- `/sensors/:id`: detalle.
- `/sensors/new`: creación para `Administrator` y `Operator`.
- `/sensors/:id/edit`: edición para `Administrator` y `Operator`.

## Operaciones

- `GET /api/sensors`
- `GET /api/sensors/{id}`
- `POST /api/sensors`
- `PUT /api/sensors/{id}`
- `DELETE /api/sensors/{id}`
- `PATCH /api/sensors/{id}/activate`
- `PATCH /api/sensors/{id}/deactivate`
- `GET /api/communities` para poblar el selector del formulario.

El listado permite buscar por nombre, código, tipo o comunidad. Las mutaciones muestran feedback, bloquean la operación duplicada y la eliminación requiere confirmación. El formulario valida campos obligatorios, longitudes y rangos geográficos.

## Autorización

Las rutas de escritura están protegidas con `roleGuard`. Las acciones también se ocultan para `Viewer`; el backend continúa siendo la autoridad definitiva.

## Verificación

```bash
npm run lint
npm test -- --watch=false
npm run build
```
