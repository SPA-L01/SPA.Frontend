import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Transaction {
  id: string;
  type: 'topup' | 'payment' | 'refund';
  amount: number;
  title: string;
  subtitle: string;
  date: string;
  status: 'success' | 'pending' | 'failed';
}

interface WalletState {
  balance: number;
  transactions: Transaction[];
}

interface WalletContextValue extends WalletState {
  deduct: (amount: number, title: string, subtitle: string) => Promise<boolean>;
  topup: (amount: number, method: string) => Promise<void>;
  reload: () => Promise<void>;
}

const WALLET_KEY = 'spa:wallet';
const INITIAL_BALANCE = 2_450_000;

const WalletContext = createContext<WalletContextValue | null>(null);

function nowLabel(): string {
  const d = new Date();
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `Hôm nay, ${h}:${m}`;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    balance: INITIAL_BALANCE,
    transactions: [],
  });

  const persist = async (next: WalletState) => {
    try {
      await AsyncStorage.setItem(WALLET_KEY, JSON.stringify(next));
    } catch (_) {}
  };

  const reload = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(WALLET_KEY);
      if (raw) {
        setState(JSON.parse(raw) as WalletState);
      }
    } catch (_) {}
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const deduct = useCallback(async (amount: number, title: string, subtitle: string): Promise<boolean> => {
    let success = false;
    setState((prev) => {
      if (prev.balance < amount) return prev;
      const tx: Transaction = {
        id: `tx_${Date.now()}`,
        type: 'payment',
        amount,
        title,
        subtitle,
        date: nowLabel(),
        status: 'success',
      };
      const next: WalletState = {
        balance: prev.balance - amount,
        transactions: [tx, ...prev.transactions].slice(0, 50),
      };
      persist(next);
      success = true;
      return next;
    });
    // give setState a tick to resolve
    await new Promise((r) => setTimeout(r, 20));
    return success;
  }, []);

  const topup = useCallback(async (amount: number, method: string): Promise<void> => {
    setState((prev) => {
      const tx: Transaction = {
        id: `tx_${Date.now()}`,
        type: 'topup',
        amount,
        title: 'Nạp tiền vào ví',
        subtitle: `Từ ${method}`,
        date: nowLabel(),
        status: 'success',
      };
      const next: WalletState = {
        balance: prev.balance + amount,
        transactions: [tx, ...prev.transactions].slice(0, 50),
      };
      persist(next);
      return next;
    });
    await new Promise((r) => setTimeout(r, 20));
  }, []);

  return (
    <WalletContext.Provider value={{ ...state, deduct, topup, reload }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be inside WalletProvider');
  return ctx;
}
