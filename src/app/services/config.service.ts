import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { EnvironmentConfig } from '../models/environment-config.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/config/environment`;
  private cachedEnvironmentConfig$?: Observable<EnvironmentConfig>;

  constructor(private http: HttpClient) {}

  getEnvironmentConfig(forceRefresh = false): Observable<EnvironmentConfig> {
    if (!this.cachedEnvironmentConfig$ || forceRefresh) {
      this.cachedEnvironmentConfig$ = this.http.get<EnvironmentConfig>(this.apiUrl).pipe(shareReplay(1));
    }

    return this.cachedEnvironmentConfig$;
  }
}

