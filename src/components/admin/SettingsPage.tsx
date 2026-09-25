import { useState, useEffect } from 'react';
import { Save, Store, DollarSign, Truck, Bell, Image, Share2, ShoppingBag, Settings as SettingsIcon, Upload, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCurrency } from '../../context/CurrencyContext';
import { useSettings } from '../../context/SettingsContext';

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
}

export default function SettingsPage() {
  const { formatPrice } = useCurrency();
  const { refreshSettings } = useSettings();
  const [settings, setSettings] = useState<Settings>({
    store_name: '',
    store_email: '',
    store_phone: '',
    store_address: '',
    store_description: '',
    store_logo: '',
    store_banner: '',
    hero_title: '',
    hero_subtitle: '',
    hero_badge: '',
    hero_features: '',
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
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'images' | 'hero' | 'pricing' | 'orders' | 'features' | 'social'>('general');

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
      alert('✅ Settings saved successfully! Changes are now live across the application.');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      alert(`❌ Failed to save settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (field: 'store_logo' | 'store_banner' | 'hero_background_image', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSettings({ ...settings, [field]: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900 mx-auto"></div>
          <p className="mt-4 text-stone-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'images', label: 'Images', icon: Image },
    { id: 'hero', label: 'Hero Banner', icon: Image },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'features', label: 'Features', icon: SettingsIcon },
    { id: 'social', label: 'Social Media', icon: Share2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Store Settings</h2>
          <p className="text-stone-600 mt-1">Manage your store configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border border-stone-200">
        <div className="border-b border-stone-200 overflow-x-auto">
          <div className="flex gap-1 p-2 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Store Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Store Name *</label>
                    <input
                      type="text"
                      value={settings.store_name}
                      onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="Your store name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Store Description</label>
                    <textarea
                      value={settings.store_description}
                      onChange={(e) => setSettings({ ...settings, store_description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="Brief description of your store"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={settings.store_email}
                        onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                        placeholder="store@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={settings.store_phone}
                        onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Address</label>
                    <textarea
                      value={settings.store_address}
                      onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="Store address"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Store Images
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Store Logo</label>
                    {settings.store_logo ? (
                      <div className="relative w-32 h-32">
                        <img
                          src={settings.store_logo}
                          alt="Logo"
                          className="w-full h-full object-contain rounded-lg border-2 border-stone-200"
                        />
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, store_logo: '' })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-stone-300 rounded-lg cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition-all">
                        <Upload className="w-8 h-8 text-stone-400" />
                        <span className="text-xs text-stone-600 mt-2 font-medium">Upload Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('store_logo', e)}
                          className="hidden"
                        />
                      </label>
                    )}
                    <p className="text-xs text-stone-500 mt-2">Recommended: Square image, 200x200px or larger</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Store Banner</label>
                    {settings.store_banner ? (
                      <div className="relative w-full h-48">
                        <img
                          src={settings.store_banner}
                          alt="Banner"
                          className="w-full h-full object-cover rounded-lg border-2 border-stone-200"
                        />
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, store_banner: '' })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-stone-300 rounded-lg cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition-all">
                        <Upload className="w-12 h-12 text-stone-400" />
                        <span className="text-sm text-stone-600 mt-2 font-medium">Upload Banner</span>
                        <span className="text-xs text-stone-500 mt-1">PNG, JPG up to 5MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('store_banner', e)}
                          className="hidden"
                        />
                      </label>
                    )}
                    <p className="text-xs text-stone-500 mt-2">Recommended: 1920x400px or larger, landscape orientation</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hero Banner Tab */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Hero Banner Customization
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Hero Title</label>
                    <input
                      type="text"
                      value={settings.hero_title}
                      onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="Your store name or main heading"
                    />
                    <p className="text-xs text-stone-500 mt-1">This appears as the main heading on the hero banner</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Hero Subtitle</label>
                    <textarea
                      value={settings.hero_subtitle}
                      onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="Brief description that appears below the title"
                    />
                    <p className="text-xs text-stone-500 mt-1">This appears as the description text on the hero banner</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Hero Badge</label>
                    <input
                      type="text"
                      value={settings.hero_badge}
                      onChange={(e) => setSettings({ ...settings, hero_badge: e.target.value })}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="✨ Premium Collection"
                    />
                    <p className="text-xs text-stone-500 mt-1">Small badge that appears above the title (e.g., "✨ Premium Collection")</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Hero Features (comma-separated)</label>
                    <input
                      type="text"
                      value={settings.hero_features}
                      onChange={(e) => setSettings({ ...settings, hero_features: e.target.value })}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="Premium Quality,Free Shipping Over ₹5000"
                    />
                    <p className="text-xs text-stone-500 mt-1">Feature badges that appear below the subtitle (separate with commas)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Hero Background Image</label>
                    {settings.hero_background_image ? (
                      <div className="relative w-full h-64">
                        <img
                          src={settings.hero_background_image}
                          alt="Hero Background"
                          className="w-full h-full object-cover rounded-lg border-2 border-stone-200"
                        />
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, hero_background_image: '' })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-stone-300 rounded-lg cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition-all">
                        <Upload className="w-12 h-12 text-stone-400" />
                        <span className="text-sm text-stone-600 mt-2 font-medium">Upload Hero Background</span>
                        <span className="text-xs text-stone-500 mt-1">PNG, JPG up to 5MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('hero_background_image', e)}
                          className="hidden"
                        />
                      </label>
                    )}
                    <p className="text-xs text-stone-500 mt-2">Recommended: 1920x1080px or larger, high-quality image</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing & Currency
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Default Currency</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                    >
                      <option value="NPR">NPR - Nepalese Rupee (रू)</option>
                      <option value="USD">USD - US Dollar ($)</option>
                      <option value="JPY">JPY - Japanese Yen (¥)</option>
                      <option value="EUR">EUR - Euro (€)</option>
                      <option value="GBP">GBP - British Pound (£)</option>
                      <option value="INR">INR - Indian Rupee (₹)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Default Shipping Fee</label>
                      <input
                        type="number"
                        value={settings.shipping_fee}
                        onChange={(e) => setSettings({ ...settings, shipping_fee: e.target.value })}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                        min="0"
                        step="0.01"
                      />
                      <p className="text-xs text-stone-500 mt-1">Current: {formatPrice(Number(settings.shipping_fee))}</p>
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
                      <p className="text-xs text-stone-500 mt-1">Current: {formatPrice(Number(settings.free_shipping_threshold))}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Minimum Order Amount</label>
                      <input
                        type="number"
                        value={settings.minimum_order}
                        onChange={(e) => setSettings({ ...settings, minimum_order: e.target.value })}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                        min="0"
                      />
                      <p className="text-xs text-stone-500 mt-1">Set to 0 for no minimum</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Tax Rate (%)</label>
                      <input
                        type="number"
                        value={settings.tax_rate}
                        onChange={(e) => setSettings({ ...settings, tax_rate: e.target.value })}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                      <p className="text-xs text-stone-500 mt-1">Current: {settings.tax_rate}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Order Settings
                </h3>
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
                    <p className="text-xs text-stone-500 mt-1">Status assigned to new orders</p>
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
                    <p className="text-xs text-stone-500 mt-1">Alert when product stock falls below this number</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  Store Features
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                    <div>
                      <p className="font-medium text-stone-900">Enable Product Reviews</p>
                      <p className="text-sm text-stone-600">Allow customers to leave reviews</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enable_reviews === 'true'}
                        onChange={(e) => setSettings({ ...settings, enable_reviews: e.target.checked ? 'true' : 'false' })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-stone-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                    <div>
                      <p className="font-medium text-stone-900">Enable Wishlist</p>
                      <p className="text-sm text-stone-600">Allow customers to save products</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enable_wishlist === 'true'}
                        onChange={(e) => setSettings({ ...settings, enable_wishlist: e.target.checked ? 'true' : 'false' })}
                        className="sr-only peer"
      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-stone-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                    <div>
                      <p className="font-medium text-stone-900">Enable Notifications</p>
                      <p className="text-sm text-stone-600">Show notification alerts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enable_notifications === 'true'}
                        onChange={(e) => setSettings({ ...settings, enable_notifications: e.target.checked ? 'true' : 'false' })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-stone-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Social Media Links
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Facebook</label>
                    <input
                      type="url"
                      value={settings.store_facebook}
                      onChange={(e) => setSettings({ ...settings, store_facebook: e.target.value })}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="https://facebook.com/yourstore"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Instagram</label>
                    <input
                      type="url"
                      value={settings.store_instagram}
                      onChange={(e) => setSettings({ ...settings, store_instagram: e.target.value })}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="https://instagram.com/yourstore"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Twitter</label>
                    <input
                      type="url"
                      value={settings.store_twitter}
                      onChange={(e) => setSettings({ ...settings, store_twitter: e.target.value })}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="https://twitter.com/yourstore"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">YouTube</label>
                    <input
                      type="url"
                      value={settings.store_youtube}
                      onChange={(e) => setSettings({ ...settings, store_youtube: e.target.value })}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="https://youtube.com/yourstore"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">WhatsApp</label>
                    <input
                      type="tel"
                      value={settings.store_whatsapp}
                      onChange={(e) => setSettings({ ...settings, store_whatsapp: e.target.value })}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
