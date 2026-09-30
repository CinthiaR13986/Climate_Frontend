// main.ts replaces these values with /runtime-config.json before bootstrap.
export const environment = {
  production: true,
  apiUrl: '',
  realtime: {
    enabled: true,
    hubUrl: '/hubs/monitoring',
  },
} as const;
