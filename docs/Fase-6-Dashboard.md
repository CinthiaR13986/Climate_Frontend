# Fase 6 — Dashboard

## Resultado

Se reemplazó el placeholder por un Dashboard lazy conectado al Gateway. Toda la información visual proviene del backend; cuando una métrica no tiene lectura se presenta “Sin datos” en lugar de inventar valores.

## Endpoints verificados antes de implementar

```http
GET /api/monitoring/current
GET /api/monitoring/simulation/status
GET /api/alerts?isActive=true
GET /api/sensors
```

Todos requieren Bearer. El filtro `isActive` está documentado por OpenAPI y se construye con `HttpParams`.

## Estructura

```text
src/app/features/
├── dashboard/
│   ├── components/
│   │   ├── active-alerts-panel/
│   │   └── climate-metric-card/
│   ├── pages/dashboard-page/
│   └── store/dashboard.store.ts
├── monitoring/
│   ├── models/monitoring.models.ts
│   └── services/monitoring-api.service.ts
├── sensors/
│   ├── models/sensor.models.ts
│   └── services/sensors-api.service.ts
└── alerts/
    ├── models/alert.models.ts
    └── services/alerts-api.service.ts
```

## Contratos implementados

- `SensorType` con los cinco valores exactos del backend.
- `SensorReadingResponse`.
- `SimulationStatusResponse`.
- `SensorResponse`.
- `AlertLevel`, `RiskType`, `AlertResponse` y `AlertFilters`.

Los enums mantienen sus valores ingleses. Las traducciones al español son únicamente de presentación.

## Estado y carga

`DashboardStore` es provisto por la página, utiliza Signals y ejecuta las cuatro consultas mediante `forkJoin`. Expone:

- lecturas, sensores, alertas y simulación;
- loading y error;
- conteo de sensores activos/inactivos;
- última lectura global;
- lectura más reciente de cada tipo climático.

Impide recargas simultáneas y permite reintentar. La destrucción del store con la página evita estado global innecesario.

## Interfaz

- Cinco tarjetas: temperatura, humedad, viento, lluvia y nivel del río.
- SVG semántico por tipo de sensor.
- Valor, unidad y hora de actualización.
- Skeletons durante la primera carga.
- Estado de simulación.
- Conteo real de sensores activos e inactivos.
- Hasta cuatro alertas activas recientes con nivel, texto e iconografía visual.
- Empty state operativo cuando no existen alertas.
- Error state con reintento.
- Espacio explícito para la gráfica de fase 7.

## Comprobación

```powershell
cd frontend/climate-monitoring-web
npm.cmd run lint
npm.cmd test -- --watch=false
npm.cmd run build
npm.cmd start
```

Inicia sesión y abre `http://localhost:4200/dashboard`.

## Validación realizada

- Los cuatro endpoints respondieron HTTP 200 con JWT.
- Backend actual: simulación activa, 15 sensores, 0 alertas activas.
- `/api/monitoring/current` devolvió una colección vacía durante la comprobación, incluso tras un intervalo; el frontend representa correctamente este estado sin datos inventados. La generación de lecturas debe revisarse en backend si se espera información inmediata.
- ESLint: correcto.
- Tests existentes: 5/5 aprobados.
- Build production: correcto.
- Dashboard generado como chunk lazy de 13.04 kB raw.

## Límite consciente

La gráfica no se simuló ni se codificaron series ficticias. Se implementará en **Fase 7 — Monitoring** consumiendo el endpoint real de chart.

La siguiente fase no se inició automáticamente.
