export interface RealtimeConfig {
  readonly enabled: boolean;
  readonly hubUrl: string;
}

export interface AppConfig {
  readonly production: boolean;
  readonly apiUrl: string;
  readonly realtime: RealtimeConfig;
}
