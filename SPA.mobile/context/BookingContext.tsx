import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedCarSpot {
  floor?: string;
  zone?: string;
  column?: string;
  note?: string;
  savedAt: string;
}

export interface BookingHistoryItem {
  id: string;
  lotId: string;
  lotName: string;
  lotAddress: string;
  slotCode: string;
  total: number;
  method: string;
  createdAt: string;
  status: 'active' | 'completed';
  savedSpot?: SavedCarSpot;
}

interface BookingContextValue {
  bookings: BookingHistoryItem[];
  addBooking: (booking: Omit<BookingHistoryItem, 'createdAt' | 'status'>) => Promise<void>;
  saveCarSpot: (bookingId: string, spot: Omit<SavedCarSpot, 'savedAt'>) => Promise<void>;
  completeBooking: (bookingId: string) => Promise<void>;
  getBooking: (bookingId: string) => BookingHistoryItem | undefined;
}

const BOOKING_KEY = 'spa:booking-history';
const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(BOOKING_KEY)
      .then((raw) => raw && setBookings(JSON.parse(raw)))
      .catch(() => {});
  }, []);

  const persist = async (next: BookingHistoryItem[]) => {
    setBookings(next);
    await AsyncStorage.setItem(BOOKING_KEY, JSON.stringify(next));
  };

  const addBooking: BookingContextValue['addBooking'] = async (booking) => {
    const nextItem: BookingHistoryItem = {
      ...booking,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    const exists = bookings.some((b) => b.id === booking.id);
    if (exists) return;
    await persist([nextItem, ...bookings].slice(0, 100));
  };

  const saveCarSpot: BookingContextValue['saveCarSpot'] = async (bookingId, spot) => {
    const next = bookings.map((b) =>
      b.id === bookingId
        ? { ...b, savedSpot: { ...spot, savedAt: new Date().toISOString() } }
        : b
    );
    await persist(next);
  };

  const completeBooking: BookingContextValue['completeBooking'] = async (bookingId) => {
    const next = bookings.map((b) =>
      b.id === bookingId ? { ...b, status: 'completed' as const } : b
    );
    await persist(next);
  };

  const value = useMemo<BookingContextValue>(() => ({
    bookings,
    addBooking,
    saveCarSpot,
    completeBooking,
    getBooking: (bookingId) => bookings.find((b) => b.id === bookingId),
  }), [bookings]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBookings() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookings must be inside BookingProvider');
  return ctx;
}
