# Fase 15 — Responsive y UX

## Resultado

Se revisaron transversalmente las vistas implementadas para desktop, tablet y móvil, junto con sus estados de carga, error, vacío y accesibilidad.

## Responsive

- Base mobile first compatible desde 320 px.
- Espaciado del shell progresivo: 16 px móvil, 24 px tablet y 32 px desktop.
- Sidebar fijo desde `lg` y drawer de hasta 85 % del viewport en resoluciones menores.
- Formularios en una columna móvil y múltiples columnas según espacio disponible.
- Tarjetas y paneles cambian entre una, dos, tres o cinco columnas según la vista.
- Las tablas extensas mantienen su semántica y usan contenedores de desplazamiento horizontal, sin provocar scroll global.
- Los diálogos limitan altura y habilitan scroll interno en pantallas pequeñas.

## Estados de interfaz

- Cargas iniciales muestran mensajes o skeletons sin bloquear la navegación global.
- Los errores usan `role="alert"` y las acciones críticas ofrecen reintento o conservan el formulario.
- Listados, gráficas y paneles incluyen estados vacíos específicos.
- Botones de mutación se deshabilitan durante la petición para evitar envíos duplicados.
- Se eliminó del Dashboard el mensaje obsoleto que anunciaba una gráfica futura y se enlazó al Monitoring ya implementado.

## Accesibilidad

- Enlace “Saltar al contenido principal”.
- Foco visible global consistente.
- El drawer recibe foco al abrirse, cierra con Escape y vuelve inerte el contenido de fondo.
- El menú de usuario cierra con Escape.
- Regiones de tablas desplazables son enfocables y tienen nombre accesible.
- Los estados de carga principales anuncian su contenido con `role="status"`.
- Los diálogos usan `role="dialog"`, `aria-modal` y título asociado.
- Niveles y estados combinan texto con color.
- `prefers-reduced-motion` reduce animaciones y transiciones.
- Inputs móviles usan al menos 16 px para evitar zoom automático en navegadores táctiles.

## Verificación

```bash
npm run lint
npm test -- --watch=false
npm run build
```

La comprobación manual recomendada usa anchos de 320, 768, 1024 y 1440 px, navegación solo con teclado y preferencia de movimiento reducido.
