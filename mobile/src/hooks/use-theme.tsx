import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

type ThemeType = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryLight: string;
  success: string;
  warning: string;
  danger: string;
}

export const lightColors: ThemeColors = {
  background: '#ffffff',
  card: '#f8fafc',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#f1f5f9',
  primary: '#7c3aed',
  primaryLight: '#faf5ff',
  success: '#10b981',
  warning: '#f97316',
  danger: '#ef4444',
};

export const darkColors: ThemeColors = {
  background: '#0f172a',
  card: '#1e293b',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  border: '#334155',
  primary: '#8b5cf6',
  primaryLight: '#2e1065',
  success: '#10b981',
  warning: '#f97316',
  danger: '#ef4444',
};

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  colors: lightColors,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>('light');

  useEffect(() => {
    SecureStore.getItemAsync('appTheme').then(savedTheme => {
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
      }
    });
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    SecureStore.setItemAsync('appTheme', newTheme);
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
