import { languageFromCountry, normalizeLanguageCode, resolveBrowserLanguage, resolveLanguagePreference } from './language-detection.util';

describe('language detection utilities', () => {
  it('prefers explicit user language over other signals', () => {
    const resolved = resolveLanguagePreference({
      userLanguage: 'pt-BR',
      storedLanguage: 'fr',
      browserLanguages: ['es-ES'],
      countryCode: 'US',
      fallback: 'en'
    });

    expect(resolved).toBe('pt');
  });

  it('falls back to browser locale when there is no user preference', () => {
    const resolved = resolveLanguagePreference({
      browserLanguages: ['de-DE', 'es-MX'],
      countryCode: 'BR',
      fallback: 'en'
    });

    expect(resolved).toBe('es');
  });

  it('uses the country fallback when browser locale is unsupported', () => {
    const resolved = resolveLanguagePreference({
      browserLanguages: ['ja-JP'],
      countryCode: 'FR',
      fallback: 'en'
    });

    expect(resolved).toBe('fr');
  });

  it('falls back to english when no signals are available', () => {
    const resolved = resolveLanguagePreference({ fallback: 'en' });

    expect(resolved).toBe('en');
  });

  it('normalizes and validates language codes', () => {
    expect(normalizeLanguageCode('EN-us')).toBe('en');
    expect(normalizeLanguageCode('pt-BR')).toBe('pt');
    expect(normalizeLanguageCode('zz-ZZ')).toBeNull();
  });

  it('maps countries to their default language', () => {
    expect(languageFromCountry('BR')).toBe('pt');
    expect(languageFromCountry('MX')).toBe('es');
    expect(languageFromCountry('US')).toBe('en');
  });

  it('resolves browser language lists in order', () => {
    expect(resolveBrowserLanguage(['ja-JP', 'fr-FR'])).toBe('fr');
    expect(resolveBrowserLanguage(['de-DE'])).toBeNull();
  });
});

