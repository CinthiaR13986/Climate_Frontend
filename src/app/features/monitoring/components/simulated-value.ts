import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { MonitoringApiService } from '../services/monitoring-api.service';
import { ApiError } from '../../../core/http/api-error.model';
@Component({ selector: 'app-simulated-value', imports: [ReactiveFormsModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `
<section class="space-y-4 rounded-2xl border bg-white p-5"><h2 class="text-xl font-semibold">Valor simulado</h2>
<p class="text-sm text-slate-600">Fija el valor de las próximas lecturas mientras la simulación esté activa. Se conserva al reiniciar el servicio. Restablecer habilita de nuevo los valores aleatorios.</p>
@if (error()) { <p role="alert" class="text-red-800">{{ error() }}</p> } @if (message()) { <p role="status">{{ message() }}</p> }
<label class="block">Valor ({{ unit() }})<input class="ml-3 rounded-lg border p-2" type="number" step="0.0001" [formControl]="value" /></label>
<div class="flex gap-3"><button class="rounded-lg bg-cyan-700 px-4 py-2 text-white disabled:opacity-50" [disabled]="busy() || value.invalid" (click)="save(false)">Guardar valor</button><button class="rounded-lg border px-4 py-2" [disabled]="busy()" (click)="save(true)">Restablecer aleatorio</button></div></section>` })
export class SimulatedValue implements OnInit {
  readonly sensorId = input.required<string>(); readonly unit = input<string | null>('');
  private readonly api = inject(MonitoringApiService);
  protected readonly value = new FormControl<number | null>(null, [Validators.required, Validators.min(-1000000), Validators.max(1000000)]);
  protected readonly busy = signal(false); protected readonly error = signal(''); protected readonly message = signal('');
  ngOnInit() { this.busy.set(true); this.api.getSimulatedValue(this.sensorId()).pipe(finalize(() => this.busy.set(false))).subscribe({ next: x => { this.value.setValue(x.value); this.message.set(x.value === null ? 'Modo aleatorio activo.' : 'Valor fijo configurado.'); }, error: e => this.fail(e) }); }
  protected save(clear: boolean) { if (!clear && this.value.invalid) return; this.busy.set(true); this.error.set(''); (clear ? this.api.clearSimulatedValue(this.sensorId()) : this.api.setSimulatedValue(this.sensorId(), this.value.value!)).pipe(finalize(() => this.busy.set(false))).subscribe({ next: () => { if (clear) this.value.setValue(null); this.message.set(clear ? 'Modo aleatorio restablecido.' : 'Valor guardado para las próximas lecturas.'); }, error: e => this.fail(e) }); }
  private fail(e: unknown) { this.error.set(e instanceof ApiError ? e.message : 'No fue posible modificar el valor simulado.'); }
}
