import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UpdateUserPreferencesRequest, UserProfile } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/users/me`;

  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`);
  }

  updateMyPreferences(payload: UpdateUserPreferencesRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/preferences`, payload);
  }
}

