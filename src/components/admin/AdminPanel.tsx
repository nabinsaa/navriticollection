import { useState } from 'react';
import { LayoutDashboard, Package, ShoppingCart, Users, Star, MessageCircle, Tag, Truck, Bell, Settings, UserCog, FileText, ChevronRight, Menu, X, ArrowLeft, Heart, Grid } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import CustomersPage from './CustomersPage';
import ReviewsPage from './ReviewsPage';
import QuoteRequestsPage from './QuoteRequestsPage';
import CouponsPage from './CouponsPage';
import ShippingPage from './ShippingPage';
import ReportsPage from './ReportsPage';
import NotificationsPage from './NotificationsPage';
import UsersPage from './UsersPage';
import SettingsPage from './SettingsPage';
import AdminWishlistFeedback from './AdminWishlistFeedback';
import CategoriesPage from './CategoriesPage';

export type AdminView = 'dashboard' | 'products' | 'categories' | 'orders' | 'customers' | 'reviews' | 'quotes' | 'coupons' | 'shipping' | 'reports' | 'notifications' | 'users' | 'settings' | 'wishlist-feedback';

interface AdminPanelProps {
  onBack?: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, submenu: false },
    { id: 'products', label: 'Products', icon: Package, submenu: false },
    { id: 'categories', label: 'Categories', icon: Grid, submenu: false },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, submenu: false },
    { id: 'customers', label: 'Customers', icon: Users, submenu: false },
    { id: 'reviews', label: 'Reviews & Feedback', icon: Star, submenu: false },
    { id: 'wishlist-feedback', label: 'Wishlists & Product Feedback', icon: Heart, submenu: false },
    { id: 'quotes', label: 'Quote Requests', icon: MessageCircle, submenu: false },
    { id: 'coupons', label: 'Coupons', icon: Tag, submenu: false },
    { id: 'shipping', label: 'Shipping', icon: Truck, submenu: false },
    { id: 'reports', label: 'Reports', icon: FileText, submenu: false },
    { id: 'notifications', label: 'Notifications', icon: Bell, submenu: false },
    { id: 'users', label: 'Users', icon: UserCog, submenu: false },
    { id: 'settings', label: 'Settings', icon: Settings, submenu: false },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminDashboard onNavigate={setCurrentView} />;
      case 'products':
        return <ProductManagement />;
      case 'categories':
        return <CategoriesPage />;
      case 'orders':
        return <OrderManagement />;
      case 'customers':
        return <CustomersPage />;
      case 'reviews':
        return <ReviewsPage />;
      case 'wishlist-feedback':
        return <AdminWishlistFeedback onBack={() => setCurrentView('dashboard')} />;
      case 'quotes':
        return <QuoteRequestsPage />;
      case 'coupons':
        return <CouponsPage />;
      case 'shipping':
        return <ShippingPage />;
      case 'reports':
        return <ReportsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'users':
        return <UsersPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <AdminDashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-white shadow-lg z-40 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 w-64`}>
        <div className="p-6 border-b border-stone-200">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Shop</span>
            </button>
          )}
          <h1 className="text-xl font-bold text-stone-900">Admin Panel</h1>
          <p className="text-sm text-stone-600 mt-1">Vastra Elegance</p>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-120px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as AdminView);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1 text-left font-medium">{item.label}</span>
                {item.submenu && <ChevronRight className="w-4 h-4" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
