import { X, Home, ShoppingBag, User, Package, Heart, Settings, LogOut, Shirt, MessageSquare, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useSettings } from '../context/SettingsContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onLoginClick: () => void;
}

export default function Sidebar({ isOpen, onClose, onNavigate, onLoginClick }: SidebarProps) {
  const { user, logout, isAdmin } = useAuth();
  const { orders } = useOrder();
  const { settings } = useSettings();

  const menuItems = [
    { id: 'shop', label: 'Shop Collection', icon: Home },
    { id: 'orders', label: 'My Orders', icon: Package, badge: orders.length },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'quotes', label: 'Read Quotes', icon: MessageSquare },
    { id: 'submit-quote', label: 'Submit Quote', icon: MessageCircle },
    { id: 'feedback', label: 'Feedback', icon: MessageCircle },
    ...(isAdmin ? [
      { id: 'admin', label: 'Admin Panel', icon: Settings },
    ] : []),
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-stone-900 to-stone-700 rounded-full flex items-center justify-center">
              <Shirt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-stone-900 font-semibold">
                {settings.store_name}
              </h2>
              <p className="text-xs text-stone-600">
                {user ? `Welcome, ${user.name}` : 'Welcome!'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-stone-700" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors text-left"
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-semibold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-stone-200 p-4">
          {user ? (
            <>
              <div className="mb-3 px-4 py-2">
                <p className="text-sm font-medium text-stone-900 truncate">{user.name}</p>
                <p className="text-xs text-stone-600 truncate">{user.email}</p>
                {isAdmin && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                    Admin
                  </span>
                )}
              </div>
              <button
                onClick={async () => {
                  await logout();
                  onClose();
                  onLoginClick();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="flex-1 text-left font-medium">Sign Out</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                onClose();
                onLoginClick();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors"
            >
              <User className="w-5 h-5" />
              <span>Sign In / Sign Up</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
