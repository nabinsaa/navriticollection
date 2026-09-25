import { useState, useEffect } from 'react';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrderProvider, useOrder } from './context/OrderContext';
import { SettingsProvider } from './context/SettingsContext';
import { categories, Product } from './data/products';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import Sidebar from './components/Sidebar';
import LoginModal from './components/LoginModal';
import AdminPanel from './components/admin/AdminPanel';
import { supabase, isSupabaseConnected } from './lib/supabase';

type View = 'shop' | 'orders' | 'wishlist' | 'quotes' | 'submit-quote' | 'feedback' | 'admin' | 'checkout' | 'product-detail';

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
      />

      <Sidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={handleNavigate}
        onLoginClick={() => setLoginModalOpen(true)}
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
          <>
            {/* Hero Section */}
            <section className="text-center py-12 mb-8">
              <h1 className="text-4xl md:text-6xl font-serif text-stone-900 mb-4 tracking-tight">
                Vastra Elegance
              </h1>
              <p className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
                Discover exquisite traditional clothing crafted with passion and heritage.
              </p>
            </section>

            {/* Category Filters */}
            <section className="mb-8">
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-stone-900 text-white shadow-lg'
                        : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-900'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </section>

            {/* Products Grid */}
            {isLoadingProducts ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div>
                <p className="text-stone-600 mt-4">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🛍️</div>
                <h3 className="text-2xl font-serif text-stone-900 mb-2">
                  {selectedCategory === 'All' ? 'No Products Yet' : `No ${selectedCategory} Products`}
                </h3>
                <p className="text-stone-600 mb-6">
                  {isAdmin ? 'Start by adding products from the Admin Panel!' : 'Check back soon for new arrivals!'}
                </p>
                {isAdmin && (
                  <button
                    onClick={() => setCurrentView('admin')}
                    className="px-6 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors"
                  >
                    Go to Admin Panel
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => {
                      setSelectedProduct(product);
                      setCurrentView('product-detail');
                    }}
                    onAddToCart={() => {
                      addToCart(product);
                      setCartOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {currentView === 'orders' && (
          <div className="text-center py-20">
            <h2 className="text-3xl font-serif text-stone-900 mb-4">My Orders</h2>
            <p className="text-stone-600">Order history will appear here</p>
          </div>
        )}

        {currentView === 'wishlist' && (
          <div className="text-center py-20">
            <h2 className="text-3xl font-serif text-stone-900 mb-4">My Wishlist</h2>
            <p className="text-stone-600">Your saved items will appear here</p>
          </div>
        )}

        {currentView === 'admin' && (
          <AdminPanel onBack={() => setCurrentView('shop')} />
        )}

        {currentView === 'checkout' && (
          <div className="text-center py-20">
            <h2 className="text-3xl font-serif text-stone-900 mb-4">Checkout</h2>
            <p className="text-stone-600">Checkout page will appear here</p>
            <button
              onClick={() => setCurrentView('shop')}
              className="mt-6 px-6 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors"
            >
              Back to Shop
            </button>
          </div>
        )}

        {currentView === 'product-detail' && selectedProduct && (
          <div className="text-center py-20">
            <h2 className="text-3xl font-serif text-stone-900 mb-4">{selectedProduct.name}</h2>
            <p className="text-stone-600">Product detail page will appear here</p>
            <button
              onClick={() => setCurrentView('shop')}
              className="mt-6 px-6 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors"
            >
              Back to Shop
            </button>
          </div>
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
