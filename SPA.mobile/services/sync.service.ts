import AsyncStorage from '@react-native-async-storage/async-storage';
import { savedParkingService, favouritesService } from './api';

const LAST_SYNC_KEY = 'spa_last_sync_time';
const SPOTS_STORAGE_KEY = 'spa_parking_spots';

export const syncService = {
  async pushLocalToCloud() {
    try {
      const localSpotsJson = await AsyncStorage.getItem(SPOTS_STORAGE_KEY);
      if (!localSpotsJson) return { success: true, count: 0 };

      const localSpots = JSON.parse(localSpotsJson);
      const formattedSpots = localSpots.map(s => ({
        localId: s.id,
        parkingLocationId: s.parkingLocationId,
        floor: s.floor,
        zone: s.zone,
        column: s.column,
        note: s.note,
        latitude: s.latitude,
        longitude: s.longitude,
        accuracy: s.accuracy,
        status: s.status,
        createdAt: s.createdAt,
        photos: s.photos || [],
      }));

      const result = await savedParkingService.syncSpots(formattedSpots);
      await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      return { success: true, ...result };
    } catch (e) {
      console.error('[SyncService] Push failed:', e);
      return { success: false, error: e.message };
    }
  },

  async pullFromCloud() {
    try {
      const cloudSpots = await savedParkingService.getSavedSpots();
      if (!cloudSpots) return { success: true, count: 0 };

      // Merge cloud spots into local storage, using localId for dedup
      const localSpotsJson = await AsyncStorage.getItem(SPOTS_STORAGE_KEY);
      let localSpots = localSpotsJson ? JSON.parse(localSpotsJson) : [];

      cloudSpots.forEach(cloudSpot => {
        const index = localSpots.findIndex(ls => ls.id === cloudSpot.localId);
        const mappedSpot = {
          id: cloudSpot.localId,
          parkingLocationId: cloudSpot.parkingLocationId,
          floor: cloudSpot.floor,
          zone: cloudSpot.zone,
          column: cloudSpot.column,
          note: cloudSpot.note,
          latitude: cloudSpot.latitude,
          longitude: cloudSpot.longitude,
          accuracy: cloudSpot.accuracy,
          status: cloudSpot.status,
          createdAt: cloudSpot.createdAt,
          photos: cloudSpot.photos?.map(p => p.url) || [],
          synced: true,
        };

        if (index > -1) {
          localSpots[index] = mappedSpot;
        } else {
          localSpots.push(mappedSpot);
        }
      });

      await AsyncStorage.setItem(SPOTS_STORAGE_KEY, JSON.stringify(localSpots));
      await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      return { success: true, count: cloudSpots.length };
    } catch (e) {
      console.error('[SyncService] Pull failed:', e);
      return { success: false, error: e.message };
    }
  },

  async getLastSyncedAt() {
    return AsyncStorage.getItem(LAST_SYNC_KEY);
  }
};
