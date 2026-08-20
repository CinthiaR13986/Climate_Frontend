# Fase 11 — Eventos

## Resultado

Se implementó el historial completo de eventos climáticos usando el contrato real del Gateway.

## Rutas

- `/events`: historial y filtros.
- `/events/:id`: detalle y vínculos con alerta, sensor y comunidad.

## Endpoints

- `GET /api/events` con `riskType`, `alertLevel`, `sensorId`, `communityId`, `from` y `to`.
- `GET /api/events/{id}`.

Los rangos locales se convierten a ISO 8601 antes de enviarse. También se valida que `from` no sea posterior a `to`.

## Interfaz

- Tabla responsive con fecha, riesgo, nivel, sensor, comunidad y estado.
- Filtros alimentados por catálogos reales.
- Estados de carga, error y resultados vacíos.
- Detalle con navegación a la alerta, el sensor y la comunidad relacionados.
- Solo lectura, porque el backend no publica mutaciones de eventos.

## Verificación

```bash
npm run lint
npm test -- --watch=false
npm run build
```
