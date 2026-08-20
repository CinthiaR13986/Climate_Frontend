# Fase 13 — Auditoría

## Resultado

Se implementó la bitácora administrativa real, de solo lectura y restringida a `Administrator`.

## Rutas

- `/audit`: registros y filtros.
- `/audit/:id`: detalle técnico.

Ambas rutas aplican `roleGuard` para `Administrator`.

## Endpoints

- `GET /api/audit` con `userId`, `action`, `resource`, `from` y `to`.
- `GET /api/audit/{id}`.

Las fechas locales se convierten a ISO 8601 y el formulario impide rangos invertidos.

## Interfaz

- Tabla cronológica con usuario, acción, recurso, identificador y dirección IP.
- Selector de usuarios obtenido del backend.
- Detalle con descripción y todos los campos publicados por el contrato.
- Estados de carga, error y resultados vacíos.
- No existen acciones de modificación o eliminación en el Swagger.

## Verificación

```bash
npm run lint
npm test -- --watch=false
npm run build
```
