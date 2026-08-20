# Fase 4 — Login

## Resultado

Se reemplazó el placeholder por una pantalla de acceso real, lazy-loaded y conectada a `POST /api/auth/login` mediante `AuthService`.

## Archivos

```text
src/app/features/auth/pages/login-page/
├── login-page.ts
├── login-page.html
├── login-page.scss
└── login-page.spec.ts
```

La ruta se registró en `src/app/app.routes.ts` con `loadComponent`, `guestGuard` y título de documento.

## Comportamiento

- Formulario reactivo y estrictamente tipado.
- Campos `login` y `password` según OpenAPI.
- Validación required, longitud y mensajes asociados.
- Autocomplete semántico para usuario y contraseña.
- Mostrar/ocultar contraseña con nombre accesible.
- Estado loading y bloqueo del botón durante la petición.
- Errores amigables normalizados; no muestra detalles técnicos.
- Persistencia centralizada de `accessToken`, `expiresAt` y `user`.
- Redirección a `/dashboard` o `returnUrl` local seguro.
- Diseño responsive: panel informativo en desktop y formulario compacto en móvil.

## Flujo

```text
/login
→ validación Reactive Forms
→ AuthService.login(LoginRequest)
→ POST http://localhost:8080/api/auth/login
→ AuthStore.setSession
→ TokenStorageService
→ /dashboard o returnUrl
→ authInterceptor agrega JWT a llamadas posteriores
```

Un 401 de login se traduce a “Usuario o contraseña incorrectos”, sin exponer el ProblemDetails técnico. Si ya existe una sesión válida, `guestGuard` evita regresar al login.

## Pruebas agregadas

- No envía el formulario inválido.
- Envía las credenciales correctas y navega al dashboard.
- Presenta un error amigable cuando falla la autenticación.

## Comprobación

```powershell
cd frontend/climate-monitoring-web
npm.cmd run lint
npm.cmd test -- --watch=false
npm.cmd run build
npm.cmd start
```

Abrir `http://localhost:4200/login` con el Gateway en `http://localhost:8080`.

## Validación realizada

- ESLint: correcto.
- Tests: 5/5 aprobados.
- Build production: correcto.
- Login real contra el Gateway: HTTP 200, usuario `admin`, rol `Administrator` y JWT recibido.
- Login empaquetado como chunk lazy independiente.

La siguiente etapa es **Fase 5 — Layout**. El Core ya incluye la estructura base; esa fase la completará visual y funcionalmente sin iniciarse automáticamente.
