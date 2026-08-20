import { afterNextRender, ChangeDetectionStrategy, Component, effect, ElementRef, input, OnDestroy, viewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { SensorChartResponse } from '../../models/monitoring.models';

Chart.register(...registerables);

@Component({ selector: 'app-sensor-chart', templateUrl: './sensor-chart.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class SensorChart implements OnDestroy {
  readonly data = input<SensorChartResponse | null>(null);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart: Chart<'line'> | null = null;
  private ready = false;

  constructor() {
    afterNextRender(() => { this.ready = true; this.render(this.data()); });
    effect(() => { const data = this.data(); if (this.ready) this.render(data); });
  }

  ngOnDestroy(): void { this.chart?.destroy(); }

  private render(response: SensorChartResponse | null): void {
    this.chart?.destroy();
    this.chart = null;
    if (!response?.data?.length) return;
    this.chart = new Chart(this.canvas().nativeElement, {
      type: 'line',
      data: {
        labels: response.data.map(point => new Date(point.timestamp).toLocaleString()),
        datasets: [{ label: response.unit ?? 'Valor', data: response.data.map(point => point.value), borderColor: '#0891b2', backgroundColor: 'rgb(8 145 178 / 12%)', fill: true, tension: 0.3, pointRadius: 2 }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true } }, scales: { x: { ticks: { maxTicksLimit: 8 } } } },
    });
  }
}
