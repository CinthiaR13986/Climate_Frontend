# Fase 7 — Monitoring

## Resultado

La ruta protegida `/monitoring` quedó conectada al Gateway real y se carga de forma diferida. No se agregaron endpoints ni datos simulados en el frontend.

## Funcionalidad

- Polling REST cada cinco segundos para lecturas actuales, estado de simulación y alertas activas.
- El polling se pausa cuando la pestaña no está visible y se destruye al abandonar la página.
- Selector de sensor con última lectura, histórico y gráfica agregada.
- Filtros `from`, `to` e `interval` enviados al backend.
- Estados vacíos y errores visibles cuando aún no existen lecturas.
- Inicio y detención de simulación para `Operator` y `Administrator`.
- Reinicio de simulación limitado a `Administrator`, conforme a la autorización del backend.
- Confirmación accesible antes de reiniciar.

## Endpoints consumidos

- `GET /api/monitoring/current`
- `GET /api/monitoring/sensors/{sensorId}/latest`
- `GET /api/monitoring/sensors/{sensorId}/history`
- `GET /api/monitoring/sensors/{sensorId}/chart`
- `POST /api/monitoring/readings`
- `GET /api/monitoring/simulation/status`
- `POST /api/monitoring/simulation/start`
- `POST /api/monitoring/simulation/stop`
- `POST /api/monitoring/simulation/reset`

## Tiempo real

SignalR se reserva para la fase 14. Hasta confirmar el contrato del hub en el backend, esta fase usa el fallback REST controlado para evitar inventar nombres de hubs o eventos.

## Dependencia

Se agregó `chart.js` para renderizar las series del endpoint de gráfica. La librería forma parte del chunk lazy de Monitoring y no del bundle inicial.

## Verificación

Ejecutar desde `frontend/climate-monitoring-web`:

```bash
npm run lint
npm test -- --watch=false
npm run build
```
