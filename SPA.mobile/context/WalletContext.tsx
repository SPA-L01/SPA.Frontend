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
    } catch (error) {
      console.error('[WalletContext] Reload failed:', error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const topup = useCallback(async (amount: number, _method: string): Promise<void> => {
    await walletService.topUp(amount);
    await reload(); // Refresh everything from BE
  }, [reload]);

  const deduct = useCallback(async (amount: number, title: string, subtitle: string): Promise<boolean> => {
    try {
      await walletService.createPayment(amount, subtitle || title);
      await reload(); // Refresh from BE
      return true;
    } catch (error) {
      console.error('[WalletContext] Deduct failed:', error);
      return false;
    }
  }, [reload]);

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
