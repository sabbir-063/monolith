import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('monolith_lang') || 'en';
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    localStorage.setItem('monolith_lang', newLang);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    if (lang === 'bn') {
      document.body.classList.add('is-bn');
    } else {
      document.body.classList.remove('is-bn');
    }
  }, [lang]);

  const t = (key) => {
    const translation = translations[lang]?.[key];
    if (translation === undefined) {
      return translations['en']?.[key] || key;
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
