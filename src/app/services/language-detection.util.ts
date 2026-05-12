export type LanguageCode = 'en' | 'pt' | 'fr' | 'es';

export const SUPPORTED_LANGUAGES: readonly LanguageCode[] = ['en', 'pt', 'fr', 'es'];

const COUNTRY_LANGUAGE_MAP: Record<string, LanguageCode> = {
  BR: 'pt',
  PT: 'pt',
  FR: 'fr',
  ES: 'es',
  MX: 'es',
  CA: 'en',
  US: 'en',
  GB: 'en',
  DE: 'en',
  IT: 'en'
};

export function normalizeLanguageCode(value: string | null | undefined): LanguageCode | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  const shortCode = normalized.includes('-') ? normalized.split('-')[0] : normalized;
  return isSupportedLanguage(shortCode) ? shortCode : null;
}

export function resolveBrowserLanguage(languages: readonly string[] | null | undefined): LanguageCode | null {
  if (!languages || languages.length === 0) {
    return null;
  }

  for (const language of languages) {
    const resolved = normalizeLanguageCode(language);
    if (resolved) {
      return resolved;
    }
  }

  return null;
}

export function languageFromCountry(countryCode: string | null | undefined): LanguageCode | null {
  if (!countryCode) {
    return null;
  }

  return COUNTRY_LANGUAGE_MAP[countryCode.trim().toUpperCase()] ?? null;
}

export function resolveLanguagePreference(options: {
  userLanguage?: string | null;
  storedLanguage?: string | null;
  browserLanguages?: readonly string[] | null;
  countryCode?: string | null;
  fallback?: LanguageCode;
}): LanguageCode {
  return (
    normalizeLanguageCode(options.userLanguage) ??
    normalizeLanguageCode(options.storedLanguage) ??
    resolveBrowserLanguage(options.browserLanguages) ??
    languageFromCountry(options.countryCode) ??
    options.fallback ??
    'en'
  );
}

export function isSupportedLanguage(value: string): value is LanguageCode {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

