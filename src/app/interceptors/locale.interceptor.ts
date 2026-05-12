import { HttpInterceptorFn } from '@angular/common/http';

// Avoid injecting TranslationService here to prevent a circular dependency during
// APP_INITIALIZER (TranslationService.init) which may perform HTTP requests.
// Read the effective language from localStorage or the document <html> lang
// attribute as a lightweight fallback that does not require DI.
export const localeInterceptor: HttpInterceptorFn = (request, next) => {
  const storageKey = 'myproperty.language';
  const language =
    (typeof localStorage !== 'undefined' && localStorage.getItem(storageKey)) ||
    (typeof document !== 'undefined' ? document.documentElement.lang : '') ||
    'en';

  return next(
    request.clone({
      setHeaders: {
        'Accept-Language': language,
        'X-Client-Language': language
      }
    })
  );
};


