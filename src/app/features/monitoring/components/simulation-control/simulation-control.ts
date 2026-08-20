import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { SimulationStatusResponse } from '../../models/monitoring.models';

@Component({ selector: 'app-simulation-control', templateUrl: './simulation-control.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class SimulationControl {
  readonly status = input<SimulationStatusResponse | null>(null);
  readonly canOperate = input(false);
  readonly canReset = input(false);
  readonly operating = input(false);
  readonly startRequested = output<void>();
  readonly stopRequested = output<void>();
  readonly resetRequested = output<void>();
  protected readonly confirmReset = signal(false);

  protected acceptReset(): void { this.confirmReset.set(false); this.resetRequested.emit(); }
}
