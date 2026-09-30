import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const origin = process.env.FRONTEND_TEST_URL ?? 'http://127.0.0.1:14200';
const gateway = process.env.GATEWAY_TEST_URL ?? 'http://127.0.0.1:18090';
assert.ok(process.env.ADMIN_SEED_PASSWORD, 'Set ADMIN_SEED_PASSWORD for the isolated test stack.');
const artifacts = resolve(process.env.UI_ARTIFACTS ?? fileURLToPath(new URL('../test-results/browser', import.meta.url)));
await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL ?? 'msedge' });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [], reports = [];
page.on('pageerror', error => errors.push(error.message));
page.on('request', request => {
  const url = new URL(request.url());
  if (/^\/(api|hubs)\//.test(url.pathname)) assert.equal(url.origin, gateway, 'REST/SignalR must use Gateway.');
});
async function audit(name) {
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
  const result = await page.evaluate(async () => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } }));
  const violations = result.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }));
  reports.push({ name, violations });
  await writeFile(resolve(artifacts, 'accessibility.json'), JSON.stringify(reports, null, 2));
}
async function visit(route, heading) {
  await page.goto(`${origin}/${route}`);
  await page.getByRole('heading', { name: heading, exact: true }).waitFor();
  await page.waitForTimeout(500);
  await audit(route);
}
try {
  await page.goto(`${origin}/users`);
  await page.waitForURL('**/login**');
  await audit('login');
  await page.locator('#login').fill('admin');
  await page.locator('#password').fill(process.env.ADMIN_SEED_PASSWORD);
  await page.locator('button[type=submit]').click();
  await page.waitForURL('**/users');
  for (const [route, heading] of [['dashboard','Monitoreo climático'], ['communities','Comunidades'], ['sensors','Sensores'], ['alert-rules','Reglas de alerta'], ['alerts','Alertas'], ['events','Historial de eventos'], ['users','Usuarios'], ['audit','Bitácora de auditoría'], ['readings','Lecturas históricas']]) {
    await visit(route, heading);
  }
  await page.goto(`${origin}/alert-rules/new`);
  await page.getByRole('heading', { name: 'Crear regla', exact: true }).waitFor();
  await audit('rule-form');
  const name = `Browser rule ${Date.now()}`;
  await page.getByLabel('Nombre', { exact: true }).fill(name);
  await page.getByLabel('Máximo permitido').fill('50');
  await page.getByLabel('Mensaje', { exact: true }).fill('Temperatura fuera del intervalo permitido');
  await page.getByRole('button', { name: 'Guardar regla' }).click();
  await page.waitForURL('**/alert-rules');
  const card = page.getByRole('article').filter({ has: page.getByRole('heading', { name, exact: true }) });
  const deactivate = card.getByRole('button', { name: 'Desactivar', exact: true });
  await deactivate.click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  assert.ok(await dialog.evaluate(el => el.contains(document.activeElement)), 'Initial focus must be inside dialog.');
  await page.keyboard.press('Shift+Tab');
  assert.ok(await dialog.getByRole('button', { name: 'Confirmar' }).evaluate(el => el === document.activeElement), 'Focus must wrap.');
  await audit('rule-dialog');
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  assert.ok(await deactivate.evaluate(el => el === document.activeElement), 'Dialog must restore focus.');
  await deactivate.click();
  await dialog.getByRole('button', { name: 'Confirmar' }).click();
  await dialog.waitFor({ state: 'hidden' });
  await card.getByText('Inactiva', { exact: true }).waitFor();
  await page.setViewportSize({ width: 375, height: 812 });
  await audit('mobile-rules');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Mobile horizontal overflow.');
  await page.getByRole('button', { name: 'Abrir navegación' }).click();
  await page.getByRole('dialog', { name: 'Menú móvil' }).waitFor();
  await audit('mobile-navigation');
  await page.getByRole('dialog', { name: 'Menú móvil' }).getByRole('button', { name: 'Cerrar navegación', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.screenshot({ path: resolve(artifacts, 'mobile-rules.png'), fullPage: true });
  await page.getByRole('button', { name: 'Menú de usuario' }).click();
  await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();
  await page.waitForURL('**/login**');
  assert.equal(await page.evaluate(() => localStorage.getItem('climate-monitoring.session')), null);
  assert.deepEqual(errors, []);
  assert.equal(reports.flatMap(report => report.violations).length, 0, `Accessibility violations; inspect ${artifacts}/accessibility.json`);
  console.log(`PASS: ${reports.length} accessibility scans, real login/logout, Gateway routing, rule creation/deactivation, dialog keyboard/focus and mobile navigation.`);
} catch (error) {
  await page.screenshot({ path: resolve(artifacts, 'failure.png'), fullPage: true }).catch(() => {});
  throw error;
} finally { await browser.close(); }
