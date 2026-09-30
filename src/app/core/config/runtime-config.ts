import { AppConfig } from './app-config.model';

export function parseRuntimeConfig(value: unknown): AppConfig {
  if (typeof value !== 'object' || value === null || !('apiUrl' in value) || typeof value.apiUrl !== 'string') {
    throw new Error('Missing API Gateway origin.');
  }
  const url = new URL(value.apiUrl);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Invalid API Gateway origin.');
  }
  return { production: true, apiUrl: url.origin, realtime: { enabled: true, hubUrl: `${url.origin}/hubs/monitoring` } };
}
