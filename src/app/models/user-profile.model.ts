export interface UserProfile {
  id?: number | null;
  keycloakId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  preferredLanguage?: string | null;
  preferredCountry?: string | null;
}

export interface UpdateUserPreferencesRequest {
  preferredLanguage?: string | null;
  preferredCountry?: string | null;
}

