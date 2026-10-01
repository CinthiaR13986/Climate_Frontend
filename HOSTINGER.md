# Frontend en Hostinger

Utiliza el proyecto Traefik de Hostinger con entrypoints `web` y `websecure`,
resolver `letsencrypt` y red externa `traefik-proxy`. Apunta el dominio al VPS.
Si `agua` todavía usa ese dominio, cambia su dominio o detén esa aplicación.
Despliega primero el backend con su complemento Hostinger.

En este repositorio copia `.env.example` a `.env` si no existe. Opcionalmente
configura estas variables con los mismos valores que en el backend:

```dotenv
CLIMATE_DOMAIN=analisissistemas2026proyecto.xyz
TRAEFIK_NETWORK=traefik-proxy
```

Desde esta carpeta en el VPS, con Docker Compose 2.24.4 o posterior:

```bash
docker compose --env-file .env -f docker-compose.yml -f docker-compose.hostinger.yml config --quiet
docker compose --env-file .env -f docker-compose.yml -f docker-compose.hostinger.yml up -d --build --wait
```

Abre `https://analisissistemas2026proyecto.xyz`. `GATEWAY_PUBLIC_URL` usa ese
mismo origen HTTPS. Las etiquetas del backend envían `/api` y `/hubs` al Gateway.
El frontend escucha en 8080 internamente y no publica 4200 en el VPS.

El archivo Hostinger es un complemento: usa siempre ambos archivos. Si Docker
Manager no permite seleccionar varios, ejecuta el comando desde la terminal.
Comprueba `/runtime-config.json`, login y SignalR después del despliegue.
Los pasos completos están en `docs/hostinger.md` del backend.
Para desarrollo local sigue usando el Compose habitual sin el segundo `-f`.
