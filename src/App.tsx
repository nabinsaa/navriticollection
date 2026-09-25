import { useState, useEffect } from 'react';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrderProvider, useOrder } from './context/OrderContext';
import { SettingsProvider } from './context/SettingsContext';
import { categories, Product } from './data/products';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Sidebar from './components/Sidebar';
import LoginModal from './components/LoginModal';
import OrdersPage from './components/OrdersPage';
import WishlistPage from './components/WishlistPage';
import CheckoutPage from './components/CheckoutPage';
import AdminPanel from './components/admin/AdminPanel';
import ShopCollection from './components/ShopCollection';
import QuotesPage from './components/QuotesPage';
import SubmitQuotePage from './components/SubmitQuotePage';
import FeedbackPage from './components/FeedbackPage';
import InfoPage from './components/InfoPage';
import ContactPage from './components/ContactPage';
import { supabase, isSupabaseConnected } from './lib/supabase';

type View = 'shop' | 'orders' | 'wishlist' | 'quotes' | 'submit-quote' | 'feedback' | 'admin' | 'checkout' | 'product-detail' | 'about' | 'contact' | 'privacy' | 'terms' | 'shipping' | 'return';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('shop');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addToCart } = useOrder();
  const { isAdmin } = useAuth();

  // Load products from Supabase
  const loadProducts = async () => {
    if (isSupabaseConnected && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading products:', error);
          setProducts([]);
        } else {
          setProducts(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
        setProducts([]);
      }
    }
    setIsLoadingProducts(false);
  };

  useEffect(() => {
    loadProducts();
  }, [currentView]);

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const handleNavigate = (view: string) => {
    if ((view === 'admin') && !isAdmin) {
      setLoginModalOpen(true);
      return;
    }
    setCurrentView(view as View);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Header
        onMenuClick={() => setMenuOpen(true)}
        onCartClick={() => setCartOpen(true)}
        onLoginClick={() => setLoginModalOpen(true)}
        onNavigate={handleNavigate}
        onLogout={() => setCurrentView('shop')}
      />

      <Sidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={handleNavigate}
        onLoginClick={() => setLoginModalOpen(true)}
        onLogout={() => setCurrentView('shop')}
      />

      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          setCurrentView('checkout');
        }}
        onLoginClick={() => setLoginModalOpen(true)}
      />

      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'shop' && (
          <ShopCollection
            categories={categories}
            onProductClick={(product: Product) => {
              setSelectedProduct(product);
              setCurrentView('product-detail');
            }}
            onAddToCart={(product: Product) => {
              addToCart(product);
              // Show success feedback
              const toast = document.createElement('div');
              toast.className = 'fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in';
              toast.textContent = '✓ Added to cart';
              document.body.appendChild(toast);
              setTimeout(() => toast.remove(), 2000);
            }}
            isAdmin={isAdmin}
            onGoToAdmin={() => setCurrentView('admin')}
            onNavigate={(view) => setCurrentView(view as View)}
          />
        )}

        {currentView === 'orders' && (
          <OrdersPage 
            onBack={() => setCurrentView('shop')} 
            onLoginClick={() => setLoginModalOpen(true)}
          />
        )}

        {currentView === 'wishlist' && (
          <WishlistPage 
            onBack={() => setCurrentView('shop')} 
            onLoginClick={() => setLoginModalOpen(true)}
          />
        )}

        {currentView === 'admin' && (
          <AdminPanel onBack={() => setCurrentView('shop')} />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onBack={() => {
              setCurrentView('shop');
              setCartOpen(true);
            }}
            onComplete={() => {
              setCurrentView('orders');
            }}
          />
        )}

        {currentView === 'product-detail' && selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setCurrentView('shop')}
          />
        )}

        {currentView === 'quotes' && (
          <QuotesPage />
        )}

        {currentView === 'submit-quote' && (
          <SubmitQuotePage onBack={() => setCurrentView('shop')} />
        )}

        {currentView === 'feedback' && (
          <FeedbackPage />
        )}

        {currentView === 'about' && (
          <InfoPage
            title="About Us"
            settingKey="about_page_content"
            defaultContent="Welcome to our store. We are dedicated to bringing you the finest products with exceptional quality and service. Our mission is to provide you with an unforgettable shopping experience."
            onBack={() => setCurrentView('shop')}
          />
        )}

        {currentView === 'contact' && (
          <ContactPage onBack={() => setCurrentView('shop')} />
        )}

        {currentView === 'privacy' && (
          <InfoPage
            title="Privacy Policy"
            settingKey="privacy_policy_content"
            defaultContent="Your privacy is important to us. This privacy policy explains how we collect, use, and protect your personal information when you use our services."
            onBack={() => setCurrentView('shop')}
          />
        )}

        {currentView === 'terms' && (
          <InfoPage
            title="Terms and Conditions"
            settingKey="terms_content"
            defaultContent="By using our website and services, you agree to comply with and be bound by the following terms and conditions. Please review them carefully."
            onBack={() => setCurrentView('shop')}
          />
        )}

        {currentView === 'shipping' && (
          <InfoPage
            title="Shipping Policy"
            settingKey="shipping_policy_content"
            defaultContent="We offer fast and reliable shipping services. Please review our shipping policy for details on delivery times, costs, and international shipping options."
            onBack={() => setCurrentView('shop')}
          />
        )}

        {currentView === 'return' && (
          <InfoPage
            title="Return Policy"
            settingKey="return_policy_content"
            defaultContent="We want you to be completely satisfied with your purchase. If you're not, please review our return policy for information on how to return items."
            onBack={() => setCurrentView('shop')}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <CurrencyProvider>
        <AuthProvider>
          <OrderProvider>
            <AppContent />
          </OrderProvider>
        </AuthProvider>
      </CurrencyProvider>
    </SettingsProvider>
  );
}
