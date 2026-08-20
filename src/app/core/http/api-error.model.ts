export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly validationErrors: readonly string[] = []) {
    super(message);
    this.name = 'ApiError';
  }
}
