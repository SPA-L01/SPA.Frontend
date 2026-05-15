import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { walletService } from '@/services/api';

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
  loading: boolean;
}

interface WalletContextValue extends WalletState {
  deduct: (amount: number, title: string, subtitle: string) => Promise<boolean>;
  topup: (amount: number, method: string) => Promise<void>;
  reload: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

// Map backend transaction type to frontend type
function mapType(apiType: string): Transaction['type'] {
  if (apiType === 'TOP_UP') return 'topup';
  if (apiType === 'REFUND') return 'refund';
  return 'payment';
}

function mapStatus(apiStatus: string): Transaction['status'] {
  if (apiStatus === 'COMPLETED') return 'success';
  if (apiStatus === 'FAILED') return 'failed';
  return 'pending';
}

function mapTitle(apiType: string): string {
  if (apiType === 'TOP_UP') return 'Nạp tiền vào ví';
  if (apiType === 'REFUND') return 'Hoàn tiền';
  return 'Thanh toán đỗ xe';
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const dd = d.getDate().toString().padStart(2, '0');
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const yy = d.getFullYear();
    const hh = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    return `${dd}/${mm}/${yy}, ${hh}:${min}`;
  } catch {
    return '';
  }
}

function mapApiTransaction(tx: any): Transaction {
  return {
    id: tx.id,
    type: mapType(tx.type),
    amount: tx.amount,
    title: mapTitle(tx.type),
    subtitle: tx.note ?? '',
    date: formatDate(tx.createdAt),
    status: mapStatus(tx.status),
  };
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    balance: 0,
    transactions: [],
    loading: true,
  });

  const reload = useCallback(async () => {
    try {
      // Only fetch if user is logged in
      const token = await AsyncStorage.getItem('spa_access_token');
      if (!token) {
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }

      const [wallet, txList] = await Promise.all([
        walletService.getWallet(),
        walletService.getTransactions(),
      ]);

      setState({
        balance: wallet.balance ?? 0,
        transactions: Array.isArray(txList) ? txList.map(mapApiTransaction) : [],
        loading: false,
      });
    } catch {
      // API error or not logged in — keep balance at 0, stop loading
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const topup = useCallback(async (amount: number, _method: string): Promise<void> => {
    const result = await walletService.topUp(amount);
    setState((prev) => ({
      ...prev,
      balance: result.newBalance,
      transactions: [
        mapApiTransaction({
          ...result.transaction,
          createdAt: result.transaction.createdAt ?? new Date().toISOString(),
        }),
        ...prev.transactions,
      ].slice(0, 50),
    }));
  }, []);

  // deduct: used locally for optimistic booking UI (Phase 5 will call API)
  const deduct = useCallback(async (amount: number, _title: string, _subtitle: string): Promise<boolean> => {
    let success = false;
    setState((prev) => {
      if (prev.balance < amount) return prev;
      success = true;
      return { ...prev, balance: prev.balance - amount };
    });
    // give setState a tick
    await new Promise((r) => setTimeout(r, 20));
    return success;
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
