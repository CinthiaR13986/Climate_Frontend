# Fase 14 — Realtime

## Resultado

Se conectó el frontend con el hub real `/hubs/monitoring`, autenticado con el JWT de la sesión.

## Protocolo y ciclo de vida

- Negociación SignalR v1 mediante `POST /hubs/monitoring/negotiate`.
- Transporte WebSocket y protocolo JSON con handshake SignalR.
- El token se envía como Bearer durante negociación y como `access_token` al WebSocket, según el mecanismo del backend.
- La conexión inicia al montar el shell autenticado y se detiene al salir o cerrar sesión.
- Reconexión automática exponencial desde 1 hasta 30 segundos.
- Respuesta a mensajes ping y manejo de cierre del servidor.

## Eventos consumidos

- `SensorReadingUpdated`: actualiza Dashboard y Monitoring.
- `AlertGenerated`: actualiza las alertas y muestra una notificación en la vista de alertas.
- `SensorStatusChanged`: actualiza el estado del catálogo en memoria.
- `SystemReset`: limpia lecturas dinámicas y actualiza el estado de simulación.

## Fallback

Monitoring realiza una carga REST inicial. El polling de cinco segundos solo se ejecuta cuando SignalR no está conectado y la pestaña está visible. La interfaz muestra si está usando SignalR o el fallback.

## Dependencia

Se intentó instalar `@microsoft/signalr`, pero npm rechazó la descarga con `UNABLE_TO_VERIFY_LEAF_SIGNATURE` porque el entorno no tiene configurada la CA de su proxy. No se desactivó `strict-ssl`. Para mantener la seguridad y completar la fase, se implementó el protocolo JSON documentado usando `fetch` y `WebSocket` nativos, sin añadir paquetes no verificados.

## Verificación

```bash
npm run lint
npm test -- --watch=false
npm run build
```
