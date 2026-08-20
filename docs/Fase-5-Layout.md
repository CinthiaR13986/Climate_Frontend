# Fase 5 — Layout

## Resultado

Se completó el layout principal posterior al login con una experiencia consistente en desktop, tablet y móvil. Las features todavía no implementadas utilizan placeholders declarados y no datos ficticios.

## Estructura

```text
src/app/core/layout/
├── app-shell/
│   ├── app-shell.ts
│   └── app-shell.html
├── sidebar/
│   ├── sidebar.ts
│   └── sidebar.html
├── topbar/
│   ├── topbar.ts
│   └── topbar.html
├── nav-icon/
│   ├── nav-icon.ts
│   └── nav-icon.html
├── forbidden-page/forbidden-page.ts
├── feature-placeholder-page/feature-placeholder-page.ts
└── navigation.model.ts
```

## Sidebar

- Marca y acceso al Dashboard.
- Grupos Monitoreo y Administración.
- Configuración tipada e inmutable de navegación.
- Iconos SVG locales, sin emojis ni dependencias pesadas.
- Estado activo mediante `RouterLinkActive`.
- Administración visible únicamente para `Administrator`.
- Cierre de sesión desde la navegación.

## Topbar

- Título contextual obtenido de `route.data.pageTitle`.
- Identidad, correo y rol del usuario actual.
- Menú accesible de cuenta y cierre de sesión.
- Botón de navegación móvil.
- Sin estados de conectividad ficticios.

## Responsive

```text
Desktop: sidebar fijo de 256 px + topbar sticky + contenido.
Tablet/móvil: topbar + drawer superpuesto.
```

El drawer se cierra al seleccionar una ruta, presionar Escape o tocar el overlay. Su ancho nunca excede el 85 % del viewport. El contenido usa un ancho máximo y padding progresivo, sin scroll horizontal global.

## Rutas preparadas

- `/dashboard`
- `/monitoring`
- `/sensors`
- `/communities`
- `/alerts`
- `/events`
- `/users`
- `/audit`
- `/system`
- `/forbidden`

Users, Audit y System usan `roleGuard` con `Administrator`. Las rutas de features futuras muestran un placeholder explícito hasta ser reemplazadas por rutas lazy reales en sus fases correspondientes.

## Accesibilidad

- Elementos semánticos `nav`, `aside`, `header` y `main`.
- Nombres accesibles para controles móviles.
- `aria-expanded` y `aria-haspopup` en el menú de usuario.
- Foco visible y navegación por teclado.
- Página 403 que conserva la sesión y explica la restricción.
- Iconos decorativos ocultos a tecnologías de asistencia.

## Comprobación

```powershell
cd frontend/climate-monitoring-web
npm.cmd run lint
npm.cmd test -- --watch=false
npm.cmd run build
npm.cmd start
```

Inicia sesión y verifica el sidebar fijo en desktop. Reduce el viewport para comprobar el drawer móvil. Un usuario no administrador no debe ver Administración; además, el guard debe impedir navegación manual hacia esas URLs.

## Validación realizada

- ESLint y reglas de accesibilidad: correctos.
- Tests: 5/5 aprobados.
- Build production: correcto.
- Login continúa en un chunk lazy independiente.
- Bundle inicial: 293.27 kB raw, 77.98 kB estimados transferidos.

La siguiente etapa es **Fase 6 — Dashboard** y no se inició automáticamente.
