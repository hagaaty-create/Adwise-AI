'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { translations as translationData, Translations } from '@/lib/translations';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  translations: Translations['en']; // We will always use the shape of 'en' as the base
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('ar');

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const newLang = prev === 'ar' ? 'en' : 'ar';
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', newLang);
        document.documentElement.lang = newLang;
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
      }
      return newLang;
    });
  }, []);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language | null;
    const initialLang = savedLanguage || 'ar';
    setLanguage(initialLang);
    document.documentElement.lang = initialLang;
    document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const translations = translationData[language] || translationData.ar;

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// This component is a trick to set the lang and dir on the server-side rendered HTML
// to avoid a flash of the wrong direction/language on initial load.
// It will be wrapped by the Provider on the client to take over.
export function LanguageSetter({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState('ar');
    const [dir, setDir] = useState('rtl');

    useEffect(() => {
        const savedLanguage = localStorage.getItem('language') as Language | null;
        const initialLang = savedLanguage || 'ar';
        setLang(initialLang);
        setDir(initialLang === 'ar' ? 'rtl' : 'ltr');
    }, []);

    return (
        <html lang={lang} dir={dir} className="h-full dark">
            <head>
                {/* Paste your Google Search Console HTML tag here for site verification */}
            </head>
            <body className={`${'var(--font-inter)'} antialiased h-full`}>
                {children}
            </body>
        </html>
    )
}
