# Frontend en Hostinger

Utiliza el proyecto Traefik de Hostinger con entrypoint `websecure` y resolver
`letsencrypt`. Apunta el dominio al VPS.
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
mismo origen HTTPS. Las etiquetas del backend envían `/api` y `/hubs` al Gateway.
El frontend escucha en 8080 internamente y no publica 4200 en el VPS.

Comprueba `/runtime-config.json`, login y SignalR después del despliegue.
Los pasos completos están en `docs/hostinger.md` del backend.
El Gateway interno se alcanza mediante `host.docker.internal:18080`; ese puerto
solo debe escuchar en `127.0.0.1` del VPS.
