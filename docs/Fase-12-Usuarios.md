# Fase 12 — Usuarios

## Resultado

Se implementó la administración de usuarios disponible en el Gateway, restringida al rol `Administrator`.

## Rutas

- `/users`: listado, búsqueda y filtros locales.
- `/users/:id`: detalle.
- `/users/:id/edit`: edición de usuario, correo y rol.

Todas las rutas aplican `roleGuard` para `Administrator`.

## Endpoints

- `GET /api/users`
- `GET /api/users/{id}`
- `PUT /api/users/{id}`
- `PATCH /api/users/{id}/status`

No se implementaron creación administrativa, cambio de contraseña ni eliminación porque el contrato no publica esas operaciones.

## Comportamiento

- Búsqueda por usuario o correo y filtros por rol/estado.
- Roles válidos: `Administrator`, `Operator` y `Viewer`.
- Activación/desactivación con confirmación y notificación.
- Se impide desactivar la cuenta actualmente autenticada desde el listado para evitar un cierre administrativo accidental.
- Si el administrador edita su propia cuenta, la sesión local actualiza sus datos con la respuesta real.
- Estados de carga, error y resultados vacíos.

## Verificación

```bash
npm run lint
npm test -- --watch=false
npm run build
```
