export interface ProblemDetails {
  readonly type?: string | null;
  readonly title?: string | null;
  readonly status?: number | null;
  readonly detail?: string | null;
  readonly instance?: string | null;
  readonly errors?: Readonly<Record<string, readonly string[]>>;
}
