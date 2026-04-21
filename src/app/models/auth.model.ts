export interface SignupRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  username?: string;
  invitationToken?: string;
}

export interface InvitationInfoResponse {
  invitationToken: string;
  inviteeEmail: string;
  inviteeName?: string;
  invitationRole: 'OWNER' | 'TENANT';
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  valid: boolean;
  expiresAt: string;
  buildingId: number;
  buildingName: string;
  unitId: number;
  unitNumber: string;
}

export interface SignupResponse {
  userId: number;
  keycloakId: string;
  email: string;
  username: string;
  message: string;
}

