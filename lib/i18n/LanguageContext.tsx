'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, SUPPORTED_LOCALES, TRANSLATIONS } from './translations';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key: string) => key,
  isRtl: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pe_locale') as Locale | null;
      if (saved && TRANSLATIONS[saved]) {
        setLocaleState(saved);
      } else {
        // Detect browser default language if supported
        const browserLang = navigator.language?.split('-')[0] as Locale;
        if (browserLang && TRANSLATIONS[browserLang]) {
          setLocaleState(browserLang);
        }
      }
    } catch {
      // localStorage may fail in private mode or non-browser environments
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('pe_locale', newLocale);
    } catch {}
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      document.documentElement.dir = 'ltr';
    }
  }, [locale]);

  const t = (key: string): string => {
    return TRANSLATIONS[locale]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  const isRtl = false;

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
