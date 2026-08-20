import { UserResponse } from '../../shared/models/api/auth.models';

export interface AuthSession {
  readonly accessToken: string;
  readonly expiresAt: string;
  readonly user: UserResponse;
}
