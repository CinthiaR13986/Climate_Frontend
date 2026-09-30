import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { APP_CONFIG } from './app/core/config/app-config.token';
import { environment } from './environments/environment';
import { parseRuntimeConfig } from './app/core/config/runtime-config';

async function start(): Promise<void> {
  if (!environment.production) { await bootstrapApplication(App, appConfig); return; }
  const response = await fetch('/runtime-config.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Runtime configuration unavailable.');
  const config = parseRuntimeConfig(await response.json());
  await bootstrapApplication(App, { ...appConfig, providers: [...appConfig.providers, { provide: APP_CONFIG, useValue: config }] });
}
void start().catch(() => {
  const root = document.querySelector('app-root');
  if (root) {
    root.setAttribute('role', 'alert');
    root.textContent = 'No fue posible iniciar la aplicación. Recarga la página o contacta al administrador.';
  }
});
