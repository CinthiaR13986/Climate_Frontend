import { parseRuntimeConfig } from './runtime-config';

describe('runtime Gateway configuration', () => {
  it('uses the same Gateway for HTTP and WebSocket negotiation', () => {
    const config = parseRuntimeConfig({ apiUrl: 'https://gateway.example.test/' });
    expect(config.apiUrl).toBe('https://gateway.example.test');
    expect(config.realtime.hubUrl).toBe('https://gateway.example.test/hubs/monitoring');
  });
  it.each([{}, { apiUrl: '/api' }, { apiUrl: 'javascript:alert(1)' }, { apiUrl: 'https://user:password@host.test' }, { apiUrl: 'https://host.test/private' }])('rejects invalid configuration %j', value => {
    expect(() => parseRuntimeConfig(value)).toThrow();
  });
});
