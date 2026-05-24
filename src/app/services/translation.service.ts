import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';
import { UserProfileService } from './user-profile.service';
import { I18nService } from './i18n.service';
import {
  LanguageCode,
  normalizeLanguageCode,
  resolveBrowserLanguage,
  resolveLanguagePreference,
  SUPPORTED_LANGUAGES
} from './language-detection.util';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly storageKey = 'myproperty.language';
  private readonly defaultLanguage: LanguageCode = 'en';
  private initialized = false;
  private readonly languageSubject = new BehaviorSubject<LanguageCode>(this.defaultLanguage);

  readonly supportedLanguages = [...SUPPORTED_LANGUAGES];
  readonly language$ = this.languageSubject.asObservable();

  constructor(
    private readonly configService: ConfigService,
    private readonly userProfileService: UserProfileService,
    private readonly authService: AuthService,
    private readonly i18nService: I18nService
  ) {}

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const storedLanguage = normalizeLanguageCode(localStorage.getItem(this.storageKey));
    const profileLanguage = await this.resolveProfileLanguage();
    const browserLanguages =
      typeof navigator !== 'undefined'
        ? navigator.languages?.length
          ? Array.from(navigator.languages)
          : navigator.language
            ? [navigator.language]
            : []
        : [];
    const browserLanguage = resolveBrowserLanguage(browserLanguages);
    const countryFallback = await this.resolveCountryFallback();

    const initialLanguage = resolveLanguagePreference({
      userLanguage: profileLanguage,
      storedLanguage,
      browserLanguages: browserLanguage ? [browserLanguage] : null,
      countryCode: countryFallback,
      fallback: this.defaultLanguage
    });

    this.applyLanguage(initialLanguage);
    this.initialized = true;
  }

  get currentLanguage(): LanguageCode {
    return this.languageSubject.value;
  }

  setLanguage(language: string): void {
    const resolved = normalizeLanguageCode(language) ?? this.defaultLanguage;
    this.applyLanguage(resolved);
  }

  translate(key: string): string {
    return this.i18nService.translate(key);
  }

  private async resolveProfileLanguage(): Promise<LanguageCode | null> {
    if (!this.authService.isLoggedIn()) {
      return null;
    }

    try {
      const profile = await firstValueFrom(this.userProfileService.getMyProfile());
      return resolveLanguagePreference({
        userLanguage: profile.preferredLanguage ?? null,
        countryCode: profile.preferredCountry ?? null,
        fallback: this.defaultLanguage
      });
    } catch {
      return null;
    }
  }

  private async resolveCountryFallback(): Promise<string | null> {
    try {
      const config = await firstValueFrom(this.configService.getEnvironmentConfig());
      return config.country ?? null;
    } catch {
      return null;
    }
  }

  private applyLanguage(language: LanguageCode): void {
    this.languageSubject.next(language);
    this.i18nService.setLanguage(language);
    localStorage.setItem(this.storageKey, language);
    document.documentElement.lang = language;
  }
}

export type { LanguageCode } from './language-detection.util';
