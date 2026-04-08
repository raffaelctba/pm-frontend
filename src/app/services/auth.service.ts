import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Keycloak, { KeycloakProfile } from 'keycloak-js';
import { from, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SignupRequest, SignupResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly signupApiUrl = `${environment.apiBaseUrl}/api/auth/signup`;

  constructor(
    private keycloak: Keycloak,
    private http: HttpClient
  ) {}

  isLoggedIn(): boolean {
    return !!this.keycloak.authenticated;
  }

  getUserProfile(): Observable<KeycloakProfile> {
    return from(this.keycloak.loadUserProfile());
  }

  getToken(): Promise<string> {
    return this.keycloak.updateToken(0).then(() => this.keycloak.token ?? '');
  }

  hasRole(role: string): boolean {
    return this.keycloak.hasRealmRole(role) || this.keycloak.hasResourceRole(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  logout(): void {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }

  login(redirectPath: string = '/dashboard'): void {
    const sanitizedPath = redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`;
    this.keycloak.login({ redirectUri: `${window.location.origin}${sanitizedPath}` });
  }

  signUp(payload: SignupRequest): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(this.signupApiUrl, payload);
  }

  getUsername(): string {
    return this.keycloak.tokenParsed?.['preferred_username'] ?? '';
  }
}
