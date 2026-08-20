# Fase 2 — Bootstrap Angular

## Resultado

Se creó `frontend/climate-monitoring-web` con Angular 21, que satisface Angular 20+, y una base standalone preparada para arquitectura por features.

## Comandos utilizados

```powershell
npx.cmd --yes @angular/cli@21 new climate-monitoring-web --routing --style=scss --standalone --strict --skip-git --package-manager=npm --defaults
cd climate-monitoring-web
npx.cmd ng add tailwindcss --skip-confirmation
npx.cmd ng add angular-eslint --skip-confirmation
```

Se usaron ejecutables `.cmd` porque la política local bloquea wrappers `.ps1`. La red presentó `UNABLE_TO_VERIFY_LEAF_SIGNATURE`; la excepción `npm_config_strict_ssl=false` se limitó al proceso y no cambió npm global. No debe usarse en una red con certificados correctos.

## Configuración

- `angular.json`: SCSS, Tailwind y targets build/serve/test/lint.
- `tsconfig.json`: strict, strictTemplates, strictInjectionParameters y noImplicitReturns.
- `.postcssrc.json`: `@tailwindcss/postcss`.
- `src/tailwind.css`: import de Tailwind CSS 4.
- `eslint.config.js`: TypeScript, Angular y accesibilidad de templates.
- `src/app/app.html`: pantalla mínima responsive para comprobar Tailwind.

## Estructura

```text
frontend/
├── docs/
│   ├── Fase-1-Analisis-del-Frontend-y-Swagger.md
│   └── Fase-2-Bootstrap.md
└── climate-monitoring-web/
    ├── public/
    ├── src/
    │   ├── app/
    │   │   ├── app.config.ts
    │   │   ├── app.routes.ts
    │   │   ├── app.ts
    │   │   ├── app.html
    │   │   └── app.spec.ts
    │   ├── main.ts
    │   ├── styles.scss
    │   └── tailwind.css
    ├── angular.json
    ├── eslint.config.js
    ├── package.json
    ├── tsconfig.json
    └── README.md
```

## Comprobación

```powershell
cd frontend/climate-monitoring-web
npm.cmd run lint
npm.cmd test -- --watch=false
npm.cmd run build
npm.cmd start
```

La siguiente etapa es **Fase 3 — Core**. No se implementaron todavía API configuration, autenticación, guards, interceptors ni layout.
