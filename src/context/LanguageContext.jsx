import { createContext, useContext, useState, useLayoutEffect, useRef } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('monolith_lang') || 'en';
  });

  // Saves the scroll position RIGHT BEFORE React re-renders on lang change.
  // Must be a ref (not state) so it doesn't trigger another render.
  const scrollRestoreRef = useRef(null);

  const setLang = (newLang) => {
    // Capture position BEFORE anything re-renders or reflows
    scrollRestoreRef.current = window.scrollY;
    setLangState(newLang);
    localStorage.setItem('monolith_lang', newLang);
  };

  // useLayoutEffect fires BEFORE the browser paints, so:
  //   1. React commits DOM (text switches language)
  //   2. This effect runs: body class changes + font changes + scroll restored
  //   3. Browser paints — user never sees the intermediate jump
  useLayoutEffect(() => {
    document.documentElement.lang = lang;
    if (lang === 'bn') {
      document.body.classList.add('is-bn');
    } else {
      document.body.classList.remove('is-bn');
    }

    // Only restore if this was a user-triggered toggle, not the initial mount
    const target = scrollRestoreRef.current;
    if (target !== null) {
      scrollRestoreRef.current = null;
      window.scrollTo({ top: target, behavior: 'instant' });
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
