import { describe, it, expect } from 'vitest';
import { SUPPORTED_LOCALES, TRANSLATIONS, Locale } from '../lib/i18n/translations';
import { getProtocol } from '../lib/protocols/registry';

describe('Internationalization (i18n) Verification', () => {
  it('supports French and English', () => {
    expect(SUPPORTED_LOCALES.length).toBe(2);
    const codes = SUPPORTED_LOCALES.map((l) => l.code);
    expect(codes).toContain('en');
    expect(codes).toContain('fr');
  });

  it('marks French and English as LTR', () => {
    const fr = SUPPORTED_LOCALES.find((l) => l.code === 'fr');
    expect(fr?.dir).toBe('ltr');

    const en = SUPPORTED_LOCALES.find((l) => l.code === 'en');
    expect(en?.dir).toBe('ltr');
  });

  it('provides consistent core translation keys across all locales', () => {
    const englishKeys = Object.keys(TRANSLATIONS['en']);
    expect(englishKeys.length).toBeGreaterThan(15);

    SUPPORTED_LOCALES.forEach((locale) => {
      const localeDict = TRANSLATIONS[locale.code];
      expect(localeDict).toBeDefined();

      // Ensure essential UI keys exist in all locales
      expect(localeDict['appTitle']).toBeTruthy();
      expect(localeDict['play']).toBeTruthy();
      expect(localeDict['pause']).toBeTruthy();
      expect(localeDict['stepNext']).toBeTruthy();
      expect(localeDict['search']).toBeTruthy();
      expect(localeDict['shortcutsTitle']).toBeTruthy();
    });
  });

  it('translates protocol steps and detailed explanations when locale is fr', () => {
    const bgpEn = getProtocol('bgp', 'en');
    const bgpFr = getProtocol('bgp', 'fr');

    expect(bgpEn.steps[2].title).toBe('Say Hello');
    expect(bgpEn.steps[2].desc).toBe('OPEN, then KEEPALIVE');
    expect(bgpEn.steps[2].detail).toContain('Each router sends an OPEN');

    expect(bgpFr.steps[2].title).toBe('Dire bonjour');
    expect(bgpFr.steps[2].desc).toBe('OPEN, puis KEEPALIVE');
    expect(bgpFr.steps[2].detail).toContain('Chaque routeur envoie un OPEN');

    const httpFr = getProtocol('http', 'fr');
    expect(httpFr.steps[0].title).toBe('Requête du client');
    expect(httpFr.steps[0].desc).toBe('Le navigateur prépare la requête');
  });
});
