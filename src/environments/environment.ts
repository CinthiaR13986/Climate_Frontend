export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  realtime: {
    enabled: true,
    hubUrl: 'http://localhost:8080/hubs/monitoring',
  },
} as const;
