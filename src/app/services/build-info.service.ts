import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { BuildInfo } from '../models/build-info.model';

@Injectable({
  providedIn: 'root'
})
export class BuildInfoService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/config/build-info`;
  private cachedBuildInfo$?: Observable<BuildInfo>;

  constructor(private http: HttpClient) {}

  getBuildInfo(forceRefresh = false): Observable<BuildInfo> {
    if (!this.cachedBuildInfo$ || forceRefresh) {
      this.cachedBuildInfo$ = this.http.get<BuildInfo>(this.apiUrl).pipe(shareReplay(1));
    }

    return this.cachedBuildInfo$;
  }
}

