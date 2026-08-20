# Fase 16 — Testing

## Resultado

La suite creció de 5 a 31 pruebas distribuidas en 6 archivos, usando Vitest y la infraestructura oficial de pruebas de Angular.

## Cobertura funcional

### Aplicación y autenticación

- Creación del componente raíz y presencia del contenedor global de toasts.
- Validación del formulario de login, request correcto, navegación y error 401 amigable.
- Persistencia, restauración, expiración y actualización de sesión.
- Derivación de permisos para `Administrator`, `Operator` y `Viewer`.

### Guards

- Acceso autenticado.
- Redirección a login conservando `returnUrl`.
- Redirección de usuarios autenticados fuera de login.
- Acceso y rechazo por rol.

### Interceptores

- Bearer agregado al Gateway.
- Token nunca enviado a orígenes externos.
- 401 limpia sesión y redirige.
- 403 conserva sesión y notifica.
- Errores HTTP normalizados como `ApiError`.

### Contratos HTTP

- Filtros exactos de Alerts, Events y Audit.
- Resolución de alertas.
- Creación y actualización de comunidades.
- Activación, desactivación y eliminación de sensores.
- Queries de histórico y chart.
- Start, stop y reset de simulación.
- Edición y cambio de estado de usuarios.

Las pruebas usan `HttpTestingController`: no requieren backend, red ni datos reales.

## Archivos principales

- `src/app/core/auth/auth.store.spec.ts`
- `src/app/core/guards/guards.spec.ts`
- `src/app/core/interceptors/interceptors.spec.ts`
- `src/app/shared/testing/api-contracts.spec.ts`
- `src/app/features/auth/pages/login-page/login-page.spec.ts`
- `src/app/app.spec.ts`

## Comandos

```bash
npm run lint
npm run test:ci
npm run build
```

`test:ci` ejecuta la suite una vez y devuelve un código distinto de cero ante cualquier fallo, por lo que puede utilizarse directamente en CI.
