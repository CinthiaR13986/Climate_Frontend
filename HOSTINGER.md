# Frontend detrás de Nginx

Nginx termina HTTPS y reenvía el frontend al puerto `4200` y `/api` y `/hubs`
al Gateway HTTP local en `127.0.0.1:18080`. Apunta el dominio al VPS.
Si `agua` todavía usa ese dominio, cambia su dominio o detén esa aplicación.
Despliega primero el backend con su complemento Hostinger.

En este repositorio copia `.env.example` a `.env` si no existe. Opcionalmente
configura estas variables con los mismos valores que en el backend:

```dotenv
CLIMATE_DOMAIN=analisissistemas2026proyecto.xyz
```

Desde esta carpeta en el VPS:

```bash
docker compose --env-file .env -f docker-compose.yml config --quiet
docker compose --env-file .env -f docker-compose.yml up -d --build --wait
```

Abre `https://analisissistemas2026proyecto.xyz`. `GATEWAY_PUBLIC_URL` usa ese
mismo origen HTTPS. El frontend escucha en `4200` y Nginx publica el sitio.

Comprueba `/runtime-config.json`, login y SignalR después del despliegue.
Los pasos completos están en `docs/hostinger.md` del backend.
El puerto `18080` del Gateway solo debe escuchar en `127.0.0.1` del VPS.
