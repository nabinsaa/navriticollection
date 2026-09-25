import { useState, useEffect } from 'react';
import { Save, Store, DollarSign, Truck, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCurrency } from '../../context/CurrencyContext';
import { useSettings } from '../../context/SettingsContext';

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

export default function SettingsPage() {
  const { formatPrice } = useCurrency();
  const { refreshSettings } = useSettings();
  const [settings, setSettings] = useState<Settings>({
    store_name: '',
    store_email: '',
    store_phone: '',
    store_address: '',
    currency: 'NPR',
    shipping_fee: '99',
    free_shipping_threshold: '5000',
    default_order_status: 'pending',
    low_stock_threshold: '10',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

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

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
      }));

      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('store_settings')
          .update({ setting_value: update.setting_value, updated_at: new Date().toISOString() })
          .eq('setting_key', update.setting_key);

        if (updateError) {
          const { error: insertError } = await supabase
            .from('store_settings')
            .insert([update]);

          if (insertError) throw insertError;
        }
      }

      await refreshSettings();
      alert('Settings saved successfully! Store name updated across the application.');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      alert(`Failed to save settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Settings</h2>
          <p className="text-stone-600 mt-1">Manage your store settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Store Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Store className="w-5 h-5 text-stone-600" />
          <h3 className="text-lg font-semibold text-stone-900">Store Information</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Store Name</label>
            <input
              type="text"
              value={settings.store_name}
              onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Store Email</label>
            <input
              type="email"
              value={settings.store_email}
              onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Store Phone</label>
            <input
              type="tel"
              value={settings.store_phone}
              onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Store Address</label>
            <textarea
              value={settings.store_address}
              onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>
        </div>
      </div>

      {/* Currency & Pricing */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-stone-600" />
          <h3 className="text-lg font-semibold text-stone-900">Currency & Pricing</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Default Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
            >
              <option value="NPR">NPR - Nepalese Rupee</option>
              <option value="USD">USD - US Dollar</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shipping Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Truck className="w-5 h-5 text-stone-600" />
          <h3 className="text-lg font-semibold text-stone-900">Shipping Settings</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Default Shipping Fee</label>
            <input
              type="number"
              value={settings.shipping_fee}
              onChange={(e) => setSettings({ ...settings, shipping_fee: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Free Shipping Threshold</label>
            <input
              type="number"
              value={settings.free_shipping_threshold}
              onChange={(e) => setSettings({ ...settings, free_shipping_threshold: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Order Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-stone-600" />
          <h3 className="text-lg font-semibold text-stone-900">Order & Inventory Settings</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Default Order Status</label>
            <select
              value={settings.default_order_status}
              onChange={(e) => setSettings({ ...settings, default_order_status: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Low Stock Threshold</label>
            <input
              type="number"
              value={settings.low_stock_threshold}
              onChange={(e) => setSettings({ ...settings, low_stock_threshold: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
              min="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
