import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.194:3000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Request interceptor: tự động đính access token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('spa_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: auto-refresh khi 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('spa_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${BASE_URL}/auth/refresh`, null, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });
        const { accessToken, refreshToken: newRefresh } = res.data;
        await AsyncStorage.setItem('spa_access_token', accessToken);
        await AsyncStorage.setItem('spa_refresh_token', newRefresh);

        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        await AsyncStorage.multiRemove(['spa_access_token', 'spa_refresh_token', 'spa_user_id']);
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export const parkingService = {
  getLocations: async (query?: any) => {
    const response = await api.get('/parking-locations', { params: query });
    return response.data;
  },
  getNearbyLocations: async (lat: number, lng: number, radiusKm?: number) => {
    const response = await api.get('/parking-locations/nearby', {
      params: { lat, lng, radiusKm },
    });
    return response.data;
  },
  getLocationDetail: async (id: string) => {
    const response = await api.get(`/parking-locations/${id}`);
    return response.data;
  },
  getSlots: async (id: string) => {
    const response = await api.get(`/parking-locations/${id}/slots`);
    return response.data;
  },
};

export const walletService = {
  getWallet: async () => {
    const response = await api.get('/wallet/me');
    return response.data;
  },
  getTransactions: async () => {
    const response = await api.get('/wallet/me/transactions');
    return response.data;
  },
  topUp: async (amount: number) => {
    const response = await api.post('/wallet/me/top-up', { amount });
    return response.data;
  },
};

