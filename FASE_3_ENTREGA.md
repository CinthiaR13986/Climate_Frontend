# Entrega de Fase 3 — Frontend Angular

Fecha: 21 de octubre de 2026. Angular 22.2.3 y TypeScript 6.0.3. Se conserva el sistema existente y se integra reportería con la nueva arquitectura de microservicios.

## Arquitectura y componentes

Angular consume REST y SignalR mediante el Gateway. La configuración pública se obtiene de `/runtime-config.json`; no contiene contraseñas ni claves internas. Se mantienen login, dashboard, monitoreo, sensores, comunidades, alertas, eventos, usuarios y auditoría.

El módulo `src/app/features/reports` contiene API tipada, formulario de generación, historial paginado, seguimiento de trabajos, detalle y descarga. Las rutas están en `src/app/app.routes.ts` y la navegación en `src/app/core/layout/navigation.model.ts`. Los guards y controles visuales complementan los permisos verificados por el backend.

## Reportes PDF y permisos

Se entregan ocho tipos: comunidades, sensores, lecturas, alertas, eventos, estado de sensores, estadísticas climáticas y resumen ejecutivo. Los filtros por comunidad, sensor y fechas se muestran según el tipo. Se validan rangos antes del envío y se diferencian estados de carga, vacío, error y éxito.

El frontend solicita un trabajo persistente, consulta su estado y muestra el resultado. No accede directamente al almacenamiento privado del PDF. El servidor aplica límites, retención y recuperación de trabajos interrumpidos.

| Rol | Generación | Consulta | Descarga |
| --- | --- | --- | --- |
| Administrator | Sí | Todos | Sí |
| Operator | Sí | Propios | No |
| Viewer | No | Propios | No |

Contratos públicos: `/api/reports/types`, `/api/reports/generate`, `/api/reports`, `/api/reports/statistics`, `/api/reports/{id}` y `/api/reports/{id}/download`.

## Dashboard, simulación y auditoría

El dashboard incluye comunidades, sensores activos e inactivos, lecturas actuales, alertas por nivel, eventos por fenómeno, evolución y estadísticas de las últimas 24 horas por tipo y unidad: cantidad, promedio, mínimo y máximo. Se admite filtro de comunidad, actualizaciones SignalR y recuperación mediante REST.

Se restauraron tres comunidades de Guatemala, 15 sensores y 27 reglas mediante las APIs actuales. Se crean primeras lecturas para sensores sin datos y se inicia el simulador. Se comprobó que el historial aumentó de 45 a 60 lecturas, con 15 lecturas actuales y cinco grupos estadísticos. Repetir el seed no duplica catálogos ni sobrescribe registros existentes.

Auditoría utiliza el contrato FastAPI y paginación para mantener acceso al historial completo. Los controles de acceso se conservan.

## Ejecución local y demostración

Desde backend:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/Start-Phase3.ps1 -NoBuild
```

Omitir `-NoBuild` para construir las imágenes. Frontend http://localhost:4200; Gateway http://localhost:8080. Usuario inicial admin; contraseña en `AUTH_ADMIN_SEED_PASSWORD` del archivo privado `.env.phase3.local`. No publicar ese archivo. `PHASE3_DEMO_ENABLED=false` omite la carga automática sin borrar datos.

Para completar una carga interrumpida: `scripts/Seed-Phase3Demo.ps1`. Guía: `backend/docs/FASE_3_DATOS_DEMO.md`. No se necesita crear servicios nuevos ni reiniciar bases para retomar.

## Pruebas y evidencia

Durante el cierre funcional se aprobaron 56 pruebas frontend, lint y build de producción. Las pruebas de navegador cubren roles, login/logout, pantallas anteriores, reglas, foco, teclado, móvil y generación/descarga de PDF. Seis escaneos axe aislados y 16 sobre Compose real con etiquetas WCAG 2.2 AA no detectaron violaciones en los recorridos evaluados; esto no constituye certificación completa de accesibilidad.

Scripts: `scripts/test-browser.mjs` y `scripts/test-reports-browser.mjs`. Las pruebas integradas se coordinan desde backend y crean registros, por lo que deben ejecutarse en una pila de prueba. Evidencia: `backend/docs/FASE_3_PRUEBAS.md` y `backend/docs/validation/phase3-demo.json`.

Para desarrollo: Node compatible con Angular 22 (se validó Node 24.21), `npm ci`, `npm run test:ci`, `npm run lint` y `npm run build`.

## Entrega y exclusiones

La entrega comprende código, documentos Word y Markdown, configuración de contenedores y pruebas. VPS, transferencia de históricos del usuario, videos y publicaciones externas quedan excluidos por el alcance acordado. Kubernetes y el proveedor de identidad externo se entregan preparados; no representan un despliegue ni OAuth operativo, cuya continuación corresponde a Fase 4.

La documentación previa de componentes se conserva como anexo histórico del Word. Las versiones y decisiones de esta entrega prevalecen sobre ese anexo. La arquitectura actual emplea Auth NestJS/PostgreSQL, Community .NET/PostgreSQL, Alert Java/PostgreSQL y Audit/Report FastAPI/Mongo; Sensor, Monitoring y Event conservan SQL Server.
