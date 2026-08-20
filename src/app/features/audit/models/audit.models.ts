export interface AuditResponse {
  readonly id: string;
  readonly userId: string;
  readonly userName: string | null;
  readonly action: string | null;
  readonly resource: string | null;
  readonly resourceId: string | null;
  readonly description: string | null;
  readonly ipAddress: string | null;
  readonly timestamp: string;
}

export interface AuditFilters {
  readonly userId?: string;
  readonly action?: string;
  readonly resource?: string;
  readonly from?: string;
  readonly to?: string;
}
