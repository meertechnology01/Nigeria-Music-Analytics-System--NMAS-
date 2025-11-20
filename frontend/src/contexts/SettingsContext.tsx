import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SystemSettings {
  // Data Collection
  autoDataCollection: boolean;
  storeRawData: boolean;
  enableValidation: boolean;
  
  // Appearance
  theme: 'light' | 'dark';
  glassEffect: boolean;
  
  // Regional Settings
  defaultCurrency: 'USD' | 'NGN' | 'EUR';
  defaultRegion: string;
  
  // Currency Conversion Rates (base: USD)
  usdToNgnRate: number;
  usdToEurRate: number;
  
  // Economic Model Parameters
  streamingRevenueMultiplier: number;
  concertRevenueMultiplier: number;
  employmentPerMillion: number;
  indirectEmploymentRatio: number;
}

const DEFAULT_SETTINGS: SystemSettings = {
  autoDataCollection: true,
  storeRawData: true,
  enableValidation: false,
  theme: 'light',
  glassEffect: false,
  defaultCurrency: 'USD',
  defaultRegion: 'all',
  usdToNgnRate: 1650,
  usdToEurRate: 0.92,
  streamingRevenueMultiplier: 1.5,
  concertRevenueMultiplier: 3.0,
  employmentPerMillion: 25,
  indirectEmploymentRatio: 2.5,
};

interface SettingsContextType {
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetSettings: () => void;
  toggleTheme: () => void;
  toggleGlassEffect: () => void;
  getCurrencySymbol: () => string;
  convertCurrency: (amountInUsd: number) => number;
  formatCurrency: (amountInUsd: number, decimals?: number) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'afrobeats-engine-settings';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings>(() => {
    // Load settings from localStorage on initial mount
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      } catch (e) {
        console.error('Failed to parse stored settings:', e);
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Apply theme class to document
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Apply glass effect class to document
  useEffect(() => {
    if (settings.glassEffect) {
      document.documentElement.classList.add('glass-mode');
    } else {
      document.documentElement.classList.remove('glass-mode');
    }
  }, [settings.glassEffect]);

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const toggleTheme = () => {
    setSettings(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  const toggleGlassEffect = () => {
    setSettings(prev => ({ ...prev, glassEffect: !prev.glassEffect }));
  };

  const getCurrencySymbol = () => {
    switch (settings.defaultCurrency) {
      case 'USD':
        return '$';
      case 'NGN':
        return '₦';
      case 'EUR':
        return '€';
      default:
        return '$';
    }
  };

  const convertCurrency = (amountInUsd: number): number => {
    switch (settings.defaultCurrency) {
      case 'USD':
        return amountInUsd;
      case 'NGN':
        return amountInUsd * settings.usdToNgnRate;
      case 'EUR':
        return amountInUsd * settings.usdToEurRate;
      default:
        return amountInUsd;
    }
  };

  const formatCurrency = (amountInUsd: number, decimals: number = 2): string => {
    const converted = convertCurrency(amountInUsd);
    return `${getCurrencySymbol()}${converted.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    })}`;
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, toggleTheme, toggleGlassEffect, getCurrencySymbol, convertCurrency, formatCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
