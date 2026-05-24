import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection, Injector } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  includeBearerTokenInterceptor,
  provideKeycloak
} from 'keycloak-angular';
import { routes } from './app.routes';
import { sessionAuthInterceptor } from './interceptors/session-auth.interceptor';
import { localeInterceptor } from './interceptors/locale.interceptor';
import { environment } from '../environments/environment';
import { TranslationService } from './services/translation.service';

// Match all API requests to the configured backend server (required for Keycloak bearer token)
const backendApiPattern = new RegExp(
  `^${environment.apiBaseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/api\\/.*`
);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes, withRouterConfig({ paramsInheritanceStrategy: 'always' })),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([includeBearerTokenInterceptor, sessionAuthInterceptor, localeInterceptor])),
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [
        {
          urlPattern: backendApiPattern
        }
      ]
    },
    // Use Injector in the APP_INITIALIZER factory to lazily obtain the TranslationService at
    // initialization time. This avoids eager provider resolution of the TranslationService
    // during the Angular provider construction phase (NG0200).
    {
      provide: APP_INITIALIZER,
      useFactory: (injector: Injector) => {
        return () => {
          const svc = injector.get(TranslationService);
          return svc.init();
        };
      },
      deps: [Injector],
      multi: true
    },
    provideKeycloak({
      config: {
        url: environment.keycloakUrl,
        realm: environment.keycloakRealm,
        clientId: environment.keycloakClientId
      },
      initOptions: {
        onLoad: 'check-sso',
        checkLoginIframe: false
      },
      providers: [],
      features: []
    })
  ]
};
