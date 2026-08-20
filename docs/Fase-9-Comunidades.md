# Fase 9 — Comunidades

## Resultado

Se implementaron todas las operaciones de comunidades disponibles en el Swagger real.

## Rutas

- `/communities`: listado responsive y búsqueda local.
- `/communities/:id`: detalle.
- `/communities/new`: creación.
- `/communities/:id/edit`: edición y cambio de estado.

## Endpoints

- `GET /api/communities`
- `GET /api/communities/{id}`
- `POST /api/communities`
- `PUT /api/communities/{id}`

El contrato no define `DELETE` ni acciones independientes de activación/desactivación. Por ello, la aplicación no inventa esas llamadas y administra `isActive` dentro de `UpdateCommunityRequest`.

## Autorización y validación

La consulta está disponible para todos los usuarios autenticados. Crear y editar requiere `Administrator` u `Operator`, tanto en la navegación como mediante `roleGuard`. Los formularios validan nombre, longitudes y rangos geográficos.

## Verificación

```bash
npm run lint
npm test -- --watch=false
npm run build
```
