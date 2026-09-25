import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { Product } from '../data/products';
import { useCurrency } from '../context/CurrencyContext';
import { useSettings } from '../context/SettingsContext';
import { supabase, isSupabaseConnected } from '../lib/supabase';

interface ShopCollectionProps {
  categories: string[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isAdmin: boolean;
  onGoToAdmin: () => void;
  onNavigate?: (view: string) => void;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  is_active: boolean;
}

export default function ShopCollection({ 
  categories: propsCategories, 
  onProductClick, 
  onAddToCart, 
  isAdmin,
  onGoToAdmin,
  onNavigate
}: ShopCollectionProps) {
  const { formatPrice } = useCurrency();
  const { settings } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'name'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  
  const PRODUCTS_PER_PAGE = 20;

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    if (isSupabaseConnected && supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Error loading categories:', error);
          setDbCategories([]);
        } else {
          setDbCategories(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
        setDbCategories([]);
      }
    }
  };

  // Use database categories if available, otherwise fallback to props
  const categories = dbCategories.length > 0 
    ? ['All', ...dbCategories.map(c => c.name)]
    : propsCategories;

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [selectedCategory, searchQuery, sortBy, priceRange]);

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
    setLoading(false);
  };

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    // Category filter
    if (selectedCategory !== 'All' && product.category !== selectedCategory) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableText = `${product.name} ${product.origin} ${product.region} ${product.material} ${product.description}`.toLowerCase();
      if (!searchableText.includes(query)) {
        return false;
      }
    }

    // Price range filter
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'newest':
      default:
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSortBy('newest');
    setPriceRange([0, 100000]);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="mt-4 text-stone-600 font-medium">Loading our collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-50">
      {/* Hero Section */}
      <section 
        className="relative text-white py-20 md:py-32 overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: settings.hero_background_image 
            ? `url(${settings.hero_background_image})`
            : 'url(https://image.qwenlm.ai/generated-images/dc09a620-6ae1-4417-8c81-fc34f5deae92/_result.png)'
        }}
      >
        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/20 rounded-full -ml-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-500/20 rounded-full -mr-48 -mb-48 blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {settings.hero_badge && (
            <div className="inline-block mb-4">
              <span className="px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-amber-200 border border-amber-400/30">
                {settings.hero_badge}
              </span>
            </div>
          )}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif mb-6 tracking-tight drop-shadow-lg">
            {settings.hero_title || 'Vastra Elegance'}
          </h1>
          <p className="text-lg md:text-xl text-stone-200 max-w-3xl mx-auto leading-relaxed mb-8 drop-shadow-md">
            {settings.hero_subtitle || 'Discover exquisite traditional clothing crafted with passion and heritage. Each piece tells a story of artisanal craftsmanship, timeless elegance, and cultural richness.'}
          </p>
          {settings.hero_features && (
            <div className="flex flex-wrap justify-center gap-6 text-sm text-stone-300">
              {settings.hero_features.split(',').map((feature, index) => (
                <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                  <span>{feature.trim()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Collection Info Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-serif text-stone-900 font-semibold">
                {selectedCategory === 'All' ? 'All Products' : selectedCategory}
              </h2>
              <p className="text-stone-600 mt-1">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-stone-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-stone-200'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4 text-stone-700" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-stone-200'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4 text-stone-700" />
                </button>
              </div>

              {/* Filter Toggle (Mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sticky top-4 space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-stone-900 mb-3">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-semibold text-stone-900 mb-3">Categories</label>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const count = category === 'All' 
                      ? products.length 
                      : products.filter(p => p.category === category).length;
                    
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          selectedCategory === category
                            ? 'bg-amber-50 text-amber-900 border-2 border-amber-500'
                            : 'bg-stone-50 text-stone-700 border-2 border-transparent hover:bg-stone-100'
                        }`}
                      >
                        <span>{category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          selectedCategory === category ? 'bg-amber-200 text-amber-900' : 'bg-stone-200 text-stone-600'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-stone-900 mb-3">Price Range</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-stone-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="text-xs text-stone-500 text-center">
                    {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </div>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-semibold text-stone-900 mb-3">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>

              {/* Reset Filters */}
              {(selectedCategory !== 'All' || searchQuery || sortBy !== 'newest' || priceRange[0] !== 0 || priceRange[1] !== 100000) && (
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2.5 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors text-sm font-medium"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Products Grid/List */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-16 text-center">
                <div className="text-7xl mb-4">🔍</div>
                <h3 className="text-2xl font-serif text-stone-900 mb-2">
                  No Products Found
                </h3>
                <p className="text-stone-600 mb-6">
                  {isAdmin 
                    ? 'Start by adding products from the Admin Panel!' 
                    : 'Try adjusting your filters or check back soon for new arrivals!'}
                </p>
                {isAdmin ? (
                  <button
                    onClick={onGoToAdmin}
                    className="px-6 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors"
                  >
                    Go to Admin Panel
                  </button>
                ) : (
                  <button
                    onClick={resetFilters}
                    className="px-6 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Products Display */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedProducts.map((product) => (
                      <ProductCardEnhanced
                        key={product.id}
                        product={product}
                        onClick={() => onProductClick(product)}
                        onAddToCart={() => onAddToCart(product)}
                        formatPrice={formatPrice}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedProducts.map((product) => (
                      <ProductCardList
                        key={product.id}
                        product={product}
                        onClick={() => onProductClick(product)}
                        onAddToCart={() => onAddToCart(product)}
                        formatPrice={formatPrice}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="text-sm font-medium">Previous</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                            currentPage === page
                              ? 'bg-stone-900 text-white shadow-lg'
                              : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="text-sm font-medium">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Page Info */}
                {totalPages > 1 && (
                  <div className="mt-4 text-center text-sm text-stone-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
                    <span className="mx-2">•</span>
                    Page {currentPage} of {totalPages}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Contact Section */}
        {(settings.contact_email || settings.contact_phone || settings.contact_address) && (
          <section className="mt-16 mb-12">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-serif text-stone-900 mb-2">
                  {settings.contact_title || 'Get in Touch'}
                </h2>
                <p className="text-stone-600">
                  {settings.contact_subtitle || 'We\'d love to hear from you'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {settings.contact_email && (
                  <div className="text-center p-6 bg-stone-50 rounded-xl">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-stone-900 mb-1">Email</h3>
                    <a href={`mailto:${settings.contact_email}`} className="text-stone-600 hover:text-amber-600 transition-colors">
                      {settings.contact_email}
                    </a>
                  </div>
                )}

                {settings.contact_phone && (
                  <div className="text-center p-6 bg-stone-50 rounded-xl">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-stone-900 mb-1">Phone</h3>
                    <a href={`tel:${settings.contact_phone}`} className="text-stone-600 hover:text-amber-600 transition-colors">
                      {settings.contact_phone}
                    </a>
                  </div>
                )}

                {settings.contact_address && (
                  <div className="text-center p-6 bg-stone-50 rounded-xl">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-stone-900 mb-1">Address</h3>
                    <p className="text-stone-600 text-sm">
                      {settings.contact_address}
                    </p>
                  </div>
                )}

                {settings.contact_hours && (
                  <div className="text-center p-6 bg-stone-50 rounded-xl">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-stone-900 mb-1">Hours</h3>
                    <p className="text-stone-600 text-sm">
                      {settings.contact_hours}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="bg-stone-900 text-stone-300 rounded-2xl p-8 md:p-12 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* About Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                {settings.store_logo ? (
                  <img src={settings.store_logo} alt={settings.store_name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <span className="text-2xl">👗</span>
                )}
                <h3 className="text-xl font-serif text-white font-semibold">
                  {settings.store_name}
                </h3>
              </div>
              <p className="text-stone-400 text-sm leading-relaxed mb-4">
                {settings.footer_about || settings.store_description || 'Discover exquisite traditional clothing crafted with passion and heritage.'}
              </p>
              {/* Social Media Links */}
              <div className="flex gap-3">
                {settings.store_facebook && (
                  <a href={settings.store_facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-amber-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                )}
                {settings.store_instagram && (
                  <a href={settings.store_instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-amber-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                )}
                {settings.store_twitter && (
                  <a href={settings.store_twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-amber-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.189 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                  </a>
                )}
                {settings.store_youtube && (
                  <a href={settings.store_youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-amber-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                )}
                {settings.store_whatsapp && (
                  <a href={`https://wa.me/${settings.store_whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-amber-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => onNavigate?.('shop')} className="text-stone-400 hover:text-amber-400 transition-colors text-left">Home</button></li>
                <li><button onClick={() => onNavigate?.('shop')} className="text-stone-400 hover:text-amber-400 transition-colors text-left">Shop</button></li>
                <li><button onClick={() => onNavigate?.('about')} className="text-stone-400 hover:text-amber-400 transition-colors text-left">About</button></li>
                <li><button onClick={() => onNavigate?.('contact')} className="text-stone-400 hover:text-amber-400 transition-colors text-left">Contact</button></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-white font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-sm">
                {settings.footer_links ? (
                  settings.footer_links.split(',').map((link, index) => {
                    const linkName = link.trim();
                    const linkMap: { [key: string]: string } = {
                      'Privacy Policy': 'privacy',
                      'Terms of Service': 'terms',
                      'Shipping Policy': 'shipping',
                      'Return Policy': 'return',
                    };
                    return (
                      <li key={index}>
                        <button 
                          onClick={() => onNavigate?.(linkMap[linkName] || 'shop')}
                          className="text-stone-400 hover:text-amber-400 transition-colors text-left"
                        >
                          {linkName}
                        </button>
                      </li>
                    );
                  })
                ) : (
                  <>
                    <li><button onClick={() => onNavigate?.('privacy')} className="text-stone-400 hover:text-amber-400 transition-colors text-left">Privacy Policy</button></li>
                    <li><button onClick={() => onNavigate?.('terms')} className="text-stone-400 hover:text-amber-400 transition-colors text-left">Terms of Service</button></li>
                    <li><button onClick={() => onNavigate?.('shipping')} className="text-stone-400 hover:text-amber-400 transition-colors text-left">Shipping Policy</button></li>
                    <li><button onClick={() => onNavigate?.('return')} className="text-stone-400 hover:text-amber-400 transition-colors text-left">Return Policy</button></li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-stone-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-stone-400 text-sm">
              {settings.footer_copyright || `© ${new Date().getFullYear()} ${settings.store_name}. All rights reserved.`}
            </p>
            <div className="flex items-center gap-4 text-sm text-stone-400">
              <span>Payment Methods:</span>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-stone-800 rounded text-xs">COD</span>
                <span className="px-2 py-1 bg-stone-800 rounded text-xs">Card</span>
                <span className="px-2 py-1 bg-stone-800 rounded text-xs">UPI</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Enhanced Grid Product Card
interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onAddToCart: () => void;
  formatPrice: (price: number) => string;
}

function ProductCardEnhanced({ product, onClick, onAddToCart, formatPrice }: ProductCardProps) {
  return (
    <div 
      className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-72 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
        {product.image.startsWith('') || product.image.startsWith('http') ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl">
            {product.image}
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_featured && (
            <span className="px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full shadow-lg">
              ⭐ Featured
            </span>
          )}
          {product.is_new_arrival && (
            <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full shadow-lg">
              🆕 New
            </span>
          )}
          {product.is_bestseller && (
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg">
              🔥 Bestseller
            </span>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-stone-900 text-xs font-medium rounded-full shadow">
            {product.category}
          </span>
        </div>

        {/* Stock Status */}
        {product.stock_quantity !== undefined && product.stock_quantity <= (product.low_stock_threshold || 10) && (
          <div className="absolute bottom-3 left-3">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-lg ${
              product.stock_quantity === 0
                ? 'bg-red-500 text-white'
                : 'bg-orange-500 text-white'
            }`}>
              {product.stock_quantity === 0 ? 'Out of Stock' : `Only ${product.stock_quantity} left`}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title & Rating */}
        <div className="mb-3">
          <h3 className="font-serif text-lg text-stone-900 font-semibold mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.floor(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-stone-300'
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-stone-600">
              {product.rating} ({product.reviews})
            </span>
          </div>
        </div>

        {/* Origin & Material */}
        <div className="mb-3 space-y-1">
          <p className="text-sm text-stone-600">
            <span className="font-medium">Origin:</span> {product.origin}, {product.region}
          </p>
          <p className="text-sm text-stone-600">
            <span className="font-medium">Material:</span> {product.material}
          </p>
        </div>

        {/* Colors */}
        {product.color && product.color.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-stone-500 mb-1.5">Available Colors:</p>
            <div className="flex flex-wrap gap-1.5">
              {product.color.slice(0, 3).map((c, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-stone-100 text-stone-700 text-xs rounded-full"
                >
                  {c}
                </span>
              ))}
              {product.color.length > 3 && (
                <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-xs rounded-full">
                  +{product.color.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <div>
            {product.discount_price ? (
              <>
                <span className="text-xl font-bold text-stone-900">
                  {formatPrice(product.discount_price)}
                </span>
                <span className="text-sm text-stone-400 line-through ml-2">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-stone-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            disabled={product.stock_quantity === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// List View Product Card
function ProductCardList({ product, onClick, onAddToCart, formatPrice }: ProductCardProps) {
  return (
    <div 
      className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative md:w-64 h-64 md:h-auto bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden flex-shrink-0">
          {product.image.startsWith('') || product.image.startsWith('http') ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">
              {product.image}
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.is_featured && (
              <span className="px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full shadow-lg">
                ⭐ Featured
              </span>
            )}
            {product.is_new_arrival && (
              <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full shadow-lg">
                🆕 New
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-serif text-xl text-stone-900 font-semibold mb-2 group-hover:text-amber-600 transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-stone-600">
                <span className="px-3 py-1 bg-stone-100 rounded-full">{product.category}</span>
                <span>{product.origin}, {product.region}</span>
              </div>
            </div>
            <div className="text-right">
              {product.discount_price ? (
                <>
                  <p className="text-2xl font-bold text-stone-900">
                    {formatPrice(product.discount_price)}
                  </p>
                  <p className="text-sm text-stone-400 line-through">
                    {formatPrice(product.price)}
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold text-stone-900">
                  {formatPrice(product.price)}
                </p>
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.floor(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-stone-300'
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-stone-600">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-stone-600 mb-4 line-clamp-2">
            {product.description}
          </p>

          {/* Details */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div>
              <span className="font-medium text-stone-900">Material:</span>{' '}
              <span className="text-stone-600">{product.material}</span>
            </div>
            <div>
              <span className="font-medium text-stone-900">Process:</span>{' '}
              <span className="text-stone-600">{product.process}</span>
            </div>
            <div>
              <span className="font-medium text-stone-900">Size:</span>{' '}
              <span className="text-stone-600">{product.size}</span>
            </div>
          </div>

          {/* Colors */}
          {product.color && product.color.length > 0 && (
            <div className="mb-4">
              <span className="text-xs text-stone-500 mb-1.5 block">Available Colors:</span>
              <div className="flex flex-wrap gap-1.5">
                {product.color.map((c, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-stone-100 text-stone-700 text-xs rounded-full"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <div className="flex items-center gap-2">
              {product.stock_quantity !== undefined && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  product.stock_quantity === 0
                    ? 'bg-red-100 text-red-700'
                    : product.stock_quantity <= 10
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {product.stock_quantity === 0 ? 'Out of Stock' : `${product.stock_quantity} in stock`}
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              disabled={product.stock_quantity === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
