import AsyncStorage from '@react-native-async-storage/async-storage';

const NAMESPACE_SEPARATOR = ':';

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (error) {
      console.warn(`[storage] Failed to read key "${key}"`, error);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`[storage] Failed to write key "${key}"`, error);
      throw error;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn(`[storage] Failed to remove key "${key}"`, error);
      throw error;
    }
  },

  async clearNamespace(prefix: string): Promise<void> {
    try {
      const normalizedPrefix = prefix.endsWith(NAMESPACE_SEPARATOR)
        ? prefix
        : `${prefix}${NAMESPACE_SEPARATOR}`;
      const keys = await AsyncStorage.getAllKeys();
      const matchingKeys = keys.filter((key) => key.startsWith(normalizedPrefix));
      if (matchingKeys.length > 0) {
        await AsyncStorage.multiRemove(matchingKeys);
      }
    } catch (error) {
      console.warn(`[storage] Failed to clear namespace "${prefix}"`, error);
      throw error;
    }
  },
};

export const STORAGE_KEYS = {
  currentSpot: 'fmc:spot:current',
  history: 'fmc:spot:history',
  settingsPrefix: 'fmc:settings',
  photosPrefix: 'fmc:spot:photos',
} as const;
