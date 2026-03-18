export interface SignupRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  username?: string;
}

export interface SignupResponse {
  userId: number;
  keycloakId: string;
  email: string;
  username: string;
  message: string;
}

