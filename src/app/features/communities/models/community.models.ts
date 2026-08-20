export interface CommunityResponse {
  readonly id: string;
  readonly name: string | null;
  readonly description: string | null;
  readonly latitude: number;
  readonly longitude: number;
  readonly isActive: boolean;
  readonly createdAt: string;
}

export interface CreateCommunityRequest {
  readonly name: string;
  readonly description: string | null;
  readonly latitude: number;
  readonly longitude: number;
}

export interface UpdateCommunityRequest extends CreateCommunityRequest {
  readonly isActive: boolean;
}
