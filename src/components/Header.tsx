import { ShoppingBag, Menu, User, LogOut } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useSettings } from '../context/SettingsContext';

interface HeaderProps {
  onMenuClick: () => void;
  onCartClick: () => void;
  onLoginClick: () => void;
  onNavigate?: (view: string) => void;
  onLogout?: () => void;
}

export default function Header({ onMenuClick, onCartClick, onLoginClick, onNavigate, onLogout }: HeaderProps) {
  const { currency, setCurrency } = useCurrency();
  const { user, logout, isAdmin } = useAuth();
  const { cart } = useOrder();
  const { settings } = useSettings();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    await logout();
    if (onLogout) {
      onLogout();
    }
    onLoginClick();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Menu Button */}
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-stone-700" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">👗</span>
            <h1 className="text-xl font-serif text-stone-900 font-semibold">
              {settings.store_name}
            </h1>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="NPR">🇳🇵 NPR</option>
              <option value="JPY">🇯🇵 JPY</option>
              <option value="USD">🇺🇸 USD</option>
              <option value="EUR">🇪🇺 EUR</option>
              <option value="GBP">🇬🇧 GBP</option>
            </select>

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative p-2 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <ShoppingBag className="w-6 h-6 text-stone-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-stone-700 hidden sm:inline">
                  {user.name}
                  {isAdmin && <span className="ml-1 text-amber-600">⭐</span>}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-stone-700" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <User className="w-6 h-6 text-stone-700" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
