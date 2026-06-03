'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MOCK_THB_RATE } from '@/lib/constants';

type Currency = 'USD' | 'THB';

interface CurrencyContextType {
  currency: Currency;
  toggleCurrency: () => void;
  formatCurrency: (amount: number | string) => string;
  rate: number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const rate = MOCK_THB_RATE;

  const toggleCurrency = () => {
    setCurrency(prev => (prev === 'USD' ? 'THB' : 'USD'));
  };

  const formatCurrency = (amount: number | string) => {
    if (typeof amount === 'string') {
      // If it's already a formatted string like $1.2B, just replace $ if THB, 
      // but realistically we should only pass numbers here.
      // We will handle specific string replacements in components.
      if (currency === 'THB' && amount.startsWith('$')) {
        return '฿' + amount.substring(1);
      }
      return amount;
    }

    const value = currency === 'THB' ? amount * rate : amount;
    const symbol = currency === 'THB' ? '฿' : '$';
    
    return `${symbol}${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, formatCurrency, rate }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
