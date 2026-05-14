import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

const ACCESS_TOKEN_KEY = 'spa_access_token';
const REFRESH_TOKEN_KEY = 'spa_refresh_token';
const USER_ID_KEY = 'spa_user_id';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNo?: string;
}

export interface AuthTokens {
  id: string;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async login(dto: LoginDto): Promise<AuthTokens> {
    const res = await api.post<AuthTokens>('/auth/login', dto);
    await authService.saveTokens(res.data);
    return res.data;
  },

  async register(dto: RegisterDto) {
    const res = await api.post('/auth/register', dto);
    return res.data;
  },

  async refreshToken(): Promise<AuthTokens | null> {
    const refreshToken = await authService.getRefreshToken();
    if (!refreshToken) return null;
    const res = await api.post<AuthTokens>('/auth/refresh', null, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    await authService.saveTokens(res.data);
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore errors — still clear local tokens
    } finally {
      await authService.clearTokens();
    }
  },

  async saveTokens(data: AuthTokens) {
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, data.accessToken],
      [REFRESH_TOKEN_KEY, data.refreshToken],
      [USER_ID_KEY, data.id],
    ]);
  },

  async clearTokens() {
    await AsyncStorage.multiRemove([
      ACCESS_TOKEN_KEY,
      REFRESH_TOKEN_KEY,
      USER_ID_KEY,
    ]);
  },

  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  },

  async getUserId(): Promise<string | null> {
    return AsyncStorage.getItem(USER_ID_KEY);
  },

  async isLoggedIn(): Promise<boolean> {
    const token = await authService.getAccessToken();
    return !!token;
  },
};
