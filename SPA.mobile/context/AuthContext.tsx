import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, LoginDto, RegisterDto } from '@/services/auth.service';
import * as Sentry from '@sentry/react-native';
import { analyticsService } from '@/services/analytics.service';

interface AuthState {
  userId: string | null;
  isLoggedIn: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    userId: null,
    isLoggedIn: false,
    loading: true,
  });

  // Check token on app start, but never block guest mode if storage fails.
  useEffect(() => {
    (async () => {
      try {
        const loggedIn = await authService.isLoggedIn();
        const userId = await authService.getUserId();
        // Khôi phục user context cho Sentry nếu đã đăng nhập trước đó
        if (loggedIn && userId) {
          Sentry.setUser({ id: userId });
          analyticsService.setUserId(userId);
        }
        setState({ userId, isLoggedIn: loggedIn, loading: false });
      } catch {
        setState({ userId: null, isLoggedIn: false, loading: false });
      }
    })();
  }, []);

  const login = async (dto: LoginDto) => {
    const data = await authService.login(dto);
    // Gán user vào Sentry và analytics service
    Sentry.setUser({ id: data.id });
    analyticsService.setUserId(data.id);
    setState({ userId: data.id, isLoggedIn: true, loading: false });
  };

  const register = async (dto: RegisterDto) => {
    await authService.register(dto);
  };

  const logout = async () => {
    await authService.logout();
    // Xóa user context trong Sentry và analytics service
    Sentry.setUser(null);
    analyticsService.setUserId(null);
    setState({ userId: null, isLoggedIn: false, loading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
