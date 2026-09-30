import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), 'browser');
const gateway = new URL(process.env.GATEWAY_PUBLIC_URL ?? '');
if (!['http:', 'https:'].includes(gateway.protocol) || gateway.username || gateway.password ||
    gateway.search || gateway.hash || gateway.pathname !== '/') {
  throw new Error('GATEWAY_PUBLIC_URL must be the public HTTP(S) origin of API Gateway.');
}
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };

export const server = createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://static.internal').pathname);
    if (path === '/health' || path === '/health/live') { res.writeHead(200, { 'Content-Type': 'text/plain' }); res.end(req.method === 'HEAD' ? undefined : 'healthy'); return; }
    if (path === '/runtime-config.json') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : JSON.stringify({ production: true, apiUrl: gateway.origin,
        realtime: { enabled: true, hubUrl: `${gateway.origin}/hubs/monitoring` } })); return;
    }
    if (/^\/(api|hubs)(\/|$)/.test(path)) { res.writeHead(404); res.end(); return; }
    let file = resolve(root, `.${path}`);
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(400); res.end(); return; }
    const info = await stat(file).catch(() => null);
    if (!info?.isFile()) {
      if (extname(path)) { res.writeHead(404); res.end(); return; }
      file = resolve(root, 'index.html');
    }
    const metadata = await stat(file);
    const cache = /[.-][a-zA-Z0-9_-]{8,}\.(js|css)$/.test(file) ? 'public, max-age=31536000, immutable' : 'no-cache';
    res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream',
      'Content-Length': metadata.size, 'Cache-Control': cache });
    if (req.method === 'HEAD') { res.end(); return; }
    createReadStream(file).on('error', () => res.destroy()).pipe(res);
  } catch { if (!res.headersSent) res.writeHead(400); res.end(); }
});
server.listen(Number(process.env.PORT ?? 8080), '0.0.0.0');
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
