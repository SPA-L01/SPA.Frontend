import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ParkingSpot } from '@/types/parking-spot';
import { parkingSpotService } from '@/services/parking-spot.service';

interface ParkingSpotContextValue {
  currentSpot: ParkingSpot | null;
  history: ParkingSpot[];
  loading: boolean;
  saveSpot: (spot: ParkingSpot) => Promise<void>;
  completeSpot: () => Promise<void>;
  refresh: () => Promise<void>;
}

const ParkingSpotContext = createContext<ParkingSpotContextValue | null>(null);

export function ParkingSpotProvider({ children }: { children: React.ReactNode }) {
  const [currentSpot, setCurrentSpot] = useState<ParkingSpot | null>(null);
  const [history, setHistory] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [cur, hist] = await Promise.all([
        parkingSpotService.getCurrentSpot(),
        parkingSpotService.getHistory(),
      ]);
      setCurrentSpot(cur);
      setHistory(hist);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const saveSpot = useCallback(async (spot: ParkingSpot) => {
    await parkingSpotService.saveCurrentSpot(spot);
    setCurrentSpot(spot);
  }, []);

  const completeSpot = useCallback(async () => {
    const completed = await parkingSpotService.completeCurrentSpot();
    setCurrentSpot(null);
    if (completed) {
      setHistory((prev) => [completed, ...prev].slice(0, 50));
    }
  }, []);

  return (
    <ParkingSpotContext.Provider value={{ currentSpot, history, loading, saveSpot, completeSpot, refresh }}>
      {children}
    </ParkingSpotContext.Provider>
  );
}

export function useParkingSpot(): ParkingSpotContextValue {
  const ctx = useContext(ParkingSpotContext);
  if (!ctx) throw new Error('useParkingSpot must be inside ParkingSpotProvider');
  return ctx;
}
