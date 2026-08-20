import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden-page',
  imports: [RouterLink],
  template: `<section class="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm"><p class="text-sm font-semibold uppercase tracking-wider text-amber-700">Acceso restringido</p><h1 class="mt-3 text-3xl font-semibold text-slate-950">No tienes permisos para esta sección</h1><p class="mt-3 text-slate-600">Tu sesión sigue activa. Solicita acceso a un administrador si consideras que deberías ingresar.</p><a routerLink="/dashboard" class="mt-7 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-medium text-white focus-visible:outline-2 focus-visible:outline-cyan-600">Volver al dashboard</a></section>`,
})
export class ForbiddenPage {}
