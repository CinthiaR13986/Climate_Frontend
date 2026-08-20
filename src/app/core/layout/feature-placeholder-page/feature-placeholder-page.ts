import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-feature-placeholder-page',
  template: `<section class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"><p class="text-sm font-semibold uppercase tracking-wider text-cyan-700">Próxima fase</p><h1 class="mt-2 text-3xl font-semibold text-slate-950">{{ title }}</h1><p class="mt-3 max-w-2xl text-slate-600">La navegación y el espacio de trabajo están preparados. Esta funcionalidad se conectará a su endpoint real en la fase correspondiente.</p></section>`,
})
export class FeaturePlaceholderPage { protected readonly title = inject(ActivatedRoute).snapshot.data['pageTitle'] as string; }
