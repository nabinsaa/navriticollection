import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface Settings {
  store_name: string;
  store_email: string;
  store_phone: string;
  store_address: string;
  store_description: string;
  store_logo: string;
  store_banner: string;
  hero_title: string;
  hero_subtitle: string;
  hero_badge: string;
  hero_features: string;
  hero_background_image: string;
  currency: string;
  shipping_fee: string;
  free_shipping_threshold: string;
  minimum_order: string;
  tax_rate: string;
  default_order_status: string;
  low_stock_threshold: string;
  enable_reviews: string;
  enable_wishlist: string;
  enable_notifications: string;
  store_facebook: string;
  store_instagram: string;
  store_twitter: string;
  store_youtube: string;
  store_whatsapp: string;
  contact_title: string;
  contact_subtitle: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  contact_hours: string;
  footer_about: string;
  footer_copyright: string;
  footer_links: string;
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
  store_description: '',
  store_logo: '',
  store_banner: '',
  hero_title: 'Vastra Elegance',
  hero_subtitle: 'Discover exquisite traditional clothing crafted with passion and heritage. Each piece tells a story of artisanal craftsmanship, timeless elegance, and cultural richness.',
  hero_badge: '✨ Premium Collection',
  hero_features: 'Premium Quality,Free Shipping Over ₹5000',
  hero_background_image: '',
  currency: 'NPR',
  shipping_fee: '99',
  free_shipping_threshold: '5000',
  minimum_order: '0',
  tax_rate: '0',
  default_order_status: 'pending',
  low_stock_threshold: '10',
  enable_reviews: 'true',
  enable_wishlist: 'true',
  enable_notifications: 'true',
  store_facebook: '',
  store_instagram: '',
  store_twitter: '',
  store_youtube: '',
  store_whatsapp: '',
  contact_title: 'Get in Touch',
  contact_subtitle: 'We\'d love to hear from you',
  contact_email: '',
  contact_phone: '',
  contact_address: '',
  contact_hours: '',
  footer_about: '',
  footer_copyright: '',
  footer_links: '',
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
        store_description: settingsMap.store_description || '',
        store_logo: settingsMap.store_logo || '',
        store_banner: settingsMap.store_banner || '',
        hero_title: settingsMap.hero_title || 'Vastra Elegance',
        hero_subtitle: settingsMap.hero_subtitle || 'Discover exquisite traditional clothing crafted with passion and heritage. Each piece tells a story of artisanal craftsmanship, timeless elegance, and cultural richness.',
        hero_badge: settingsMap.hero_badge || '✨ Premium Collection',
        hero_features: settingsMap.hero_features || 'Premium Quality,Free Shipping Over ₹5000',
        hero_background_image: settingsMap.hero_background_image || '',
        currency: settingsMap.currency || 'NPR',
        shipping_fee: settingsMap.shipping_fee || '99',
        free_shipping_threshold: settingsMap.free_shipping_threshold || '5000',
        minimum_order: settingsMap.minimum_order || '0',
        tax_rate: settingsMap.tax_rate || '0',
        default_order_status: settingsMap.default_order_status || 'pending',
        low_stock_threshold: settingsMap.low_stock_threshold || '10',
        enable_reviews: settingsMap.enable_reviews || 'true',
        enable_wishlist: settingsMap.enable_wishlist || 'true',
        enable_notifications: settingsMap.enable_notifications || 'true',
        store_facebook: settingsMap.store_facebook || '',
        store_instagram: settingsMap.store_instagram || '',
        store_twitter: settingsMap.store_twitter || '',
        store_youtube: settingsMap.store_youtube || '',
        store_whatsapp: settingsMap.store_whatsapp || '',
        contact_title: settingsMap.contact_title || 'Get in Touch',
        contact_subtitle: settingsMap.contact_subtitle || 'We\'d love to hear from you',
        contact_email: settingsMap.contact_email || '',
        contact_phone: settingsMap.contact_phone || '',
        contact_address: settingsMap.contact_address || '',
        contact_hours: settingsMap.contact_hours || '',
        footer_about: settingsMap.footer_about || '',
        footer_copyright: settingsMap.footer_copyright || '',
        footer_links: settingsMap.footer_links || '',
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
