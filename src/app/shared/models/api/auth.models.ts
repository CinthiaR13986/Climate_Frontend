export type SystemRole = 'Administrator' | 'Operator' | 'Viewer';

export interface LoginRequest {
  readonly login: string | null;
  readonly password: string | null;
}

export interface UserResponse {
  readonly id: string;
  readonly username: string | null;
  readonly email: string | null;
  readonly role: string | null;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly lastLoginAt?: string | null;
}

export interface LoginResponse {
  readonly accessToken: string | null;
  readonly expiresAt: string;
  readonly user: UserResponse;
}

export interface RegisterRequest {
  readonly username: string | null;
  readonly email: string | null;
  readonly password: string | null;
}
