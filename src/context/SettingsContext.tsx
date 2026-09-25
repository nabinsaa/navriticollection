import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface Settings {
  store_name: string;
  store_email: string;
  store_phone: string;
  store_address: string;
  currency: string;
  shipping_fee: string;
  free_shipping_threshold: string;
  default_order_status: string;
  low_stock_threshold: string;
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: Settings = {
  store_name: 'Vastra Elegance',
  store_email: '',
  store_phone: '',
  store_address: '',
  currency: 'NPR',
  shipping_fee: '99',
  free_shipping_threshold: '5000',
  default_order_status: 'pending',
  low_stock_threshold: '10',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase.from('store_settings').select('*');
      if (error) throw error;

      const settingsMap: any = {};
      data?.forEach((item) => {
        settingsMap[item.setting_key] = item.setting_value;
      });

      setSettings({
        store_name: settingsMap.store_name || 'Vastra Elegance',
        store_email: settingsMap.store_email || '',
        store_phone: settingsMap.store_phone || '',
        store_address: settingsMap.store_address || '',
        currency: settingsMap.currency || 'NPR',
        shipping_fee: settingsMap.shipping_fee || '99',
        free_shipping_threshold: settingsMap.free_shipping_threshold || '5000',
        default_order_status: settingsMap.default_order_status || 'pending',
        low_stock_threshold: settingsMap.low_stock_threshold || '10',
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: loadSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
