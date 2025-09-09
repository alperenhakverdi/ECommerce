import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorMode } from '@chakra-ui/react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleColorMode: () => void;
  isSystemMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { colorMode, setColorMode } = useColorMode();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('theme-mode');
    return (stored as ThemeMode) || 'system';
  });

  // Check if user prefers dark mode via system settings
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (themeMode === 'system') {
        setColorMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    // Set initial theme based on mode
    if (themeMode === 'system') {
      setColorMode(prefersDarkMode ? 'dark' : 'light');
    } else {
      setColorMode(themeMode);
    }

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [themeMode, setColorMode, prefersDarkMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('theme-mode', mode);
    
    if (mode === 'system') {
      setColorMode(prefersDarkMode ? 'dark' : 'light');
    } else {
      setColorMode(mode);
    }
  };

  const toggleColorMode = () => {
    if (themeMode === 'system') {
      // If in system mode, switch to the opposite of current system preference
      const newMode = prefersDarkMode ? 'light' : 'dark';
      setThemeMode(newMode);
    } else {
      // If manual mode, toggle between light and dark
      const newMode = colorMode === 'light' ? 'dark' : 'light';
      setThemeMode(newMode);
    }
  };

  const value: ThemeContextType = {
    themeMode,
    setThemeMode,
    toggleColorMode,
    isSystemMode: themeMode === 'system',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};