import { inject, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { AlertResponse } from '../../features/alerts/models/alert.models';
import { SensorReadingResponse, SimulationStatusResponse } from '../../features/monitoring/models/monitoring.models';
import { AuthStore } from '../auth/auth.store';
import { APP_CONFIG } from '../config/app-config.token';

export type RealtimeState = 'disabled' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected';
export interface SensorStatusChanged { readonly id: string; readonly isActive: boolean; }
interface NegotiateResponse { readonly connectionToken?: string; readonly connectionId?: string; }
interface HubMessage { readonly type?: number; readonly target?: string; readonly arguments?: readonly unknown[]; readonly error?: string; }
const RECORD_SEPARATOR = '\u001e';

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private readonly config = inject(APP_CONFIG);
  private readonly authStore = inject(AuthStore);
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private shouldConnect = false;
  private handshakeComplete = false;
  private readonly readingSubject = new Subject<SensorReadingResponse>();
  private readonly alertSubject = new Subject<AlertResponse>();
  private readonly sensorStatusSubject = new Subject<SensorStatusChanged>();
  private readonly systemResetSubject = new Subject<SimulationStatusResponse>();
  readonly state = signal<RealtimeState>(this.config.realtime.enabled ? 'disconnected' : 'disabled');
  readonly readingUpdated$ = this.readingSubject.asObservable();
  readonly alertGenerated$ = this.alertSubject.asObservable();
  readonly sensorStatusChanged$ = this.sensorStatusSubject.asObservable();
  readonly systemReset$ = this.systemResetSubject.asObservable();

  async start(): Promise<void> {
    if (!this.config.realtime.enabled || !this.authStore.isAuthenticated()) return;
    this.shouldConnect = true;
    if (this.socket?.readyState === WebSocket.OPEN || this.state() === 'connecting') return;
    await this.connect();
  }

  stop(): void {
    this.shouldConnect = false;
    this.clearReconnect();
    const socket = this.socket;
    this.socket = null;
    if (socket && socket.readyState < WebSocket.CLOSING) socket.close(1000, 'Sesión finalizada');
    this.state.set(this.config.realtime.enabled ? 'disconnected' : 'disabled');
  }

  private async connect(): Promise<void> {
    const token = this.authStore.accessToken();
    if (!token || !this.shouldConnect) return;
    this.state.set(this.reconnectAttempt ? 'reconnecting' : 'connecting');
    try {
      const response = await fetch(`${this.config.realtime.hubUrl}/negotiate?negotiateVersion=1`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error(`SignalR negotiate respondió ${response.status}`);
      const negotiation = await response.json() as NegotiateResponse;
      const connectionToken = negotiation.connectionToken ?? negotiation.connectionId;
      if (!connectionToken) throw new Error('SignalR no devolvió connectionToken.');
      this.openSocket(connectionToken, token);
    } catch { this.scheduleReconnect(); }
  }

  private openSocket(connectionToken: string, accessToken: string): void {
    const url = new URL(this.config.realtime.hubUrl, window.location.origin);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.searchParams.set('id', connectionToken);
    url.searchParams.set('access_token', accessToken);
    const socket = new WebSocket(url);
    this.socket = socket;
    this.handshakeComplete = false;
    socket.onopen = () => socket.send(`{"protocol":"json","version":1}${RECORD_SEPARATOR}`);
    socket.onmessage = event => this.handlePayload(String(event.data));
    socket.onerror = () => socket.close();
    socket.onclose = () => { if (this.socket === socket) this.socket = null; if (this.shouldConnect) this.scheduleReconnect(); };
  }

  private handlePayload(payload: string): void {
    for (const frame of payload.split(RECORD_SEPARATOR).filter(Boolean)) {
      let message: HubMessage;
      try { message = JSON.parse(frame) as HubMessage; } catch { continue; }
      if (!this.handshakeComplete) {
        if (message.error) { this.socket?.close(); return; }
        this.handshakeComplete = true;
        this.reconnectAttempt = 0;
        this.state.set('connected');
        if (message.type === undefined) continue;
      }
      if (message.type === 6) this.socket?.send(`{"type":6}${RECORD_SEPARATOR}`);
      if (message.type === 7) this.socket?.close();
      if (message.type === 1 && message.target) this.dispatch(message.target, message.arguments?.[0]);
    }
  }

  private dispatch(target: string, payload: unknown): void {
    if (target === 'SensorReadingUpdated') this.readingSubject.next(payload as SensorReadingResponse);
    if (target === 'AlertGenerated') this.alertSubject.next(payload as AlertResponse);
    if (target === 'SensorStatusChanged') this.sensorStatusSubject.next(payload as SensorStatusChanged);
    if (target === 'SystemReset') this.systemResetSubject.next(payload as SimulationStatusResponse);
  }

  private scheduleReconnect(): void {
    if (!this.shouldConnect || this.reconnectTimer) return;
    this.state.set('reconnecting');
    const delay = Math.min(1000 * 2 ** this.reconnectAttempt++, 30000);
    this.reconnectTimer = setTimeout(() => { this.reconnectTimer = null; void this.connect(); }, delay);
  }

  private clearReconnect(): void { if (this.reconnectTimer) clearTimeout(this.reconnectTimer); this.reconnectTimer = null; this.reconnectAttempt = 0; }
}
