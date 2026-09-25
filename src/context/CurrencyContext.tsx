import { createContext, useContext, useState, ReactNode } from 'react';

type Currency = 'NPR' | 'JPY' | 'USD' | 'EUR' | 'GBP';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (price: number) => string;
}

const exchangeRates: Record<Currency, number> = {
  NPR: 1,
  JPY: 0.56,
  USD: 0.0075,
  EUR: 0.0069,
  GBP: 0.0059,
};

const currencySymbols: Record<Currency, string> = {
  NPR: 'रू',
  JPY: '¥',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('NPR');

  const formatPrice = (price: number): string => {
    const convertedPrice = price * exchangeRates[currency];
    const symbol = currencySymbols[currency];
    
    if (currency === 'JPY') {
      return `${symbol}${Math.round(convertedPrice).toLocaleString()}`;
    }
    
    return `${symbol}${convertedPrice.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
}
