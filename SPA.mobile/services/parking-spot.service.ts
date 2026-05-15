import AsyncStorage from '@react-native-async-storage/async-storage';
import { ParkingSpot } from '@/types/parking-spot';

const KEY_CURRENT = 'fmc:spot:current';
const KEY_HISTORY = 'fmc:spot:history';

export const parkingSpotService = {
  async getCurrentSpot(): Promise<ParkingSpot | null> {
    try {
      const raw = await AsyncStorage.getItem(KEY_CURRENT);
      return raw ? (JSON.parse(raw) as ParkingSpot) : null;
    } catch {
      return null;
    }
  },

  async saveCurrentSpot(spot: ParkingSpot): Promise<void> {
    await AsyncStorage.setItem(KEY_CURRENT, JSON.stringify(spot));
  },

  async clearCurrentSpot(): Promise<void> {
    await AsyncStorage.removeItem(KEY_CURRENT);
  },

  async completeCurrentSpot(): Promise<ParkingSpot | null> {
    const current = await this.getCurrentSpot();
    if (!current) return null;

    const now = new Date().toISOString();
    const completed: ParkingSpot = {
      ...current,
      status: 'COMPLETED',
      completedAt: now,
      updatedAt: now,
      durationMs: Date.now() - new Date(current.createdAt).getTime(),
    };

    // Add to history
    const history = await this.getHistory();
    const updated = [completed, ...history].slice(0, 50);
    await AsyncStorage.setItem(KEY_HISTORY, JSON.stringify(updated));

    // Clear current
    await this.clearCurrentSpot();

    return completed;
  },

  async getHistory(): Promise<ParkingSpot[]> {
    try {
      const raw = await AsyncStorage.getItem(KEY_HISTORY);
      return raw ? (JSON.parse(raw) as ParkingSpot[]) : [];
    } catch {
      return [];
    }
  },

  async getHistoryItem(id: string): Promise<ParkingSpot | null> {
    const history = await this.getHistory();
    return history.find((s) => s.id === id) ?? null;
  },
};
