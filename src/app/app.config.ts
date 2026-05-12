import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, provideZoneChangeDetection, Injector } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  includeBearerTokenInterceptor,
  provideKeycloak
} from 'keycloak-angular';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader, TRANSLATE_HTTP_LOADER_CONFIG } from '@ngx-translate/http-loader';
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
    // Provide configuration for the TranslateHttpLoader used by @ngx-translate/http-loader v17+.
    // The TRANSLATE_HTTP_LOADER_CONFIG token is consumed by the TranslateHttpLoader factory.
    {
      provide: TRANSLATE_HTTP_LOADER_CONFIG,
      useValue: { prefix: './assets/i18n/', suffix: '.json' }
    },
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateHttpLoader
        }
      })
    ),
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
    // (and its internal TranslateService) which can create circular dependency errors
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
