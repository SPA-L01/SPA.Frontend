import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { favouritesService } from '@/services/api';

interface FavouritesContextValue {
  favouriteIds: string[];
  favouriteLots: any[];
  loading: boolean;
  toggleFavourite: (locationId: string) => Promise<void>;
  isFavourite: (locationId: string) => boolean;
  refresh: () => Promise<void>;
}

const FavouritesContext = createContext<FavouritesContextValue | null>(null);

export function FavouritesProvider({ children }: { children: React.ReactNode }) {
  const [favouriteLots, setFavouriteLots] = useState<any[]>([]);
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('spa_access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      const data = await favouritesService.getFavourites();
      setFavouriteLots(data);
      setFavouriteIds(data.map((l: any) => l.id));
    } catch (e) {
      console.error('[FavouritesContext] Refresh failed:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleFavourite = async (locationId: string) => {
    const isFav = favouriteIds.includes(locationId);
    try {
      if (isFav) {
        setFavouriteIds((prev) => prev.filter((id) => id !== locationId));
        await favouritesService.removeFavourite(locationId);
      } else {
        setFavouriteIds((prev) => [...prev, locationId]);
        await favouritesService.addFavourite(locationId);
      }
      await refresh(); // Sync full objects
    } catch (e) {
      console.error('[FavouritesContext] Toggle failed:', e);
      await refresh(); // Revert on error
    }
  };

  const isFavourite = (locationId: string) => favouriteIds.includes(locationId);

  return (
    <FavouritesContext.Provider value={{ favouriteIds, favouriteLots, loading, toggleFavourite, isFavourite, refresh }}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const ctx = useContext(FavouritesContext);
  if (!ctx) throw new Error('useFavourites must be inside FavouritesProvider');
  return ctx;
}
