import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { MantineProvider } from '@mantine/core';
import { theme as mantineTheme } from '@/theme';

export type ThemeColorScheme = 'light' | 'dark';

interface ThemeContextValue {
  colorScheme: ThemeColorScheme;
  setColorScheme: (colorScheme: ThemeColorScheme) => void;
  toggleColorScheme: () => void;
}

const STORAGE_KEY = 'swivel-portal:color-scheme';

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialColorScheme(): ThemeColorScheme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedPreference = window.localStorage.getItem(STORAGE_KEY);
  if (storedPreference === 'light' || storedPreference === 'dark') {
    return storedPreference;
  }

  const prefersDark =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setColorSchemeState] = useState<ThemeColorScheme>(() =>
    getInitialColorScheme()
  );

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    if (colorScheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, colorScheme);
    } catch {
      // Ignore storage errors (e.g., Safari private mode)
    }
  }, [colorScheme]);

  const setColorScheme = useCallback((scheme: ThemeColorScheme) => {
    setColorSchemeState(scheme);
  }, []);

  const toggleColorScheme = useCallback(() => {
    setColorSchemeState((prev: ThemeColorScheme) =>
      prev === 'dark' ? 'light' : 'dark'
    );
  }, []);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({ colorScheme, setColorScheme, toggleColorScheme }),
    [colorScheme, setColorScheme, toggleColorScheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <MantineProvider
        theme={mantineTheme}
        defaultColorScheme="light"
        forceColorScheme={colorScheme}
      >
        {children}
      </MantineProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
