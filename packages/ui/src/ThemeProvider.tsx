import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export type Theme = 'light' | 'dark';
export type Direction = 'ltr' | 'rtl';

interface ThemeProviderState {
  theme: Theme;
  direction: Direction;
  language: string;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: string) => void;
  toggleTheme: () => void;
  toggleLanguage: () => void;
}

const initialState: ThemeProviderState = {
  theme: 'light',
  direction: 'ltr',
  language: 'en',
  setTheme: () => null,
  setLanguage: () => null,
  toggleTheme: () => null,
  toggleLanguage: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  defaultLanguage?: string;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  defaultLanguage = 'en',
  storageKey = 'art-souk-theme',
  ...props
}: ThemeProviderProps) {
  const { i18n } = useTranslation();
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return defaultTheme;
  });

  const [language, setLanguageState] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${storageKey}-language`);
      if (stored) {
        return stored;
      }
      // Check browser language
      const browserLang = navigator.language;
      if (browserLang.startsWith('ar')) {
        return 'ar';
      }
    }
    return defaultLanguage;
  });

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // Set direction
    root.setAttribute('dir', direction);
    root.setAttribute('lang', language);

    localStorage.setItem(storageKey, theme);
  }, [theme, direction, language, storageKey]);

  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem(`${storageKey}-language`, language);
  }, [language, i18n, storageKey]);

  const setLanguage = (newLanguage: string) => {
    setLanguageState(newLanguage);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const systemTheme = e.matches ? 'dark' : 'light';
      const storedTheme = localStorage.getItem(storageKey);
      if (!storedTheme) {
        setTheme(systemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [storageKey]);

  const value = {
    theme,
    direction,
    language,
    setTheme,
    setLanguage,
    toggleTheme,
    toggleLanguage,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

// High contrast mode support
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isHighContrast;
}

// Reduced motion support
export function useReducedMotion() {
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isReducedMotion;
}
