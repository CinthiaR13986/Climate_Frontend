import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProblemDetails } from '../../shared/models/api/problem-details.model';
import { ApiError } from './api-error.model';

@Injectable({ providedIn: 'root' })
export class ProblemDetailsService {
  fromHttpError(error: HttpErrorResponse): ApiError {
    const problem = this.isProblemDetails(error.error) ? error.error : null;
    const validationErrors = problem?.errors ? Object.values(problem.errors).flat() : [];
    return new ApiError(this.messageFor(error.status, problem), error.status, validationErrors);
  }

  private messageFor(status: number, problem: ProblemDetails | null): string {
    if (status === 0) return 'No fue posible conectar con el servidor. Verifica tu conexión.';
    if (status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.';
    if (status === 403) return 'No tienes permisos para realizar esta acción.';
    if (status === 404) return 'El recurso solicitado no existe.';
    if (status === 409) return problem?.detail ?? 'La operación entra en conflicto con información existente.';
    if (status === 422 || status === 400) return problem?.detail ?? 'Revisa la información ingresada.';
    return problem?.detail ?? problem?.title ?? 'Ocurrió un error inesperado. Inténtalo nuevamente.';
  }

  private isProblemDetails(value: unknown): value is ProblemDetails {
    return !!value && typeof value === 'object';
  }
}
