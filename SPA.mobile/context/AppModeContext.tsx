import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';

export type AppMode = 'guest' | 'authenticated';

interface AppModeContextType {
  mode: AppMode;
  isGuest: boolean;
  isAuthenticated: boolean;
}

const AppModeContext = createContext<AppModeContextType | null>(null);

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();

  const value = useMemo<AppModeContextType>(() => {
    const mode: AppMode = isLoggedIn ? 'authenticated' : 'guest';
    return {
      mode,
      isGuest: mode === 'guest',
      isAuthenticated: mode === 'authenticated',
    };
  }, [isLoggedIn]);

  return (
    <AppModeContext.Provider value={value}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode(): AppModeContextType {
  const ctx = useContext(AppModeContext);
  if (!ctx) throw new Error('useAppMode must be used inside AppModeProvider');
  return ctx;
}
